// UI

var effectVANTA;

jQuery(function(){

    effectVANTA = makeVANTA('body');

    jQuery("#charts").hide();
    jQuery("#credits").hide();
    jQuery("#precredits").show();
    jQuery("#DrawSolution").click(ParabolicPDESolutionRequest);

    //example hPDEs
    {
        jQuery("#sample1").click(function(){
            $('#qx').text('1'),
            $('#kx').text('1'),
            $('#fx').text('0'),
            $('#phix').text('sin(x)'),
            $('#alpha1').text(0),
            $('#beta1').text(1),
            $('#gamma1').text(0),
            $('#alpha2').text(0),
            $('#beta2').text(1),
            $('#gamma2').text(0),
            $('#a').text(0),
            $('#b').text(6.28),
            $('#T').text(10),
            $('#h').text(0.1),
            $('#tau').text(0.1)
        });
    }
})
    
/* updates layout */
function updateLayout(){
    effectVANTA.resize();
}
