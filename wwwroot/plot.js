// global vars
local_ip = 'localhost';
dyns_ip = '85.143.113.155';
ip = local_ip;

exclusionList = ['Math.pow', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '^' , '.', '(', ')', '*', '/', '+', '-', 'abs', 'acos', 'acosh', 'arg', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'conj', 'ceil', 'cos', 'cosh', 'cot', 'csc', 'exp', 'exp2', 'floor', 'hypot', 'imag', 'int', 'log', 'log2', 'log10', 'max', 'min', 'polar', 'pow', 'real', 'sec', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'];

//var xs = {};
var Darc = 0;
var currentXs = ['x1', 'x2', 'x3'];
var ODEvarlist = [];
var ODEparamlist = [];
var ODEEqParams = {};

var ndims;
var equationTimeSeries = {}, lyapunovTimeSeries = {};
selectedLyapunovMapParamList = [];
selectedBifurcationDiagramParamList = [];


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
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
} 
function removeItemAll(arr, value) {
var i = 0;
while (i < arr.length) {
    if (arr[i] === value) {
    arr.splice(i, 1);
    } else {
    ++i;
    }
}
return arr;
}
function rangeFloatArray(start, end, step) {
    var array = [];
    val = start;
    while (val < end){
        array.push(val);
        val += step;
    }
    return array
}

// UI
jQuery(function(){
    //jQuery("#charts").hide();
    jQuery("#phasecharts").hide();
    jQuery("#phasechart2").hide();
    jQuery("#phasechart3").hide();
    jQuery("#3dcharts").hide();
    //jQuery("#3DStreamtubeCharts").hide();
    jQuery("#lyapunovchart").hide();
    jQuery("#LyapunovMap").hide();
    jQuery("#BifurcationDiagram").hide();
    jQuery("#Poincarecharts").hide();
    jQuery("#credits").hide();
    
    document.getElementById("time").defaultValue = "10";
    document.getElementById("dt").defaultValue = "0.01";

    // btns
    jQuery("#draw").click(onDraw);
    jQuery('#addx').click(function(){
        $('#maininput').append(newODE());
    });
    jQuery('#drawPoincare').click(function(){
        makePlotPoincare();
    });
    jQuery('#drawRangePoincare').click(function(){
        for (var i = -50; i <= 50; i++){
            Darc = i;
            makePlotPoincare();
        }
        Darc = 0;
    });
    jQuery('#drawLyapunovMap').click(function(){
        makeLyapunovMap();
    });
    jQuery('#drawBifurcationDiagram').click(function(){
        makeBifurcationDiagram();
    });
    jQuery('#addeq').click(function(){
        $('#eqinput').append(newEq());
    });

    $(document).on('click', '.remove', function() {
        removedODEVar = $(this).parent().parent().children('.col-75').children('.inputeq')[0].id;
        removeItemOnce(ODEvarlist, removedODEVar);
        $(this).parent().parent().parent().remove();
    });
    
    //example attractors
    {
        jQuery("#lorenz").click(function(){
            eqs = ["d(x)/dt=s*(y-x)", "d(y)/dt=x*(r-z)-y", "d(z)/dt=x*y-b*z"];
            eqparams = ["10", "28", "8/3"];
            setFields(3, eqs, 'main');
            setFields(3, eqparams, 'params');
            document.getElementById("time").value = "100";
            document.getElementById("dt").value = "0.001";
        })

        jQuery("#dequanli").click(function(){
            eqs = ["d(x)/dt=a*(y-x)+delta*x*z", "d(y)/dt=ro*x+t*y-x*z", "d(z)/dt=beta*z+x*y-eps*y*x"];
            eqparams = ["40", "0.16", "55", "20", "1.833", "0.65"];
            setFields(3, eqs, 'main');
            setFields(6, eqparams, 'params');
            document.getElementById("time").value = "10";
            document.getElementById("dt").value = "0.001";
        })

        jQuery("#shilnikov").click(function(){
            eqs = ["d(x)/dt=y", "d(y)/dt=z", "d(z)/dt=-0.87*x-y-0.4*z+x*x"];
            setFields(3, eqs, 'main');
            document.getElementById("time").value = "10";
            document.getElementById("dt").value = "0.001";
        })
    }
    
    // btn Groups
    $(document).on('click', '.btn-phase', function(){
        if ($(this).is("active"))
        {
            s = this.id;
            /*
            $(this).siblings().removeClass('active');
            makePlotXY(xs[this.id.split('/')[0]], xs[this.id.split('/')[1]], $(this).parent().siblings()['0'].id);
            */
        }
        else
        {
            s = this.id;
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
            makePlotXY(equationTimeSeries[this.id.split('/')[0]], equationTimeSeries[this.id.split('/')[1]], $(this).parent().siblings()['0'].id);
        }
    });

    $(document).on('click', '.btn-Poincare', function(){
        if ($(this).is("active"))
        {
            s = this.id;
            /*
            $(this).siblings().removeClass('active');
            */
        }
        else
        {
            s = this.id;
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
            currentXs[0] = this.id.split('/')[0];
            currentXs[1] = this.id.split('/')[1];
            currentXs[2] = this.id.split('/')[2];
            makePlotPoincare();
        }
    });

    $(document).on('change', '.inputeq', function() {
        ODEchange(this);
    });

    $(document).on('click', '.LyapunovMapCheckBox', function() {
        if (selectedLyapunovMapParamList.length < 2){
            if (selectedLyapunovMapParamList.indexOf(this.id.slice(19)) == -1){
                selectedLyapunovMapParamList.push(this.id.slice(19));
            } else {
                removeItemOnce(selectedLyapunovMapParamList, this.id.slice(19));
            }
        } else {
            if (selectedLyapunovMapParamList.indexOf(this.id.slice(19)) == -1){
                alert("Можно выбрать только два параметра");
                this.checked = false;
            } else {
                removeItemOnce(selectedLyapunovMapParamList, this.id.slice(19));
            }
        }
    });

    $(document).on('click', '.BifurcationDiagramCheckBox', function() {
        if (selectedBifurcationDiagramParamList.length < 1){
            if (selectedBifurcationDiagramParamList.indexOf(this.id.slice(26)) == -1){
                selectedBifurcationDiagramParamList.push(this.id.slice(26));
            } else {
                removeItemOnce(selectedBifurcationDiagramParamList, this.id.slice(26));
            }
        } else {
            if (selectedBifurcationDiagramParamList.indexOf(this.id.slice(26)) == -1){
                alert("Можно выбрать только один параметр");
                this.checked = false;
            } else {
                removeItemOnce(selectedBifurcationDiagramParamList, this.id.slice(26));
            }
        }
    });
    
    // file
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

    // redundant
    {
    /*
    function displayPlotData(results){		
        successAlert(true);
        jQuery("#success_alert").delay(1000).fadeOut(100);
        plot(results.data, "local");
        jQuery("#charts").show();
    }

    $('#UploadModal').on('shown.bs.modal', function () {
        //$('#myInput').trigger('focus')
    })
    */
    }

});

