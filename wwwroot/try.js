/*
Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/api_docs/mt_bruno_elevation.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}
  
var z_data=[ ]
for(i=0;i<24;i++)
{
  z_data.push(unpack(rows,i));
}




var data = [{
           z: z_data,
           type: 'surface'
        }];
  
var layout = {
  title: 'Mt Bruno Elevation',
  autosize: false,
  width: 1200,
  height: 1200,
  margin: {
    l: 65,
    r: 50,
    b: 65,
    t: 90,
  }
};
Plotly.newPlot('myDiv', data, layout);
});
*/

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

function renderGraph(){
  inputJSON = loadFile("data.json");;
  inputData = JSON.parse(inputJSON);
  var timeSequence = inputData['time sequence'];
  var trajectories = inputData['trajectories'];

  traces = [];
  trajectories.forEach(function(trajectory, i){
    traces.push(
      {
        type: 'scatter3d',
        mode: 'lines',
        x: trajectory['x'],
        y: timeSequence,
        z: trajectory['u'],
        opacity: 1,
        line:{
            colorscale: 'Bluered',
            color: trajectory['u'],
            size: 1
        },
                /*
        marker: {
            color: '#000000',
            size: 2,
        },*/
        name: 'trajectory' + i,
      }
    );
    /*
    realu = [];
    for (let i = 0; i < timeSequence.length; i++){
      t = timeSequence[i];
      x = trajectory['x'][i];
      u = Math.pow(t, 2) / 2 + Math.pow(x, 2) / 4 - Math.pow(x - 2*t, 2) / 4 + Math.cos(x - 2*t) - trajectory['u'][i];
      realu.push(u);
    }

    traces.push(
      {
        type: 'scatter3d',
        mode: 'lines',
        x: trajectory['x'],
        y: timeSequence,
        z: realu,
        opacity: 1,
        line:{
            colorscale: 'Bluered',
            color: '#000000',
            size: 1
        },
        name: 'errtrajectory' + i,
      }
    );
    */
  });


  var config = {responsive: true}
  Plotly.newPlot('myDiv', traces,
          {
              height: 750,
              displayModeBar: true,
              margin: {
                  l: 25,
                  r: 25,
                  b: 25,
                  t: 25,
                  pad: 1
                },
              scene: {
                xaxis:{title: 'x'},
                yaxis:{title: 'time'},
                zaxis:{title: 'u'},
                }
          }
  );
}