var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var stripe = require('stripe')('sk_test_FB7cCOZGb2x5zMtYtcugEvhs')
var async = require('async')
var passport = require('passport')

var User = require('../models/user')
var Product = require('../models/product')
var Cart = require('../models/cart')
var passportConfig = require('../config/passport')



// function to paginate mongoose query
function paginate (req, res, next) {
  var perPage = 9
  var page = req.params.page

  Product
  .find()
  .skip(perPage * page)
  .limit(perPage)
  .populate('category')
  .exec(function (err, products) {
    if (err) return next(err)
    Product.count().exec(function (err, count) {
      if (err) return next(err)
      res.render('main/product-main', {
        products: products,
        pages: count / perPage,
        error: req.flash('errors')
      })
    })
  })
}



// ///////////////////////////// ROUTES BEGIN!///////////////////////////////////////////////

// get data from server: homepage
router.get('/', function (req, res, next) {
  if (req.user) {
    paginate(req, res, next)
    // res.send('testing')
  } else {
    res.render('main/home', {error: req.flash('errors') })
  }
})

router.get('/page/:page', function (req, res, next) {
  paginate(req, res, next)
})

// post data to server: search queries
router.post('/search', function (req, res, next) {
  res.redirect('/search?q=' + req.body.search_term_nav_bar)
  // q is the ?q=blahblahblah part
})

// get data from server: results from search query
router.get('/search', function (req, res, next) {
  // /search?q=blahblahblah
  // req.query.q refers to blahblahblah
  if (req.query.q) {

    Product
    .find({name: {$regex: `.*${req.query.q}.*`, $options: '-i'}})
    .populate('category')
    .exec(function (err, data) {
      if (err) return next(err)
      res.render('main/search-results', {
        query: req.query.q,
        data: data
      })
      // res.send(data)
    })
  } else {
    res.redirect('/')
  }
})

// get data from server: routes to show ALL product from category (params :id here refers to the category productS belong to)
router.get('/products/:id', function (req, res, next) {
  Product
  .find({category: req.params.id})
  // we can use populate because data type of Product is ObjectId
  .populate('category')
  // can now do products.category.name after calling populate
  // {category: 123123,
  // name: Harry Potter,
  // price: 123123,
  // image: 'link'}
  //
  // AFTER POPULATE:
  // {
  //   category: {
  //     _id: 123123,
  //     name: books
  //   }
  //   name: Harry Potter,
  //   price: 123123,
  //   image: 'link'
  // }
  // exec will execute on ALL methods above (find and populate)
  .exec(function (err, products) {
    if (err) return next(err)
    res.render('main/category', {
      products: products
    })
  })
})

// get data from server: routes to show one product from category (params :id here refers to the category product belongs to)
router.get('/product/:id', function (req, res, next) {
  Product.findById({_id: req.params.id}, function (err, product) {
    console.log('product is ' + product)
    if (err) return next(err)
    res.render('main/product', {
      product: product
    })
  })
})

// get data from server: find cart of user that is logged in.
router.get('/cart', passportConfig.isAuthenticated, function (req, res, next) {
  console.log(req.body)
  Cart
  .findOne({owner: req.user._id})
  .populate({
    path: 'items.item'
  })
  .exec(function (err, foundCart) {
    console.log(foundCart)
    if (err) return next(err)
    res.render('main/cart', {
      foundCart: foundCart,
      message: req.flash('remove')
    })
  })
})

// post data to server: push product into user's cart
router.post('/product/:product_id', passportConfig.isAuthenticated, function (req, res, next) {
  Cart.findOne({owner: req.user._id}, function (err, cart) {
    console.log(req.body)
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    })
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2)
    cart.save(function (err) {
      if (err) return next(err)
      res.redirect('/cart')
    })
  })
})

// send data to server: remove product from cart
router.post('/remove', passportConfig.isAuthenticated, function (req, res, next) {
  Cart.findOne({owner: req.user._id}, function (err, foundCart) {
    if (err) return next()
    // pull operator removes from an existing array all instances of a value or values that match a specified condition
    foundCart.items.pull(req.body.item)
    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2)
    console.log(foundCart.total)
    foundCart.save(function (err, found) {
      if (err) return (next)
      req.flash('remove', 'Successfully removed item from cart')
      res.redirect('/cart')
    })
  })
})

// send data to server: payment route
router.post('/payment', passportConfig.isAuthenticated, function (req, res, next) {
  var stripeToken = req.body.stripeToken
  var currentCharges = Math.round(req.body.stripeMoney * 100)
  stripe.customers.create({
    source: stripeToken
  }).then(function (customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    })
  }).then(function (charge) {
    // db calls are asynchronous, not sure which one finishes first
    // async waterfall runs the tasks array of functions in series
    // each function passes their results to the next in the array.
    // if any of the tasks pass an error to their own callback, the next function is not executed, and the main callback is immediately called with the error.
    async.waterfall([
      function (callback) {
        Cart.findOne({ owner: req.user._id }, function (err, cart) {
          callback(err, cart)
        })
      },
      function (cart, callback) {
        User.findOne({ _id: req.user._id }, function (err, user) {
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                quantity: cart.items[i].quantity,
                paid: cart.items[i].price
              })
            }

            user.save(function (err, user) {
              if (err) return next(err)
              callback(err, user)
            })
          }
        })
      },
      function (user) {
        // set cart.items as empty array
        // set total price in cart as 0
        Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function (err, updated) {
          if (updated) {
            res.redirect('/profile')
          }
        })
      }
    ])
  })
})

// // alternative to checking mlab database for list of users
// router.get('/users', function (req, res, next) {
//   User.find({}, function (err, users) {
//     if (err) next(err)
//     res.json(users)
//   })
// })

module.exports = router