// UI fill ins
function setStarts(defval, n){
    $('input[id="x_0"]').each(function(i, elem){
        if (i < n) {elem.value = defval;}
    });
}
function ensureFields(n){
    count = 0;
    $('.inputeq').each(function(i, elem){
        count++;
    });
    extra = n - count;
    for(var i = 0; i < extra; i++){
        $('#maininput').append(newODE());
    }
}
function setFields(n, array, type){
    if (type == 'main'){
        ensureFields(n);
        $('.inputeq').each(function(i, elem){
            if (i < n) {elem.value = array[i]; ODEchange(elem)}
        });
        setStarts(0.1, 3);
    } else if (type = 'params') {
        $('.inputparam').each(function(i, elem){
            if (i < n) {elem.value = array[i];}
        });
        setStarts(0.1, 3);
    }
}

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
function newODE(){
    var newx = '<div class="bg-white rounded shadow p-1 mb-1"><div class="row no-gutters" style="width:100%;"><div class="col col-20 pr-1"><input type="text" class="form-control inputstart" id="x_0" placeholder=""></div><div class="col col-75"><input type="text" class="form-control inputeq" id="xi" placeholder="" value="d()/dt="></div><div class="col col-05"><button class="remove btn btn-outline-light px-0" style="height: 100%; width:100%; text-align:center; vertical-align:middle;">&#x274C;</button></div></div></div>';
    count = 0;
    $('.inputeq').each(function(i, elem){
        count++;
    });
    return newx.split("xi").join('x'+(count + 1));
}
function newParam(name){
    var Param = '<div class="bg-white rounded shadow p-1 mb-1"><div class="row no-gutters" style="width:100%;"><div class="col col-4 pr-1"><input type="text" class="form-control inputparamname" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: end;" id="paraminame" value="name ="></div><div class="col col-8"><input type="text" class="form-control inputparam" id="parami" placeholder="значение"></div></div></div>';
    /*
    count = 1;
    $('.inputparam').each(function(i, elem){
        count++;
    });
    */
    Param = Param.split("name").join(name);
    Param = Param.split("parami").join("param" + name);
    return Param;
}
function addParam(name){
    $('#paraminput').append(newParam(name));
    addParamLyapunovMap(name);
    addParamLBifurcationDiagram(name);
}
function deleteParam(name){
    $('#param' + name).parent().parent().parent().remove();
    deleteParamLyapunovMap(name);
    deleteParamBifurcationDiagram(name);
}
function ODEchange(element){
    equation = element.value;
    // change eqvar
    eqvar = equation.slice(2, equation.indexOf(')/dt='));
    element.id = eqvar;
    if (ODEvarlist.indexOf(eqvar) == -1)
        ODEvarlist.push(eqvar);
    // look for params
    equation = equation.slice(equation.indexOf(')/dt=') + 5);
    exclusionList.forEach(function(item, i, exclusionList) {
        equation = equation.split(item).join(' ');
    });
    equation = equation.replace(/\s{2,}/g, ' ');
    params = equation.split(' ');
    removeItemAll(params, '');
    // check if some param is removed
    if (eqvar in ODEEqParams){
        outerParams = [];
        ODEvarlist.forEach(function(variable) {
            if (variable != eqvar) {
                ODEEqParams[variable].forEach(function(varparam) {
                    if (outerParams.indexOf(varparam) == -1)
                        outerParams.push(varparam);
                });
            }
        });
        ODEEqParams[eqvar].forEach(function(eqvarparam) {
            if (outerParams.indexOf(eqvarparam) == -1 && params.indexOf(eqvarparam) == -1) {
                deleteParam(eqvarparam);
                removeItemAll(ODEparamlist, eqvarparam);
            }
        });
        ODEparamlist.forEach(function(eqvarparam) {
            if (outerParams.indexOf(eqvarparam) == -1 && params.indexOf(eqvarparam) == -1) {
                deleteParam(eqvarparam);
                removeItemAll(ODEparamlist, eqvarparam);
            }
        });
        ODEEqParams[eqvar] = params;
    } else {
        ODEEqParams[eqvar] = params;
    }

    params.forEach(function(item) {
        if (ODEparamlist.indexOf(item) == -1) {
            ODEparamlist.push(item);
            addParam(item);
        }
    });
    ODEvarlist.forEach(function(item) {
        deleteParam(item);
        removeItemAll(ODEparamlist, item);
    });
    //alert(paramlist);
}
function newEq(){
    var neweq = '<div class="bg-white rounded shadow p-1 mb-1"> <div class="row no-gutters" style="width:100%;"> <div class="col col-95"><input type="text" class="form-control eq" id="eqi" placeholder="variable = ..." value=""></div> <div class="col col-05"><button class="remove btn btn-outline-light px-0" style="height: 100%; width:100%; text-align:center; vertical-align:middle;">&#x274C;</button></div> </div> </div>';
    count = 0;
    $('.eq').each(function(i, elem){
        count++;
    });
    return neweq.split("eqi").join('eq'+(count + 1));
}

