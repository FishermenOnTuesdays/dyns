// global vars
var startAnimation;

// UI
jQuery(function(){
    jQuery("#charts").hide();
    jQuery("#credits").hide();
    jQuery("#precredits").show();
    // jQuery("#DrawSolution").click(TwoDimensionalHeatEquationRequest);
    jQuery("#DrawSolution").on('click', function() {
        startAnimation = TwoDimensionalHeatEquationRequest();
    });

    //example hPDEs
    {
        jQuery("#sample1").click(function(){
            $('#qxyX').text(1),
            $('#KxyX').text(1),
            $('#qxyY').text(1),
            $('#KxyY').text(1),
            $('#fxyt').text(0),
            $('#a').text(0),
            $('#b').text(1),
            $('#c').text(0),
            $('#d').text(1),
            $('#T').text(0.1),
            $('#mu_a').text(0),
            $('#mu_b').text(0),
            $('#mu_c').text(0),
            $('#mu_d').text(0),
            $('#u0').text(1),
            $('#hx').text(0.1),
            $('#hy').text(0.1),
            $('#tau').text(0.01)
        });
    }
})

// var effectVANTA = delay(100).then(() => makeVANTA('body'));

/* updates layout */
function updateLayout(){
    delay(200).then(makeVANTA('body').resize());
}

delay(2000).then(() => updateLayout());
