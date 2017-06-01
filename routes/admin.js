var express = require('express')
var router = express.Router()
var Category = require('../models/category')
var Product = require('../models/product')
var passport = require('passport')
var passportConfig = require('../config/passport')
var cloudinary = require('cloudinary')

router.get('/adminlogin', function (req, res, next) {
  res.render('admin/adminlogin', {message: req.flash('success')})
})

router.post('/adminlogin', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/add-category', passportConfig.isAdmin, function (req, res, next) {
  res.render('admin/add-category', {message: req.flash('success')
  })
})

router.post('/add-category', passportConfig.isAdmin, function (req, res, next) {
  var category = new Category()
  category.name = req.body.name
  category.save(function (err) {
    if (err) next(err)
    req.flash('success', 'Successfully added a category')
    return res.redirect('/add-category')
  })
})

router.get('/add-product', passportConfig.isAdmin, function (req, res, next) {
  res.render('admin/add-product', {message: req.flash('success')})
})

router.post('/add-product', passportConfig.isAdmin, function (req, res, next) {
  console.log(req.body)
  var imageURL
  if (req.body.imageURL == '') {
    imageURL = 'http://i.imgur.com/m04fRgc.jpg'
  } else {
    imageURL = req.body.imageURL
  }
  console.log('image url is now ' + req.body.imageURL)
  var product = new Product()
  Category.findOne({name: req.body.category}, function (err, category) {
    if (err) console.log(err)
    console.log(category)
    product.category = category._id
    product.category.name = category.name
    product.name = req.body.name
    product.price = req.body.price
    product.image = imageURL

    product.save(function (err) {
      if (err) next(err)
      req.flash('success', 'Successfully added a product')
      return res.redirect('/add-product')
    })
  })
})

// send data to server: remove product from site
router.post('/remove-product', passportConfig.isAdmin, function (req, res, next) {
  Product.findByIdAndRemove({_id: req.body.remove}, function (err, foundProduct) {
    if (err) return next()
    req.flash('success', 'Successfully deleted product')
    res.redirect('back')
  })
})

// get data from server: get form to edit product
// router.get('/edit-product', passportConfig.isAdmin, function (req, res, next) {
//   res.render('admin/edit-product')
// })
//
// // send data to server: save edits to product to database
// router.post('/edit-product', passportConfig.isAdmin, function (req, res, next) {
//   Product.findByIdAndUpdate({_id: req.body.edit}, function (err, foundProduct) {
//     if (err) return next()
//     console.log('FOUND PRODUCT IS ', foundProduct);
//     return res.redirect('/')
//   })
// })

module.exports = router
