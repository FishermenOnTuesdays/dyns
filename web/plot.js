// global vars
var ndims;
var xs = {};

//-------------------------------------------------------

function newrow(){
    console.log(1)
    var newx = '<div class="row justify-content-end no-gutters bg-white rounded shadow p-1 mb-1 ml-1"><div class="col col-20 p-1"><input type="text" class="form-control" id="x_0" placeholder="xi_0"></div><div class="col col-75 p-1"><input type="text" class="form-control" id="x" placeholder="dxi/dt"></div><div class="col col-05 p-1"><button class="remove btn btn-outline-light">&#10060;</button></div></div>';
    count = 1;
    $('input[id="x"]').each(function(i, elem){
        count++;
    });
    return newx.split("xi").join('x'+count);
}

jQuery(function(){
    jQuery("#charts").hide();
    jQuery("#phasecharts").hide();
    jQuery("#phasechart2").hide();
    jQuery("#phasechart3").hide();
    jQuery("#3dcharts").hide();
    
    document.getElementById("N").defaultValue = "1000";
    document.getElementById("dt").defaultValue = "0.001";

    jQuery("#draw").click(onDraw);
    jQuery('#addx').click(function(){
        $('fieldset').append(newrow());
    });
    $(document).on('click', '.remove', function() {
        $(this).parent().parent().remove();
    });
    // btns
    $(document).on('click', '.btn-ch', function(){
        if ($(this).is("active"))
        {
            s = this.id;
            $(this).siblings().removeClass('active');
            makePlotXY(xs[this.id.split('/')[0]], xs[this.id.split('/')[1]], $(this).parent().siblings()['0'].id);
        }
        else
        {
            s = this.id;
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
            makePlotXY(xs[this.id.split('/')[0]], xs[this.id.split('/')[1]], $(this).parent().siblings()['0'].id);
        }
     });
});

function onDraw()
{
    k0 = 0;
    k = 0;
    var data = {};
    jQuery('input[id="x"]').each(function(i, elem){
        if ($(elem).val() != ""){
            k++;
            data['x' + (i + 1)] = $(elem).val();
        }
    });
    jQuery('input[id="x_0"]').each(function(i, elem){
        if ($(elem).val() != ""){
            k0++;
            data['x' + (i + 1) + '_0'] = $(elem).val();
        }   
    });
    data['N'] = jQuery("#N").val();
    data['dt'] = jQuery("#dt").val();

    console.log(data);
    if (Object.values(data).length > 2 && k == k0){
        var code = jQuery(".code");
        var d = jQuery('<div id="success_alert" class="alert alert-warning text_center m10" role="alert">ОБРАБОТКА</div>');
        code.prepend(d);

        jQuery.post(
            'http://91.79.32.28:3389',
            data,
            success
        );
    }
    else{
        var code = jQuery(".code");
        var d = jQuery('<div id="error_alert" class="alert alert-danger text_center m10" role="alert">НЕВЕРНЫЙ ФОРМАТ ЗНАЧЕНИЙ</div>');
        code.prepend(d);
        jQuery("#error_alert").delay(1000).fadeOut(100);
        //alert('неверные начальные значения');
    }
}

function success(data)
{
    console.log(data);
    //console.log("success");
    jQuery("#success_alert").delay(500).fadeOut(100);
    plot();
    jQuery("#charts").show();
}

//plot
//--------------------------------------------------------------------------
function plot(path) {
    Plotly.d3.csv("../res/result.csv", function(data){ processData(data) } );
    };