// web graph
function onDraw()
{
    // make data
    k = 0;
    k0 = 0;
    requestData = {};
    requestData['request type'] = 0;
    requestData['variables'] = ODEvarlist.join(', ');
    
    start_values = [];
    jQuery('.inputstart').each(function(i, elem){
        if ($(elem).val() != ""){
            k0++;
            start_values.push($(elem).val());
        }   
    });
    requestData['start values'] = start_values;

    functions = [];
    jQuery('.inputeq').each(function(i, elem){
        if ($(elem).val() != ""){
            k++;
            functions.push($(elem).val().slice(($(elem).val().indexOf(')/dt=') + 5)));
        }
    });
    requestData['functions'] = functions;

    additional_equations = [];
    jQuery('.inputparam').each(function(i, elem){
        if ($(elem).val() != ""){
            nameeq = $($(elem).parent().parent().children()[0]).children()[0].value;
            additional_equations.push(nameeq + $(elem).val());
        }
    });
    requestData['additional equations'] = additional_equations.join('; ').split(' =').join(':=') + ';';
    //if (requestData['additional equations'] == ';') requestData['additional equations'] = ';';

    requestData['time'] = jQuery("#time").val();
    requestData['dt'] = jQuery("#dt").val();

    console.log(requestData);
    if (Object.values(requestData).length > 2 && k == k0){
        successAlert(true);
        //requestData['request type'] = 'main';
        jQuery.post(
            'http://' + ip + ':5000',
            requestData,
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
    plot(JSON.parse(JSON.parse(data))[0], "web");
    jQuery("#charts").show();
}
function plot(dataset, type) {
    if (dataset){
        processData(dataset, type);
    } else{
        processData(dataset, "web");
        //Plotly.d3.csv("output/result.csv", function(data){ processData(data, "web") } );
    }
}
function getData(dataset, type){
    
    var _equationTimeSeries = {};
    var _lyapunovTimeSeries = {};
    
    if (type == "web"){
        //vars = dataset['variables'];
        trajectoryData = dataset['trajectory'];
        Object.keys(trajectoryData).forEach(function(item, i) {
            _equationTimeSeries[item] = trajectoryData[item];
        });
        ODEvarlist.forEach(function(item, i) {
            _lyapunovTimeSeries['lambda' + (i + 1)] = dataset['series of spectrum lyapunov exponents']['lambda' + (i + 1)];
        });
        return [_equationTimeSeries, _lyapunovTimeSeries];
    } else if (type == "BifurcationDiagram"){
        trajectoryData = dataset['trajectory'];
        Object.keys(trajectoryData).forEach(function(item, i) {
            _equationTimeSeries[item] = trajectoryData[item];
        });
        return _equationTimeSeries;
    } else if (type == "local"){
        return 0;
    }
}
function processData(allRows, type) {
    _data = getData(allRows, type);
    equationTimeSeries = _data[0];
    lyapunovTimeSeries = _data[1];
    ndims = ODEvarlist.length;

    jQuery("#lyapunovchart").show();
    jQuery("#LyapunovMap").show();
    jQuery("#credits").show();
    jQuery("#phasechart2").hide();
    jQuery("#phasechart3").hide();
    jQuery("#phasecharts").hide();
    jQuery("#3dcharts").hide();
    jQuery("#btngroup1").hide();
    if (ndims > 1){
        jQuery("#phasechart2").hide();
        jQuery("#phasechart3").hide();
        jQuery("#phasecharts").show();
        if (ndims > 2){
            jQuery("#btngroup1").show();
            jQuery("#phasechart2").show();
            jQuery("#phasechart3").show();
            jQuery("#3dcharts").show();
            jQuery("#3DStreamtubeCharts").show();
            jQuery("#BifurcationDiagram").show();
            jQuery("#Poincarecharts").show();
        }
    }

    makePlots(ndims);
    //-----------------------------------------------------------
    successAlert(false);
}

// Plots -----------------------------------------------------------------------------
function makePlots(ndims){
    // make plots -----------------------------------------------
    makePlotT(ndims, equationTimeSeries);
    makePlotLyapunov(ndims, lyapunovTimeSeries);
    makePlotPhase(equationTimeSeries);
    makePlot3D(equationTimeSeries[ODEvarlist[0]], equationTimeSeries[ODEvarlist[1]], equationTimeSeries[ODEvarlist[2]], 'chartXY3D');
    makePoincareUI();
    if (ndims >= 3) makePlotPoincare();
    //makeEqPlot();
}
function makePlotT(ndims, timeSeries){
    var plotDiv = document.getElementById("chartXYt");
    
    traces = []
    
    for (var i = 0; i < ndims; i++) {
        id = ODEvarlist[i];
        traces.push({
            x: timeSeries['t'],
            y: timeSeries[id],
            name: id
        });
    }

    // add equation plots
    var EqTimeSeries = {};
    // find eq vars and params
    var EqVars = [];
    var EqParams = [];
    var EqEqs = [];
    $('.eq').each(function(i, elem){
        var currentLine = $(elem).val();
        if (currentLine != ''){
            var currentVar = currentLine.slice(0, currentLine.indexOf('='));
            if (currentVar.slice(-1)[0] == ' ') {
                currentVar = currentVar.slice(0, currentVar.length - 1);
            }
            EqTimeSeries[currentVar] = [];
            EqVars.push(currentVar);
            var currentEq = currentLine.slice(currentLine.indexOf('=') + 1);
            EqEqs.push(currentEq);
            exclusionList.forEach(function(item, i, exclusionList) {
                currentEq = currentEq.split(item).join(' ');
            });
            currentEq = currentEq.replace(/\s{2,}/g, ' ');
            var currentEqParams = currentEq.split(' ');
            removeItemAll(currentEqParams, '');
            EqParams.push(currentEqParams);
        }
    });

    // check inner dependecies
    var EqDepends = [];
    EqParams.forEach(function(EqParamList, i) {
        var currentEqDepends = [];
        EqParamList.forEach(function(variable) {
            if (ODEvarlist.indexOf(variable) == -1){
                currentEqDepends.push(variable);
            }
        });
        EqDepends.push(currentEqDepends);
    });

    var seriesLen = timeSeries['t'].length;
    var seriesdt = timeSeries['t'][1] = timeSeries['t'][0];
    //make timeSeries for eqs w/o dependecies
    EqDepends.forEach(function(currentEqDepends, i) {
        if (currentEqDepends.length == 0){
            for (var j = 0; j < seriesLen; j++){
                var currentEq = EqEqs[i];
                EqParams[i].forEach(function(item, i) {
                    currentEq = currentEq.split(item).join(timeSeries[item][j]);
                });
                EqTimeSeries[EqVars[i]].push(eval(currentEq));
            }
        }
    });
    //make timeSeries for eqs w dependecies
    EqDepends.forEach(function(currentEqDepends, i) {
        if (currentEqDepends.length != 0){
            for (var j = 0; j < seriesLen; j++){
                var currentEq = EqEqs[i];
                EqParams[i].forEach(function(item, i) {
                    if (item in timeSeries) {
                        currentEq = currentEq.split(item).join(timeSeries[item][j]);
                    } else {
                        currentEq = currentEq.split(item).join(EqTimeSeries[item][j]);
                    }
                });
                EqTimeSeries[EqVars[i]].push(eval(currentEq));
            }
        }
    });

    for (var i = 0; i < EqVars.length; i++) {
        id = EqVars[i];
        traces.push({
            x: timeSeries['t'],
            y: EqTimeSeries[id],
            name: id
        });
    }

    var config = {responsive: true}
    Plotly.newPlot('chartXYt', traces, {
        displayModeBar: true,
        config,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        });
}
function makePlotPhase(timeSeries){
    
    function makePlotXY(x, y, type){
        var traces = [{
            x: x,
            y: y
        }];
        
        Plotly.newPlot(type, traces, {
            displayModeBar: true,
            margin: {
            t: 20, //top margin
            l: 20, //left margin
            r: 20, //right margin
            b: 20 //bottom margin
            }
        });
    }

    $('.btngroupPhase').each(function(num, elem){
        $(elem).empty();
    });
    if (ndims == 2){
        makePlotXY(timeSeries[ODEvarlist[0]], timeSeries[ODEvarlist[1]], 'chartXY');
    }
    else {
        var btnsample = '<button type="button" class="btn btn-outline-primary btn-ch btn-phase active" id="xx/yy">xxyy</button>';
        $('.btngroupPhase').each(function(num, elem){
            btn = '';
            count = 0;
            for(var i = 0; i < ndims; i++){
                for(var j = i + 1; j < ndims; j++){
                    btncurr = btnsample;
                    if (num != count){
                        btncurr = btncurr.split(" active").join('');
                    }
                    btncurr = btncurr.split("xx").join(ODEvarlist[i]);
                    btncurr = btncurr.split("yy").join(ODEvarlist[j]);
                    btn += btncurr;
                    count++;
                }
            }
            $(elem).append(btn);
        });
        makePlotXY(timeSeries[ODEvarlist[0]], timeSeries[ODEvarlist[1]], 'chartXY');
        makePlotXY(timeSeries[ODEvarlist[0]], timeSeries[ODEvarlist[2]], 'chartXZ');
        makePlotXY(timeSeries[ODEvarlist[1]], timeSeries[ODEvarlist[2]], 'chartYZ');
    }
}
function makePlot3D(x, y, z, chartid){

    var trace = {
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        opacity: 1,
        line:{
            color: '#000000',
            size: 1
        },
        /*marker: {
            color: '#000000',
            size: 2,
        },*/
        name: 'flow',
    };

    data = [trace];
    Plotly.newPlot(chartid, data,
        {
            height: 750,
            displayModeBar: true,
            margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 25,
                pad: 1}
            }
        );
}
// -----------------------------------------------------------------------------------


// Poincare --------------------------------------------------------------------------
function makePlotPoincare(){
    n = equationTimeSeries[ODEvarlist[0]].length;
    //xs = dataarc[2];
    if (currentXs[0] == 'x1'){
        currentXs[0] = ODEvarlist[0];
        currentXs[1] = ODEvarlist[1];
        currentXs[2] = ODEvarlist[2];
    }

    // get plane params
    var A = parseFloat(document.getElementById('inputA').value);
    var B = parseFloat(document.getElementById('inputB').value);
    var C = parseFloat(document.getElementById('inputC').value);
    //var D = parseFloat(document.getElementById('inputD').value);
    if (Darc == 0){
        var D = parseFloat(document.getElementById('inputD').value);
    } else var D = Darc;

    // request data from server
    data = {
        'request type': 3,
        'trajectory': [equationTimeSeries[currentXs[0]], equationTimeSeries[currentXs[1]], equationTimeSeries[currentXs[2]]],
        'plane equation': [A, B, C, D]
    }
    console.log(data);
    jQuery.post(
        'http://' + ip + ':5000',
        data,
        successPoincare
    );
}
function makePoincareUI(){
    $('.btngroupPoincare').each(function(num, elem){
        $(elem).empty();
    });
    if (ndims == 1) return 0;
    var btnsample = '<button type="button" class="btn btn-outline-primary btn-ch btn-Poincare active" id="xx/yy/zz">xxyyzz</button>';
    $('.btngroupPoincare').each(function(num, elem){
        btn = '';
        count = 0;
        for(var i = 0; i < ndims; i++){
            for(var j = i + 1; j < ndims; j++){
                for(var k = j + 1; k < ndims; k++){
                    btncurr = btnsample;
                    if (num != count){
                        btncurr = btncurr.split(" active").join('');
                    }
                    btncurr = btncurr.split("xx").join(ODEvarlist[i]);
                    btncurr = btncurr.split("yy").join(ODEvarlist[j]);
                    btncurr = btncurr.split("zz").join(ODEvarlist[k]);
                    btn += btncurr;
                    count++;
                }
            }
        }
        $(elem).append(btn);
    });
}
function successPoincare(data){

    var data = JSON.parse(JSON.parse(data));
    // get plane params
    var A = parseFloat(document.getElementById('inputA').value);
    var B = parseFloat(document.getElementById('inputB').value);
    var C = parseFloat(document.getElementById('inputC').value);
    var D = parseFloat(document.getElementById('inputD').value);
    // Poincare 2D map
    var traces = [{
        x: data['intersections2D'][0],
        y: data['intersections2D'][1],
        mode: 'markers'
    }];
    
    Plotly.newPlot('chartPoincare2D', traces, {
        height: document.getElementById('chartPoincare2D').offsetWidth,
        displayModeBar: true,
        margin: {
        t: 25, //top margin
        l: 25, //left margin
        r: 25, //right margin
        b: 25, //bottom margin
        pad: 1 
        }
    });
    var M1 = Math.max(Math.min(...equationTimeSeries[currentXs[0]]), Math.max(...equationTimeSeries[currentXs[0]]));
    var M2 = Math.max(Math.min(...equationTimeSeries[currentXs[1]]), Math.max(...equationTimeSeries[currentXs[1]]));
    var M3 = Math.max(Math.min(...equationTimeSeries[currentXs[2]]), Math.max(...equationTimeSeries[currentXs[2]]));
    var T = 1 * Math.max(M1, M2, M3);
    // 3D map
    makePlotPoincare3D(equationTimeSeries[currentXs[0]], equationTimeSeries[currentXs[1]], equationTimeSeries[currentXs[2]], A, B, C, D, 'chartPoincare3D', data, T)
    // trash
    /*
    if ((data['time'] > 0) || (Darc == 0)){
        inputD.value = data['D'];
        sliderD.value = data['D'];
        // get plane params
        var A = parseFloat(document.getElementById('inputA').value);
        var B = parseFloat(document.getElementById('inputB').value);
        var C = parseFloat(document.getElementById('inputC').value);
        //var D = parseFloat(document.getElementById('inputD').value);
        var D = Darc;
        if (Darc == 0){
            var D = parseFloat(document.getElementById('inputD').value);
        }
        
        //console.log(data);
        //console.log("success");
        // Poincare 2D map
        var traces = [{
            x: data['X'],
            y: data['Y'],
            mode: 'markers'
        }];
        
        Plotly.newPlot('chartPoincare2D', traces, {
            height: document.getElementById('chartPoincare2D').offsetWidth,
            displayModeBar: true,
            margin: {
            t: 25, //top margin
            l: 25, //left margin
            r: 25, //right margin
            b: 25, //bottom margin
            pad: 1 
            }
        });
        var M1 = Math.max(Math.min(...equationTimeSeries[currentXs[0]]), Math.max(...equationTimeSeries[currentXs[0]]));
        var M2 = Math.max(Math.min(...equationTimeSeries[currentXs[1]]), Math.max(...equationTimeSeries[currentXs[1]]));
        var M3 = Math.max(Math.min(...equationTimeSeries[currentXs[2]]), Math.max(...equationTimeSeries[currentXs[2]]));
        var T = 1 * Math.max(M1, M2, M3);
        // 3D map
        makePlotPoincare3D(equationTimeSeries[currentXs[0]], equationTimeSeries[currentXs[1]], equationTimeSeries[currentXs[2]], A, B, C, D, 'chartPoincare3D', data, T)
    }
    */
}
function makePlotPoincare3D(X, Y, Z, A, B, C, D, type, dataset, T = 100){
    //var plotDiv = document.getElementById("plot");

    // base plane
    var basePlane = [];
    for(let x = 0; x <= 10; x++){
        var line = []
        for(let y = 0; y <= 10; y++)
            line.push(0)
        basePlane.push(line)
    }

    // input plane
    var inputPlane = {};
    inputPlane['x'] = [], inputPlane['y'] = [], inputPlane['z'] = [];
    for(let x = -T; x <= T; x+=(T/10)){
        for(let y = -T; y <= T; y+=(T/10)){
            z = -(A*x+B*y+D)/C;
            inputPlane['x'].push(-(B*y+C*z+D)/A);
            inputPlane['y'].push(-(A*x+C*z+D)/B);
            inputPlane['z'].push(z);  
        }
    }

    var input = {
        type: "mesh3d",
        x: inputPlane['x'],
        y: inputPlane['y'],
        z: inputPlane['z'],
        opacity: 0.6,
        //color:'rgb(254,254,254)'
        color:'#99ccff'
    };

    var trace = {
        type: 'scatter3d',
        mode: 'lines',
        x: X,
        y: Y,
        z: Z,
        opacity: 1,
        line:{
            color: '#000000',
            size: 1
        },
        /*
        marker: {
            color: '#000000',
            size: 2,
        },*/
        name: 'flow',
    };

    var intersection_trace = {
        type: 'scatter3d',
        mode: 'markers',
        x: dataset['intersections3D'][0],
        y: dataset['intersections3D'][1],
        z: dataset['intersections3D'][2],
        opacity: 1,
        marker:{
            color: '#1E90FF',
            size: 3
        },
        /*
        marker: {
            color: '#000000',
            size: 2,
        },*/
        name: 'intersection',
    };

    data = [trace, input, intersection_trace];

    //clear div
    $(type).empty();

    Plotly.newPlot(type, data,
        {
            height: document.getElementById(type).offsetWidth,
            displayModeBar: true,
            margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 25,
                pad: 1}
            }
    );
}
// -----------------------------------------------------------------------------------


