function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function DrawSurface(filename){

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0xffffff);//new THREE.Color(0x676767);

  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  const canvas = document.querySelector('#PDESurface');
  fitToContainer(canvas);
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
  var GridBoundingBox = null;

  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('temp/');
  objLoader.load(filename, function ( object ) {
      object.traverse( function( node ) {
          if( node.material ) {
              ///*
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
          }
      });

      scene.add(object);
      //object.position.x -= 10;
      //object.position.y -= 5;
  });

  /*--------------------
  Grid Planes
  --------------------*/
  const createYZPlane = () => {
    var gridHelper = new THREE.GridHelper(100, 100, 0x007bff, 0x808080);
		gridHelper.position.y = 0;
		gridHelper.position.x = 0;
    gridHelper.rotation.x = Math.PI / 180 * -90;
		scene.add(gridHelper);
  }
  createYZPlane();
  const createXYPlane = () => {
    var gridHelper = new THREE.GridHelper(100, 100, 0x007bff, 0x808080);
		gridHelper.position.y = 0;
		gridHelper.position.x = 0;
		scene.add( gridHelper );
  }
  createXYPlane();

  var animate = function () {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}