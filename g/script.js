/* global THREE */
/* global THREEx */
/* global requestAnimationFrame */
var controls, camera, glScene, cssScene, glRenderer, cssRenderer;

const hiroPatt = '../data/data/patt.hiro' 
const kanjiPatt = '../data/data/patt.kanji'
const cscPatt = '../data/data/csc.patt'

const patternUrl  = hiroPatt

function createGlRenderer() {
  var glRenderer = new THREE.WebGLRenderer({
    alpha: true
  });
  // glRenderer.setClearColor(0x111111);
  glRenderer.setPixelRatio(window.devicePixelRatio);
  glRenderer.setSize(window.innerWidth, window.innerHeight);
  glRenderer.domElement.style.position = 'absolute';
  glRenderer.domElement.style.zIndex = 1;
  glRenderer.domElement.style.top = 0;
  return glRenderer;
}
///////////////////////////////////////////////////////////////////
// Creates CSS Renderer
//
///////////////////////////////////////////////////////////////////
function createCssRenderer() {
  var cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  glRenderer.domElement.style.zIndex = 0;
  cssRenderer.domElement.style.top = 0;
  return cssRenderer;
}
///////////////////////////////////////////////////////////////////
// Creates plane mesh
//
///////////////////////////////////////////////////////////////////
function createPlane(w, h, position, rotation) {
  var material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  var geometry = new THREE.PlaneGeometry(w, h);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;
  mesh.rotation.x = rotation.x;
  mesh.rotation.y = rotation.y;
  mesh.rotation.z = rotation.z;
  return mesh;
}
///////////////////////////////////////////////////////////////////
// Creates CSS object
//
///////////////////////////////////////////////////////////////////
function createCssObject(w, h, position, rotation, url) {
  var html = [
    '<div style="width:' + w + 'px; height:' + h + 'px;">',
    '<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
    '</iframe>',
    '</div>'
  ].join('\n');
  var div = document.createElement('div');
  $(div).html(html);
  var cssObject = new THREE.CSS3DObject(div);
  cssObject.position.x = position.x;
  cssObject.position.y = position.y;
  cssObject.position.z = position.z;
  cssObject.rotation.x = rotation.x;
  cssObject.rotation.y = rotation.y;
  cssObject.rotation.z = rotation.z;
  const scale = 0.005
  cssObject.scale.set(scale, scale, scale)
  return cssObject;
}
///////////////////////////////////////////////////////////////////
// Creates 3d webpage object
//
///////////////////////////////////////////////////////////////////
function create3dPage(w, h, position, rotation, url) {
  // var plane = createPlane(
  //   w, h,
  //   position,
  //   rotation);
  //   smoothedRoot.add(plane); // TODO is this necessary?
  var cssObject = createCssObject(
    w, h,
    position,
    rotation,
    url);
  cssScene.add(cssObject);
}

///////////////////////////////////////////////////////////////////
// Updates scene
//
///////////////////////////////////////////////////////////////////
let lastTimeMsec = null

function update() {
  // controls.update();
  glRenderer.render(glScene, camera);
  cssRenderer.render(cssScene, camera);
  onRenderFcts.forEach(function (onRenderFct) {
    onRenderFct()
  })
  requestAnimationFrame(update);


}

// BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT
// BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT
// BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT
// BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT
// BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT BEGIN AR BULLSHIT
const onRenderFcts = []
let arToolkitSource
let arToolkitContext
let markerRoot
let artoolkitMarker
let smoothedRoot
let smoothedControls
const initAR = () => {
  camera = new THREE.PerspectiveCamera()

  // 45,
  // window.innerWidth / window.innerHeight,
  // 1,
  // 10000);
  // camera.position.set(0, 100, 3000);
  // controls = new THREE.TrackballControls(camera);
  glRenderer = createGlRenderer();
  cssRenderer = createCssRenderer();
  //document.body.appendChild(glRenderer.domElement);
  document.body.appendChild(cssRenderer.domElement);
  cssRenderer.domElement.appendChild(glRenderer.domElement);
  glScene = new THREE.Scene();
  cssScene = new THREE.Scene();
  // var ambientLight = new THREE.AmbientLight(0x555555);
  // glScene.add(ambientLight);
  // var directionalLight = new THREE.DirectionalLight(0xffffff);
  // directionalLight.position.set(-.5, .5, -1.5).normalize();
  // glScene.add(directionalLight);



  arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam
    sourceType: 'webcam'
    // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',
    // // to read from a video
    // sourceType: 'video',
    // sourceUrl: '../data/videos/csc.mp4'
  })
  arToolkitSource.init(function onReady() {
    onResize()
  })
  // handle resize
  window.addEventListener('resize', function () {
    onResize()
  })

  function onResize() {
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(glRenderer.domElement)
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
  }
  const createARToolkitContext = () => {
    // create arToolkitContext
    const arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: '../data/data/camera_para.dat',
      detectionMode: 'mono',
      maxDetectionRate: 30,
      canvasWidth: 80 * 3,
      canvasHeight: 60 * 3 // NOTE used to be 3
    })
    // initialize it
    arToolkitContext.init(function onCompleted() {
      // copy projection matrix to camera
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
      // camera.zoom = 10
    })
    // update artoolkit on every frame
    onRenderFcts.push(function () {
      if (arToolkitSource.ready === false) return
      arToolkitContext.update(arToolkitSource.domElement)
    })
    return arToolkitContext
  }
  arToolkitContext = createARToolkitContext()
  markerRoot = new THREE.Group()
  glScene.add(markerRoot)
  artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl
  })
  // build a smoothedControls
  smoothedRoot = new THREE.Group()
  glScene.add(smoothedRoot)
  smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
    lerpPosition: 0.4,
    lerpQuaternion: 0.3,
    lerpScale: 1
  })
  onRenderFcts.push(function (delta) {
    smoothedControls.update(markerRoot)
  })

  const arWorldRoot = smoothedRoot
  // add a torus knot	
  // var geometry = new THREE.CubeGeometry(1, 1, 1);
  // var material = new THREE.MeshNormalMaterial({
  //   transparent: true,
  //   opacity: 0.5,
  //   side: THREE.DoubleSide
  // });
  // var mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = geometry.parameters.height / 2
  // arWorldRoot.add(mesh);
  // var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
  // var material = new THREE.MeshNormalMaterial();
  // var mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = 0.5
  // arWorldRoot.add(mesh);
  // onRenderFcts.push(function () {
  //   mesh.rotation.x += 0.1
  // })


  create3dPage(
    1000, 1000,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(Math.PI * .5, Math.PI, Math.PI),
    'http://csclub.ca/~azvorygi/irc/');

  arWorldRoot.add(cssScene)



  update();

}
///////////////////////////////////////////////////////////////////
// On document ready
//
///////////////////////////////////////////////////////////////////
$(document).ready(function () {
  // initialize();
  initAR()
});
// const renderer = new THREE.WebGLRenderer({
//   // antialias : true,
//   alpha: true
// })
// const initRenderer = (renderer) => {
//   renderer.setClearColor(new THREE.Color('lightgrey'), 0)
//   // renderer.setPixelRatio( 1/2 );
//   renderer.setSize(window.innerWidth, window.innerHeight)
//   renderer.domElement.style.position = 'absolute'
//   renderer.domElement.style.top = '0px'
//   renderer.domElement.style.left = '0px'
//   document.body.appendChild(renderer.domElement)
// }
// initRenderer(renderer)
// // array of functions for the rendering loop
// const onRenderFcts = []
// const arToolkitSource = new THREEx.ArToolkitSource({
//   // to read from the webcam
//   // sourceType: 'webcam'
//   // to read from an image
//   // sourceType : 'image',
//   // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',
//   // to read from a video
//   sourceType: 'video',
//   sourceUrl: '../data/videos/headtracking.mp4'
// })
// arToolkitSource.init(function onReady () {
//   onResize()
// })
// // handle resize
// window.addEventListener('resize', function () {
//   onResize()
// })
// function onResize () {
//   arToolkitSource.onResizeElement()
//   arToolkitSource.copyElementSizeTo(renderer.domElement)
//   if (arToolkitContext.arController !== null) {
//     arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
//   }
// }
// const createARToolkitContext = () => {
//   // create arToolkitContext
//   const arToolkitContext = new THREEx.ArToolkitContext({
//     cameraParametersUrl: '../data/data/camera_para.dat',
//     detectionMode: 'mono',
//     maxDetectionRate: 30,
//     canvasWidth: 80 * 3,
//     canvasHeight: 60 * 3
//   })
//   // initialize it
//   arToolkitContext.init(function onCompleted () {
//     // copy projection matrix to camera
//     camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
//   })
//   // update artoolkit on every frame
//   onRenderFcts.push(function () {
//     if (arToolkitSource.ready === false) return
//     arToolkitContext.update(arToolkitSource.domElement)
//   })
//   return arToolkitContext
// }
// const arToolkitContext = createARToolkitContext()
// /// /////////////////////////////////////////////////////////////////////////////
// //          Create a ArMarkerControls
// /// /////////////////////////////////////////////////////////////////////////////
// const markerRoot = new THREE.Group()
// scene.add(markerRoot)
// const artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
//   type: 'pattern',
//   patternUrl : '../data/data/patt.kanji'
//   // patternUrl: 'csc.patt'
// })
// // build a smoothedControls
// const smoothedRoot = new THREE.Group()
// scene.add(smoothedRoot)
// const smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
//   lerpPosition: 0.4,
//   lerpQuaternion: 0.3,
//   lerpScale: 1
// })
// onRenderFcts.push(function (delta) {
//   smoothedControls.update(markerRoot)
// })
// /// ///////////////////////////////////////////////////////////////////////////////
// //  add an object in the scene
// /// ///////////////////////////////////////////////////////////////////////////////
// const arWorldRoot = smoothedRoot
// // add a torus knot	
// var geometry	= new THREE.CubeGeometry(1,1,1);
// var material	= new THREE.MeshNormalMaterial({
//   transparent : true,
//   opacity: 0.5,
//   side: THREE.DoubleSide
// }); 
// var mesh	= new THREE.Mesh( geometry, material );
// mesh.position.y	= geometry.parameters.height/2
// arWorldRoot.add( mesh );
// var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
// var material	= new THREE.MeshNormalMaterial(); 
// var mesh	= new THREE.Mesh( geometry, material );
// mesh.position.y	= 0.5
// arWorldRoot.add( mesh );
// onRenderFcts.push(function(){
//   mesh.rotation.x += 0.1
// })
// /// ///////////////////////////////////////////////////////////////////////////////
// //  render the whole thing on the page
// /// ///////////////////////////////////////////////////////////////////////////////
// onRenderFcts.push(function () {
//   renderer.render(scene, camera)
//   // stats.update();
// })
// // run the rendering loop
// let lastTimeMsec = null
// requestAnimationFrame(function animate (nowMsec) {
//   // keep looping
//   requestAnimationFrame(animate)
//   // measure time
//   lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
//   var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
//   lastTimeMsec = nowMsec
//   // call each update function
//   onRenderFcts.forEach(function (onRenderFct) {
//     onRenderFct(deltaMsec / 1000, nowMsec / 1000)
//   })
// })