// Lyapunov --------------------------------------------------------------------------
function makePlotLyapunov(ndims, timeSeries){
    var plotDiv = document.getElementById("plot");
    
    traces = []
    
    for (var i = 1; i <= ndims; i++) {
        ticker = "λ" + i
        id = "lambda" + i
        traces.push({
            x: timeSeries['t'],
            y: timeSeries[id],
            name: ticker
        });
    }
    var config = {responsive: true}
    Plotly.newPlot('chartLyapunov', traces, {
        displayModeBar: true,
        config,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        });
    
    //show exponents
    eps = 1e-1;
    var lisample = '<li class="list-group-item type">λ</li>';
    arrLyapunov  = []
    for(var i = 1; i <= ndims; i++){
        arrLyapunov.push(timeSeries['lambda' + i][timeSeries['lambda' + i].length - 1]);
    }
    arrLyapunov.sort(function(a, b){return b - a});

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
}
function addParamLyapunovMap(name){
    newParamLyapunovMap = '<div class="row align-self-center shadow rounded mb-1" id="LyapunovMapParamT"> <div class="col-12 zero-padding"> <div class="row no-gutters justify-content-center align-self-center bg-light"> <div class="col-05 text-center my-auto"> <input type="checkbox" class="LyapunovMapCheckBox" id="LyapunovMapCheckBoxT"> </div> <div class="col-05 text-center my-auto"> <h4>T</h4> </div> <div class="col-80 justify-content-center align-self-center"> <div class="row no-gutters" style="width: 100%;"> <div class="col-2 justify-content-center align-self-center"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="inputTL" value="-10"> </div> <div class="col-8 justify-content-center align-self-center"> <div id="sliderRangeLyapunovMapT"></div> </div> <div class="col-2 justify-content-center align-self-center"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="inputTR" value="10"> </div> </div> </div> <div class="col-010 text-center my-auto"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="inputTStep" value="1"> </div> </div> </div> <script> $(function() { $("#sliderRangeLyapunovMapT").slider({ range: true, min: -100, max: 100, values: [-10, 10], slide: function( event, ui ) { $("#inputTL").val(ui.values[0]); $("#inputTR").val(ui.values[1]); } }); $("#inputTL").val($("#sliderRangeLyapunovMapT").slider("values", 0)); $("#inputTR").val($("#sliderRangeLyapunovMapT").slider("values", 1)); }); </script> </div>';
    paramLyapunovMap = newParamLyapunovMap.split("T").join(name);
    $('#LyapunovMapParamList').append(paramLyapunovMap);
}
function deleteParamLyapunovMap(name){
    $('#LyapunovMapParam' + name).remove();
}
function successAlertLyapunovMap(state) {
    if (state){
        //add alert
        //var success_alert_html = jQuery('<div id="success_alert" class="alert alert-warning text_center m10" role="alert">ОБРАБОТКА</div>');
        //jQuery(".code").prepend(success_alert_html);
        //add spinner to button
        var spinner_html = '<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>';
        jQuery("#drawLyapunovMap").text("");
        jQuery("#drawLyapunovMap").append(spinner_html);
    } else{
        //jQuery("#success_alert").delay(500).fadeOut(100);
        jQuery("#drawLyapunovMap").empty();
        jQuery("#drawLyapunovMap").text("Построить");
    }
}
function makeLyapunovMap(){
    
    // make data
    k = 0;
    k0 = 0;
    requestData = {};
    requestData['request type'] = 1;
    requestData['variables'] = ODEvarlist.join(', ');
    
    start_values = [];
    jQuery('.inputstart').each(function(i, elem){
        if ($(elem).val() != ""){
            k0++;
            start_values.push($(elem).val());
        }   
    });
    requestData['start values'] = start_values;

    functions = [];
    jQuery('.inputeq').each(function(i, elem){
        if ($(elem).val() != ""){
            k++;
            functions.push($(elem).val().slice(($(elem).val().indexOf(')/dt=') + 5)));
        }
    });
    requestData['functions'] = functions;

    additional_equations = [];
    jQuery('.inputparam').each(function(i, elem){
        if ($(elem).val() != ""){
            nameeq = $($(elem).parent().parent().children()[0]).children()[0].value;
            additional_equations.push(nameeq + $(elem).val());
        }
    });
    
    temp_additional_equations = [];
    paramcount = 0;
    additional_equations.forEach(function(item, i) {
        addeqvar = item.slice(0, item.indexOf(' ='));
        if (selectedLyapunovMapParamList.indexOf(addeqvar) == -1){
            temp_additional_equations.push(item);
        } else{
            paramcount++;
        }
    });
    requestData['additional equations'] = temp_additional_equations.join('; ').split(' =').join(':=') + ';';

    requestData['time'] = jQuery("#time").val();
    requestData['dt'] = jQuery("#dt").val();

    requestData['parameters'] = selectedLyapunovMapParamList;
    requestData['ranges'] = [];
    requestData['steps'] = [];
    selectedLyapunovMapParamList.forEach(function(item, i) {
        requestData['ranges'].push([parseFloat($('#input' + item + 'L').val()), parseFloat($('#input' + item + 'R').val())]);
        requestData['steps'].push(parseFloat($('#input' + item + 'Step').val()));
    });

    console.log(requestData);
    if (Object.values(requestData).length > 2 && k == k0 && (paramcount == 2)){
        successAlertLyapunovMap(true);
        //requestData['request type'] = 'main';
        jQuery.post(
            'http://' + ip + ':5000',
            requestData,
            successLyapunovMap
        );
    }
    else{
        //var code = jQuery(".code");
        //var d = jQuery('<div id="error_alert" class="alert alert-danger text_center m10" role="alert">НЕВЕРНЫЙ ФОРМАТ ЗНАЧЕНИЙ</div>');
        //code.prepend(d);
        //$('#navbarDropdownMenuLink').popover('show');
        //jQuery("#error_alert").delay(1000).fadeOut(100);
        alert('ошибочка у вас');
    }
}
function successLyapunovMap(data){
    function getLyapunovMapData(dataset){
    
        resData = {};
        resData['x'] = [];
        resData['y'] = [];
        resData['lyap'] = [];

        dataset.forEach(function(item, i) {
            resData['x'].push(item[0][0]);
            resData['y'].push(item[0][1]);
            resData['lyap'].push(item[1]);
        });
    
        return resData;
    }
    successAlertLyapunovMap(false);
    //LyapunovMapData = JSON.parse(JSON.parse(data))[0];
    LyapunovMapData = getLyapunovMapData(JSON.parse(JSON.parse(data))[0]);
    drawLyapunovMap(LyapunovMapData['x'], LyapunovMapData['y'], LyapunovMapData['lyap']);
}
function drawLyapunovMap(x, y, z){
    var data = [{
        z: z,
		x: x,
		y: y,
        type: 'contour',
        line:{
          smoothing: 0.85
        }
      }];

      var layout = {
        height: (document.getElementById('chartLyapunovMap').offsetWidth * 0.8),
        displayModeBar: true,
        margin: {
            l: 50,
            r: 25,
            b: 50,
            t: 25,
            pad: 2},
        /*title: {
            text:'Plot Title',
            font: {
                family: 'Courier New, monospace',
                size: 24
            },
            xref: 'paper',
            x: 0.05,
            },*/
        xaxis: {
          title: {
            text: selectedLyapunovMapParamList[0],
            font: {
              //family: 'Courier New, monospace',
              size: 24,
              //color: '#7f7f7f'
            }
          },
        },
        yaxis: {
          title: {
            text: selectedLyapunovMapParamList[1],
            font: {
              //family: 'Courier New, monospace',
              size: 24,
              //color: '#7f7f7f'
            }
          }
        }
      };
      
      Plotly.newPlot('chartLyapunovMap', data, layout);
}
// -----------------------------------------------------------------------------------

