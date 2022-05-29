/* returns effect VANTA object for specified element id */
function makeVANTA(element_id) {
    return VANTA.FOG({
        el: `#${element_id}`,
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
}

/* returns spinner html */
function makeSpinner() {
    return '<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>';
}

/* receives task state and toggles spinner on button */
function spinnerToggle(element_id, state) {
    var element = jQuery(`#${element_id}`);
    if (state) {
        //add spinner to button
        var prevContent = element.text();
        element.attr("prevContent", prevContent);
        element.text("");
        element.append(makeSpinner());
    } else {
        element.empty();
        element.text(element.attr("prevContent"));
        element.removeAttr("prevContent")
    }
}

/* delays for specified timeout */
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

/* get min value in multidimensional array */
function getMin(a){
    return Math.min(...a.map(e => Array.isArray(e) ? getMin(e) : e));
  }


/* get max value in multidimensional array */
function getMax(a){
    return Math.max(...a.map(e => Array.isArray(e) ? getMax(e) : e));
  }

function draw3DSurfacePlot(element_id, x, y, z, xaxis='x', yaxis='y', zaxis='z', colorscale='') {
    
    var chartData = [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: colorscale,
    }];

    var layout = {
        scene: {
            xaxis:{title: xaxis},
            yaxis:{title: yaxis},
            zaxis:{title: zaxis},
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
    Plotly.newPlot(element_id, chartData, layout, config);
    
}

function animate2DLinePlot(element_id, x, t, xs, xaxis='x', yaxis='y') {
    
    y_min = getMin(xs)
    y_max = getMax(xs)
    var chartData = [{
        x: x,
        y: xs[0],
        name: 't=0',
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
            color: xs[0],
            colorscale: 'Blackbody',
            cmin: y_min,
            cmax: y_max,
            size: 8
          },
        line: {
            color: 'black'
        }
    }];
    var layout = {
        xaxis:{title: xaxis},
        yaxis:{
            title: yaxis,
            range: [y_min, y_max],
        },
        autosize: true,
        showlegend: true,
        height: 850,
        margin: {
         l: 50,
         r: 50,
         b: 50,
         t: 50,
         pad: 2
        },
    };
    var config = {responsive: true};

    var frames = []
    var frame_names = []
    xs.forEach((_x, i) => {
        if (i >= 0) {
            let frame_name = 't='+i
            frame_names.push(frame_name)
            frames.push(
                {
                data: [{
                        x: x,
                        y: _x,
                        name: frame_name,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {
                            color: _x,
                            colorscale: 'Blackbody',
                            cmin: y_min,
                            cmax: y_max,
                            size: 8
                          },
                        line: {
                            color: 'black'
                        }
                    }],
                name: frame_name
                }
            )
        }
      });

    Plotly.newPlot(
        element_id, chartData, layout, config
        ).then(function () {
            Plotly.addFrames(element_id, frames);
        });
      
    function startAnimation() {
        Plotly.animate(element_id, frame_names, {
            frame: [
            {duration: 250},
            {duration: 100},
            ],
            transition: [
            {duration: 200, easing: 'elastic-in'},
            {duration: 50, easing: 'cubic-in'},
            ],
            mode: 'afterall'
        })
    }

    // setTimeout(function(){startAnimation()}, 1000);

    return startAnimation;
    
}

function animate3DSurfacePlot(element_id, x, y, zs, t, xaxis='x', yaxis='y', zaxis='z') {
    
    z_min = getMin(zs)
    z_max = getMax(zs)
    var chartData = [{
        x: x,
        y: y,
        z: zs[0],
        type: 'surface',
        name: 'frame0',
        colorscale: 'Blackbody',
        cmin: z_min,
        cmax: z_max
    }];
    var layout = {
        scene: {
            xaxis:{title: xaxis},
            yaxis:{title: yaxis},
            zaxis:{
                title: zaxis,
                range: [z_min, z_max],
            },
            },
        autosize: true,
        showlegend: true,
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

    var frames = []
    var frame_names = []
    zs.forEach((z, i) => {
        if (i >= 0) {
            let frame_name = 'frame'+i
            frame_names.push(frame_name)
            frames.push(
                {
                data: [{
                        x: x,
                        y: y,
                        z: z,
                        type: 'surface',
                        name: frame_name,
                        colorscale: 'Blackbody',
                        cmin: z_min,
                        cmax: z_max
                    }],
                name: frame_name
                }
            )
        }
      });

    Plotly.newPlot(
        element_id, chartData, layout, config
        ).then(function () {
            Plotly.addFrames(element_id, frames);
        });
      
    function startAnimation() {
        Plotly.animate(element_id, frame_names, {
            frame: [
            {duration: 750},
            {duration: 250},
            ],
            transition: [
            {duration: 500, easing: 'elastic-in'},
            {duration: 100, easing: 'cubic-in'},
            ],
            mode: 'afterall'
        })
    }

    // setTimeout(function(){startAnimation()}, 1000);

    return startAnimation;
    
}