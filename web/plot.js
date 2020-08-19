// global vars
var ndims;
var xs = {};

// init popovers
$(document).ready(function(){
    //Инициализация всплывающей панели для
    //элементов веб-страницы, имеющих атрибут
    //data-toggle="popover"
    $('[data-toggle="popover-left"]').popover({
      //Установление направления отображения popover
      placement : 'left',
      trigger: "hover"
    });
    $('#navbarDropdownMenuLink').popover();
    //$("#popover-left").popover({ trigger: "hover" });
});

//-------------------------------------------------------
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

function newrow(){
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
    jQuery("#lyapunovchart").hide();
    
    document.getElementById("N").defaultValue = "1000";
    document.getElementById("dt").defaultValue = "0.01";

    jQuery("#draw").click(onDraw);
    jQuery('#addx').click(function(){
        $('fieldset').append(newrow());
    });
    $(document).on('click', '.remove', function() {
        $(this).parent().parent().remove();
    });
    
    //example attractors
    {
        jQuery("#lorenz").click(function(){
            params = ["10*(x2-x1)", "x1*(28-x3)-x2", "x1*x2-(8/3)*x3"]
            setFields(3, params);
            document.getElementById("N").value = "10000";
            document.getElementById("dt").value = "0.01";
        })

        jQuery("#dequanli").click(function(){
            params = ["40*(x2-x1)+0.16*x1*x3", "55*x1+20*x2-x1*x3", "1.833*x3+x1*x2-0.65*x1*x1"]
            setFields(3, params);
            document.getElementById("N").value = "10000";
            document.getElementById("dt").value = "0.001";
        })

        jQuery("#shilnikov").click(function(){
            params = ["x2", "x3", "-0.87*x1-x2-0.4*x3+x1*x1"]
            setFields(3, params);
            document.getElementById("N").value = "100000";
            document.getElementById("dt").value = "0.001";
        })
    }
    
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

    function displayPlotData(results){		
        successAlert(true);
        jQuery("#success_alert").delay(1000).fadeOut(100);
        plot(results.data, "local");
        jQuery("#charts").show();
    }
    
    $('#UploadModal').on('shown.bs.modal', function () {
        //$('#myInput').trigger('focus')
    })

    $('#submit-file').on("click",function(e){
		e.preventDefault();
		$('#files').parse({
			config: {
				delimiter: "auto",
				complete: displayPlotData,
			},
			before: function(file, inputElem)
			{
				//console.log("Parsing file...", file);
			},
			error: function(err, file)
			{
				//console.log("ERROR:", err, file);
			},
			complete: function()
			{
				//console.log("Done with all files");
			}
		});
    });
});

// UI fill ins
function setStarts(defval, n){
    $('input[id="x_0"]').each(function(i, elem){
        if (i < n) {elem.value = defval;}
    });
}

function ensureFields(n){
    count = 0;
    $('input[id="x"]').each(function(i, elem){
        count++;
    });
    for(var i = 0; i < (n - count); i++){
        $('fieldset').append(newrow());
    }
}

function setFields(n, array){
    ensureFields(n);
    $('input[id="x"]').each(function(i, elem){
        if (i < n) {elem.value = array[i];}
    });
    setStarts(0.1, 3);
}

// web graph
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

    //console.log(data);
    if (Object.values(data).length > 2 && k == k0){
        successAlert(true);

        jQuery.post(
            'http://83.237.22.37:5000',
            data,
            success
        );
    }
    else{
        var code = jQuery(".code");
        var d = jQuery('<div id="error_alert" class="alert alert-danger text_center m10" role="alert">НЕВЕРНЫЙ ФОРМАТ ЗНАЧЕНИЙ</div>');
        code.prepend(d);
        $('#navbarDropdownMenuLink').popover('show');
        jQuery("#error_alert").delay(1000).fadeOut(100);
    }
}

function success(data)
{
    //console.log(data);
    //console.log("success");
    //successAlert(false);
    plot();
    jQuery("#charts").show();
}

//plot
//--------------------------------------------------------------------------
//global data var
var dataarc = [];
var n;

function plot(dataset, type) {
    if (dataset){
        processData(dataset, type);
    } else{
        Plotly.d3.csv("output/result.csv", function(data){ processData(data, "web") } );
    }
};

