var express = require('express')
var router = express.Router()
var Category = require('../models/category')
var Product = require('../models/product')
var passport = require('passport')
var passportConfig = require('../config/passport')

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

// get data from server: get form to edit particular product
router.get('/edit-product/:id', passportConfig.isAdmin, function (req, res, next) {
  Product
  .findOne({_id: req.params.id})
  .populate('category')
  .exec(function (err, foundProduct) {
    if (err) return next(err)
    res.render('admin/edit-product', {foundProduct: foundProduct})
  })
})

// send data to server: save edits to product to database
router.post('/edit-product/:id', passportConfig.isAdmin, function (req, res, next) {
  Product.findOne({_id: req.params.id}, function (err, foundProduct) {
    console.log('found product is ', foundProduct)
    if (err) return next(err)
    if (req.body.name) foundProduct.name = req.body.name
    if (req.body.price) foundProduct.price = req.body.price
    if (req.body.category) foundProduct.category = req.body.category
    if (req.body.image) foundProduct.image = req.body.image

    foundProduct.save(function (err) {
      if (err) return next(err)
      req.flash('success', 'Successfully edited product')
      return res.redirect('/')
    })
  })
})

module.exports = router