function processData(allRows) {

    console.log(allRows);
    ndims = Object.keys(allRows[0]).length - 1

    xs = {};
    for (var i = 1; i <= ndims; i++){
        xs['x' + i] = [];
    }
    if (ndims < 3){
        xs['x3'] = [];
    }

    var t = [];

    for (var i = 0; i < allRows.length; i++) {
        row = allRows[i];
        for (var j = 1; j <= ndims; j++){
            xs['x' + j].push(row['x' + j]);
        }
        if (ndims < 3){
            xs['x3'].push(0);
        }
        t.push(row['t']);
    }

    console.log(ndims);
    console.log(xs);
    jQuery("#phasechart2").hide();
    jQuery("#phasechart3").hide();
    jQuery("#phasecharts").hide();
    jQuery("#3dcharts").hide();
    jQuery("#btngroup1").hide();
    if (ndims > 1){
        jQuery("#phasechart2").hide();
        jQuery("#phasechart3").hide();
        jQuery("#phasecharts").show();
        jQuery("#3dcharts").show();
        if (ndims > 2){
            jQuery("#btngroup1").show();
            jQuery("#phasechart2").show();
            jQuery("#phasechart3").show();
        }
    }

    // make plots -----------------------------------------------
    makePlotT(ndims, xs, t);
    makePlotPhase();
    //makePlotXY(xs['x1'], xs['x2']);
    //makePlotPoincare(x, xx);
    
    makePlot3D(xs['x1'], xs['x2'], xs['x3']);
    //-----------------------------------------------------------
}

function makePlotT(ndims, dims, t){
    var plotDiv = document.getElementById("plot");
    
    traces = []
    
    for (var i = 1; i <= ndims; i++) {
        id = "x" + i
        traces.push({
            x: t,
            y: dims[id],
            name: id
        });
    }
    
    Plotly.newPlot('chartXYt', traces, {
        displayModeBar: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        });
};

function makePlotPhase(){
    $('.btn-group').each(function(num, elem){
        $(elem).empty();
    });
    if (ndims == 2){
        makePlotXY(xs['x1'], xs['x2'], 'chartXY');
    }
    else {
        var btnsample = '<button type="button" class="btn btn-outline-primary btn-ch active" id="xi/xj">xixj</button>';
        $('.btn-group').each(function(num, elem){
            btn = '';
            count = 0;
            for(var i = 1; i <= ndims; i++){
                for(var j = i + 1; j <= ndims; j++){
                    btncurr = btnsample;
                    if (num != count){
                        btncurr = btncurr.split(" active").join('');
                    }
                    btncurr = btncurr.split("xi").join('x' + i);
                    btncurr = btncurr.split("xj").join('x' + j);
                    btn += btncurr;
                    count++;
                }
            }
            $(elem).append(btn);
        });
        makePlotXY(xs['x1'], xs['x2'], 'chartXY');
        makePlotXY(xs['x1'], xs['x3'], 'chartXZ');
        makePlotXY(xs['x2'], xs['x3'], 'chartYZ');
    }
}

function makePlotXY(x, y, type){
var traces = [{
    x: x,
    y: y
}];

Plotly.newPlot(type, traces, {
    displayModeBar: true,
    margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 50,
        pad: 4}
    });
};

function makePlotPoincare(x, y){
var plotDiv = document.getElementById("plot");
var traces = [{
    x: x,
    y: y
}];

Plotly.newPlot('chartPoincare', traces,
    {title: 'Пуанкаре'});
};

function makePlot3D(x, y, z){
var plotDiv = document.getElementById("plot");

// base plane
var basePlane = [];
for(let x = 0; x <= 10; x++){
    var line = []
    for(let y = 0; y <= 10; y++)
        line.push(0)
    basePlane.push(line)
}

// input plane
var inputPlane = [];
for(let x = 0; x <= 10; x++){
    var line = []
    for(let y = 0; y <= 10; y++)
        line.push(-x-y-2)
    inputPlane.push(line)
}

function getData() {
    var basePlane = [];
    for(let i = 0; i<10; i++)
    basePlane.push(Array(10).fill().map(() => 0))
    return basePlane;
}  

var data = getData();
//console.log(data);

var trace = {
    type: 'scatter3d',
    mode: 'markers',
    x: x,
    y: y,
    z: z,
    opacity: 1,
    marker: {
        color: '#000000',
		size: 2,
    },
    name: 'flow',
};
/*
var base = {
    z: basePlane,
    showscale: false,
    opacity: 0.1,
    type: 'surface',
    name: 'базовая плоскость'
};

var input = {
    z: inputPlane,
    showscale: false,
    opacity: 0.9,
    type: 'surface',
    name: 'данная плоскость'
};

data = [base, input, trace];
*/
data = [trace];
Plotly.newPlot('chartXY3D', data,
    {
        height: 1000,
        displayModeBar: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        }
    );
};
