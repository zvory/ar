//////////////////////////////////////////////////////////////////////////////////
//		Init
//////////////////////////////////////////////////////////////////////////////////

// init renderer
const renderer	= new THREE.WebGLRenderer({
    // antialias	: true,
    alpha: true
});

const initRenderer = (renderer) => {
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    // renderer.setPixelRatio( 1/2 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );    
}
initRenderer(renderer)

// array of functions for the rendering loop
const onRenderFcts= [];

// init scene and camera
const scene	= new THREE.Scene();

//////////////////////////////////////////////////////////////////////////////////
//		Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
const camera = new THREE.Camera();
scene.add(camera);

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////

const arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam 
    // sourceType : 'webcam',
    
    // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		
    
    // to read from a video
    sourceType : 'video',
    sourceUrl : 'data/videos/headtracking.mp4',		
})

arToolkitSource.init(function onReady(){
    onResize()
})

// handle resize
window.addEventListener('resize', function(){
    onResize()
})
function onResize(){
    arToolkitSource.onResize()	
    arToolkitSource.copySizeTo(renderer.domElement)	
    if( arToolkitContext.arController !== null ){
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
    }	
}
////////////////////////////////////////////////////////////////////////////////
//          initialize arToolkiTHREExContext
////////////////////////////////////////////////////////////////////////////////


// create arToolkitContext
const arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/data/camera_para.dat',
    detectionMode: 'mono',
    maxDetectionRate: 30,
    canvasWidth: 80*3,
    canvasHeight: 60*3,
})
// initialize it
arToolkitContext.init(function onCompleted(){
    // copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
})

// update artoolkit on every frame
onRenderFcts.push(function(){
    if( arToolkitSource.ready === false )	return
    
    arToolkitContext.update( arToolkitSource.domElement )
})


////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////

const markerRoot = new THREE.Group
scene.add(markerRoot)
const artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type : 'pattern',
    // patternUrl : 'data/data/patt.hiro'
    patternUrl : 'data/data/patt.kanji'
})

// build a smoothedControls
const smoothedRoot = new THREE.Group()
scene.add(smoothedRoot)
const smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
    lerpPosition: 0.4,
    lerpQuaternion: 0.3,
    lerpScale: 1,
})
onRenderFcts.push(function(delta){
    smoothedControls.update(markerRoot)
})
//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

const arWorldRoot = smoothedRoot

// Create a texture loader so we can load our image file
const loader = new THREE.TextureLoader();

// Load an image file into a custom material
const material = new THREE.MeshLambertMaterial({
    map: loader.load('csclogo.png')
});

// create a plane geometry for the image with a width of 10
// and a height that preserves the image's aspect ratio
const geometry = new THREE.PlaneGeometry(6.5, 2);

// combine our image geometry and material into a mesh
const mesh = new THREE.Mesh(geometry, material);

mesh.position.y	= 0.1*geometry.parameters.height
arWorldRoot.add( mesh );

mesh.rotation.x = 1.5*Math.PI ;

onRenderFcts.push(function(){
    mesh.rotation.z -= 0.05
})

//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function(){
    renderer.render( scene, camera );
    // stats.update();
})

// run the rendering loop
let lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec	= nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
})