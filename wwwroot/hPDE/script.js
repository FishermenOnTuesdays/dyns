// global vars
localhost_ip = '127.0.0.1';
local_ip = '192.168.31.80';
dyns_ip = '85.143.113.155';
dyns_web = 'dyns.mephi.ru';
var ip = local_ip;

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
            el: "#body",
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
        jQuery("#credits").hide();
        jQuery("#precredits").show();
        jQuery("#DrawSolution").click(DrawSolution);

        //example hPDEs
        {
            jQuery("#sample1").click(function(){
                $('#fx').text('1'),
                $('#gx').text('1'),
		$('#qx').text('0'),
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
        jQuery("#DrawSolution").text("");
        jQuery("#DrawSolution").append(spinner_html);
    } else{
        //jQuery("#success_alert").delay(500).fadeOut(100)
        jQuery("#DrawSolution").empty();
        jQuery("#DrawSolution").text("Построить график");
    }
}
// web graph
function DrawSolution(){
    // gathering data from UI
    var request = {
        'f': $('#fx').text(),
        'g': $('#gx').text(),
	'q': $('#qx').text(),
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
        'https://' + ip + ':5001/api',
        {
            'request type': 'HyperbolicPartialDifferentialEquation',
            'payload': JSON.stringify(request)
        },
        successhPDE
    );

    function successhPDE(data){
        jQuery("#charts").show();
        jQuery("#credits").show();
        jQuery("#precredits").hide();
        successAlert(false);

        console.log(data);

        // z_data = JSON.parse(data['z_data']);
        // z_data = data['z_data'];

        
        // if (jQuery("#truesolution").val() == ''){
        //     makePlot(linspace(a, b, N), data, 'chartYX')
        // } else {
        //     X = linspace(a, b, N),
        //     makePlots([X, X], [data, applyStringFunc(jQuery("#truesolution").val(), X)], ['calculated solution', 'true solution'], 'chartYX')
        // }
        // successAlert(false),

        

        var chartData = [{
            x: data['x'],
            y: data['t'],
            z: data['z_data'],
            type: 'surface'
         }];
        
        // var layout = {
        //     displayModeBar: true,
        //     margin: {
        //     t: 20, //top margin
        //     l: 20, //left margin
        //     r: 20, //right margin
        //     b: 20 //bottom margin
        //     },
        //     xaxis: {
        //         title: 'x',
        //         constrain: 'range'
        //         }, 
        //     yaxis: {
        //         title: 't',
        //         scaleanchor: 'x'
        //         }
        // };
        var layout = {
            scene: {
                xaxis:{title: 'x'},
                yaxis:{title: 't'},
                zaxis:{title: 'u'},
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
        Plotly.newPlot('3DSurfaceChart', chartData, layout, config);
        };

        delay(1000).then(() => updateLayout());
        
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }