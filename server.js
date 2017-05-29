var express = require('express')
var morgan = require('morgan')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var ejs = require('ejs')
var ejsMate = require('ejs-mate')
// sessions are stored in server
var session = require('express-session')
// cookies are stored in browser
// cookies have sessions encrypted in the cookies
var cookieParser = require('cookie-parser')
var flash = require('express-flash')
// MongoStore library depends on session library
var MongoStore = require('connect-mongo/es5')(session)
var passport = require('passport')
var deepPopulate = require('mongoose-deep-populate')(mongoose)

// require my own files
var secret = require('./config/secret')
var User = require('./models/user')
var Category = require('./models/category')
var cartLength = require('./middleware/middleware')


var app = express()

// connect to mLab
mongoose.connect(secret.database, function (err) {
  if (err) console.log(err)
  console.log('yay connected to mLab database!')
})

// running middlewares (teach express how to use these modules)
app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({url: secret.database, autoReconnect: true})
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})
app.use(function (req, res, next) {
  // empty {} inside find method will search for all documents within category
  Category.find({}, function (err, categories) {
    if (err) next(err)
    res.locals.categories = categories
    next()
  })
})
app.use(cartLength)

// set engine
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')

// require routes
var mainRoutes = require('./routes/main')
var userRoutes = require('./routes/user')
var adminRoutes = require('./routes/admin')
var apiRoutes = require('./api/api')

app.use(mainRoutes)
app.use(userRoutes)
app.use(adminRoutes)
app.use('/api', apiRoutes)

app.listen(secret.port, function (err) {
  if (err) throw err
  console.log('server is running on port ' + secret.port)
})
