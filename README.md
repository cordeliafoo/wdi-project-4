# SHOPPPIT

## About
Shopppit (with three Ps) is my 4th and final project as a Web Development Immersive student at General Assembly.   This app pays homage to a vice that surfaces whenever I'm stressed (which happened a lot throughout my time at WDI!) - online shopping aka shopping with monopoly money.  I wanted to walk myself through the steps of actually building an ecommerce website from the user's perspective, as well as from the admin/business owner's perspective. 

This full-stack app is built with node js, Express, MongoLab with Bootstrap as the frontend framework.
 
![shopppit](https://github.com/shirongfoo/wdi-project-4/blob/master/shoppit1%20(3).gif)

## Development
I came up with 4 models altogether for this application.  User, Category, Product, and Cart.  My models are as follows: 

```var UserSchema = new mongoose.Schema({
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
  }],
  isAdmin: {type: Boolean, default: false}
})
