function draw3DSurfacePlot(element_id, x, y, z, xaxis='x', yaxis='y', zaxis='z', colorscale='') {
    
    var chartData = [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: colorscale,
    }];

    var layout = {
        scene: {
            xaxis:{title: xaxis},
            yaxis:{title: yaxis},
            zaxis:{title: zaxis},
            },
        autosize: true,
        height: 850,
        margin: {
         l: 0,
         r: 0,
         b: 0,
         t: 0,
         pad: 1
        },
    };
    var config = {responsive: true};
    Plotly.newPlot(element_id, chartData, layout, config);
    
}

$(document).ready(function() {
    function PoissionEquationRequest(){
        // gathering data from UI
        var request = {
            'fxy': document.getElementById('fxy').innerText,
            'a': parseFloat(document.getElementById('a').innerText),
            'b': parseFloat(document.getElementById('b').innerText),
            'c': parseFloat(document.getElementById('c').innerText),
            'd': parseFloat(document.getElementById('d').innerText),
            'mu_a': document.getElementById('mu_a').innerText,
            'mu_b': document.getElementById('mu_b').innerText,
            'mu_c': document.getElementById('mu_c').innerText,
            'mu_d': document.getElementById('mu_d').innerText,
            'Nx': parseInt(document.getElementById('Nx').innerText),
            'Ny': parseInt(document.getElementById('Ny').innerText),
            'method_name': document.getElementById('method_name').value,
        }
    
        console.log(request);
        // spinnerToggle('DrawSolution', true);
        // set spinner inside the button
        document.getElementById('solveButton').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

        
        //post request to server in plain javascript
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            'request type': 'PoissonEquation',
            'payload': JSON.stringify(request)
        }));

        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
                // alert(`Done, got ${xhr.response.length} bytes`); // response is the server
                var response = JSON.parse(xhr.response);
                console.log(response);
                draw3DSurfacePlot('SolutionGraph', response['x'], response['y'], response['z_data'], 'x', 'y', 'u', 'Blackbody');
                
                document.getElementById('solveButton').innerHTML = 'Решить';
            }
        };
    }

    document.getElementById('solveButton').addEventListener('click', PoissionEquationRequest);
});


