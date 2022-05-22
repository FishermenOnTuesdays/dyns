function HyperbolicPDESolutionRequest(){
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
    spinnerToggle('DrawSolution', true);

    jQuery.post(
        `https://${ip}:${port}/api`,
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
        
        spinnerToggle('DrawSolution', false);

        draw3DSurfacePlot('3DSurfaceChart', data['x'], data['t'], data['z_data'], 'x', 't', 'u')

        delay(1000).then(() => updateLayout());
    };        
}

function ParabolicPDESolutionRequest(){
    // gathering data from UI
    var request = {
        'q': $('#qx').text(),
        'k': $('#kx').text(),
	    'f': $('#fx').text(),
        'phi': $('#phix').text(),
        'alpha1': $('#alpha1').text(),
        'beta1': $('#beta1').text(),
        'gamma1': $('#gamma1').text(),
        'alpha2': $('#alpha2').text(),
        'beta2': $('#beta2').text(),
        'gamma2': $('#gamma2').text(),
        'a': parseFloat($('#a').text()),
        'b': parseFloat($('#b').text()),
        'T': parseFloat($('#T').text()),
        'h': parseFloat($('#h').text()),
        'tau': parseFloat($('#tau').text())
    }

    console.log(request);
    spinnerToggle('DrawSolution', true);

    jQuery.post(
        `https://${ip}:${port}/api`,
        {
            'request type': 'ParabolicPartialDifferentialEquation',
            'payload': JSON.stringify(request)
        },
        successpPDE
    );

    function successpPDE(data){
        jQuery("#charts").show();
        jQuery("#credits").show();
        jQuery("#precredits").hide();
        
        spinnerToggle('DrawSolution', false);

        draw3DSurfacePlot('3DSurfaceChart', data['x'], data['t'], data['z_data'], 'x', 't', 'u')

        delay(1000).then(() => updateLayout());
    };        
}

function TwoDimensionalHeatEquationRequest(){
    // gathering data from UI
    var request = {
        'qxyX': $('#qxyX').text(),
        'KxyX': $('#KxyX').text(),
        'qxyY': $('#qxyY').text(),
        'KxyY': $('#KxyY').text(),
	    'fxyt': $('#fxyt').text(),
        'a': parseFloat($('#a').text()),
        'b': parseFloat($('#b').text()),
        'c': parseFloat($('#c').text()),
        'd': parseFloat($('#d').text()),
        'T': parseFloat($('#T').text()),
        'mu_a': $('#mu_a').text(),
        'mu_b': $('#mu_b').text(),
        'mu_c': $('#mu_c').text(),
        'mu_d': $('#mu_d').text(),
        'u0': $('#u0').text(),
        'hx': parseFloat($('#hx').text()),
        'hy': parseFloat($('#hy').text()),
        'tau': parseFloat($('#tau').text())
    }

    console.log(request);
    spinnerToggle('DrawSolution', true);

    jQuery.post(
        `https://${ip}:${port}/api`,
        {
            'request type': '2DimensionalHeatEquation',
            'payload': JSON.stringify(request)
        },
        successpPDE
    );

    function successpPDE(data){
        jQuery("#charts").show();
        jQuery("#credits").show();
        jQuery("#precredits").hide();
        
        spinnerToggle('DrawSolution', false);

        startAnimation = animate3DSurfacePlot('3DSurfaceChart', data['x'], data['y'], data['u'], data['t'], 'x', 'y', 'u')

        delay(500).then(() => updateLayout());
        jQuery("#Animate").on('click', function() {
            startAnimation()
        });

        return startAnimation;
    };        
}