$(function () {
  var opts = {
    lines: 7, // The number of lines to draw
    length: 25, // The length of each line
    width: 10, // The line thickness
    radius: 44, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.25, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'absolute' // Element positioning
  }
  var stripe = Stripe('pk_test_tQVIzlkk11fYH46kBkV7k502')
  var elements = stripe.elements()

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

  $(document).on('click', '#plus', function (e) {
    e.preventDefault()
    var priceValue = parseFloat($('#priceValue').val())
    console.log(priceValue)
    var quantity = parseInt($('#quantity').val())

  // priceHidden is the original price of item
  // priceValue is the accumulated value that user has to pay
    priceValue += parseFloat($('#priceHidden').val())
    quantity += 1

    $('#quantity').val(quantity)
    $('#priceValue').val(priceValue.toFixed(2))
    $('#total').html(quantity)
  })

  $(document).on('click', '#minus', function (e) {
    console.log('clicked')
    e.preventDefault()
    var priceValue = parseFloat($('#priceValue').val())
    console.log(priceValue)
    var quantity = parseInt($('#quantity').val())

    if (quantity === 1) {
      priceValue = $('#priceHidden').val()
      quantity = 1
    } else {
    // priceHidden is the original price of item
    // priceValue is the accumulated value that user has to pay
      priceValue -= parseFloat($('#priceHidden').val())
      quantity -= 1

      $('#quantity').val(quantity)
      $('#priceValue').val(priceValue.toFixed(2))
      $('#total').html(quantity)
    }
  })

  // //////////////////////////////////////STRIPE /////////////////////////////////////////////////////////

  // Custom styling can be passed to options when creating an Element.
  var style = {
    base: {
    // Add your base input styles here. For example:
      fontSize: '16px',
      lineHeight: '24px'
    }
  }

// Create an instance of the card Element
  var card = elements.create('card', {style: style})

// Add an instance of the card Element into the `card-element` <div>
  if ($('#card-element').length) {
    card.mount('#card-element')
  }

  card.addEventListener('change', function (event) {
    var displayError = document.getElementById('card-errors')
    if (event.error) {
      displayError.textContent = event.error.message
    } else {
      displayError.textContent = ''
    }
  })

  // Create a token or display an error when the form is submitted.
  if ($('#payment-form').length) {
    var form = document.getElementById('payment-form')
    form.addEventListener('submit', function (event) {
      event.preventDefault()

      stripe.createToken(card).then(function (result) {
        if (result.error) {
          // Inform the user if there was an error
          var errorElement = document.getElementById('card-errors')
          errorElement.textContent = result.error.message
        } else {
          // Send the token to your server
          stripeTokenHandler(result.token)
        }
      })
    })
  }

  function stripeTokenHandler (token) {
  // Insert the token ID into the form so it gets submitted to the server
    var form = document.getElementById('payment-form')
    var hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('type', 'hidden')
    hiddenInput.setAttribute('name', 'stripeToken')
    hiddenInput.setAttribute('value', token.id)
    form.appendChild(hiddenInput)

    var spinner = new Spinner(opts).spin(loading)
    loading.appendChild(spinner.el)

  // Submit the form
    form.submit()
  }

  // $(function () {
  //   if ($.fn.cloudinary_fileupload !== undefined) {
  //     $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()
  //   }
  // })
}) // end of $(function(){ blahblah)
