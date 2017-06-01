var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var secret = require('../config/secret')
var async = require('async')

var User = require('../models/user')
var Cart = require('../models/cart')

// serialize and derialize
// serialize: store session in temporary database which is connect-mongo
passport.serializeUser(function (user, done) {
  done(null, user._id)
})

// deserialize: get the data; have this so-called req.user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

// middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function (req, email, password, done) {
  // done is the callback
  User.findOne({email: email}, function (err, user) {
    if (err) return done(err)
    if (!user) {
      return done(null, false, req.flash('loginMessage', 'No user has been found'))
    }
    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('loginMessage', 'Oops wrong password pal'))
    }
    return done(null, user)
  })
}))

passport.use(new FacebookStrategy(secret.facebook, function (token, refreshToken, profile, done) {
  User.findOne({facebook: profile.id}, function (err, user) {
    if (err) throw err
    if (user) {
      return done(null, user)
    } else {
      async.waterfall([
        function (callback) {
          var newUser = new User()
          newUser.profile.name = profile.displayName
          newUser.email = profile._json.email
          newUser.facebook = profile.id
          newUser.tokens.push({
            kind: 'facebook',
            token: token
          })
          newUser.profile.picture = 'https://graph.facebook.com' + 'profile.id' + '/picture?type=large'
          newUser.save(function (err) {
            if (err) throw err
            callback(err, newUser)
          })
        },
        // make a cart for user who signed in with facebook i.e. newUser
        function (newUser) {
          var cart = new Cart()
          cart.owner = newUser._id
          cart.save(function (err) {
            if (err) done(err)
            return done(err, newUser)
          })
        }
      ])
    }
  })
}))

// custom function to validate user
exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('errors', 'Sorry please Login or Sign Up to view page ')
  res.redirect('/')
}

// custom function to validate user
exports.isAdmin = function (req, res, next) {
    // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
       // if user is admin, go next
    if (req.user.isAdmin) {
      return next()
    }
  }

  // res.send('redirect')
  req.flash('errors', 'Sorry you do not have administrative rights ')
  res.redirect('/')
}
