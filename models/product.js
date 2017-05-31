var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ProductSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  name: {type: String, required: true},
  price: {type: Number,required: true},
  image: String
})

module.exports = mongoose.model('Product', ProductSchema)
