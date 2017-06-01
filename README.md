# SHOPPPIT
## Where to find it?
The deployed app can be found  at http://shopppit.herokuapp.com/

## About
Shopppit (with three Ps (!!) because shopit and shoppit were already taken) is my 4th and final project as a Web Development Immersive student at General Assembly Singapore.   This app pays homage to a vice that surfaces whenever I'm stressed (which happened a lot throughout my time at WDI) - online shopping. I wanted to walk myself through the steps of actually building an ecommerce website from the user's perspective, as well as from the admin/business owner's perspective. 

This full-stack app is built with node js, Express, MongoLab with Bootstrap as the frontend framework and deployed on heroku.
 
![shopppit](https://github.com/shirongfoo/wdi-project-4/blob/master/shoppit1%20(3).gif)

## Development
### Models
I came up with 4 models altogether for this application - User, Category, Product, and Cart.  My models are as follows; using referencing to link them together: 

```
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
  }],
  isAdmin: {type: Boolean, default: false}
})

```

```
var CategorySchema = new Schema({
  name: {type: String, unique: true, lowercase: true}
})
```

```
var ProductSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  name: {type: String, required: true},
  price: {type: Number, required: true},
  image: String
})
```

``` 
var CartSchema = new Schema({
  owner: {type: Schema.Types.ObjectId, ref: 'User'},
  total: {type: Number, default: 0},
  items: [{
    item: {type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: {type: Number, default: 1},
    price: {type: Number, default: 0}
  }]
})
```

## User Flow:
New users will be able to:
- sign up as member and automatically be logged in
- log in using their Facebook credentials

Logged In Members are able to:
- browse items
- search for items using the search bars
- add items/corresponding quantity to their cart
- remove items from their cart
- view their purchase history
- checkout their cart and pay using stripe 

Admin will be able to perform all functions a Logged In Member can.  Admin will also be able to:
- add category
- add/delete/update product 


## Notable Areas:
### Cloudinary jQuery plugin for direct image uploading from browser
This method of uploading images allows for images to be uploaded directly from a browser to cloud without going through my server.   
### ajax search 
### pagination mongoose query 

## References:
### CSS Framework
### Others
![Cloudinary Direct Browser Upload]http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud

## Acknowledgements: 
My truly amazing WDI9 classmates who have rendered help in all ways possible. Also thanks especially to Prima and Sharona for battling through the cloudinary direct upload with me; and also to Yisheng for patiently helping me troubleshoot through all my bugs.
