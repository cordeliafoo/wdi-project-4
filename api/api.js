var express = require('express')
var router = express.Router()
// async is a library that will help to manage a series of callbacks
var async = require('async')
var faker = require('faker')
var Category = require('../models/category')
var Product = require('../models/product')

// posting to /api/search: handling ajax call in public/js/pages.js
router.post('/search', function (req, res, next) {
  console.log(req.body.search_term)

  Product
  .find({name: {$regex: `.*${req.body.search_term}.*`, $options: '-i'}})
  .populate('category')
  .exec(function (err, data) {
    if (err) return next(err)
    res.json(data)
  })
})

// handling get requests to /api/:name where :name is category name.  populates categories with seed data.
router.get('/:name', function (req, res, next) {
  async.waterfall([
    function (callback) {
      Category.findOne({name: req.params.name}, function (err, category) {
        if (err) return next(err)
        callback(null, category)
      })
    },
    function (category, callback) {
      for (var i = 0; i < 30; i++) {
        var product = new Product()
        product.category = category._id
        product.category.name = category.name
        product.name = faker.commerce.productName()
        product.price = faker.commerce.price()
        product.image = faker.image.image()
        product.save()
      }
    }
  ])

  res.json({message: 'Success'})
})

module.exports = router
