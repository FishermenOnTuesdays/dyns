/* creates latex matrix equation */
async function createLatexMatrixEquation_AxeB(size, table_id){
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

async function updateAxeB(table_id, size){
    var table = document.getElementById(table_id);
    // replace input of size x size with matrix
    document.getElementById('i0N').value = size;
    table.innerHTML = '<div class="spinner-border text-primary my-auto" role="status"></div>';
    // create table
    // setTimeout(function(){
    // replace table
    createLatexMatrixEquation_AxeB(size, table_id).then(
        function(result){
            table.innerHTML = result;
            MathJax.typeset();
        }
    )
    // table.innerHTML = createLatexMatrixEquation_AxeB(size, table_id);
    // update mathjax
    // MathJax.typeset();
    // }, 100);
}

$(document).ready(function() {
    // add listeners #i0N and replace #table_A with table using size from #i0N
    var matrixA_size_input = document.getElementById('i0N');
    // create matrix A
    matrixA_size_input.addEventListener('input', async function(){
        await updateAxeB('table_A', matrixA_size_input.value);
        // var table = document.getElementById('table_A');
        // table.innerHTML = '<div class="spinner-border text-primary my-auto" role="status"></div>';
        // // create table
        // setTimeout(function(){
        //     // replace table
        //     table.innerHTML = createLatexMatrixEquation_AxeB(matrixA_size_input.value, 'table_A');
        //     // update mathjax
        //     MathJax.typeset();
        // }, 1000);
    });
    var table = document.getElementById('table_A');
    // table.innerHTML = createLatexMatrixEquation_AxeB(matrixA_size_input.value, 'table_A');
    // MathJax.typeset();
    updateAxeB('table_A', matrixA_size_input.value);

    // randomizeButton
    var randomizeButton = document.getElementById('randomizeButton');
    randomizeButton.addEventListener('click', function(){
        var size = document.getElementById('i0N').value;
        let smallest10exp = Math.ceil(Math.log10(size));
        let multiplicator = Math.pow(10, smallest10exp);
        for (var i = 1; i <= size; i++) {
            for (var j = 1; j <= size; j++) {
                cell_id = 'table_A' + (i*multiplicator + j);
                document.getElementById(cell_id).innerHTML = Math.random();//Math.floor(Math.random() * 10);
            }
            document.getElementById('vector_b'+i).innerHTML = Math.random();//Math.floor(Math.random() * 10);
            document.getElementById('vector_x'+i).innerHTML = 'x'+i;
            document.getElementById('error').innerHTML = '';
        }
        MathJax.typeset();
    });
    
    $('select').on('change', async function(e){
        try {
            example_num = this.value;
            let example_data_json = this.options[this.selectedIndex].getAttribute("data-example");
            let example_data = JSON.parse(example_data_json);
            // console.log(example_data);
            for (const [key, value] of Object.entries(example_data)) {
            if (key.includes('table')) {
                let size = value.length;
                // resize table
                await updateAxeB('table_A', size).then(function(){
                    // fill table
                    let smallest10exp = Math.ceil(Math.log10(size));
                    let multiplicator = Math.pow(10, smallest10exp);
                    for (var i = 0; i < size; i++) {
                        for (let j = 0; j < value[i].length; j++) {
                            cell_id = key + ((i+1)*multiplicator + (j+1));
                            document.getElementById(cell_id).innerHTML = value[i][j];
                            }
                    }
                });
            } else {
                if (key.includes('vector')) {
                for (let i = 0; i < value.length; i++) {
                    cell_id = key + (i+1);
                    document.getElementById(cell_id).innerHTML = value[i];
                }
                }
            }
            }
        } catch (error) {
            console.log(error);
        }
        sle_type = this.parentNode.parentNode.parentNode.name;
        form = document.getElementById(sle_type);
        const FD = new FormData(form);
        FD.append('request type', 'SLE');
        FD.append('SLE_type', sle_type);
        FD.append('SLE_method', document.getElementById('SLE_method').value);
        let matrix = [];
        let vector = [];
        var N = parseInt(document.getElementById('i0N').value);
        let smallest10exp = Math.ceil(Math.log10(N));
        let multiplicator = Math.pow(10, smallest10exp);
        for (let i = 0; i < N; i++) {
            let row = [];
            for (let j = 0; j < N; j++) {
            row.push(parseFloat(document.getElementById('table_A' + ((i+1)*multiplicator + (j+1))).innerHTML));
            }
            matrix.push(row);
        }
        for (let i = 0; i < N; i++) {
            vector.push(parseFloat(document.getElementById('vector_b' + (i+1)).innerHTML));
        }
        FD.append('matrix', JSON.stringify(matrix));
        FD.append('vector', JSON.stringify(vector));
        sendFormData(FD);
    });
});


