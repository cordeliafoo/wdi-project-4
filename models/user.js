var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var crypto = require('crypto')
var Schema = mongoose.Schema

// the user schema attributes/characteristics/fields
var UserSchema = new mongoose.Schema({
  email: {type: String, unique: true, lowercase: true},
  password: {type: String},
  facebook: String,
  tokens: Array,
  profile: {
    name: {type: String, default: ''},
    picture: {type: String, default: ''}
  },
  address: String,
  history: [{
    paid: {type: Number, default: 0},
    item: {type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: {type: Number, default: 1}
  }]

})

// hash password before we save it to database
UserSchema.pre('save', function (next) {
  // pre is a mongoose method for every schema
  var user = this
  // var user12345= new User()
  // this refers to the user12345
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

// compare password in datase with one that user types in
UserSchema.methods.comparePassword = function (password) {
  // UserSchema.methods.functionName create a custom method for UserSchema
  return bcrypt.compareSync(password, this.password)
}

UserSchema.methods.gravatar = function (size) {
  if (!this.size) size = 200
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro'
  var md5 = crypto.createHash('md5').update(this.email).digest('hex')
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
}

module.exports = mongoose.model('User', UserSchema)
