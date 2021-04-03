
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

function renderSurfaceGraph(){

  inputJSON = loadFile("data.json");;
  inputData = JSON.parse(inputJSON);
  var timeSequence = inputData['time sequence'];
  timeSequence.unshift(0.0);
  var trajectories = inputData['trajectories'];

  var x = [];
  var u = [];
  var t = [];
  ///*
  for (let i = 0; i < timeSequence.length; i++){
    for (let j = 0; j < trajectories.length; j++){
      x.push(trajectories[j]['x'][i]);
      u.push(trajectories[j]['u'][i]);
      t.push(timeSequence[i]);
    }
  }
  //*/
  /*
  trajectories.forEach(function(trajectory, i){
    x = x.concat(trajectory['x']);
    u = u.concat([trajectory['u']]);
    t = t.concat(timeSequence);
  });
  */

  var data = [{
    z: u,
    x: x,
    y: t,
    type: 'mesh3d'
  }];
    
  var layout = {
    title: '42',
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
  Plotly.newPlot('myDiv1', data, layout);

}