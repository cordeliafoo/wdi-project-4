var Cart = require('../models/cart')

module.exports = function (req, res, next) {
  if (req.user) {
    var total = 0
    Cart.findOne({owner: req.user._id}, function (err, cart) {
      if (cart) {
        for (var i = 0; i < cart.items.length; i++) {
          total += cart.items[i].quantity
        }
        // res.locals is an object that contains response local variables scoped to that request
        // res.locals only available to views rendered during that request/response cycle
        // set a local variable called cart to total
        // looping through cart to get cart.items.quantity to account for >1 quantity purchased for same item.
        // will be able to use local variable 'cart' to reflect TOTAL QUANTITY in the cart-icon in navbar
        res.locals.cart = total
      } else {
        res.locals.cart = 0
      }
      next()
    })
  } else {
    next()
  }
}
