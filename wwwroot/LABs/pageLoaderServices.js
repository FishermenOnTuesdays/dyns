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
        // set mse value to input
        var euclidean = document.getElementById('error');
        euclidean.innerHTML = data.euclidean;
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
  // XHR.open("POST", "/api");
  XHR.open("POST", "http://localhost:5001/");

  // The data sent is what the user provided in the form
  XHR.send(FD);
}

// load static html blocks and add listeners for submit form
$(
  function () {
    var includes = $('[data-include]')
    $.each(includes, function () {
      var file = '/LABs/views/' + $(this).data('include') + '.html'
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
                    form = document.getElementById(this.name);
                    const FD = new FormData(form);
                    FD.append('request type', 'SLE');
                    // FD.append('SLE_type', this.name);
                    FD.append('SLE_method', document.getElementById('SLE_method').value);
                    let matrix = [];
                    let vector = [];
                    var N = parseInt(document.getElementById('i0N').value);
                    let smallest10exp = Math.ceil(Math.log10(N));
                    let multiplicator = Math.pow(10, smallest10exp);
                    for (let i = 0; i < N; i++) {
                      let row = [];
                      for (let j = 0; j < N; j++) {
                        row.push(parseFloat(document.getElementById('table_A' + ((i+1)*multiplicator + (j+1))).innerHTML));
                      }
                      matrix.push(row);
                    }
                    for (let i = 0; i < N; i++) {
                      vector.push(parseFloat(document.getElementById('vector_b' + (i+1)).innerHTML));
                    }
                    FD.append('matrix', JSON.stringify(matrix));
                    FD.append('vector', JSON.stringify(vector));
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

// $(document).ready(function() {
//   // new ClipboardJS('.btn');

// });
