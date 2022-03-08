// UI
jQuery(function(){
    jQuery("#charts").hide();
    jQuery("#credits").hide();
    jQuery("#precredits").show();
    jQuery("#DrawSolution").click(HyperbolicPDESolutionRequest);

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

var effectVANTA = delay(100).then(() => makeVANTA('body'));

/* updates layout */
function updateLayout(){
    effectVANTA.resize();
}