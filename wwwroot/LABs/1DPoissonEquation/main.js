function draw2DLinePlot(element_id, x, ys, names){
    var traces = [];
    ys.forEach(y => {
        traces.push({
            x: x,
            y: y,
            mode: 'lines',
            line: {shape: 'spline'},
            type: 'scatter',
            name: names[ys.indexOf(y)]
        });
    });
    var config = {responsive: true}
    Plotly.newPlot(element_id, traces, {
        displayModeBar: true,
        margin: {
        t: 50, //top margin
        l: 50, //left margin
        r: 50, //right margin
        b: 50 //bottom margin
        },
    },
    config);
}

$(document).ready(function() {
    function PoissionEquationRequest(){
        // gathering data from UI
        var request = {
            'fx': document.getElementById('fx').innerText,
            'a': parseFloat(document.getElementById('a').innerText),
            'b': parseFloat(document.getElementById('b').innerText),
            'u_a': parseFloat(document.getElementById('u_a').innerText),
            'u_b': parseFloat(document.getElementById('u_b').innerText),
            'N': parseInt(document.getElementById('N').innerText),
            // 'method_name': document.getElementById('method_name').value,
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
            'request type': '1DPoissonEquation',
            'payload': JSON.stringify(request)
        }));

        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
                // alert(`Done, got ${xhr.response.length} bytes`); // response is the server
                var response = JSON.parse(xhr.response);
                console.log(response);
                // check if analytical_solution string input is empty
                if (document.getElementById('analytical_solution').innerText == ''){
                    draw2DLinePlot('SolutionGraph', response.x, [response.U_finite_element, response.U_finite_difference], ['Метод конечных элементов', 'Метод конечных разностей']);
                } else {
                    // calculate analytical solution
                    var analytical_solution = document.getElementById('analytical_solution').innerText;
                    var U_analytical = [];
                    response.x.forEach(x => {
                        U_analytical.push(
                            math.evaluate(analytical_solution, {x: x})
                        );
                    });
                    draw2DLinePlot('SolutionGraph', response.x, [response.U_finite_element, response.U_finite_difference, U_analytical], ['Метод конечных элементов', 'Метод конечных разностей', 'Аналитическое решение']);
                }
                draw2DLinePlot('DifferenceGraph', response.x, [response.U_difference], ['Разность решений']);
                document.getElementById('solveButton').innerHTML = 'Решить';
                updateLayout('vanta');
            }
        };
    }

    document.getElementById('solveButton').addEventListener('click', PoissionEquationRequest);
});


