function sendFormData(FD) {

  var submitButton = document.getElementById('submitButton');
  submitButton.innerHTML = '<div class="spinner-border text-light mx-auto" role="status"><span class="visually-hidden">Loading...</span></div>';

  const XHR = new XMLHttpRequest();

  // Define what happens on successful data submission
  XHR.addEventListener("load", function(event) {

    var submitButton = document.getElementById('submitButton');
    submitButton.innerHTML = 'Решить';
    data = JSON.parse(event.target.responseText);
    // console.log(data)

    switch (data.response) {
      case 'OK':
        // submitButton.insertAdjacentHTML('afterend', '<div class="alert alert-success" role="alert">успешно!</div>');
        // data is object with keys: 'response', 'x'
        // console.log(data.x)
        // set x values to inputs
        for (var i = 1; i <= data.x.length; i++) {
          var input = document.getElementById('vector_x' + i);
          input.innerHTML = data.x[i - 1];
        }

        break;
      case 'error':
        alert(data.error);
        break;
        // switch (data.error) {
        //   case 'maximum file size exceeded':
        //     alert(data.error);
        //     break;
        //   default:
        //     alert('Неизвестная ошибка на сервере')
        //     break;
        // }
        // break;
      default:
        alert('Неизвестная ошибка')
        break;
    }

  });

  // Define what happens in case of error
  XHR.addEventListener("error", function(event) {
    var submitButton = document.getElementById('submitButton');
    submitButton.insertAdjacentHTML('afterend', '<div class="alert alert-danger" role="alert">Ой, что-то пошло не так.</div>');
  });

  // Set up our request
  XHR.open("POST", "/api");

  // The data sent is what the user provided in the form
  XHR.send(FD);
}

// load static html blocks and add listeners for submit form
$(
  function () {
    var includes = $('[data-include]')
    $.each(includes, function () {
      var file = '/SLEs/views/' + $(this).data('include') + '.html'
      $(this).load(file)
    }).promise().done(function(){

        delay(100).then(() => {
          // JavaScript for disabling form submissions if there are invalid fields
          (function () {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            var forms = document.querySelectorAll('.needs-validation')

            // Loop over them and prevent submission
            Array.prototype.slice.call(forms)
              .forEach(function (form) {
                // check if var_num field is not empty
                form.addEventListener('submit', function (event) {
                  if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                  } else {
                    event.preventDefault();
                    const FD = new FormData(form);
                    FD.append('request type', 'SLE');
                    FD.append('SLE_type', form.name);
                    sendFormData(FD);
                  }
                  form.classList.add('was-validated')
                }, false)
              })
          })()

        })

      });
  }
);

$(document).ready(function() {
  // new ClipboardJS('.btn');
  
  $('select').on('change', function(e){
    example_num = this.value;
    let example_data = this.options[this.selectedIndex].getAttribute("data-example");
    example_data = JSON.parse(example_data);
    // console.log(example_data);
    for (const [key, value] of Object.entries(example_data)) {
      if (key.includes('table')) {
        let size = value.length;
        let smallest10exp = Math.ceil(Math.log10(size));
        let multiplicator = Math.pow(10, smallest10exp);
        for (var i = 0; i < size; i++) {
          for (let j = 0; j < value[i].length; j++) {
            cell_id = key + ((i+1)*multiplicator + (j+1));
            document.getElementById(cell_id).innerHTML = value[i][j];
          }
        }
      } else {
        if (key.includes('vector')) {
          for (let i = 0; i < value.length; i++) {
            cell_id = key + (i+1);
            document.getElementById(cell_id).innerHTML = value[i];
          }
        }
      }
    }

    sle_type = this.parentNode.parentNode.parentNode.name;
    form = document.getElementById(sle_type);
    const FD = new FormData(form);
    FD.append('request type', 'SLE');
    FD.append('sle_type', sle_type);
    FD.append('sle_method', 'default');
    FD.append('matrix', example_data['matrix_A']);
    FD.append('vector', example_data['vector_b']);
    sendFormData(FD);
  });

});
