function Draw(){

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0xffffff);//new THREE.Color(0x676767);

  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  const canvas = document.querySelector('#View');
  let width = canvas.offsetWidth,
      height = canvas.offsetHeight;
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  /*
  var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
  keyLight.position.set(-1000, 0, 1000);
  
  var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
  fillLight.position.set(1000, 0, 1000);

  var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(1000, 0, -1000).normalize();
  */
  var keyLight1 = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
  keyLight1.position.set(-1000, 0, 1000);
  var keyLight2 = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
  keyLight2.position.set(1000, 0, -1000);
  var ambientLight = new THREE.AmbientLight(0x404040, 1); // soft white light

  //scene.add(keyLight);
  //scene.add(fillLight);
  //scene.add(backLight);
  scene.add(keyLight1);
  scene.add(keyLight2);
  scene.add(ambientLight);

  /*
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath('assets/');
  mtlLoader.setPath('assets/');
  mtlLoader.load('surface.mtl', function (materials) {

      materials.preload();

      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/');
      objLoader.load('surface.obj', function (object) {
          object.traverse( function( node ) {
            if( node.material ) {
              node.material.side = THREE.DoubleSide;
            }
          });
          scene.add(object);
          object.position.x -= 10;
          object.position.y -= 5;

      });

  });
  */
  //GridBox params
  var GridBoundingBox;
  var objs = [];
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('assets/');
  objLoader.load('surface.obj', function ( object ) {
      object.traverse( function( node ) {
          if( node.material ) {
              geometry = node.geometry
              geometry.computeBoundingBox();
              GridBoundingBox = geometry.boundingBox;
              var GradientMaterial = new THREE.ShaderMaterial({
                  uniforms: {
                    color1: {
                      value: new THREE.Color("blue")
                    },
                    color2: {
                      value: new THREE.Color("red")
                    },
                    bboxMin: {
                      value: geometry.boundingBox.min
                    },
                    bboxMax: {
                      value: geometry.boundingBox.max
                    }
                  },
                  vertexShader: `
                    uniform vec3 bboxMin;
                    uniform vec3 bboxMax;
                  
                    varying vec2 vUv;
                
                    void main() {
                      vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
                      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                    }
                  `,
                  fragmentShader: `
                    uniform vec3 color1;
                    uniform vec3 color2;
                  
                    varying vec2 vUv;
                    
                    void main() {
                      
                      gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                    }
                  `,
                  side: THREE.DoubleSide,
                  //wireframe: true
                  wireframe: false
              });
              node.material = GradientMaterial;
              objs.push(node);
              var wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({color: "black"}));
              scene.add(wireframe);
          }
      });

      scene.add(object);
      //object.position.x -= 10;
      //object.position.y -= 5;
      
      /*--------------------
      Grid Planes
      --------------------*/
      var SIZE = [
        Math.ceil(GridBoundingBox.max.x - GridBoundingBox.min.x),
        Math.ceil(GridBoundingBox.max.y - GridBoundingBox.min.y),
        Math.ceil(GridBoundingBox.max.z - GridBoundingBox.min.z)
      ];
      var maxSIZE = Math.max(...SIZE);
      controls.object.position.x += maxSIZE / 2;
      controls.object.position.y += maxSIZE / 2;
      controls.object.position.z += maxSIZE;// / 2;
      controls.target = new THREE.Vector3(
        GridBoundingBox.min.x + maxSIZE / 2,
        GridBoundingBox.min.y + maxSIZE / 2,
        GridBoundingBox.min.z //- maxSIZE / 2
        );

      const createYZ1Plane = () => {
        var size = maxSIZE;
        var gridHelper = new THREE.GridHelper(size, size, 0x007bff, 0x808080);
        gridHelper.position.z = GridBoundingBox.min.z;// + SIZE[2] / 2;
        gridHelper.position.y = GridBoundingBox.min.y + maxSIZE / 2;
        gridHelper.position.x = GridBoundingBox.min.x;// + SIZE[0] / 2;
        gridHelper.rotation.x = Math.PI / 180 * -90;
        gridHelper.rotation.z = Math.PI / 180 * -90;
        scene.add(gridHelper);
      }
      createYZ1Plane();
      const createYZ2Plane = () => {
        var size = maxSIZE;
        var gridHelper = new THREE.GridHelper(size, size, 0x007bff, 0x808080);
        gridHelper.position.z = GridBoundingBox.min.z - maxSIZE / 2;
        gridHelper.position.y = GridBoundingBox.min.y + maxSIZE / 2;
        gridHelper.position.x = GridBoundingBox.min.x + maxSIZE / 2;
        gridHelper.rotation.x = Math.PI / 180 * -90;
        scene.add(gridHelper);
      }
      createYZ2Plane();
      const createXYPlane = () => {
        var size = maxSIZE;
        var gridHelper = new THREE.GridHelper(size, size, 0x007bff, 0x808080);
        gridHelper.position.z = GridBoundingBox.min.z;// + SIZE[2] / 2;
        gridHelper.position.y = GridBoundingBox.min.y;// + SIZE[1] / 2;
        gridHelper.position.x = GridBoundingBox.min.x + maxSIZE / 2;
        scene.add(gridHelper);
      }
      createXYPlane();
      // add AXES
      //const axesHelper = new THREE.AxesHelper(100);
      //scene.add( axesHelper );
  });

  var marker = new THREE.TextSprite({
    alignment: 'left',
    color: '#000000',
    fontFamily: 'Roboto',
    fontSize: 0.5,
    fontStyle: 'italic',
    text: '10, 10, 10\n'
  });
  /*
  var marker = new THREE.Mesh(new THREE.SphereBufferGeometry(0.25, 4, 2), new THREE.MeshBasicMaterial({
    color: 0xFFc8FF
  }));
  */
  marker.position.setScalar(1000);
  scene.add(marker);
  
  var intscs = [];
  var rc = new THREE.Raycaster();
  var m = new THREE.Vector2();
  var poi = new THREE.Vector3();
  var pos = new THREE.Vector3();
  var tp = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ];
  var tri = new THREE.Triangle();
  var bc = new THREE.Vector3();
  var idx = 0;
  
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  
  function onMouseMove(event) {
    m.x = (event.clientX / window.innerWidth) * 2 - 1;
    m.y = -(event.clientY / window.innerHeight) * 2 + 1;
    rc.setFromCamera(m, camera);
    intscs = rc.intersectObjects(objs);
    if (intscs.length > 0) {
      let o = intscs[0];
      poi.copy(o.point);
      o.object.worldToLocal(poi);
      setPos(o.faceIndex);
      o.object.localToWorld(pos);
      marker.position.copy(pos);
      marker.text = marker.position.x.toFixed(1) + ', ' + marker.position.y.toFixed(1) + ', ' + marker.position.z.toFixed(1) + '\n';
      marker.position.z += 2;
      
    }
  }
  
  function setPos(faceIndex) {
    tp[0].fromBufferAttribute(intscs[0].object.geometry.attributes.position, faceIndex * 3 + 0);
    tp[1].fromBufferAttribute(intscs[0].object.geometry.attributes.position, faceIndex * 3 + 1);
    tp[2].fromBufferAttribute(intscs[0].object.geometry.attributes.position, faceIndex * 3 + 2);
    tri.set(tp[0], tp[1], tp[2]);
    tri.getBarycoord(poi, bc);
    if (bc.x > bc.y && bc.x > bc.z) {
      idx = 0;
    } else if (bc.y > bc.x && bc.y > bc.z) {
      idx = 1;
    } else if (bc.z > bc.x && bc.z > bc.y) {
      idx = 2;
    }
    pos.copy(tp[idx]);
  }

  var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}

window.onload = function() {
  Draw();
};