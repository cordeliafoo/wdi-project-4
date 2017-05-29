var express = require('express')
var router = express.Router()
var Category = require('../models/category')
var Product = require('../models/product')
var passportConfig = require('../config/passport')

router.get('/adminlogin', function (req, res, next) {
  res.render('admin/adminlogin', {message: req.flash('success')})
})

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
  var product = new Product()
  Category.findOne({name: req.body.category}, function (err, category) {
    if (err) return next(err)
    product.category = category._id
    product.category.name = category.name
    product.name = req.body.name
    product.price = req.body.price
    product.image = req.body.image
    product.save(function (err) {
      if (err) next(err)
      req.flash('success', 'Successfully added a product')
      return res.redirect('/add-product')
    })
  })
})

module.exports = router
