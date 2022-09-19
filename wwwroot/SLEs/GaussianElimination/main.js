/* creates latex matrix equation */
function createLatexMatrixEquation_AxeB(size, table_id){
    var tableHTML = ''
    tableHTML += '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'
    tableHTML += '<mrow data-mjx-texclass="INNER">'
    tableHTML += '<mo data-mjx-texclass="OPEN">(</mo>'
    tableHTML += '<mtable columnspacing="1em" rowspacing="4pt">';
    let smallest10exp = Math.ceil(Math.log10(size));
    let multiplicator = Math.pow(10, smallest10exp);
    for (var i = 1; i <= size; i++) {
        tableHTML += '<mtr>';
        for (var j = 1; j <= size; j++) {
            tableHTML += '<mtd>';
            tableHTML += '<semantics>';
            tableHTML += '<annotation-xml encoding="application/xhtml+xml">';
            cell_id = table_id + (i*multiplicator + j);
            tableHTML += '<span id="'+cell_id+'" class="input" role="textbox" type="text" style="border-bottom: solid; min-width: 3ch; display: block; text-align:center" contenteditable></span>';
            tableHTML += '</annotation-xml>';
            tableHTML += '</semantics>';
            tableHTML += '</mtd>';
        }
        tableHTML += '</mtr>';
    }
    tableHTML += '</mtable>';
    tableHTML += '<mo data-mjx-texclass="CLOSE">)</mo>';
    tableHTML += '</mrow>';
    tableHTML += '<mo>&#xD7;</mo>';
    tableHTML += '<mrow data-mjx-texclass="INNER">'
    tableHTML += '<mo data-mjx-texclass="OPEN">(</mo>'
    tableHTML += '<mtable columnspacing="1em" rowspacing="4pt">';
    for (var i = 1; i <= size; i++) {
        tableHTML += '<mtr>';
        tableHTML += '<mtd>';
        tableHTML += '<semantics>';
        tableHTML += '<annotation-xml encoding="application/xhtml+xml">';
        tableHTML += '<span id="vector_x'+i+'" class="input" role="textbox" type="text" style="border-bottom: solid; min-width: 3ch; display: block; text-align:center">'+'x'+i+'</span>';
        tableHTML += '</annotation-xml>';
        tableHTML += '</semantics>';
        tableHTML += '</mtd>';
        tableHTML += '</mtr>';
    }
    tableHTML += '</mtable>';
    tableHTML += '<mo data-mjx-texclass="CLOSE">)</mo>';
    tableHTML += '</mrow>';
    tableHTML += '<mo>=</mo>';
    tableHTML += '<mrow data-mjx-texclass="INNER">'
    tableHTML += '<mo data-mjx-texclass="OPEN">(</mo>'
    tableHTML += '<mtable columnspacing="1em" rowspacing="4pt">';
    for (var i = 1; i <= size; i++) {
        tableHTML += '<mtr>';
        tableHTML += '<mtd>';
        tableHTML += '<semantics>';
        tableHTML += '<annotation-xml encoding="application/xhtml+xml">';
        tableHTML += '<span id="vector_b'+i+'" class="input" role="textbox" type="text" style="border-bottom: solid; min-width: 3ch; display: block; text-align:center" contenteditable></span>';
        tableHTML += '</annotation-xml>';
        tableHTML += '</semantics>';
        tableHTML += '</mtd>';
        tableHTML += '</mtr>';
    }
    tableHTML += '</mtable>';
    tableHTML += '<mo data-mjx-texclass="CLOSE">)</mo>';
    tableHTML += '</mrow>';
    tableHTML += '</math>';
    return tableHTML;

}

$(document).ready(function() {
    // add listeners #i0N and replace #table_A with table using size from #i0N
    var matrixA_size_input = document.getElementById('i0N');
    // create matrix A
    matrixA_size_input.addEventListener('input', function(){
        var table = document.getElementById('table_A');
        table.innerHTML = '<div class="spinner-border text-primary my-auto" role="status"></div>';
        // create table
        setTimeout(function(){
            // replace table
            table.innerHTML = createLatexMatrixEquation_AxeB(matrixA_size_input.value, 'table_A');
            // update mathjax
            MathJax.typeset();
        }, 1000);
    });
    var table = document.getElementById('table_A');
    table.innerHTML = createLatexMatrixEquation_AxeB(matrixA_size_input.value, 'table_A');
    MathJax.typeset();

    // randomizeButton
    var randomizeButton = document.getElementById('randomizeButton');
    randomizeButton.addEventListener('click', function(){
        var size = document.getElementById('i0N').value;
        let smallest10exp = Math.ceil(Math.log10(size));
        let multiplicator = Math.pow(10, smallest10exp);
        for (var i = 1; i <= size; i++) {
            for (var j = 1; j <= size; j++) {
                cell_id = 'table_A' + (i*multiplicator + j);
                document.getElementById(cell_id).innerHTML = Math.floor(Math.random() * 10);
            }
            document.getElementById('vector_b'+i).innerHTML = Math.floor(Math.random() * 10);
            document.getElementById('vector_x'+i).innerHTML = 'x'+i;
        }
        MathJax.typeset();
        });
});