// Bifurcation Diagram ---------------------------------------------------------------
function addParamLBifurcationDiagram(name){
    newParamBifurcationDiagram = '<div class="row align-self-center shadow rounded mb-1" id="BifurcationDiagramParamT"> <div class="col-12 zero-padding"> <div class="row no-gutters justify-content-center align-self-center bg-light"> <div class="col-05 text-center my-auto"> <input type="checkbox" class="BifurcationDiagramCheckBox" id="BifurcationDiagramCheckBoxT"> </div> <div class="col-05 text-center my-auto"> <h4>T</h4> </div> <div class="col-80 justify-content-center align-self-center"> <div class="row no-gutters" style="width: 100%;"> <div class="col-2 justify-content-center align-self-center"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="BifurcationDiagraminputTL" value="-10"> </div> <div class="col-8 justify-content-center align-self-center"> <div id="sliderRangeBifurcationDiagramT"></div> </div> <div class="col-2 justify-content-center align-self-center"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="BifurcationDiagraminputTR" value="10"> </div> </div> </div> <div class="col-010 text-center my-auto"> <input type="text" class="form-control" style="border: none; border-width: 0; box-shadow: none; background-color:transparent; text-align: center;" id="BifurcationDiagraminputTStep" value="0.1"> </div> </div> </div> <script> $(function() { $("#sliderRangeBifurcationDiagramT").slider({ range: true, min: -100, max: 100, values: [-10, 10], slide: function( event, ui ) { $("#BifurcationDiagraminputTL").val(ui.values[0]); $("#BifurcationDiagraminputTR").val(ui.values[1]); } }); $("#BifurcationDiagraminputTL").val($("#sliderRangeBifurcationDiagramT").slider("values", 0)); $("#BifurcationDiagraminputTR").val($("#sliderRangeBifurcationDiagramT").slider("values", 1)); }); </script> </div>';
    paramBifurcationDiagram = newParamBifurcationDiagram.split("T").join(name);
    $('#BifurcationDiagramParamList').append(paramBifurcationDiagram);
}
function deleteParamBifurcationDiagram(name){
    $('#BifurcationDiagramParam' + name).remove();
}
function successAlertBifurcationDiagram(state) {
    if (state){
        //add alert
        //var success_alert_html = jQuery('<div id="success_alert" class="alert alert-warning text_center m10" role="alert">ОБРАБОТКА</div>');
        //jQuery(".code").prepend(success_alert_html);
        //add spinner to button
        var spinner_html = '<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>';
        jQuery("#drawBifurcationDiagram").text("");
        jQuery("#drawBifurcationDiagram").append(spinner_html);
    } else{
        //jQuery("#success_alert").delay(500).fadeOut(100);
        jQuery("#drawBifurcationDiagram").empty();
        jQuery("#drawBifurcationDiagram").text("Построить");
    }
}
var BifurcationDiagramRange = [-10, 10];
function makeBifurcationDiagram(){
    
    // make data
    k = 0;
    k0 = 0;
    requestData = {};
    requestData['request type'] = 2;
    requestData['variables'] = ODEvarlist.join(', ');
    
    start_values = [];
    jQuery('.inputstart').each(function(i, elem){
        if ($(elem).val() != ""){
            k0++;
            start_values.push($(elem).val());
        }   
    });
    requestData['start values'] = start_values;

    functions = [];
    jQuery('.inputeq').each(function(i, elem){
        if ($(elem).val() != ""){
            k++;
            functions.push($(elem).val().slice(($(elem).val().indexOf(')/dt=') + 5)));
        }
    });
    requestData['functions'] = functions;

    additional_equations = [];
    jQuery('.inputparam').each(function(i, elem){
        if ($(elem).val() != ""){
            nameeq = $($(elem).parent().parent().children()[0]).children()[0].value;
            additional_equations.push(nameeq + $(elem).val());
        }
    });
    
    temp_additional_equations = [];
    paramcount = 0;
    additional_equations.forEach(function(item, i) {
        addeqvar = item.slice(0, item.indexOf(' ='));
        if (selectedBifurcationDiagramParamList.indexOf(addeqvar) == -1){
            temp_additional_equations.push(item);
        } else{
            paramcount++;
        }
    });
    requestData['additional equations'] = temp_additional_equations.join('; ').split(' =').join(':=') + ';';

    requestData['time'] = jQuery("#time").val();
    requestData['dt'] = jQuery("#dt").val();

    requestData['parameter'] = selectedBifurcationDiagramParamList[0];
    requestData['range'] = [parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'L').val()), parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'R').val())];
    requestData['step'] = parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'Step').val());
    BifurcationDiagramRange = [parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'L').val()), parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'R').val()), parseFloat($('#BifurcationDiagraminput' + requestData['parameter'] + 'Step').val())];

    console.log(requestData);
    if (Object.values(requestData).length > 2 && k == k0 && (paramcount == 1)){
        successAlertBifurcationDiagram(true);
        //requestData['request type'] = 'main';
        jQuery.post(
            'http://' + ip + ':5000',
            requestData,
            successBifurcationDiagram
        );
    }
    else{
        //var code = jQuery(".code");
        //var d = jQuery('<div id="error_alert" class="alert alert-danger text_center m10" role="alert">НЕВЕРНЫЙ ФОРМАТ ЗНАЧЕНИЙ</div>');
        //code.prepend(d);
        //$('#navbarDropdownMenuLink').popover('show');
        //jQuery("#error_alert").delay(1000).fadeOut(100);
        alert('такх, ошибочка у вас');
    }
}
function successBifurcationDiagram(data){
    if (data.length < 10){
        alert('что-то пошло не так');
    }
    BifurcationData = JSON.parse(JSON.parse(data));
    //BifurcationPoints = [].concat(...BifurcationData['BifurcationMap']);
    successAlertBifurcationDiagram(false);

    drawBifurcationDiagram(BifurcationData['BifurcationMap']);
}
function drawBifurcationDiagram(data){

    y = [];
    x = [];
    rangex = rangeFloatArray(BifurcationDiagramRange[0], BifurcationDiagramRange[1], BifurcationDiagramRange[2]);
    data.forEach(function(traj, i, data) {
        traj.forEach(function(dot) {
            x.push(rangex[i]);
            y.push(dot);
        });
    });

    traces = [
        {
            mode: 'markers',
            x: x,
            y: y,
            marker: {
                size: 2,
                color: 'black'
            }
        }
    ];

    var config = {responsive: true}
    Plotly.newPlot('chartBifurcationDiagram', traces, {
        displayModeBar: true,
        config,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4}
        });
}
// -----------------------------------------------------------------------------------

