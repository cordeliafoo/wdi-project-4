var mongoose = require('mongoose')
var Schema = mongoose.Schema
// mongoosastic is a library
// search specific product using mongoosastic features without writing additional code to connect elasticsearch and mongodb
var mongoosastic=require('mongoosastic')


var ProductSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
})

ProductSchema.plugin(mongoosastic)

module.exports = mongoose.model('Product', ProductSchema)
