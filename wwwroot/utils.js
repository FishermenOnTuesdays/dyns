/* delays for specified timeout */
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

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

/* updates layout */
function updateLayout(element_id){
    delay(200).then(makeVANTA(element_id).resize());
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

/* get min value in multidimensional array */
function getMin(a){
    return Math.min(...a.map(e => Array.isArray(e) ? getMin(e) : e));
  }


/* get max value in multidimensional array */
function getMax(a){
    return Math.max(...a.map(e => Array.isArray(e) ? getMax(e) : e));
  }

/* creates latex matrix */
function createLatexMatrix(size, table_id){
    var tableHTML = ''
    tableHTML += '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'
    tableHTML += '<mrow data-mjx-texclass="INNER">'
    tableHTML += '<mo data-mjx-texclass="OPEN">(</mo>'
    tableHTML += '<mtable columnspacing="1em" rowspacing="4pt">';
    for (var i = 1; i <= size; i++) {
        tableHTML += '<mtr>';
        for (var j = 1; j <= size; j++) {
            tableHTML += '<mtd>';
            tableHTML += '<semantics>';
            tableHTML += '<annotation-xml encoding="application/xhtml+xml">';
            tableHTML += '<span id="'+table_id+i+j+'" class="input" role="textbox" type="text" style="border-bottom: solid; min-width: 3ch; display: block; text-align:right" contenteditable></span>';
            tableHTML += '</annotation-xml>';
            tableHTML += '</semantics>';
            tableHTML += '</mtd>';
        }
        tableHTML += '</mtr>';
    }
    tableHTML += '</mtable>';
    tableHTML += '<mo data-mjx-texclass="CLOSE">)</mo>';
    tableHTML += '</mrow>';
    tableHTML += '</math>';
    return tableHTML;
}

