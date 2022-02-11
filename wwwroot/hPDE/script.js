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

        //example hPDEs
        {
            jQuery("#sample1").click(function(){
                $('#fx').text('1'),
                $('#gx').text('1'),
                $('#phix').text('sin(x)'),
                $('#psix').text('0'),
                $('#alpha1').text(0),
                $('#beta1').text(1),
                $('#gamma1').text(0),
                $('#alpha2').text(0),
                $('#beta2').text(1),
                $('#gamma2').text(0),
                $('#a').text(0),
                $('#b').text(6.28),
                $('#T').text(10),
                $('#h').text(0.01),
                $('#tau').text(0.01)
            });
        }

    })

    
}

/* receives onDraw task state and updates spinner */
function successAlert(state) {
    if (state){
        //add alert
        //var success_alert_html = jQuery('<div id="success_alert" class="alert alert-warning text_center m10" role="alert">ОБРАБОТКА</div>')
        //jQuery(".code").prepend(success_alert_html)
        //add spinner to button
        var spinner_html = '<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>';
        jQuery("#draw").text("");
        jQuery("#draw").append(spinner_html);
    } else{
        //jQuery("#success_alert").delay(500).fadeOut(100)
        jQuery("#draw").empty();
        jQuery("#draw").text("Построить графики");
    }
}
// web graph
function DrawSolution(){
    // gathering data from UI
    var request = {
        'f': $('#fx').text(),
        'g': $('#gx').text(),
        'phi': $('#phix').text(),
        'psi': $('#psix').text(),
        'alpha1': parseFloat($('#alpha1').text()),
        'beta1': parseFloat($('#beta1').text()),
        'gamma1': parseFloat($('#gamma1').text()),
        'alpha2': parseFloat($('#alpha2').text()),
        'beta2': parseFloat($('#beta2').text()),
        'gamma2': parseFloat($('#gamma2').text()),
        'a': parseFloat($('#a').text()),
        'b': parseFloat($('#b').text()),
        'T': parseFloat($('#T').text()),
        'h': parseFloat($('#h').text()),
        'tau': parseFloat($('#tau').text())
    }

    console.log(request);
    successAlert(true);

    jQuery.post(
        'http://' + ip + ':5000/api',
        {
            'request type': 'HyperbolicPartialDifferentialEquation',
            'payload': JSON.stringify(request)
        },
        successhPDE
    );

    function successhPDE(data){
        console.log(data);
        jQuery("#charts").show(),
        // if (jQuery("#truesolution").val() == ''){
        //     makePlot(linspace(a, b, N), data, 'chartYX')
        // } else {
        //     X = linspace(a, b, N),
        //     makePlots([X, X], [data, applyStringFunc(jQuery("#truesolution").val(), X)], ['calculated solution', 'true solution'], 'chartYX')
        // }
        // successAlert(false),

        successAlert(false)

        var chartData = [{
            z: data['data'],
            type: 'surface'
         }];
        
        var layout = {
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
        };
        var config = {responsive: true};
        Plotly.newPlot('3DSurfaceChart', chartData, layout, config);
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
    }
}
/**
 * make Plotly plot using 2 dimensional arrays and their names for specified chart_id.
 * uses makeTrace() function to make traces
 */
function makePlots(X, Y, names, chart_id){
    var traces = Array(X.length).fill().map((_, i) => makeTrace(X[i], Y[i], names[i]));
    var config = {responsive: true};
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
    var config = {responsive: true};
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
/* applies string func on array */
function applyStringFunc(stringfunc, X){
    return Array(X.length).fill().map((_, i) => math.evaluate(stringfunc, {x: X[i]}) )
}