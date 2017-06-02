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
Having tried the common way of uploading images from a web application to the cloud (a form in the application uploads an image to my server that in turn uploads the same image to the cloud), I wanted to try delivering images directly from the users' browser to the cloud without going through the intermediary server.  This approach is not only faster, but is simple to integrate with modern web browsers and includes many modern uploading UI elements such as drag & drop support and showing uploading progress.  

According to the tutorial,  javascript files from certain node modules had to be accessed from within the HTML file. To accomplish this, the following middlewares had to be run in server.js:
```
app.use('/blueimp', express.static(__dirname + '/node_modules/blueimp-file-upload/js/'))
app.use('/cloudinaryupload', express.static(__dirname + '/node_modules/cloudinary-jquery-file-upload/'))
```

Over in the add-products ejs file:
```
<script src="blueimp/vendor/jquery.ui.widget.js" type="text/javascript"></script>
<script src="blueimp/jquery.iframe-transport.js" type="text/javascript"></script>
<script src="blueimp/jquery.fileupload.js" type="text/javascript"></script>
<script src="cloudinaryupload/cloudinary-jquery-file-upload.js" type="text/javascript"></script>

<script type="text/javascript">
    // $('.upload_form').append(
    //   $.cloudinary.unsigned_upload_tag('l2g2tztk', {cloud_name: 'shirongfoo'})
    // ).bind('cloudinarydone', function(e, data){
    //   console.log('uploaded')
    // })
    $('.upload_field').unsigned_cloudinary_upload(
      'l2g2tztk',
      { cloud_name: 'shirongfoo'}
    ).bind('cloudinarydone', function(e, data) {
      $('.thumbnails').html(
        '<img src="'+ data.result.secure_url + '" height=" '+ 300 + '" height=" '+ 300 + '"/>'
      )
      $('.imageURL').val(data.result.secure_url)
      // $('.thumbnails').append($.cloudinary.image(data.result.public_id,
      //     {
      //       format: 'jpg',
      //       width: 150,
      //       height: 100,
      //       crop: 'thumb',
      //       gravity: 'face',
      //       effect: 'saturation:50'
      //     }
      //   )
      // )
    }).bind('cloudinaryprogress', function(e, data) {
      $('.progress').css('visibility', 'visible')
      $('.progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%');
    });
</script>
```

### Searchbar with Ajax 

```
$('#search').keyup(function () {
    var search_term = $(this).val()
    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
      success: function (data) {
        console.log(data)
        var data = data

        $('#searchResults').empty()
        for (var i = 0; i < data.length; i++) {
          var html = ''
          html += `<div class=col-md-4>`
          html += `<a href = "product/${data[i]._id}">`
          html += `<div class="thumbnail">`
          html += `<img src= "${data[i].image}">`
          html += `<div class = "caption">`
          html += `<h3>${data[i].name}</h3>`
          // html += `<p>${data[i].category.name}</p>`
          html += `<p>$${data[i].price}</p>`
          html += `</div>`
          html += `</div>`
          html += `</a>`
          html += `</div>`

          $('#searchResults').append(html)
        }
      },
      error: function (error) {
        console.log(error)
      }
    })
  })

```

```
// posting to /api/search: handling ajax call in public/js/pages.js
router.post('/search', function (req, res, next) {

  Product
  .find({name: {$regex: `.*${req.body.search_term}.*`, $options: '-i'}})
  .populate('category')
  .exec(function (err, data) {
    if (err) return next(err)
    res.json(data)
  })
})
```

## References:
### CSS Framework
- http://getbootstrap.com/css/

### Others
Cloudinary Direct Browser Upload: 
- http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud
- https://github.com/cloudinary/cloudinary_js

Pagination in Mongoose:
- http://madhums.me/2012/08/20/pagination-using-mongoose-express-and-jade/



## Acknowledgements: 
My truly amazing WDI9 classmates who have rendered help in all ways possible. Also thanks especially to Prima and Sharona for battling through the cloudinary direct upload with me; and also to Yisheng for patiently helping me troubleshoot through all my bugs.
