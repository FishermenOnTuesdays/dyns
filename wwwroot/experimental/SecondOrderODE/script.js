// global vars
localhost_ip = '127.0.0.1';
local_ip = '192.168.31.80';
dyns_ip = '85.143.113.155';
dyns_web = 'dyns.mephi.ru';
var ip = localhost_ip;

// UI
var effectVANTA;
// launch UI
onStart();

/* updates layout */
function updateLayout(){
    effectVANTA.resize();
}
/* launches on start, prepair page */
function onStart(){
    jQuery(function(){

        effectVANTA = VANTA.FOG({
            el: "#mainbody",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0x7bff,
            midtoneColor: 0x0,
            lowlightColor: 0xa9ff,
            baseColor: 0x0
        });

        jQuery("#charts").hide();
        jQuery("#DrawSolution").click(DrawSolution);

    })
}

/* receives onDraw task state and updates spinner */
function successAlert(state) {
    if (state){
        //add alert
        //var success_alert_html = jQuery('<div id="success_alert" class="alert alert-warning text_center m10" role="alert">ОБРАБОТКА</div>');
        //jQuery(".code").prepend(success_alert_html);
        //add spinner to button
        var spinner_html = '<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>';
        jQuery("#draw").text("");
        jQuery("#draw").append(spinner_html);
    } else{
        //jQuery("#success_alert").delay(500).fadeOut(100);
        jQuery("#draw").empty();
        jQuery("#draw").text("Построить графики");
    }
}
// web graph
function DrawSolution(){
    // gathering data from UI
    var requestData = {};
    requestData['request type'] = 'SecondOrderODESolver';
    requestData['functions'] = [jQuery("#px").val(), jQuery("#qx").val(), jQuery("#phix").val()];
    requestData['boundaries'] = [
                                [parseFloat(jQuery("#A1").val()), parseFloat(jQuery("#A2").val()), parseFloat(jQuery("#A3").val())],
                                [parseFloat(jQuery("#B1").val()), parseFloat(jQuery("#B2").val()), parseFloat(jQuery("#B3").val())]
                                ];
    let a = parseFloat(jQuery("#leftbound").val())
    let b = parseFloat(jQuery("#rightbound").val())
    let N = parseInt(jQuery("#N").val());
    requestData['bounds'] = [a, b];
    requestData['N'] = N;

    request = {
        'request type': requestData['request type'],
        'data': JSON.stringify(requestData)
    }

    console.log(request);
    successAlert(true);
    jQuery.post(
        'https://' + ip + ':5000',
        request,
        success
    );

    function success(data){
        var data = JSON.parse(data);
        console.log(data);
        jQuery("#charts").show();
        if (jQuery("#truesolution").val() == ''){
            makePlot(linspace(a, b, N), data, 'chartYX')
        } else {
            X = linspace(a, b, N);
            makePlots([X, X], [data, applyStringFunc(jQuery("#truesolution").val(), X)], ['calculated solution', 'true solution'], 'chartYX')
        }
        successAlert(false);
    }

}

/**
 * returns Plotly lines trace object.
 */
function makeTrace(x, y, name){
    return {
        x: x,
        y: y,
        mode: 'lines',
        line: {shape: 'spline'},
        type: 'scatter',
        name: name
    };
}
/**
 * make Plotly plot using 2 dimensional arrays and their names for specified chart_id.
 * uses makeTrace() function to make traces
 */
function makePlots(X, Y, names, chart_id){
    var traces = Array(X.length).fill().map((_, i) => makeTrace(X[i], Y[i], names[i]));
    var config = {responsive: true}
    Plotly.newPlot(chart_id, traces, {
        displayModeBar: true,
        margin: {
        t: 20, //top margin
        l: 20, //left margin
        r: 20, //right margin
        b: 20 //bottom margin
        },
        xaxis: {
            constrain: 'range'
            }, 
        yaxis: {
            scaleanchor: 'x'
            }
    },
    config);
}
function makePlot(x, y, name){
    var traces = [{
        x: x,
        y: y,
        mode: 'lines',
        line: {shape: 'spline'},
        type: 'scatter'
    }];
    var config = {responsive: true}
    Plotly.newPlot(name, traces, {
        displayModeBar: true,
        margin: {
        t: 20, //top margin
        l: 20, //left margin
        r: 20, //right margin
        b: 20 //bottom margin
        },
        xaxis: {
            constrain: 'range'
            }, 
        yaxis: {
            scaleanchor: 'x'
            }
    },
    config);
}

// utility func
/* makes linspace */
function linspace(start, stop, N) {
    var arr = [];
    var step = (stop - start) / (N - 1);
    for (var i = 0; i < N; i++) {
      arr.push(start + (step * i));
    }
    return arr;
}
/* applies string func on array */
function applyStringFunc(stringfunc, X){
    return Array(X.length).fill().map((_, i) => math.evaluate(stringfunc, {x: X[i]}) );
}