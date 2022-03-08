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

function draw3DSurfacePlot(element_id, x, y, z, xaxis='x', yaxis='y', zaxis='z') {
    
    var chartData = [{
        x: x,
        y: y,
        z: z,
        type: 'surface'
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