function getData(dataset, type){
    
    xs = {};
    ls = {};
    t = [];
    
    if (type == "web"){
        n = dataset.length
        ndims = (Object.keys(dataset[0]).length - 1) / 2

        for (var i = 1; i <= ndims; i++){
            xs['x' + i] = [];
            ls['l' + i] = [];
        }
        if (ndims < 3){
            xs['x3'] = [];
        }

        for (var i = 0; i < dataset.length; i++) {
            row = dataset[i];
            for (var j = 1; j <= ndims; j++){
                xs['x' + j].push(row['x' + j]);
                ls['l' + j].push(row['l' + j]);
            }
            if (ndims < 3){
                xs['x3'].push(0);
            }
            t.push(row['t']);
        }
    } else if (type == "local"){
        n = dataset.length - 2
        ndims = ((dataset[0].join(",").split(",")).length - 1) / 2

        for (var i = 1; i <= ndims; i++){
            xs['x' + i] = [];
            ls['l' + i] = [];
        }
        if (ndims < 3){
            xs['x3'] = [];
        }

        for(var i = 1; i < (dataset.length - 1); i++){
			var row = dataset[i];
			var cells = row.join(",").split(",");
			for(var j = 1; j <= ndims; j++){
                xs['x' + j].push(cells[j - 1]);
                ls['l' + j].push(cells[ndims + j - 1]);
            }
            if (ndims < 3){
                xs['x3'].push(0);
            }
            t.push(cells[ndims]);
        }
    }

    return [n, ndims, xs, t, ls];
}

function processData(allRows, type) {
    
    //console.log(allRows);

    dataarc = getData(allRows, type);
    n = dataarc[0];
    ndims = dataarc[1];
    xs = dataarc[2];
    t = dataarc[3];
    ls = dataarc[4];

    //console.log(dataarc);

    jQuery("#lyapunovchart").show();

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
    makePlotLyapunov(ndims, ls, t);
    makePlotPhase();
    //makePlotXY(xs['x1'], xs['x2']);
    //makePlotPoincare(x, xx);
    
    makePlot3D(xs['x1'], xs['x2'], xs['x3']);
    //-----------------------------------------------------------
    successAlert(false);
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

function makePlotLyapunov(ndims, dims, t){
    var plotDiv = document.getElementById("plot");
    
    traces = []
    
    for (var i = 1; i <= ndims; i++) {
        ticker = "λ" + i
        id = "l" + i
        traces.push({
            x: t,
            y: dims[id],
            name: ticker
        });
    }
    
    Plotly.newPlot('chartLyapunov', traces, {
        displayModeBar: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        });
    
    //show exponents
    eps = 1e-6;
    var lisample = '<li class="list-group-item type">λ</li>';
    arrLyapunov  = []
    for(var i = 1; i <= ndims; i++){
        arrLyapunov.push(ls['l' + i][n - 1]);
    }
    arrLyapunov.sort().reverse();

    $('.list-group').each(function(num, elem){
        $(elem).empty();
        li = '';
        for(var i = 0; i < ndims; i++){
            licurr = lisample;
            value = arrLyapunov[i];
            if (value > 0){
                licurr = licurr.split("type").join('list-group-item-success');
            } else if (-eps < value && value < eps){
                licurr = licurr.split("type").join('list-group-item-light');
            } else if (value < 0){
                licurr = licurr.split("type").join('list-group-item-danger');
            }
            licurr = licurr.split("λ").join(value);
            li += licurr;
        }
        $(elem).append(li);
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

// save plot data
function savetocsv() {
    n = dataarc[0]
    ndims = dataarc[1];
    xs = dataarc[2];
    t = dataarc[3];

    if (dataarc.length > 0){
        var csv = '';
        //header
        for (var i = 1; i <= ndims; i++){
            csv += ("x" + i + ",");
        }
        csv += "t\n";

        //data part
        for (var i = 0; i < n; i++) {
            for (var j = 1; j <= ndims; j++){
                csv += xs["x" + j][i];
                csv += ",";
            }
            csv += t[i];
            csv += "\n";
        }
    
        //console.log(csv);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'result.csv';
        hiddenElement.click();
    }
    else{
        var code = jQuery(".code");
        var d = jQuery('<div id="error_alert" class="alert alert-danger text_center m10" role="alert">НЕТ ДАННЫХ ДЛЯ ВЫГРУЗКИ</div>');
        code.prepend(d);
        jQuery("#error_alert").delay(1000).fadeOut(100);
    }
}