/*
// 3D Streamtube ---------------------------------------------------------------------
{
    Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/streamtube-basic.csv', function(err, rowss){

    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    rows = {};
    rows['x'] = [];
    rows['y'] = [];
    rows['z'] = [];
    rows['u'] = [];
    rows['v'] = [];
    rows['w'] = [];
    for (let x = -20; x < 20; x+=5) {
        for (let y = -26; y < 30; y+=5) {
            for (let z = 0; z < 50; z+=5) {
                u = 10*(y-x);
                v = x*(28-z)-y;
                w = x*y-(8/3)*z;
                rows['x'].push(x);
                rows['y'].push(y);
                rows['z'].push(z);
                rows['u'].push(u);
                rows['v'].push(v);
                rows['w'].push(w);
            }
        }   
    }

    var data = [{
      type: "streamtube",
      x: rows['x'],
      y: rows['y'],
      z: rows['z'],
      u: rows['u'],
      v: rows['v'],
      w: rows['w'],
      sizeref: 0.1,
      cmin: 0,
      cmax: 3
    }]

    Plotly.newPlot('chartStreamtube3D', data,
        {
            height: 750,
            displayModeBar: true,
            margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 25,
                pad: 1}
        }
    );

});
}
// -----------------------------------------------------------------------------------
*/
// save plot data
function savetocsv() {

    n = dataarc[0];
    ndims = dataarc[1];
    xs = dataarc[2];
    t = dataarc[3];
    ls = dataarc[4];

    if (dataarc.length > 0){
        var csv = '';
        //header
        for (var i = 1; i <= ndims; i++){
            csv += ("x" + i + ",");
        }
        for (var i = 1; i <= ndims; i++){
            csv += ("l" + i + ",");
        }
        csv += "t\n";

        //data part
        for (var i = 0; i < n; i++) {
            for (var j = 1; j <= ndims; j++){
                csv += xs["x" + j][i];
                csv += ",";
            }
            for (var j = 1; j <= ndims; j++){
                csv += ls["l" + j][i];
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