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
        jQuery("#sample2").click(function(){
            $('#qxyX').text(1),
            $('#KxyX').text(1),
            $('#qxyY').text(1),
            $('#KxyY').text(1),
            $('#fxyt').text(0),
            $('#a').text(0),
            $('#b').text(3),
            $('#c').text(-1),
            $('#d').text(2),
            $('#T').text(0.5),
            $('#mu_a').text(0),
            $('#mu_b').text(0),
            $('#mu_c').text(0),
            $('#mu_d').text(0),
            $('#u0').text('2*exp(-10*((x-1)^2+(y-0.5)^2))'),
            $('#hx').text(0.05),
            $('#hy').text(0.05),
            $('#tau').text(0.01)
        });
        jQuery("#sample3").click(function(){
            $('#qxyX').text(1),
            $('#KxyX').text(1),
            $('#qxyY').text(1),
            $('#KxyY').text(1),
            $('#fxyt').text('100*exp(-100*((x-1)^2+(y-0.5)^2))'),
            $('#a').text(0),
            $('#b').text(2),
            $('#c').text(0),
            $('#d').text(1),
            $('#T').text(0.5),
            $('#mu_a').text(0),
            $('#mu_b').text(0),
            $('#mu_c').text(0),
            $('#mu_d').text(0),
            $('#u0').text(0),
            $('#hx').text(0.05),
            $('#hy').text(0.05),
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
