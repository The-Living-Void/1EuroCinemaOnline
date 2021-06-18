import * as THREE from './node_modules/three/build/three.module.js'
import * as CANNON from './node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControls } from './customPackage/controls/PointerLockControls.js'
import CannonDebugRenderer from './customPackage/CannonDebugRenderer.js';
import { GLTFLoader } from './customPackage/loader/GLTFLoader.js'
//import { threeToCannon } from './node_modules/three-to-cannon/index.js';
import { RGBELoader } from './customPackage/loader/RGBELoader.js';
//import { RoughnessMipmapper } from './customPackage/utils/RoughnessMipmapper.js';
// import { EffectComposer } from './postprocessing/EffectComposer.js';
// import { RenderPass } from './postprocessing/RenderPass';
// import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';


var debug = false;
var checkObjId = true;
var worldId = 3; //1= socerers 2=lighthouse 3=forest 4= cave
// var objectName = 'spider-anim2.glb';
var adjustHeigth = -20;
var soundGoGo = true;

//if (soundGoGo==true) {
const listener = new THREE.AudioListener();
const sound = new THREE.PositionalAudio(listener);
const soundLayer2 = new THREE.PositionalAudio(listener);
const soundLayer3 = new THREE.PositionalAudio(listener);
const soundLayer4 = new THREE.PositionalAudio(listener);
const soundLayer5 = new THREE.PositionalAudio(listener);
const soundBase = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

var muteSound = false;
var soundLoad = false;
var fadeSpeed = 0.007;
//}

//var imgHeightWorld = new Array();
var boolMushroom;
var boolCross;

//interactive stuff
var critterLocation = new THREE.Vector3();
var boolInPerimeter = false;
var currentScene = { id: " " }; //current critter that was found in perimeter gets injected here
var scenes = [];
var constructFetch = "customPackage/scenes/scenes-" + worldId + ".json";
var critterId;
var critterPosX;
var critterPosY;
var critterPosZ;
var critterFilmLink;
var critterLoc = new THREE.Vector3(0, 0, 0);
var filmIsPlaying = false;
var critterClass = "world" + worldId + "critter";
var runOnce = true;
var randomNumberGenerated;
var critterHtmlId = 0;
var alreadyCLickedCritters = [];
var critterToFindArray = [];
var runOnce2 = true;
var lastCritterToFind = false;

var embedContainer = "embedContainerFilm" + "-" + worldId;
var embedContainerGet = document.getElementById(embedContainer);

var initOnce = 0;


var zVal = 0;
var yVal = 0;
var xVal = 0;

let dt2, mixer, lastframe = Date.now(),
    jumpAction, idleAction;
var height_scale = 3;
//1sp person login stuff
var blocker = document.getElementById('blocker')
var instructions = document.getElementById('instructions' + worldId)
var mouse = new THREE.Vector2(),
    INTERSECTED;
var boolMouseOn = false,
    boolMouseClick = false;
var id;

const manager = new THREE.LoadingManager();
manager.onStart = function(url, itemsLoaded, itemsTotal) {
    //console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
manager.onLoad = function() {
    console.log('Loading complete!');
    if (worldId == 2) {
        soundGo(2);
        soundLoad = true;
    }
    if (worldId == 3) {
        soundGo(3);
        soundLoad = true;
    }

};
manager.onProgress = function(url, itemsLoaded, itemsTotal) {
    //console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

pointerLock();

var plane2;
var sphereShape, sphereBody, world, physicsMaterial, walls = [],
    balls = [],
    ballMeshes = [],
    boxes = [],
    boxMeshes = [],
    voxels, groundBody, groundBody2, groundBodyMesh, cannonDebugRenderer;

var camera, scene, renderer, time, raycaster;
var geometry, material, mesh, controls, light;
//OLDCODE
var torusGeo, torusMaterial, shaderMaterial, uniforms, buffGeo, torus;

time = Date.now()
var img = new Image();
var imgForrest = new Image();

var imagesTiles = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
//var textureTiles = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];

for (var i = 0; i < imagesTiles.length; i++) {
    imagesTiles[i].src = "heightMap/" + (worldId) + "_" + (i + 1) + ".png";
}

initCannon();
if (initOnce == 0) {
    init();
    initOnce++;
}

render();
addFlatGround();
getScenes();


for (var i = 1; i < 10; i++) {
    addHeightMapAll(i);
}

animate();

console.log("heyaa I am working :)");

function initCannon() {
    //img.src = "textures/Heightmap.png";
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 2; //used to be 7
    solver.tolerance = 0.1;
    var split = true;
    if (split) world.solver = new CANNON.SplitSolver(solver);
    else world.solver = solver;

    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.broadphase.useBoundingBoxes = true;

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material('slipperyMaterial');
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.0,
        restitution: 0.3,
    });
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    var nx = 50,
        ny = 8,
        nz = 50,
        sx = 0.5,
        sy = 0.5,
        sz = 0.5;

    // Create a sphere
    var mass = 2,
        radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    sphereBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
    sphereBody.addShape(sphereShape);
    // sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5);
    sphereBody.position.set(100, 70, -40);
    sphereBody.linearDamping = 0.9;
    world.addBody(sphereBody);

    // var sphereChickShape = new CANNON.Sphere(5);
    // var chickCircleBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
    // chickCircleBody.addShape(sphereChickShape);
    // chickCircleBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    // chickCircleBody.position.set(85, 32, 5);
    // world.addBody(chickCircleBody);
    //var quatChick = new CANNON.Quaternion(0, 0, 0, 0);
    //sphereChickShape.quaternion.set(n1, 0, 0, 0);

    if (worldId == 1) {
        var world1wall1Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world1wall1Body = new CANNON.Body({ mass: 0 });
        world1wall1Body.addShape(world1wall1Shape);
        world1wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world1wall1Body.position.set(330, 0, 0);
        world.addBody(world1wall1Body);

        var world1wall2Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world1wall2Body = new CANNON.Body({ mass: 0 });
        world1wall2Body.addShape(world1wall2Shape);
        world1wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world1wall2Body.position.set(-150, 0, 0);
        world.addBody(world1wall2Body);

        var world1wall3Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world1wall3Body = new CANNON.Body({ mass: 0 });
        world1wall3Body.addShape(world1wall3Shape);
        world1wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world1wall3Body.position.set(0, 0, -240);
        world.addBody(world1wall3Body);

        var world1wall4Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world1wall4Body = new CANNON.Body({ mass: 0 });
        world1wall4Body.addShape(world1wall4Shape);
        world1wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world1wall4Body.position.set(0, 0, 250);
        world.addBody(world1wall4Body);

        //CODE BOXES SUUS
        // sphere shapes (tegen klok in):
        var pillarShape1 = new CANNON.Sphere(43);
        var pillarBody1 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody1.addShape(pillarShape1);
        pillarBody1.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody1.position.set(-140, 15, -30);
        world.addBody(pillarBody1);

        var pillarShape2 = new CANNON.Sphere(44);
        var pillarBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody2.addShape(pillarShape2);
        pillarBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody2.position.set(-91, 15, 155);
        world.addBody(pillarBody2);

        var pillarShape3 = new CANNON.Sphere(43);
        var pillarBody3 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody3.addShape(pillarShape3);
        pillarBody3.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody3.position.set(100, 15, 240);
        world.addBody(pillarBody3);

        var pillarShape4 = new CANNON.Sphere(43);
        var pillarBody4 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody4.addShape(pillarShape4);
        pillarBody4.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody4.position.set(290, 15, 160);
        world.addBody(pillarBody4);

        var pillarShape5 = new CANNON.Sphere(43);
        var pillarBody5 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody5.addShape(pillarShape5);
        pillarBody5.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody5.position.set(330, 15, -30);
        world.addBody(pillarBody5);

        var pillarShape6 = new CANNON.Sphere(43);
        var pillarBody6 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody6.addShape(pillarShape6);
        pillarBody6.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody6.position.set(230, 15, -250);
        world.addBody(pillarBody6);

        var pillarShape7 = new CANNON.Sphere(43);
        var pillarBody7 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        pillarBody7.addShape(pillarShape7);
        pillarBody7.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        pillarBody7.position.set(-68, 15, -250);
        world.addBody(pillarBody7);

        // plane
        // var chassisShape8 = new CANNON.Box(new CANNON.Vec3(20, 40, 10));
        // var chassisBody8 = new CANNON.Body({ mass: 0 });
        // chassisBody8.addShape(chassisShape8);
        // //chassisBody.position.set(0, 0, 0);
        // chassisBody8.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        // chassisBody8.position.set(95, 5, -15);
        // chassisBody8.angularVelocity.set(0, 0, 0); // initial velocity
        // world.addBody(chassisBody8);

        //crystal
        var crystalShape = new CANNON.Sphere(25);
        var crystalBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystalBody.addShape(crystalShape);
        crystalBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystalBody.position.set(90, 20, 5);
        world.addBody(crystalBody);

        var crystal2Shape = new CANNON.Sphere(3);
        var crystal2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystal2Body.addShape(crystal2Shape);
        crystal2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystal2Body.position.set(68, 22, -13);
        world.addBody(crystal2Body);

        var crystal3Shape = new CANNON.Sphere(5);
        var crystal3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystal3Body.addShape(crystal3Shape);
        crystal3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystal3Body.position.set(68, 23, 22);
        world.addBody(crystal3Body);

        var crystal4Shape = new CANNON.Sphere(8);
        var crystal4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystal4Body.addShape(crystal4Shape);
        crystal4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystal4Body.position.set(70, 26, 5);
        world.addBody(crystal4Body);

        var crystal5Shape = new CANNON.Sphere(8);
        var crystal5Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystal5Body.addShape(crystal5Shape);
        crystal5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystal5Body.position.set(67, 34, 6);
        world.addBody(crystal5Body);

        // pillars next to crystal:
        var cyrstalPillarShape1 = new CANNON.Sphere(6);
        var crystalPillarBody1 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystalPillarBody1.addShape(cyrstalPillarShape1);
        crystalPillarBody1.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystalPillarBody1.position.set(116, 25, -2);
        world.addBody(crystalPillarBody1);

        var crystalPillarShape2 = new CANNON.Sphere(6);
        var crystalPillarBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystalPillarBody2.addShape(crystalPillarShape2);
        crystalPillarBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystalPillarBody2.position.set(81, 25, -39);
        world.addBody(crystalPillarBody2);

        var crystalPillarShape3 = new CANNON.Sphere(6);
        var crystalPillarBody3 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        crystalPillarBody3.addShape(crystalPillarShape3);
        crystalPillarBody3.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        crystalPillarBody3.position.set(116, 25, -40);
        world.addBody(crystalPillarBody3);

        var swordBaseShape = new CANNON.Sphere(5);
        var swordBaseBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        swordBaseBody.addShape(swordBaseShape);
        swordBaseBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        swordBaseBody.position.set(99.5, 20, -21.5);
        world.addBody(swordBaseBody);

        var swordShape = new CANNON.Box(new CANNON.Vec3(1, 60, 2));
        var swordBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        swordBody.addShape(swordShape);
        swordBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        swordBody.position.set(99.5, 20, -21.5);
        world.addBody(swordBody);

        var swordShape2 = new CANNON.Box(new CANNON.Vec3(1, 5, 5));
        var swordBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial });
        swordBody2.addShape(swordShape2);
        swordBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        swordBody2.position.set(99.5, 27, -21.5);
        world.addBody(swordBody2);

        //High Platform

        var platform1Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform1Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform1Body.addShape(platform1Shape);
        platform1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 2.82);
        platform1Body.position.set(87, -10, 0);
        world.addBody(platform1Body);

        var platform2Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform2Body.addShape(platform2Shape);
        platform2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -2.84);
        platform2Body.position.set(113, -10, 0);
        world.addBody(platform2Body);

        var platform3Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform3Body.addShape(platform3Shape);
        platform3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.9);
        platform3Body.position.set(121, -10, -9);
        world.addBody(platform3Body);

        var platform4Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform4Body.addShape(platform4Shape);
        platform4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.25);
        platform4Body.position.set(121, -10, -32);
        world.addBody(platform4Body);

        var platform5Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform5Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform5Body.addShape(platform5Shape);
        platform5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.32);
        platform5Body.position.set(112, -10, -41);
        world.addBody(platform5Body);

        var platform6Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform6Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform6Body.addShape(platform6Shape);
        platform6Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.3);
        platform6Body.position.set(87, -10, -40);
        world.addBody(platform6Body);

        var platform7Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform7Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform7Body.addShape(platform7Shape);
        platform7Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 1.25);
        platform7Body.position.set(78, -10, -31);
        world.addBody(platform7Body);

        var platform8Shape = new CANNON.Box(new CANNON.Vec3(22, 30, 30));
        var platform8Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        platform8Body.addShape(platform8Shape);
        platform8Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 1.92);
        platform8Body.position.set(79, -10, -9);
        world.addBody(platform8Body);


        //Low Platform

        // var lowPlatform1Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        // var lowPlatform1Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // lowPlatform1Body.addShape(lowPlatform1Shape);
        // lowPlatform1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 2.82);
        // lowPlatform1Body.position.set(87, 30, 0);
        // world.addBody(lowPlatform1Body);

        // var lowPlatform2Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        // var lowPlatform2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // lowPlatform2Body.addShape(lowPlatform2Shape);
        // lowPlatform2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -2.84);
        // lowPlatform2Body.position.set(113, 30, 0);
        // world.addBody(lowPlatform2Body);
        //
        var lowPlatform3Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform3Body.addShape(lowPlatform3Shape);
        lowPlatform3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.9);
        lowPlatform3Body.position.set(136, -4, -1);
        world.addBody(lowPlatform3Body);

        var lowPlatform4Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform4Body.addShape(lowPlatform4Shape);
        lowPlatform4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.25);
        lowPlatform4Body.position.set(142, -4, -38);
        world.addBody(lowPlatform4Body);

        var lowPlatform5Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform5Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform5Body.addShape(lowPlatform5Shape);
        lowPlatform5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.32);
        lowPlatform5Body.position.set(122, -4, -58);
        world.addBody(lowPlatform5Body);

        var lowPlatform6Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform6Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform6Body.addShape(lowPlatform6Shape);
        lowPlatform6Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.3);
        lowPlatform6Body.position.set(81, -4, -59);
        world.addBody(lowPlatform6Body);

        var lowPlatform7Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform7Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform7Body.addShape(lowPlatform7Shape);
        lowPlatform7Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 1.25);
        lowPlatform7Body.position.set(60, -4, -39);
        world.addBody(lowPlatform7Body);

        var lowPlatform8Shape = new CANNON.Box(new CANNON.Vec3(30, 10, 30));
        var lowPlatform8Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        lowPlatform8Body.addShape(lowPlatform8Shape);
        lowPlatform8Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 1.92);
        lowPlatform8Body.position.set(60, -4, -2);
        world.addBody(lowPlatform8Body);


    }

    if (worldId == 2) {

        var world2wall1Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world2wall1Body = new CANNON.Body({ mass: 0 });
        world2wall1Body.addShape(world2wall1Shape);
        world2wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world2wall1Body.position.set(330, 0, 0);
        world.addBody(world2wall1Body);

        var world2wall2Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world2wall2Body = new CANNON.Body({ mass: 0 });
        world2wall2Body.addShape(world2wall2Shape);
        world2wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world2wall2Body.position.set(-150, 0, 0);
        world.addBody(world2wall2Body);

        var world2wall3Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world2wall3Body = new CANNON.Body({ mass: 0 });
        world2wall3Body.addShape(world2wall3Shape);
        world2wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world2wall3Body.position.set(0, 0, -240);
        world.addBody(world2wall3Body);

        var world2wall4Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world2wall4Body = new CANNON.Body({ mass: 0 });
        world2wall4Body.addShape(world2wall4Shape);
        world2wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world2wall4Body.position.set(0, 0, 250);
        world.addBody(world2wall4Body);

        var vuurtorenShape = new CANNON.Box(new CANNON.Vec3(20, 20, 12));
        var vuurtorenBody = new CANNON.Body({ mass: 0 });
        vuurtorenBody.addShape(vuurtorenShape);
        vuurtorenBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 20);
        vuurtorenBody.position.set(145, 15, 110);
        world.addBody(vuurtorenBody);

        var vuurtoren2Shape = new CANNON.Sphere(19.5);
        var vuurtoren2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        vuurtoren2Body.addShape(vuurtoren2Shape);
        vuurtoren2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        vuurtoren2Body.position.set(135, 11, 136);
        world.addBody(vuurtoren2Body);

        var hutShape = new CANNON.Box(new CANNON.Vec3(9, 5, 9));
        var hutBody = new CANNON.Body({ mass: 0 });
        hutBody.addShape(hutShape);
        hutBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutBody.position.set(160, 4, -75);
        world.addBody(hutBody);

        var hutwall1Shape = new CANNON.Box(new CANNON.Vec3(0.5, 11, 9));
        var hutwall1Body = new CANNON.Body({ mass: 0 });
        hutwall1Body.addShape(hutwall1Shape);
        hutwall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutwall1Body.position.set(152, 8, -78);
        world.addBody(hutwall1Body);

        var hutwall2Shape = new CANNON.Box(new CANNON.Vec3(0.5, 11, 9));
        var hutwall2Body = new CANNON.Body({ mass: 0 });
        hutwall2Body.addShape(hutwall2Shape);
        hutwall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutwall2Body.position.set(168, 8, -72);
        world.addBody(hutwall2Body);

        var hutwall3Shape = new CANNON.Box(new CANNON.Vec3(8, 11, 0.5));
        var hutwall3Body = new CANNON.Body({ mass: 0 });
        hutwall3Body.addShape(hutwall3Shape);
        hutwall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutwall3Body.position.set(162, 8, -83);
        world.addBody(hutwall3Body);

        var hutwall4Shape = new CANNON.Box(new CANNON.Vec3(4, 11, 0.5));
        var hutwall4Body = new CANNON.Body({ mass: 0 });
        hutwall4Body.addShape(hutwall4Shape);
        hutwall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutwall4Body.position.set(161, 8, -66);
        world.addBody(hutwall4Body);

        var hutwall5Shape = new CANNON.Box(new CANNON.Vec3(2, 11, 0.5));
        var hutwall5Body = new CANNON.Body({ mass: 0 });
        hutwall5Body.addShape(hutwall5Shape);
        hutwall5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
        hutwall5Body.position.set(151, 8, -69);
        world.addBody(hutwall5Body);

        var huttreeShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
        var huttreeBody = new CANNON.Body({ mass: 0 });
        huttreeBody.addShape(huttreeShape);
        huttreeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        huttreeBody.position.set(176, 8, -50);
        world.addBody(huttreeBody);

        var keien1Shape = new CANNON.Sphere(25);
        var keien1Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        keien1Body.addShape(keien1Shape);
        keien1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        keien1Body.position.set(252, -14, -15);
        world.addBody(keien1Body);

        var keien2Shape = new CANNON.Sphere(10);
        var keien2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        keien2Body.addShape(keien2Shape);
        keien2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        keien2Body.position.set(242, 7, -16);
        world.addBody(keien2Body);

        var keien3Shape = new CANNON.Sphere(11);
        var keien3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        keien3Body.addShape(keien3Shape);
        keien3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        keien3Body.position.set(232, 12, -27);
        world.addBody(keien3Body);

        var bigrockShape = new CANNON.Sphere(21.6);
        var bigrockBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        bigrockBody.addShape(bigrockShape);
        bigrockBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        bigrockBody.position.set(62, 11, -43);
        world.addBody(bigrockBody);

        var bigrock1Shape = new CANNON.Sphere(21);
        var bigrock1Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        bigrock1Body.addShape(bigrock1Shape);
        bigrock1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        bigrock1Body.position.set(58, 25, -48);
        world.addBody(bigrock1Body);

        var bigrock2Shape = new CANNON.Sphere(17);
        var bigrock2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        bigrock2Body.addShape(bigrock2Shape);
        bigrock2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        bigrock2Body.position.set(31, 10, -56);
        world.addBody(bigrock2Body);

        var bigrock3Shape = new CANNON.Sphere(17);
        var bigrock3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        bigrock3Body.addShape(bigrock3Shape);
        bigrock3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        bigrock3Body.position.set(45, -3, -20);
        world.addBody(bigrock3Body);

        var bigrock4Shape = new CANNON.Sphere(12);
        var bigrock4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        bigrock4Body.addShape(bigrock4Shape);
        bigrock4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        bigrock4Body.position.set(60, 1, -15);
        world.addBody(bigrock4Body);

        var chassisShape = new CANNON.Box(new CANNON.Vec3(4, 5, 3.2));
        var chassisBody = new CANNON.Body({ mass: 0 });
        chassisBody.addShape(chassisShape);
        chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -70);
        chassisBody.position.set(41, 4, -41);
        chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
        world.addBody(chassisBody);

        var boardwalkShape = new CANNON.Box(new CANNON.Vec3(45, 5, 5));
        var boardwalkBody = new CANNON.Body({ mass: 0 });
        boardwalkBody.addShape(boardwalkShape);
        boardwalkBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boardwalkBody.position.set(-48, -1, 37);
        world.addBody(boardwalkBody);

        var boardwalk2Shape = new CANNON.Box(new CANNON.Vec3(5, 30, 5));
        var boardwalk2Body = new CANNON.Body({ mass: 0 });
        boardwalk2Body.addShape(boardwalk2Shape);
        boardwalk2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boardwalk2Body.position.set(-88, -1, 37);
        world.addBody(boardwalk2Body);

        var boatShape = new CANNON.Box(new CANNON.Vec3(15, 25, 9));
        var boatBody = new CANNON.Body({ mass: 0 });
        boatBody.addShape(boatShape);
        boatBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.1);
        boatBody.position.set(-45, 0, 66);
        world.addBody(boatBody);

        var boat2Shape = new CANNON.Box(new CANNON.Vec3(6, 25, 6));
        var boat2Body = new CANNON.Body({ mass: 0 });
        boat2Body.addShape(boat2Shape);
        boat2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.9);
        boat2Body.position.set(-28, 0, 67);
        world.addBody(boat2Body);

        var boat3Shape = new CANNON.Box(new CANNON.Vec3(5, 25, 5));
        var boat3Body = new CANNON.Body({ mass: 0 });
        boat3Body.addShape(boat3Shape);
        boat3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.95);
        boat3Body.position.set(-70, 0, 63);
        world.addBody(boat3Body);

        var boat4Shape = new CANNON.Box(new CANNON.Vec3(9, 25, 7.5));
        var boat4Body = new CANNON.Body({ mass: 0 });
        boat4Body.addShape(boat4Shape);
        boat4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.1);
        boat4Body.position.set(-61, 0, 64);
        world.addBody(boat4Body);

        var treefree1Shape = new CANNON.Box(new CANNON.Vec3(1.2, 1.2, 16));
        var treefree1Body = new CANNON.Body({ mass: 0 });
        treefree1Body.addShape(treefree1Shape);
        treefree1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        treefree1Body.position.set(47, 15, 61);
        treefree1Body.angularVelocity.set(0, 0, 0);
        world.addBody(treefree1Body);

        var treefree2Shape = new CANNON.Box(new CANNON.Vec3(1.8, 1.8, 16));
        var treefree2Body = new CANNON.Body({ mass: 0 });
        treefree2Body.addShape(treefree2Shape);
        treefree2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        treefree2Body.position.set(103, 15, 11);
        treefree2Body.angularVelocity.set(0, 0, 0);
        world.addBody(treefree2Body);

        var treespiderislandShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
        var treespiderislandBody = new CANNON.Body({ mass: 0 });
        treespiderislandBody.addShape(treespiderislandShape);
        treespiderislandBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        treespiderislandBody.position.set(-68, 15, -195);
        treespiderislandBody.angularVelocity.set(0, 0, 0);
        world.addBody(treespiderislandBody);

        var treeemeraldShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
        var treeemeraldBody = new CANNON.Body({ mass: 0 });
        treeemeraldBody.addShape(treeemeraldShape);
        treeemeraldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        treeemeraldBody.position.set(32, 15, 5);
        treeemeraldBody.angularVelocity.set(0, 0, 0);
        world.addBody(treeemeraldBody);

        var treeemerald2Shape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
        var treeemerald2Body = new CANNON.Body({ mass: 0 });
        treeemerald2Body.addShape(treeemerald2Shape);
        treeemerald2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        treeemerald2Body.position.set(97, 15, 101);
        treeemerald2Body.angularVelocity.set(0, 0, 0);
        world.addBody(treeemerald2Body);

        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);



    }
    if (worldId == 3) {
        var world3wall1Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world3wall1Body = new CANNON.Body({ mass: 0 });
        world3wall1Body.addShape(world3wall1Shape);
        world3wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world3wall1Body.position.set(348, 0, 0);
        world.addBody(world3wall1Body);

        var world3wall2Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
        var world3wall2Body = new CANNON.Body({ mass: 0 });
        world3wall2Body.addShape(world3wall2Shape);
        world3wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world3wall2Body.position.set(-145, 0, 0);
        world.addBody(world3wall2Body);

        //west wall
        var world3wall3Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world3wall3Body = new CANNON.Body({ mass: 0 });
        world3wall3Body.addShape(world3wall3Shape);
        world3wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world3wall3Body.position.set(0, 0, -260);
        world.addBody(world3wall3Body);

        // east wall
        var world3wall4Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
        var world3wall4Body = new CANNON.Body({ mass: 0 });
        world3wall4Body.addShape(world3wall4Shape);
        world3wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        world3wall4Body.position.set(0, 0, 245);
        world.addBody(world3wall4Body);


        var mushroom2943Shape = new CANNON.Box(new CANNON.Vec3(0.7, 0.7, 6));
        var mushroom2943Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        mushroom2943Body.addShape(mushroom2943Shape);
        mushroom2943Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, -0.2, 0), -Math.PI / 2);
        mushroom2943Body.position.set(77, 25, 0);
        mushroom2943Body.angularVelocity.set(0, 0, 0);
        world.addBody(mushroom2943Body);

        var mushroomgrootShape = new CANNON.Box(new CANNON.Vec3(1, 1, 6));
        var mushroomgrootBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        mushroomgrootBody.addShape(mushroomgrootShape);
        mushroomgrootBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0.9, 0, 0), -Math.PI / 2);
        mushroomgrootBody.position.set(92, 27, 2);
        mushroomgrootBody.angularVelocity.set(0, 0, 0);
        world.addBody(mushroomgrootBody);

        var plantjeShape = new CANNON.Sphere(3);
        var plantjeBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        plantjeBody.addShape(plantjeShape);
        plantjeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        plantjeBody.position.set(66, 21, 11);
        world.addBody(plantjeBody);

        var rotsjeShape = new CANNON.Sphere(3);
        var rotsjeBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        rotsjeBody.addShape(rotsjeShape);
        rotsjeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        rotsjeBody.position.set(81, 26, -14);
        world.addBody(rotsjeBody);

        var eikShape = new CANNON.Sphere(42);
        var eikBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        eikBody.addShape(eikShape);
        eikBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        eikBody.position.set(105, 10, -200);
        world.addBody(eikBody);

        var mushroomgroot2Shape = new CANNON.Box(new CANNON.Vec3(10, 10, 10));
        var mushroomgroot2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        mushroomgroot2Body.addShape(mushroomgroot2Shape);
        mushroomgroot2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1.05, -0.4, -0.3), -Math.PI / 2);
        mushroomgroot2Body.position.set(94, 12, -10);
        mushroomgroot2Body.angularVelocity.set(0, 0, 0);
        world.addBody(mushroomgroot2Body);

        var cliff1Shape = new CANNON.Box(new CANNON.Vec3(10, 4, 19));
        var cliff1Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff1Body.addShape(cliff1Shape);
        cliff1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
        cliff1Body.position.set(103, 18, -19);
        cliff1Body.angularVelocity.set(0, 0, 0);
        world.addBody(cliff1Body);

        var cliff1aShape = new CANNON.Box(new CANNON.Vec3(9, 4, 9));
        var cliff1aBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff1aBody.addShape(cliff1aShape);
        cliff1aBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
        cliff1aBody.position.set(98, 19.7, -8);
        cliff1aBody.angularVelocity.set(0, 0, 0);
        world.addBody(cliff1aBody);

        var cliff2Shape = new CANNON.Box(new CANNON.Vec3(4, 6, 5));
        var cliff2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff2Body.addShape(cliff2Shape);
        cliff2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.3);
        cliff2Body.position.set(98, 15, -4);
        cliff2Body.angularVelocity.set(0, 0, 0);
        world.addBody(cliff2Body);

        var cliff3Shape = new CANNON.Box(new CANNON.Vec3(4, 4, 4));
        var cliff3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff3Body.addShape(cliff3Shape);
        cliff3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
        cliff3Body.position.set(114, 18.5, -23);
        cliff3Body.angularVelocity.set(0, 0, 0);
        world.addBody(cliff3Body);

        var cliff4Shape = new CANNON.Box(new CANNON.Vec3(3, 4, 4));
        var cliff4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff4Body.addShape(cliff4Shape);
        cliff4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
        cliff4Body.position.set(117, 14, -19);
        world.addBody(cliff4Body);

        var cliff5Shape = new CANNON.Box(new CANNON.Vec3(11, 10, 11));
        var cliff5Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff5Body.addShape(cliff5Shape);
        cliff5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
        cliff5Body.position.set(75, 16, -47);
        world.addBody(cliff5Body);

        var cliff6Shape = new CANNON.Box(new CANNON.Vec3(2, 10, 11));
        var cliff6Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff6Body.addShape(cliff6Shape);
        cliff6Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.4);
        cliff6Body.position.set(80, 15, -34);
        world.addBody(cliff6Body);

        var cliff7Shape = new CANNON.Box(new CANNON.Vec3(3.5, 10, 4));
        var cliff7Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff7Body.addShape(cliff7Shape);
        cliff7Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
        cliff7Body.position.set(103, 14, -41);
        world.addBody(cliff7Body);

        var cliff8Shape = new CANNON.Box(new CANNON.Vec3(5, 10, 5));
        var cliff8Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff8Body.addShape(cliff8Shape);
        cliff8Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
        cliff8Body.position.set(99, 16, -50);
        world.addBody(cliff8Body);

        var cliff9Shape = new CANNON.Box(new CANNON.Vec3(10, 10, 5));
        var cliff9Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff9Body.addShape(cliff9Shape);
        cliff9Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.1);
        cliff9Body.position.set(89, 16, -49);
        world.addBody(cliff9Body);

        var cliff10Shape = new CANNON.Box(new CANNON.Vec3(5, 10, 4));
        var cliff10Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff10Body.addShape(cliff10Shape);
        cliff10Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.1);
        cliff10Body.position.set(85, 16, -40);
        world.addBody(cliff10Body);

        var cliff11Shape = new CANNON.Box(new CANNON.Vec3(2.5, 10, 3.5));
        var cliff11Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff11Body.addShape(cliff11Shape);
        cliff11Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
        cliff11Body.position.set(104, 16, -51);
        world.addBody(cliff11Body);

        var cliff12Shape = new CANNON.Box(new CANNON.Vec3(3, 10, 7.5));
        var cliff12Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff12Body.addShape(cliff12Shape);
        cliff12Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
        cliff12Body.position.set(115, 11, -27);
        world.addBody(cliff12Body);


        var cliff13Shape = new CANNON.Box(new CANNON.Vec3(2, 16, 6));
        var cliff13Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff13Body.addShape(cliff13Shape);
        cliff13Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.5);
        cliff13Body.position.set(59, 9, -57);
        world.addBody(cliff13Body);

        // var cliff14Shape = new CANNON.Box(new CANNON.Vec3(4, 18, 5));
        // var cliff14Body = new CANNON.Body({mass: 0, material: physicsMaterial});
        // cliff14Body.addShape(cliff14Shape);
        // cliff14Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 1, 1), -0.5);
        // cliff14Body.position.set(50, 9, -27);
        // world.addBody(cliff14Body);

        var cliff15Shape = new CANNON.Box(new CANNON.Vec3(4, 16, 6));
        var cliff15Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliff15Body.addShape(cliff15Shape);
        cliff15Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.6);
        cliff15Body.position.set(53, 10, -29);
        world.addBody(cliff15Body);

        var cliffrockShape = new CANNON.Sphere(2);
        var cliffrockBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliffrockBody.addShape(cliffrockShape);
        cliffrockBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        cliffrockBody.position.set(70, 26, -37);
        world.addBody(cliffrockBody);

        var cliffrock2Shape = new CANNON.Sphere(7);
        var cliffrock2Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliffrock2Body.addShape(cliffrock2Shape);
        cliffrock2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        cliffrock2Body.position.set(89, 24, -30);
        world.addBody(cliffrock2Body);

        var cliffrock3Shape = new CANNON.Sphere(2.5);
        var cliffrock3Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliffrock3Body.addShape(cliffrock3Shape);
        cliffrock3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        cliffrock3Body.position.set(95, 24, -26);
        world.addBody(cliffrock3Body);

        var cliffrock4Shape = new CANNON.Sphere(23);
        var cliffrock4Body = new CANNON.Body({ mass: 0, material: physicsMaterial });
        cliffrock4Body.addShape(cliffrock4Shape);
        cliffrock4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        cliffrock4Body.position.set(62, 0, -26);
        world.addBody(cliffrock4Body);


        var boomShape = new CANNON.Box(new CANNON.Vec3(3.8, 3.8, 16));
        var boomBody = new CANNON.Body({ mass: 0 });
        boomBody.addShape(boomShape);
        boomBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boomBody.position.set(333, 16, -157);
        boomBody.angularVelocity.set(0, 0, 0);
        world.addBody(boomBody);

        var boom2Shape = new CANNON.Box(new CANNON.Vec3(2.8, 2.8, 16));
        var boom2Body = new CANNON.Body({ mass: 0 });
        boom2Body.addShape(boom2Shape);
        boom2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boom2Body.position.set(288, 33, 189);
        boom2Body.angularVelocity.set(0, 0, 0);
        world.addBody(boom2Body);

        var boom3Shape = new CANNON.Box(new CANNON.Vec3(4.3, 4.3, 16));
        var boom3Body = new CANNON.Body({ mass: 0 });
        boom3Body.addShape(boom3Shape);
        boom3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boom3Body.position.set(182, 33, 194);
        boom3Body.angularVelocity.set(0, 0, 0);
        world.addBody(boom3Body);

        var boom4Shape = new CANNON.Box(new CANNON.Vec3(3.6, 3.6, 16));
        var boom4Body = new CANNON.Body({ mass: 0 });
        boom4Body.addShape(boom4Shape);
        boom4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boom4Body.position.set(19, 28, 152);
        boom4Body.angularVelocity.set(0, 0, 0);
        world.addBody(boom4Body);

        var boom5Shape = new CANNON.Box(new CANNON.Vec3(4.5, 4.5, 16));
        var boom5Body = new CANNON.Body({ mass: 0 });
        boom5Body.addShape(boom5Shape);
        boom5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        boom5Body.position.set(-117, 32, -158);
        boom5Body.angularVelocity.set(0, 0, 0);
        world.addBody(boom5Body);


    }
    if (worldId == 4) {
        // Create a plane
        // var groundShape = new CANNON.Plane();
        // groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // groundBody.addShape(groundShape);
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        // groundBody.position.set(0, 0, 0);
        // world.addBody(groundBody);

        //box shapes:
        var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1, 3.2));
        var chassisBody = new CANNON.Body({ mass: 0 });
        chassisBody.addShape(chassisShape);
        //chassisBody.position.set(0, 0, 0);
        chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        chassisBody.position.set(20, 4, -40);
        chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
        world.addBody(chassisBody);

        var chickShape = new CANNON.Box(new CANNON.Vec3(3, 1, 4));
        var chickBody = new CANNON.Body({ mass: 0 });
        chickBody.addShape(chickShape);
    }
    // bodies.push(body);
}

function init() {
    console.log("init run");
    cssSteps();
    critterArray();


    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
    camera.position.z = 1;

    //var game = this;
    var white = "rgb(255,255,255)";
    scene = new THREE.Scene(white);

    scene.background = new THREE.Color(white);
    raycaster = new THREE.Raycaster();
    loadCharacter(critterToFindArray[0]);
    //  var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    //  scene.add(ambient);

    //louisa's code: onclick (window is placeholder for what should be clicked) makes it appear:
    //if (boolcrittercaught = false){
    window.addEventListener("mousedown", function() {
        //gltf.scene.visible = !gltf.scene.visible;
        //count+=1;
        // boolMouseClick = true;
        //console.log("mouseDown really?");
        //soundGo();
        //document.getElementById("btn").innerHTML = count;
        //console.log( "mousedown Event" );
        //boolcrittercaught = true;
    });
    //}


    skybox();
    //addCharacters();
    modelLoader();
    //

    //modelLoaderAnimate();

    //controls
    //controls = new PointerLockControls(camera, sphereBody);
    //var cannonDebugRenderer = new CannonDebugRenderer( scene, world );

    controls = new PointerLockControls(camera, sphereBody)

    if (debug == true) {
        cannonDebugRenderer = new CannonDebugRenderer(scene, world);
    }

    scene.add(controls.getObject())

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;


}

function skybox() {
    let materialArray = [];
    let texture_ft;
    let texture_bk;
    let texture_up;
    let texture_dn;
    let texture_rt;
    let texture_lf;

    if (worldId == 1) {
        texture_ft = new THREE.TextureLoader().load('skybox/blizzard4_ft.png');
        texture_bk = new THREE.TextureLoader().load('skybox/blizzard4_bk.png');
        texture_up = new THREE.TextureLoader().load('skybox/blizzard4_up.png');
        texture_dn = new THREE.TextureLoader().load('skybox/blizzard4_dn.png');
        texture_rt = new THREE.TextureLoader().load('skybox/blizzard4_rt.png');
        texture_lf = new THREE.TextureLoader().load('skybox/blizzard4_lf.png');
    } else if (worldId == 2) {
        texture_ft = new THREE.TextureLoader().load('skybox/blizzard2_ft.png');
        texture_bk = new THREE.TextureLoader().load('skybox/blizzard2_bk.png');
        texture_up = new THREE.TextureLoader().load('skybox/blizzard2_up.png');
        texture_dn = new THREE.TextureLoader().load('skybox/blizzard2_dn.png');
        texture_rt = new THREE.TextureLoader().load('skybox/blizzard2_rt.png');
        texture_lf = new THREE.TextureLoader().load('skybox/blizzard2_lf.png');
    } else if (worldId == 3) {
        texture_ft = new THREE.TextureLoader().load('skybox/blizzard3_ft.png');
        texture_bk = new THREE.TextureLoader().load('skybox/blizzard3_bk.png');
        texture_up = new THREE.TextureLoader().load('skybox/blizzard3_up.png');
        texture_dn = new THREE.TextureLoader().load('skybox/blizzard3_dn.png');
        texture_rt = new THREE.TextureLoader().load('skybox/blizzard3_rt.png');
        texture_lf = new THREE.TextureLoader().load('skybox/blizzard3_lf.png');
    } else if (worldId == 4) {
        texture_ft = new THREE.TextureLoader().load('skybox/blizzard_ft.jpg');
        texture_bk = new THREE.TextureLoader().load('skybox/blizzard_bk.jpg');
        texture_up = new THREE.TextureLoader().load('skybox/blizzard_up.jpg');
        texture_dn = new THREE.TextureLoader().load('skybox/blizzard_dn.jpg');
        texture_rt = new THREE.TextureLoader().load('skybox/blizzard_rt.jpg');
        texture_lf = new THREE.TextureLoader().load('skybox/blizzard_lf.jpg');
    }
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

    for (var i = 0; i < 6; i++) {
        materialArray[i].side = THREE.BackSide;
    }

    let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);

    scene.add(skybox);
}

function objectLoader() {

    // var geometry = new THREE.PlaneGeometry(10, 10, 10);
    // var material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
    // var plane = new THREE.Mesh(geometry, material);
    // plane.rotation.x = Math.PI/2;
    // scene.add(plane);

    //a little box
    // geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    // material = new THREE.MeshNormalMaterial();
    // mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    //img.onload = function () {
    //get height data from img
    //var data = getHeightData(img,0.5);
    // plane
    // var geometry2 = new THREE.PlaneGeometry(10,10,9,9);
    // //var texture = new THREE.TextureLoader().load ('textures/IslandDM3.jpg');
    // let text1 = new THREE.TextureLoader().load('textures/island2.png');
    // var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
    // plane2 = new THREE.Mesh( geometry2, material );
    // plane2.rotation.x = Math.PI/2;
    // plane2.position.set(0, 5, 0);
    //
    // const resolution = 257;
    //
    // var matrix = [];
    // for (var j = 0; j < resolution; j++) {
    // matrix.push(new Float32Array(resolution));
    // }

}

function modelLoader() {


    if (worldId == 1) {

        var ambient = new THREE.AmbientLight(0xd5c3e8, 0.2);
        scene.add(ambient);

        const directionalLight = new THREE.DirectionalLight(0xd5c3e8, 0.3);
        scene.add(directionalLight);



        // const color = 0xd5c3e8; // purple
        const color = 0x000000; // black

        const near = 10;
        const far = 6000;
        scene.fog = new THREE.Fog(color, near, far);

        let model1, model2, model3, model4, model5, model6, model7, model8;
        //add names and locations of models here #SUUS
        let p1 = loadModel('models/druid-winter-scene/winter.gltf').then(result => { model1 = result.scene.children[0]; });
        //let p2 = loadModel('models/arbol/arbol.gltf').then(result => {  model2 = result.scene.children[0]; });
        let p3 = loadModel('models/purple-crystal/purple-crystal.gltf').then(result => { model3 = result.scene.children[0]; });
        let p4 = loadModel('models/island.glb').then(result => { model4 = result.scene.children[0]; });
        //let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
        let p6 = loadModel('models/portal/portal.gltf').then(result => { model6 = result.scene.children[0]; });
        let p7 = loadModel('models/stars/stars.gltf').then(result => { model7 = result.scene.children[0]; });
        //let p8 = loadModel('models/AnimationModels/Robot.glb').then(result => {  model8 = result.scene.children[0]; });

        function loadModel(url) {
            return new Promise(resolve => {
                new GLTFLoader(manager).load(url, resolve);
            });
        }


        const loader = new GLTFLoader()

        loader.load('models/critters/world1/pleunhand.glb', (gltf) => {
                gltf.scene.traverse(function(object) {
                    object.frustumCulled = false;


                });
                gltf.scene.position.set(300, 10, 50);
                gltf.scene.scale.set(3, 3, 3);
                scene.add(gltf.scene);

            }

        );


        // loader.load('models/critters/world1/pleunleg.glb', (gltf)  => {
        //   gltf.scene.traverse( function( object ) {
        //   object.frustumCulled = false;
        //
        //
        //   } );
        //   gltf.scene.position.set(-30,-2,-120);
        //   gltf.scene.scale.set(3,3,3);
        //   scene.add(gltf.scene);
        //
        // }
        // );

        loader.load('models/critters/world1/levi.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(80, 20, -20);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 255, 0);
            scene.add(gltf.scene);

        });

        loader.load('models/critters/world1/vanessa.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(100, 2, 320);
            gltf.scene.scale.set(6, 6, 6);
            scene.add(gltf.scene);
            console.log(dumpObject(gltf.scene).join('\n'));

        });

        loader.load('models/critters/world1/pienb-beatle.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(-96, 8.4, 0);
            gltf.scene.scale.set(4, 4, 4);
            scene.add(gltf.scene);
            console.log(dumpObject(gltf.scene).join('\n'));

        });

        loader.load('models/critters/world1/carmen-phone-new.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
                object.uuid = "carmenroca";



            });
            gltf.scene.position.set(50, 15, -200);
            gltf.scene.scale.set(2, 2, 2);
            gltf.scene.rotation.set(45, 0, 0);
            //gltf.scene.userData.name("Carmen");

            scene.add(gltf.scene);
            //console.log(gltf.scene.getObjectByName("group_iphone6_plus"));

        });

        //boxcritter 1_carmen_0_50_15_
        // const geometryCarmen = new THREE.BoxGeometry();
        // const materialCarmen = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const cubeCarmen = new THREE.Mesh( geometryCarmen, materialCarmen );
        // cubeCarmen.position.set(50,15,-200);
        // scene.add( cubeCarmen );

        Promise.all([p1, p3, p4, p6, p7]).then(() => {

            var scaleSizeModel1 = 1;
            model1.scale.set(scaleSizeModel1, scaleSizeModel1, scaleSizeModel1);
            model1.position.set(100, 20, -20);
            //model1.rotation.x = Math.PI/2;

            // var scaleSizeModel2 = 400;
            // model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
            // model2.position.set(100,-200,0);
            // //model2.rotation.x = Math.PI/2;

            var scaleSizeModel3 = 100;
            model3.scale.set(scaleSizeModel3, scaleSizeModel3, scaleSizeModel3);
            model3.position.set(100, 10, 0);
            //model3.rotation.x = Math.PI/2;

            var scaleSizeModel4 = 40;
            model4.scale.set(scaleSizeModel4, scaleSizeModel4, scaleSizeModel4);
            model4.position.set(100, -10, 0);
            model4.rotation.x = Math.PI / 2;
            //add amount of model mods here here #SUUS
            //model3.position.set(0,50,0);
            //add model to the scene

            var scaleSizeModel6 = 4;
            model6.scale.set(scaleSizeModel6, scaleSizeModel6, scaleSizeModel6);
            model6.position.set(80, -500, 0);
            //model6.rotation.x = Math.PI/2;

            var scaleSizeModel7 = 10;
            model7.scale.set(scaleSizeModel7, scaleSizeModel7, scaleSizeModel7);
            model7.position.set(50, 70, -50);

            // var scaleSizeModel8 = 2000;
            // model8.scale.set(scaleSizeModel8,scaleSizeModel8,scaleSizeModel8);
            // model8.position.set(150, -50, -10);
            //model8
            //model6.rotation.x = Math.PI/2;

            //add models 2 scene here #SUUS
            scene.add(model1);
            //taken out cause its too big and makes everything super slow
            // scene.add(model2);
            scene.add(model3);
            scene.add(model4);
            //scene.add(model5);  //this one is obsolete
            scene.add(model6);
            scene.add(model7);
            //scene.add(model8);
            //continue the process
        });
    }
    if (worldId == 2) {


        var ambient = new THREE.AmbientLight(0xb5580d, 0.7);
        scene.add(ambient);

        const light = new THREE.PointLight(0xb5580d, 0.5, 100);
        light.position.set(50, 50, 50);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0x2261ab, 0.3);
        scene.add(directionalLight);

        const color = 0x2261ab; // blue
        const near = 40;
        const far = 350;
        scene.fog = new THREE.Fog(color, near, far);


        let model1, model2, model3, model4, model5, model6, model7, model8, model9, model10, model11, model12, model13, model14;

        //add names and locations of models here #SUUS
        let p1 = loadModel('models/nature-tree3/scene.gltf').then(result => { model1 = result.scene.children[0]; });
        let p2 = loadModel('models/lighthouse-island/lighthouse-island.gltf').then(result => { model2 = result.scene.children[0]; });
        let p3 = loadModel('models/nature-tree/scene.gltf').then(result => { model3 = result.scene.children[0]; });
        let p4 = loadModel('models/island.glb').then(result => { model4 = result.scene.children[0]; });
        let p5 = loadModel('models/islandCollisionMap.glb').then(result => { model5 = result.scene.children[0]; });
        let p6 = loadModel('models/rocks/rocks.gltf').then(result => { model6 = result.scene.children[0]; });
        let p7 = loadModel('models/stars/stars.gltf').then(result => { model7 = result.scene.children[0]; });
        let p8 = loadModel('models/fishing-boat/fishing.gltf').then(result => { model8 = result.scene.children[0]; });
        let p9 = loadModel('models/hut/hut.gltf').then(result => { model9 = result.scene.children[0]; });
        let p10 = loadModel('models/nature-tree3/scene.gltf').then(result => { model10 = result.scene.children[0]; });
        let p11 = loadModel('models/cartoon_boardwalk_large_t/scene.gltf').then(result => { model11 = result.scene.children[0]; });
        let p12 = loadModel('models/nature-tree3/scene.gltf').then(result => { model12 = result.scene.children[0]; });
        let p13 = loadModel('models/low_poly_tree/scene.gltf').then(result => { model13 = result.scene.children[0]; });
        let p14 = loadModel('models/low_poly_tree/scene.gltf').then(result => { model14 = result.scene.children[0]; });


        const loader = new GLTFLoader()

        // adam centko man
        // loader.load('models/critters/world2/adam-gloss.glb', (gltf) => {
        //     mixer = new THREE.AnimationMixer(gltf.scene);
        //     jumpAction = mixer.clipAction(gltf.animations[0])
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(144, 9.3, 88.7);
        //     gltf.scene.rotation.set(0, 2.83, 0);
        //     scene.add(gltf.scene);
        //     jumpAction.play();
        // });
        // box queen critter = adam critters
        // const geometry = new THREE.BoxGeometry();
        // //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.set(144, 9.3, 88.7);
        // cube.scale.set(2, 10, 4);
        // cube.userData.name = "adamcentko";
        // cube.uuid = "adam2";
        // scene.add(cube);
        // console.log(dumpObject(cube).join('\n'));
        // console.log(cube.userData);

        // karin spider
        // loader.load('models/critters/world2/karin-spider-anim2.glb', (gltf) => {
        //     mixer = new THREE.AnimationMixer(gltf.scene);
        //     jumpAction = mixer.clipAction(gltf.animations[0])
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(160, 9, -75);
        //     gltf.scene.rotation.set(0, -0.5, 0);
        //     gltf.scene.scale.set(5.5, 5.5, 5.5);
        //     scene.add(gltf.scene);
        //     jumpAction.play();
        // });

        // loader.load('models/critters/world2/karin-spider-core.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(160, 9, -75);
        //     gltf.scene.rotation.set(0, -0.5, 0);
        //     gltf.scene.scale.set(5.5, 5.5, 5.5);
        //     scene.add(gltf.scene);
        // });

        // wouter it's britney bitch
        // loader.load('models/critters/world2/wouter.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(-40, 5, 60);
        //     gltf.scene.scale.set(1, 1, 1);
        //     gltf.scene.rotation.set(0, 3, 0);
        //     scene.add(gltf.scene);
        //     console.log(dumpObject(gltf.scene).join('\n'));
        // });



        // louis cores
        // loader.load('models/critters/world2/louis.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(280, 0, -15);
        //     gltf.scene.scale.set(1, 1, 1);
        //     gltf.scene.rotation.set(1, 1.9, -0.2);
        //     scene.add(gltf.scene);
        // });

        // const geometryLuis = new THREE.BoxGeometry();
        // const materialLuis = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
        // const cubeLuis = new THREE.Mesh(geometryLuis, materialLuis);
        // cubeLuis.position.set(280, 0, 20); //-15
        // cubeLuis.scale.set(30, 100, 60);
        // cubeLuis.userData.name = "louisbraddock";


        // scene.add(cubeLuis);
        //console.log(dumpObject(cubeLuis).join('\n'));
        //console.log(cubeLuis.userData);

        // // valerie tea pots
        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(40.3, 15, -34);
        //     gltf.scene.scale.set(0.1, 0.1, 0.1);
        //     gltf.scene.rotation.set(0, 1.5, 0.5);
        //     scene.add(gltf.scene);
        // });


        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(43, 14, -30.1);
        //     gltf.scene.scale.set(0.1, 0.1, 0.1);
        //     gltf.scene.rotation.set(2, 1, 0.7);
        //     scene.add(gltf.scene);
        // });


        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(41, 13, -32.6);
        //     gltf.scene.scale.set(0.05, 0.05, 0.05);
        //     gltf.scene.rotation.set(1.3, 3, -0.6);
        //     scene.add(gltf.scene);
        // });

        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(41.3, 14.8, -32.3);
        //     gltf.scene.scale.set(0.03, 0.03, 0.03);
        //     gltf.scene.rotation.set(0.2, 1, -1);
        //     scene.add(gltf.scene);
        // });


        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(40.7, 17.8, -33.4);
        //     gltf.scene.scale.set(0.04, 0.04, 0.04);
        //     gltf.scene.rotation.set(-2, 1.3, 0);
        //     scene.add(gltf.scene);
        // });

        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(42, 17, -32);
        //     gltf.scene.scale.set(0.07, 0.07, 0.07);
        //     gltf.scene.rotation.set(2, 1.2, 0);
        //     scene.add(gltf.scene);
        // });

        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(37, 11.3, -22);
        //     gltf.scene.scale.set(0.1, 0.1, 0.1);
        //     gltf.scene.rotation.set(0, 0, 0.4);
        //     scene.add(gltf.scene);
        // });

        // loader.load('models/critters/world2/valerie.glb', (gltf) => {
        //     gltf.scene.traverse(function(object) {
        //         object.frustumCulled = false;
        //     });
        //     gltf.scene.position.set(38, 11.8, -19);
        //     gltf.scene.scale.set(0.05, 0.05, 0.05);
        //     gltf.scene.rotation.set(0.2, 2, -0.2);
        //     scene.add(gltf.scene);
        // });




        function loadModel(url) {
            return new Promise(resolve => {
                new GLTFLoader(manager).load(url, resolve);
            });
        }



        Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14]).then(() => {

            let theResult = model2.getObjectByName("Plane", true);
            theResult.visible = false;

            let theResult2 = model2.getObjectByName("water", true);
            theResult2.visible = false;

            let theResult3 = model2.getObjectByName("Cube011_rocks_0", true);
            theResult3.visible = false;

            let theResult4 = model2.getObjectByName("Cube007_rocks_0", true);
            theResult4.visible = false;


            var scaleSizeModel1 = 5;
            model1.scale.set(scaleSizeModel1, scaleSizeModel1, scaleSizeModel1);
            model1.position.set(180, 32, -50);
            //model1.rotation.x = Math.PI/2;

            var scaleSizeModel2 = 1;
            model2.scale.set(scaleSizeModel2, scaleSizeModel2, scaleSizeModel2);
            model2.position.set(165, -68, 85);
            model2.rotation.z = -0.4;

            var scaleSizeModel3 = 5;
            model3.scale.set(scaleSizeModel3, scaleSizeModel3, scaleSizeModel3);
            model3.position.set(100, 44, 10);
            //model3.rotation.x = Math.PI/2;

            var scaleSizeModel6 = 40;
            model6.scale.set(scaleSizeModel6, scaleSizeModel6, scaleSizeModel6);
            model6.position.set(50, 25, -40);
            model6.rotation.z = 10;

            var scaleSizeModel7 = 10;
            model7.scale.set(scaleSizeModel7, scaleSizeModel7, scaleSizeModel7);
            model7.position.set(50, 70 - adjustHeigth, -50);
            //model6.rotation.x = Math.PI/2;

            var scaleSizeModel8 = 0.1;
            model8.scale.set(scaleSizeModel8, scaleSizeModel8, scaleSizeModel8);
            model8.position.set(-50, 0, 65);
            model8.rotation.z = 80;

            var scaleSizeModel9 = 0.06;
            model9.scale.set(scaleSizeModel9, scaleSizeModel9, scaleSizeModel9);
            model9.position.set(160, 6, -75);
            model9.rotation.z = -170;

            var scaleSizeModel10 = 5;
            model10.scale.set(scaleSizeModel10, scaleSizeModel10, scaleSizeModel10);
            model10.position.set(50, 38, 60);
            //model6.rotation.x = Math.PI/2;

            var scaleSizeModel11 = 1;
            model11.scale.set(scaleSizeModel11, scaleSizeModel11, scaleSizeModel11);
            model11.position.set(-30, 0, 40);

            var scaleSizeModel12 = 4;
            model12.scale.set(scaleSizeModel12, scaleSizeModel12, scaleSizeModel12);
            model12.position.set(-65, 28, -195);
            model12.rotation.z = 50;

            var scaleSizeModel13 = 8;
            model13.scale.set(scaleSizeModel13, scaleSizeModel13, scaleSizeModel13);
            model13.position.set(35, 0, 5);
            model13.rotation.z = 50;

            var scaleSizeModel14 = 8;
            model14.scale.set(scaleSizeModel14, scaleSizeModel14, scaleSizeModel14);
            model14.position.set(100, 0, 100);


            //add models 2 scene here #SUUS
            scene.add(model1);
            scene.add(model2);
            scene.add(model3);
            scene.add(model5);
            scene.add(model6);
            scene.add(model7);
            scene.add(model8);
            scene.add(model9);
            scene.add(model10);
            scene.add(model11);
            scene.add(model12);
            scene.add(model13);
            scene.add(model14);
            //continue the process
        });

    }
    if (worldId == 3) {

        var ambient = new THREE.AmbientLight(0x477a79, 0.4);
        scene.add(ambient);

        // const light = new THREE.PointLight( 0x477a79, 1, 10 );
        // light.position.set( 100, 50, 50 );
        // scene.add( light );

        const color = 0xdff0eb; // greenish
        const near = 50;
        const far = 500;
        scene.fog = new THREE.Fog(color, near, far);

        let model1, model2, model3, model4, model5, model6, model7;

        //add names and locations of models here #SUUS
        let p1 = loadModel('models/forest-scene/forest.gltf').then(result => { model1 = result.scene.children[0]; });
        let p2 = loadModel('models/space/scene.gltf').then(result => { model2 = result.scene.children[0]; });
        let p3 = loadModel('models/stump/tree-stump.gltf').then(result => { model3 = result.scene.children[0]; });
        let p4 = loadModel('models/island.glb').then(result => { model4 = result.scene.children[0]; });
        let p5 = loadModel('models/islandCollisionMap.glb').then(result => { model5 = result.scene.children[0]; });
        let p6 = loadModel('models/mushroom/mushroom.gltf').then(result => { model6 = result.scene.children[0]; });
        let p7 = loadModel('models/oak/tree.gltf').then(result => { model7 = result.scene.children[0]; });


        const loader = new GLTFLoader()

        // alondra tree
        loader.load('models/critters/world3/alondra.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(240, 0.2, -50);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 0.6, 0);
            scene.add(gltf.scene);
        });

        // stan piano
        loader.load('models/critters/world3/stan.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(270, 24.6, 160);
            gltf.scene.scale.set(0.7, 0.7, 0.7);
            gltf.scene.rotation.set(0, 0.6, 0);
            scene.add(gltf.scene);
        });

        // nathalie like buttons

        // nathalie queen critter
        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(186, 47, 180);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(0, 0, -1.55);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(190, 48, 165);
            gltf.scene.scale.set(0.06, 0.06, 0.06);
            gltf.scene.rotation.set(0, 0.6, -1.55);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(159.5, 42, 150);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(0, 0.8, -1.55);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(167, 90, 200.5);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(0, -0.3, -1.55);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(196.7, 97, 145);
            gltf.scene.scale.set(0.06, 0.06, 0.06);
            gltf.scene.rotation.set(0, 1, -1.55);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/nathalie2.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(160, 55, 204);
            gltf.scene.scale.set(0.07, 0.07, 0.07);
            gltf.scene.rotation.set(0, -0.8, -1.55);
            scene.add(gltf.scene);
        });

        // Lara cloth ghosts
        loader.load('models/critters/world3/lara.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(5, 5, 100);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 0, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/lara.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(12, 3.2, 90);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 4, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/lara.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(3, 3.5, 75);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 7, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/lara.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(4, -0.5, 85);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 8, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/lara.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(-5, 3, 90);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, 17, 0);
            scene.add(gltf.scene);
        });




        // Inwoo apples
        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(32, 20, -170);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(2, 0, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(54, 15, -175);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(0, 0, 7);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(90, 17.5, -155);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(0, 3, 2);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(42, 12, -150);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(0, 0, 1);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(62, 16, -163);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(30, 2, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world3/inwoo.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });

            gltf.scene.position.set(119, 93, -110);
            gltf.scene.scale.set(17, 17, 17);
            gltf.scene.rotation.set(0, 0, 0);
            scene.add(gltf.scene);
        });

        function loadModel(url) {
            return new Promise(resolve => {
                new GLTFLoader(manager).load(url, resolve);
            });
        }

        Promise.all([p1, p2, p3, p4, p5, p6, p7]).then(() => {
            let theResult = model1.getObjectByName("Plane_0", true);
            theResult.visible = false;

            let theResult2 = model1.getObjectByName("Plane378_0", true);
            theResult2.position.set(0, 0, 0.2);

            let theResult3 = model1.getObjectByName("Plane371_0", true);
            theResult3.visible = false;

            let theResult4 = model1.getObjectByName("Plane370_0", true);
            theResult4.visible = false;

            let theResult5 = model1.getObjectByName("Cylinder065_Cylinder070_0", true);
            theResult5.position.set(0, -0.2, -2);

            var scaleSizeModel1 = 35;
            model1.scale.set(scaleSizeModel1, scaleSizeModel1, scaleSizeModel1);
            //model1.position.set(20,-9,25);
            model1.position.set(100, -5, 0);
            //model1.rotation.x = Math.PI/2;

            var scaleSizeModel2 = 4000;
            model2.scale.set(scaleSizeModel2, scaleSizeModel2, scaleSizeModel2);
            // model2.position.set(10,50,0);
            model2.position.set(90, 50, 25);
            //model2.rotation.x = Math.PI/2;

            var scaleSizeModel3 = 3;
            model3.scale.set(scaleSizeModel3, scaleSizeModel3, scaleSizeModel3);
            model3.position.set(100, -3, 0);
            //model3.rotation.x = Math.PI/2;

            var scaleSizeModel4 = 400;
            model4.scale.set(scaleSizeModel4, scaleSizeModel4, scaleSizeModel4);
            // model4.position.set(50,-10,0);
            model4.position.set(130, -10, 25);
            model4.rotation.x = Math.PI / 2;
            //add amount of model mods here here #SUUS
            //model3.position.set(0,50,0);
            //add model to the scene

            var scaleSizeModel6 = 9;
            model6.scale.set(scaleSizeModel6, scaleSizeModel6, scaleSizeModel6);
            model6.position.set(80, 14, 0);
            //model6.rotation.x = Math.PI/2;

            var scaleSizeModel7 = 50;
            model7.scale.set(scaleSizeModel7, scaleSizeModel7, scaleSizeModel7);
            model7.position.set(100, 10, -200);
            // model7.position.set(180,10,-175);

            //add models 2 scene here #SUUS
            scene.add(model1);
            scene.add(model2);
            scene.add(model3);
            //scene.add(model4);

            scene.add(model5);
            scene.add(model6);
            scene.add(model7);
            //continue the process
        });
    }
    if (worldId == 4) {

        var ambient = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambient);

        // const light = new THREE.PointLight( 0x400318, 1, 100 );
        // light.position.set( 20, 10, 50 );
        // scene.add( light );

        const directionalLight = new THREE.DirectionalLight(0x400318, 0.3);
        scene.add(directionalLight);

        const color = 0x400318; // dark-red
        const near = 10;
        const far = 3000;
        scene.fog = new THREE.Fog(color, near, far);

        let model1, model2, model3, model4, model5, model6;

        //add names and locations of models here #SUUS
        let p1 = loadModel('models/crystal-cave/crystal-cave.gltf').then(result => { model1 = result.scene.children[0]; });
        let p2 = loadModel('models/crystal/crystal.gltf').then(result => { model2 = result.scene.children[0]; });
        let p3 = loadModel('models/skybox/skybox.gltf').then(result => { model3 = result.scene.children[0]; });
        let p4 = loadModel('models/island.glb').then(result => { model4 = result.scene.children[0]; });
        let p5 = loadModel('models/islandCollisionMap.glb').then(result => { model5 = result.scene.children[0]; });
        let p6 = loadModel('models/gemstone-02/gem.gltf').then(result => { model6 = result.scene.children[0]; });


        function loadModel(url) {
            return new Promise(resolve => {
                new GLTFLoader(manager).load(url, resolve);
            });
        }

        const loader = new GLTFLoader()

        loader.load('models/critters/world4/yifan.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(10, 30, 0);
            gltf.scene.scale.set(10, 10, 10);
            scene.add(gltf.scene);

        });

        loader.load('models/critters/world4/valentine.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(245, 5, 0);
            gltf.scene.scale.set(0.7, 0.7, 0.7);
            scene.add(gltf.scene);

        });

        loader.load('models/critters/world4/minhong.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(0, 0, 100);
            gltf.scene.scale.set(3.5, 3.5, 3.5);
            scene.add(gltf.scene);

        });

        loader.load('models/critters/world4/emily.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;


            });
            gltf.scene.position.set(-180, 30, -200);
            gltf.scene.scale.set(5, 5, 5);
            scene.add(gltf.scene);

        });

        loader.load('models/critters/world4/benjamin-anim.glb', (gltf) => {

            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(120, 0, -200);
            gltf.scene.scale.set(80, 80, 80);
            scene.add(gltf.scene);

        });

        Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
            var scaleSizeModel1 = 2;
            model1.scale.set(scaleSizeModel1, scaleSizeModel1, scaleSizeModel1);
            model1.position.set(20, 50, 0);
            //model1.rotation.x = Math.PI/2;

            var scaleSizeModel2 = 400;
            model2.scale.set(scaleSizeModel2, scaleSizeModel2, scaleSizeModel2);
            model2.position.set(100, 400, 0);
            //model2.rotation.x = Math.PI/2;

            var scaleSizeModel3 = 20;
            model3.scale.set(scaleSizeModel3, scaleSizeModel3, scaleSizeModel3);
            model3.position.set(0, -10, 0);
            //model3.rotation.x = Math.PI/2;

            var scaleSizeModel4 = 400;
            model4.scale.set(scaleSizeModel4, scaleSizeModel4, scaleSizeModel4);
            model4.position.set(500, -100, 0);
            // model4.rotation.x = Math.PI/2;

            //add amount of model mods here here #SUUS
            //model3.position.set(0,50,0);
            //add model to the scene

            var scaleSizeModel6 = 100;
            model6.scale.set(scaleSizeModel6, scaleSizeModel6, scaleSizeModel6);
            model6.position.set(100, 40, 0);
            //model6.rotation.x = Math.PI/2;

            //add models 2 scene here #SUUS
            scene.add(model1);
            scene.add(model2);
            scene.add(model3);
            scene.add(model4);
            scene.add(model5);
            scene.add(model6);
            //continue the process
        });
    }
}

function addCharacters() {

    // const loader = new GLTFLoader()


    // world shader
    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('textures/equirectangular/')
        .load('venice_sunset_1k.hdr', function(texture) {

            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            render();



        });



    // 		loader.load('models/critters/'+objectName, (gltf)  => {
    //     mixer = new THREE.AnimationMixer( gltf.scene );
    //     //gltf.animations;
    //     //idleAction = mixer.clipAction( gltf.animations[ 1 ] )
    //     jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )
    //
    //     gltf.scene.traverse( function( object ) {
    //       object.frustumCulled = false;
    //     } );
    //     // gltf.scene.traverse((o) => {
    //     //   if (o.isMesh) {
    //     //     o.material.emissive = new THREE.Color( "rgb(194, 85, 226)" );
    //     //   }
    //     // });
    //     scene.add(gltf.scene);
    //     // starts idle animation
    //     jumpAction.play();
    //   }, function ( xhr ) {
    //     if (xhr.loaded/xhr.total * 100 == 100) {
    //     console.log("finished loading characters!")
    //     }
    // 		//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    // 	},
    // 	// called when loading has errors
    // 	function ( error ) {
    // 		console.log( 'An error happened' );
    // 	}
    // );
}

function soundGo(functionNumber) {

    if (functionNumber == 2) {
        //const sound = new THREE.Audio( listener );

        if (soundGoGo == true) {
         //console.log("zero for sound stuff");
         camera.add(listener);

         //audioLoader.load('sound/Boat Island.mp3', function(buffer) {
         audioLoader.load('sound/juno layer.mp3', function(buffer) {
             sound.setBuffer(buffer);
             sound.setLoop(true);
             sound.setRefDistance(10);
             sound.setVolume(0.5);
             sound.setRefDistance(12);
             sound.setVolume(0.6);
             sound.play();
             //console.log(sound.getOutput());
         });

         audioLoader.load('sound/horn layer.mp3', function(buffer) {
             soundLayer2.setBuffer(buffer);
             soundLayer2.setLoop(true);
             soundLayer2.setRefDistance(15);
             soundLayer2.setVolume(0.7);
             soundLayer2.play();
             //console.log(sound.getOutput());
         });

         audioLoader.load('sound/omni layer.mp3', function(buffer) {
             soundLayer3.setBuffer(buffer);
             soundLayer3.setLoop(true);
             soundLayer3.setRefDistance(25);
             soundLayer3.setVolume(0.9);
             soundLayer3.play();
             //console.log(sound.getOutput());
         });

         audioLoader.load('sound/Pauken layer.mp3', function(buffer) {
             soundLayer4.setBuffer(buffer);
             soundLayer4.setLoop(true);
             soundLayer4.setRefDistance(30);
             soundLayer4.setVolume(0.7);
             soundLayer4.play();
             //console.log(sound.getOutput());
         });

         audioLoader.load('sound/violin layer.mp3', function(buffer) {
             soundLayer5.setBuffer(buffer);
             soundLayer5.setLoop(true);
             soundLayer5.setRefDistance(25);
             soundLayer5.setVolume(0.5);
             soundLayer5.play();
             //console.log(sound.getOutput());
         });

         audioLoader.load('sound/Base layer.mp3', function(buffer) {
             soundBase.setBuffer(buffer);
             soundBase.setLoop(true);
             soundBase.setVolume(0.4);
             soundBase.play();
             //console.log(sound.getOutput());
         });

         //gltf.scene.position.set(-40, 5, 60); Britney Pos

         //gltf.scene.position.set(160,9,-75);
         const box = new THREE.BoxGeometry(20, 20, 20);
         const material = new THREE.MeshBasicMaterial({ color: 0xff2200 });
         material.visible = false;

         const cubeSound = new THREE.Mesh(box, material);
         cubeSound.position.set(160, 9, -75);

         cubeSound.add(sound);
         scene.add(cubeSound);

         const cubeSound2 = new THREE.Mesh(box, material);
         cubeSound2.position.set(-40+5, 5+3, 60+7);
         cubeSound2.add(soundLayer2);
         scene.add(cubeSound2);

         const cubeSound3 = new THREE.Mesh(box, material);
         cubeSound3.position.set(144-5, 99.3, 88.7+45);
         cubeSound3.add(soundLayer3);
         scene.add(cubeSound3);

         const cubeSound4 = new THREE.Mesh(box, material);
         cubeSound4.position.set(-50, 15, -180);
         cubeSound4.add(soundLayer4);
         scene.add(cubeSound4);

         //gltf.scene.position.set(40.3, 15, -34);
         const cubeSound5 = new THREE.Mesh(box, material);
         cubeSound5.position.set(40, 15, -34);
         cubeSound5.add(soundLayer5);
         scene.add(cubeSound5);

         //gltf.scene.position.set(144, 9.3, 88.7); adam centko pos
          }
        }
        if (functionNumber == 3) {
            //const sound = new THREE.Audio( listener );

            if (soundGoGo == true) {
             //console.log("zero for sound stuff");
             camera.add(listener);

             //audioLoader.load('sound/Boat Island.mp3', function(buffer) {
             audioLoader.load('sound/Forest Arp & bass Layer.mp3', function(buffer) {
                 sound.setBuffer(buffer);
                 sound.setLoop(true);
                 sound.setRefDistance(17);
                 sound.coneInnerAngle = 45;
                 //sound.setVolume(0.01);
                 //console.log("rolloff = "+sound.getDistanceModel());
                 sound.setRolloffFactor(0.1);
                 //sound.setRefDistance(2);
                 sound.setVolume(0.4);
                 sound.play();
                 //console.log(sound.getOutput());
             });
             //
             audioLoader.load('sound/Forest Rhodes Layer.mp3', function(buffer) {
                 soundLayer2.setBuffer(buffer);
                 soundLayer2.setLoop(true);
                 soundLayer2.coneInnerAngle = 45;
                 soundLayer2.setRefDistance(20);
                 soundLayer2.setVolume(0.7);
                 soundLayer2.play();
                 //console.log(sound.getOutput());
             });
             //
             audioLoader.load('sound/Forest Dilruba Layer.mp3', function(buffer) {
                 soundLayer3.setBuffer(buffer);
                 soundLayer3.setLoop(true);
                 soundLayer3.setRefDistance(25);
                 soundLayer3.setVolume(0.9);
                 soundLayer3.setRolloffFactor(0.5);
                 soundLayer3.play();
                 //console.log(sound.getOutput());
             });
             //
             audioLoader.load('sound/Forest Kalimba Layer.mp3', function(buffer) {
                 soundLayer4.setBuffer(buffer);
                 soundLayer4.setLoop(true);
                 soundLayer4.setRefDistance(30);
                 soundLayer4.setRolloffFactor(0.5);
                 soundLayer4.setVolume(0.5);
                 soundLayer4.play();
                 //console.log(sound.getOutput());
             });
             //
             audioLoader.load('sound/Forest Kaos Layer.mp3', function(buffer) {
                 soundLayer5.setBuffer(buffer);
                 soundLayer5.setLoop(true);
                 soundLayer5.setRefDistance(30);
                 soundLayer5.setVolume(0.6);
                 soundLayer5.play();
                 //console.log(sound.getOutput());
             });

             audioLoader.load('sound/Forest Base Layer.mp3', function(buffer) {
                 soundBase.setBuffer(buffer);
                 soundBase.setLoop(true);
                 soundBase.setVolume(0.4);
                 soundBase.play();
                 //console.log(sound.getOutput());
             });

             //gltf.scene.position.set(-40, 5, 60); Britney Pos

             //gltf.scene.position.set(160,9,-75);
             const box = new THREE.BoxGeometry(20, 20, 20);
             const material = new THREE.MeshBasicMaterial({ color: 0xff2200 });
             material.visible = false;

             const cubeSound = new THREE.Mesh(box, material);
             cubeSound.position.set(100, 20, -20);

             cubeSound.add(sound);
             scene.add(cubeSound);

             const cube2 = new THREE.Mesh(box, material);
             cube2.position.set(100, 20, -185);
             cube2.add(soundLayer2);
             scene.add(cube2);
             //
             const cube3 = new THREE.Mesh(box, material);
             cube3.position.set(335, 20, -160);
             cube3.add(soundLayer3);
             scene.add(cube3);
             //
             const cube4 = new THREE.Mesh(box, material);
             cube4.position.set(-120, 40, -165);
             cube4.add(soundLayer4);
             scene.add(cube4);
             //
             //gltf.scene.position.set(40.3, 15, -34);
             const cube5 = new THREE.Mesh(box, material);
             cube5.position.set(185, 45, 195);
             cube5.add(soundLayer5);
             scene.add(cube5);

             //gltf.scene.position.set(144, 9.3, 88.7); adam centko pos
              }
            }
}

function LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    //_LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
            c.castShadow = true;
        });
        fbx.position.copy(offset);

        const anim = new FBXLoader();
        anim.setPath(path);
        anim.load(animFile, (anim) => {
            const m = new THREE.AnimationMixer(fbx);
            this._mixers.push(m);
            const idle = m.clipAction(anim.animations[0]);
            idle.play();
        });
        this._scene.add(fbx);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

var dt = 1 / 60;
dt2 = (Date.now() - lastframe) / 1000;

function animate() {
    //console.log("test");
    const numObjects = 14;
    const idToObject = {};

    cssStepsWalk();
    cursorCheck();



    if (debug == true) {
        cannonDebugRenderer.update();
    }

    if (controls.enabled) {
        world.step(dt)
            // Update ball positions
        for (var i = 0; i < balls.length; i++) {
            ballMeshes[i].position.copy(balls[i].position)
            ballMeshes[i].quaternion.copy(balls[i].quaternion)
        }
    }
    dt2 = (Date.now() - lastframe) / 1000;
    if (mixer) {
        mixer.update(dt2)
    }
    setTimeout(function() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        if (soundLoad == true) {
            soundMute();
        }
    }, 1000 / 30);

    controls.update(Date.now() - time);
    //renderer.render(scene, camera);
    lastframe = Date.now();
    time = Date.now();

    //requestAnimationFrame(animate);
}

function loadCharacter(characterName) {

    console.log("chara name = " + characterName);

    // adam centko man
    if (characterName == 'adamcentko2') {
        console.log('im in!!');
        const loader = new GLTFLoader();

        loader.load('models/critters/world2/adam-gloss.glb', (gltf) => {
            mixer = new THREE.AnimationMixer(gltf.scene);
            jumpAction = mixer.clipAction(gltf.animations[0])
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(144, 9.3, 88.7);
            gltf.scene.rotation.set(0, 2.83, 0);
            scene.add(gltf.scene);
            jumpAction.play();
        });
        // box queen critter = adam critters
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
        //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(144, 9.3, 88.7);
        cube.scale.set(2, 17, 4);
        cube.userData.name = "adamcentko";
        cube.uuid = "adam2";
        scene.add(cube);
        console.log(dumpObject(cube).join('\n'));
        console.log(cube.userData);
    }

    // karin spider
    if (characterName == 'karinferrari2') {

        const loader = new GLTFLoader();
        loader.load('models/critters/world2/karin-spider-anim2.glb', (gltf) => {
            mixer = new THREE.AnimationMixer(gltf.scene);
            jumpAction = mixer.clipAction(gltf.animations[0])
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(160, 9, -75);
            gltf.scene.rotation.set(0, -0.5, 0);
            gltf.scene.scale.set(5.5, 5.5, 5.5);
            scene.add(gltf.scene);
            jumpAction.play();
        });

        loader.load('models/critters/world2/karin-spider-core.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(160, 9, -75);
            gltf.scene.rotation.set(0, -0.5, 0);
            gltf.scene.scale.set(5.5, 5.5, 5.5);
            scene.add(gltf.scene);
        });
    }
    // wouter it's britney bitch
    if (characterName == 'wouterstroet2') {
        const loader = new GLTFLoader();
        loader.load('models/critters/world2/wouter.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(-40, 5, 60);
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.rotation.set(0, 3, 0);
            scene.add(gltf.scene);

        });
        // box queen critter = wouter britney critters
        const geometrybrit = new THREE.BoxGeometry();
        const materialbrit = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
        //const materialbrit = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometrybrit, materialbrit);
        cube.position.set(-40, 5, 55);
        cube.scale.set(6, 25, 2);
        cube.userData.name = "wouterstroet";
        cube.uuid = "wouterstroet2";
        scene.add(cube);
        console.log(dumpObject(cube).join('\n'));
        console.log(cube.userData);
    }

    // louis cores
    if (characterName == 'louisbraddock2') {
        const loader = new GLTFLoader();
        loader.load('models/critters/world2/louis.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(280, 0, -15);
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.rotation.set(1, 1.9, -0.2);
            scene.add(gltf.scene);
        });

        // box queen critter = luis critters
        const geometryLuis = new THREE.BoxGeometry();
        const materialLuis = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
        //const materialLuis = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cubeLuis = new THREE.Mesh(geometryLuis, materialLuis);
        cubeLuis.position.set(280, 0, 20); //-15
        cubeLuis.scale.set(30, 100, 60);
        cubeLuis.userData.name = "louisbraddock";


        scene.add(cubeLuis);
    }
    // valerie tea pots
    if (characterName == 'valerievanzuijlen2') {
        const loader = new GLTFLoader();
        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(40.3, 15, -34);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(0, 1.5, 0.5);
            scene.add(gltf.scene);
        });


        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(43, 14, -30.1);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(2, 1, 0.7);
            scene.add(gltf.scene);
        });


        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(41, 13, -32.6);
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            gltf.scene.rotation.set(1.3, 3, -0.6);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(41.3, 14.8, -32.3);
            gltf.scene.scale.set(0.03, 0.03, 0.03);
            gltf.scene.rotation.set(0.2, 1, -1);
            scene.add(gltf.scene);
        });


        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(40.7, 17.8, -33.4);
            gltf.scene.scale.set(0.04, 0.04, 0.04);
            gltf.scene.rotation.set(-2, 1.3, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(42, 17, -32);
            gltf.scene.scale.set(0.07, 0.07, 0.07);
            gltf.scene.rotation.set(2, 1.2, 0);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(37, 11.3, -22);
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.rotation.set(0, 0, 0.4);
            scene.add(gltf.scene);
        });

        loader.load('models/critters/world2/valerie.glb', (gltf) => {
            gltf.scene.traverse(function(object) {
                object.frustumCulled = false;
            });
            gltf.scene.position.set(38, 11.8, -19);
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            gltf.scene.rotation.set(0.2, 2, -0.2);
            scene.add(gltf.scene);
        });
    }

}

function cursorCheck() {

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    // If only interested in one intersection, you can use .intersectObject()

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            //console.log("hit this = "+INTERSECTED.userData.index);
            var object = intersects[0].object;
            var material = object.material;
            var userD = object.userData.name;
            var objectParent = object.parent;
            var objectSiblings = objectParent.children;
            var siblingNames = [];
            var siblingBool = false;
            id = object.id;
            critterLocation = object.position;

            //material.color = new THREE.Color( Math.random(), Math.random(), Math.random());
            //console.log(model2.userData.STRING);
            if (checkObjId == true) {
                // console.log(userD);
                // console.log(boolInPerimeter, "boolInPerimeter");
                //console.log(dumpObject(object.parent).join('\n')); //looking at interesected objsts parent structure
                var newScene;
                scenes.forEach(item => {
                    //critterLoc = new THREE.Vector3(item.posX, item.posY, item.posZ);
                    if (objectSiblings.length > 0) {
                        objectSiblings.forEach(function(child) {
                            siblingNames.push(child.name);
                            //console.log(siblingNames);
                        });
                        if (siblingNames.includes(item.idInWorld) == true) {
                            //console.log("chidlren of it yes name");
                            siblingBool = true;
                        } else { siblingBool = false; }
                        // siblingNames.forEach(namevalue);
                        // function namevalue(nameValue) {
                        // 	console.log(nameValue, "nameValue");
                        // 	if(item.idInWorld == namevalue ) {
                        // 		console.log("chidlren of it yes name");
                        // 	}
                        // }
                    }
                    //console.log(critterLoc,"critterLoc");
                    //console.log(critterLocation,"critterLocation");
                    //	if (critterLocation.equals(critterLoc) == true ) {
                    if ((userD == item.idInWorld) || (siblingBool == true)) {
                        boolMouseOn = true;
                        newScene = item;
                        console.log("yes location same");
                        boolInPerimeter = true;

                        // look for click

                        //if( boolMouseOn == true){
                        window.addEventListener("click", clickedOnCritter, false);


                        //	}
                    } else {
                        boolInPerimeter = false;
                    }
                });

                if (newScene) {
                    //console.log("newscene", newScene);
                    //console.log("you made it to the", currentScene);
                    boolInPerimeter = true;


                    if (currentScene.id != newScene.id) {

                        currentScene = newScene;
                        critterId = currentScene.id;
                        //console.log("(currentScene.id != newScene.id)");
                        critterFilmLink = currentScene.videoUrl;
                        // updateFilmUrl(critterFilmLink)
                    }
                } else {
                    // console.log(" no");
                }
                //console.log('intersect!' + userD);
                // console.log("id" + id);

            }




            material.needsUpdate = true;
            // this.pickedObject = intersectedObject;
            //id for beasts:
            // dino = 199 , 200
            // bird = 192
            // upper landscape = 209

            INTERSECTED = intersects[0].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            //INTERSECTED.material.emissive.setHex( 0xff0000 );

            //  boolMouseOn = true; //THIS WAS USEFUL ONCE on 28.05

            //pop up on hover:
            //trailer.style.visibility = "visible";
            //trailer.style.opacity = 1;
        }
    } else {
        //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        //  boolMouseOn = false; //THIS WAS USEFUL ONCE on 28.05
        INTERSECTED = null;
    }


    //louisa's code, trying to make the pop up happen onclick of an object
    // if(boolMouseOn == true && boolMouseClick == true ){
    //
    // 		var currentSceneLoc = new THREE.Vector3(currentScene.posX, currentScene.posY, currentScene.posZ);
    //       if (userD == currentScene.idInWorld) {
    //        console.log("Clicked on critter");
    //        critterId = currentScene.id;
    //        critterPosX = currentScene.posX;
    //        critterPosY = currentScene.posY;
    //        critterPosZ = currentScene.posZ;
    // 			showFilm(critterId, critterPosX, critterPosY, critterPosZ, critterFilmLink);
    //       }
    // }
    //turn off mouseclick after possible event
    if (boolMouseClick == true) {
        boolMouseClick = false;

    }
}



function clickedOnCritter() {
    window.removeEventListener("click", clickedOnCritter, false);
    boolMouseOn = false;

    //critterFilmLink = currentScene.videoUrl;
    updateFilmUrl(critterFilmLink);
    //document.getElementById("embedContainerFilm-iframe2").src = "https://player.vimeo.com/video/559077120?autoplay=1&badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479";

    embedContainerGet.style.backgroundColor = "black";
    embedContainerGet.style.visibility = "visible";
    embedContainerGet.style.display = "block";

    var exitimageGet = "world" + worldId + "videofound";
    document.getElementById(exitimageGet).addEventListener("click", clickedOnExitVideo);
    //instructions.click();
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
    document.exitPointerLock();

    muteSound = true;
    if (critterToFindArray[0] == critterId + worldId) {
        document.getElementById(critterToFindArray[0]).style.visibility = "hidden";
    }

    if (filmIsPlaying == false) {
        console.log("wuu clicked");
        critterId = currentScene.id;
        critterPosX = currentScene.posX;
        critterPosY = currentScene.posY;
        critterPosZ = currentScene.posZ;


        //showFilm(critterId, critterPosX, critterPosY, critterPosZ, critterFilmLink);
    } else {
        console.log("film was already playing");
    }
}

function updateFilmUrl(critterFilmLink) {
    var filmPath = critterFilmLink;
    var iframeGet = 'embedContainerFilm-iframe' + worldId;
    var filmPathCont = document.getElementById(iframeGet);
    filmPathCont.src = filmPath;
}

function clickedOnExitVideo() {
    muteSound = false;
    //embedContainerGet.classList.remove('fade-in');
    //embedContainerGet.classList.add('fade-out');
    embedContainerGet.style.visibility = null;
    embedContainerGet.style.display = null;
    embedContainerGet.style.transition = null;
    embedContainerGet.style.backgroundColor = null;
    console.log("clicked exit button");
    instructions.click();
    var element = document.body;
    element.requestPointerLock();
    filmIsPlaying = false;
    var iframeGet = 'embedContainerFilm-iframe' + worldId;
    var filmPathCont = document.getElementById(iframeGet);
    filmPathCont.removeAttribute('src');
    //filmPathCont.src = null; //#
    //document.getElementById(critterHtmlId).style.visibility = "hidden";
    console.log(critterId);
    if (lastCritterToFind == false) {
        if (critterToFindArray[0] == critterId + worldId) {
            critterToFindArray.splice(0, 1);
            huntForNextCritter();
            console.log(critterToFindArray);
        } else {
            console.log("different ones");
        }
    } else {
        console.log("geoevent start");
    }

    // randomNumber(0, critterToFindArray.length - 1);
    // console.log(randomNumberGenerated);
    // critterHtmlId = critterToFindArray[randomNumberGenerated];
    // console.log(critterHtmlId);
    // document.getElementById(critterHtmlId).style.visibility = "visible";


}

function showFilm(critterId, critterPosX, critterPosY, critterPosZ, critterFilmLink) {
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
    document.exitPointerLock();
    //var idForFilm = id+"video";
    window.removeEventListener("click", clickedOnCritter, false);
    boolMouseOn = false;
    let video, texture, mesh;
    let mouse = new THREE.Vector2();
    // var filmPath = critterFilmLink;
    // var filmPathCont = document.getElementById('embedContainerFilm-iframe1');
    // filmPathCont.src = filmPath;
    // console.log("looking for film with id " + critterId);
    // var element = document.body;
    // element.requestPointerLock =
    // 	element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock

    // window.dispatchEvent(new KeyboardEvent('keydown', {
    //   'key': 'Escape'
    // }));
    //var filmPath =  "video/" + critterId + "/" + "1.mp4";
    //var embedContainer = "embedContainerFilm" + "-" + worldId;
    // var embedContainerGet = document.getElementById(embedContainer);
    //embedContainerGet.classList.remove('fade-out');
    //embedContainerGet.classList.add('fade-in');
    // embedContainerGet.style.visibility = "visible";
    // embedContainerGet.style.display = "block";

    //embedContainerGet.setAttribute("style", "background: red; transition: 30 ease-in;");
    // embedContainerGet.style.transition = "5s ease-in";
    // embedContainerGet.style.backgroundColor = "black";

    //pointerLock();
    filmIsPlaying = true;
    var exitimageGet = "world" + worldId + "videofound";
    document.getElementById(exitimageGet).addEventListener("click", clickedOnExitVideo);






    //controls.unlock();

    //controls.enabled = false;
    //console.log(controls);


}

function critterArray() {
    var CritterClassList = document.getElementsByClassName(critterClass);
    console.log(CritterClassList);
    for (var i = 0; i < CritterClassList.length; i++) {
        //if (runOnce == true) {
        //     randomNumber(0, CritterClassList.length - 1);
        // runOnce = false;
        //
        //if ((i < CritterClassList.length) && (runOnce2 == true)) {
        critterToFindArray.push(CritterClassList[i].id);
        console.log(critterToFindArray, "critterToFindArray");


        // if (i == CritterClassList.length - 1) {
        //     runOnce2 = false;
        // }
        //  } else { runOnce2 = false; }


        //var firstCritterInfo = CritterClassList[randomNumberGenerated];

        //console.log(CritterClassList);
        //console.log(firstCritterId, "firstCritterId");
        // } else {
        //     runOnce = false;
        // }
    }
    randomNextCritterInArray();

    var firstCritterId = critterToFindArray[0];
    console.log(firstCritterId);
    if (critterHtmlId == 0) {
        document.getElementById(firstCritterId).style.visibility = "visible";
        console.log("yes");
    } else {
        //firstCritterId = critterHtmlId;
        document.getElementById(firstCritterId).style.visibility = "hidden";
        //document.getElementById(critterHtmlId).style.visibility = "visible";
    }
}

function randomNextCritterInArray() {
    var n = critterToFindArray.length;
    var tempArr = [];
    for (var i = 0; i < n - 1; i++) {
        // The following line removes one random element from arr
        // and pushes it onto tempArr
        tempArr.push(critterToFindArray.splice(Math.floor(Math.random() * critterToFindArray.length), 1)[0]);
    }
    // Push the remaining item onto tempArr
    tempArr.push(critterToFindArray[0]);
    critterToFindArray = tempArr;
    console.log(critterToFindArray);
    if (n == 1) {
        console.log("last one to find");
        lastCritterToFind = true;
    }
}

function huntForNextCritter() {
    randomNextCritterInArray();
    document.getElementById(critterToFindArray[0]).style.visibility = "visible";
    loadCharacter(critterToFindArray[0]);
}

function getScenes() {

    //  structure of json: "world-id | idInWorld | posX |posY | posZ | videoUrl"

    //let fetchRes = fetch('customPackage/scenes/scenes-1.json');
    let fetchRes = fetch(constructFetch);
    //console.log(fetchRes);
    fetchRes.then(res => res.json())
        .then(d => {
            scenes = d.map(
                    function(item) {
                        //  console.log(item);
                        var parts = item.split('|');
                        return {
                            world: parseFloat(parts[0]),
                            id: parts[1],
                            idInWorld: parts[2],
                            posX: parseFloat(parts[3]),
                            posY: parseFloat(parts[4]),
                            posZ: parseFloat(parts[5]),
                            videoUrl: parts[6],
                        }
                    }
                )
                //console.log(d) // writes the array

        })
        .then(
            function() {
                //findNearest();
                // here call the findnearest function
                setTimeout(function() {
                    getScenes();

                }, 30000);
            }
        )
}

function cssStepsWalk() {


    if (worldId == 1) {
        if (boolInPerimeter == true) {
            js: document.getElementById("found1").style.visibility = "visible";
            //critterHtmlId = critterId + worldId;
        }
        else {
            js: document.getElementById("found1").style.visibility = "hidden";

        }
    }
    if (worldId == 2) {
        if (boolInPerimeter == true) {
            js: document.getElementById("found1").style.visibility = "visible";
            //critterHtmlId = critterId + worldId;
            //document.getElementById(critterHtmlId).style.visibility = "visible";
            //console.log(critterHtmlId, "critterHtmlId");
            //document.getElementById(critterHtmlId).style.visibility = "visible";
            cssSteps();
        }
        else {
            js: document.getElementById("found1").style.visibility = "hidden";
        }
    }
    if (worldId == 3) {
        if (boolInPerimeter == true) {
            js: document.getElementById("range3").style.visibility = "visible";
            js: document.getElementById("found3").style.visibility = "visible";
            js: document.getElementById("hintsfade3-2").style.visibility = "visible";
            //critterHtmlId = critterId + worldId;

        }
        else {
            js: document.getElementById("found3").style.visibility = "hidden";
            js: document.getElementById("range3").style.visibility = "hidden";

        }
    }
    if (worldId == 4) {
        if (boolInPerimeter == true) {
            js: document.getElementById("range3").style.visibility = "visible";
            js: document.getElementById("found3").style.visibility = "visible";
            js: document.getElementById("hintsfade3-2").style.visibility = "visible";
            //critterHtmlId = critterId + worldId;

        }
        else {
            js: document.getElementById("found3").style.visibility = "hidden";
            js: document.getElementById("range3").style.visibility = "hidden";

        }
    }
}


function cssSteps() {


    // console.log(firstCritterId);
    if (worldId == 1) {

        js: document.getElementById("world1").style.visibility = "visible";
        js: document.getElementById("world1welcome").style.visibility = "visible";
        js: document.getElementById("world2").style.visibility = "hidden";
        js: document.getElementById("world3").style.visibility = "hidden";
        js: document.getElementById("world4").style.visibility = "hidden";

        js: document.getElementById("instructions1").style.visibility = "visible";
        js: document.getElementById("instructions2").style.visibility = "hidden";
        js: document.getElementById("instructions3").style.visibility = "hidden";
        js: document.getElementById("instructions4").style.visibility = "hidden";

        js: document.getElementById("encyclo1").style.display = "block";
        js: document.getElementById("encyclo2").style.visibility = "hidden";
        js: document.getElementById("encyclo3").style.visibility = "hidden";
        js: document.getElementById("encyclo-4").style.visibility = "hidden";

        js: document.getElementById("info1").style.visibility = "hidden"; //for development sake commnt out
        js: document.getElementById("info2").style.visibility = "hidden";
        js: document.getElementById("info3").style.visibility = "hidden";
        js: document.getElementById("info4").style.visibility = "hidden";


    }
    else if (worldId == 2) {
        // document.getElementById(firstCritterId).style.visibility = "visible";

        js: document.getElementById("world1").style.visibility = "hidden";
        js: document.getElementById("world2").style.visibility = "visible";
        js: document.getElementById("world2welcome").style.visibility = "visible";
        js: document.getElementById("world3").style.visibility = "hidden";
        js: document.getElementById("world4").style.visibility = "hidden";
        //js: document.getElementById("louisbraddock2").style.visibility = "visible";

        js: document.getElementById("instructions1").style.visibility = "hidden";
        js: document.getElementById("instructions2").style.visibility = "visible";
        js: document.getElementById("instructions3").style.visibility = "hidden";
        js: document.getElementById("instructions4").style.visibility = "hidden";

        js: document.getElementById("encyclo1").style.visibility = "hidden";
        js: document.getElementById("encyclo2").style.display = "block";
        js: document.getElementById("encyclo3").style.visibility = "hidden";
        js: document.getElementById("encyclo-4").style.visibility = "hidden";

        js: document.getElementById("info1").style.visibility = "hidden";
        js: document.getElementById("info2").style.visibility = "visible";
        js: document.getElementById("info3").style.visibility = "hidden";
        js: document.getElementById("info4").style.visibility = "hidden";

    }
    else if (worldId == 3) {
        js: document.getElementById("world1").style.visibility = "hidden";
        js: document.getElementById("world2").style.visibility = "hidden";
        js: document.getElementById("world3").style.visibility = "visible";
        js: document.getElementById("world3welcome").style.visibility = "visible";
        js: document.getElementById("world4").style.visibility = "hidden";
        js: document.getElementById("alondracastellanos3").style.visibility = "visible";

        js: document.getElementById("instructions1").style.visibility = "hidden";
        js: document.getElementById("instructions2").style.visibility = "hidden";
        js: document.getElementById("instructions3").style.visibility = "visible";
        js: document.getElementById("instructions4").style.visibility = "hidden";

        js: document.getElementById("encyclo1").style.visibility = "hidden";
        js: document.getElementById("encyclo2").style.visibility = "hidden";
        js: document.getElementById("encyclo3").style.display = "block";
        js: document.getElementById("encyclo-4").style.visibility = "hidden";

        js: document.getElementById("info1").style.visibility = "hidden";
        js: document.getElementById("info2").style.visibility = "hidden";
        js: document.getElementById("info3").style.visibility = "visible";
        js: document.getElementById("info4").style.visibility = "hidden";


        //js: document.getElementById("found").style.visibility = "visible";

    }
    else if (worldId == 4) {
        js: document.getElementById("world1").style.visibility = "hidden";
        js: document.getElementById("world2").style.visibility = "hidden";
        js: document.getElementById("world3").style.visibility = "hidden";
        js: document.getElementById("world4").style.visibility = "visible";
        js: document.getElementById("world4welcome").style.visibility = "visible";
        js: document.getElementById("benjaminhall4").style.visibility = "visible";

        js: document.getElementById("instructions1").style.visibility = "hidden";
        js: document.getElementById("instructions2").style.visibility = "hidden";
        js: document.getElementById("instructions3").style.visibility = "hidden";
        js: document.getElementById("instructions4").style.visibility = "visible";

        js: document.getElementById("encyclo1").style.visibility = "hidden";
        js: document.getElementById("encyclo2").style.visibility = "hidden";
        js: document.getElementById("encyclo3").style.visibility = "hidden";
        js: document.getElementById("encyclo-4").style.display = "block";

        js: document.getElementById("info1").style.visibility = "hidden";
        js: document.getElementById("info2").style.visibility = "hidden";
        js: document.getElementById("info3").style.visibility = "hidden";
        js: document.getElementById("info4").style.visibility = "visible";
    }

}

function pointerLock() {

    var havePointerLock =
        'pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document

    if (havePointerLock) {
        var element = document.body

        var pointerlockchange = function(event) {
            if (
                document.pointerLockElement === element ||
                document.mozPointerLockElement === element ||
                document.webkitPointerLockElement === element
            ) {
                controls.enabled = true
                blocker.style.display = 'none'
            } else {
                controls.enabled = false
                blocker.style.display = '-webkit-box'
                blocker.style.display = '-moz-box'
                blocker.style.display = 'box'

                instructions.style.display = ''
            }
        }

        var pointerlockerror = function(event) {
            instructions.style.display = ''
        }

        document.addEventListener('pointerlockchange', pointerlockchange, false)
        document.addEventListener('mozpointerlockchange', pointerlockchange, false)
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false)

        document.addEventListener('pointerlockerror', pointerlockerror, false)
        document.addEventListener('mozpointerlockerror', pointerlockerror, false)
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false)

        instructions.addEventListener(
            'click',
            function(event) {
                instructions.style.display = 'none'

                // Ask the browser to lock the pointer

                element.requestPointerLock =
                    element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock

                element.requestPointerLock()

                // if (/Firefox/i.test(navigator.userAgent)) {
                //     var fullscreenchange = function(event) {
                //         if (
                //             document.fullscreenElement === element ||
                //             document.mozFullscreenElement === element ||
                //             document.mozFullScreenElement === element
                //         ) {
                //             document.removeEventListener('fullscreenchange', fullscreenchange)
                //             document.removeEventListener('mozfullscreenchange', fullscreenchange)

                //             element.requestPointerLock()
                //         }
                //     }

                //     document.addEventListener('fullscreenchange', fullscreenchange, false)
                //     document.addEventListener('mozfullscreenchange', fullscreenchange, false)

                //     element.requestFullscreen =
                //         element.requestFullscreen ||
                //         element.mozRequestFullscreen ||
                //         element.mozRequestFullScreen ||
                //         element.webkitRequestFullscreen

                //     element.requestFullscreen()
                // } else {
                //     element.requestPointerLock()
                // }
            },
            false
        )
    } else {
        instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API"
    }
}
//return array with height data from img
function getTerrainPixelData(image) {
    //var canvas = document.getElementById("canvas");
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

    var data = canvas.getContext('2d').getImageData(0, 0, image.width, image.height).data;
    var normPixels = []

    for (var i = 0, n = data.length; i < n; i += 4) {
        // get the average value of R, G and B.
        normPixels.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }
    //console.log(normPixels);
    //normPixels = null;
    return normPixels;
}

function addHeightMapAll(squareNo) {
    //heigthmapfun
    var xMult;
    var yMult;
    var img4All = imagesTiles[squareNo - 1];
    //var img4AllText = textureTiles[squareNo-1];

    if (squareNo == 1) {
        xMult = 200;
        yMult = -200;
    } else if (squareNo == 2) {
        xMult = 0;
        yMult = -200;
    } else if (squareNo == 3) {
        xMult = -200;
        yMult = -200;
    } else if (squareNo == 4) {
        xMult = 200;
        yMult = 0;
    } else if (squareNo == 5) {
        xMult = 0;
        yMult = 0;
    } else if (squareNo == 6) {
        xMult = -200;
        yMult = 0;
    } else if (squareNo == 7) {
        xMult = 200;
        yMult = 200;
    } else if (squareNo == 8) {
        xMult = 0;
        yMult = 200;
    } else if (squareNo == 9) {
        xMult = -200;
        yMult = 200;
    }

    //what would we need?
    //an Img for the heightMap
    //an X multiplier and an Y multiplier

    //here is the physics part
    var allBody = new CANNON.Body({ mass: 0 });
    var matrix = fromImage(img4All, img4All.width, img4All.height, 0, 25);
    var shape = new CANNON.Heightfield(matrix, { elementSize: 2.0 });
    var quat = new CANNON.Quaternion(0, 0, 0, 0);
    quat.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
    quat.normalize();
    allBody.addShape(shape, new CANNON.Vec3, quat);
    allBody.position.set(xVal + yMult, yVal, 100 + zVal + xMult);
    world.addBody(allBody);

    //here is the visual part
    var terrain = getTerrainPixelData(img4All);
    var geometry = new THREE.PlaneGeometry(24 * img4All.width / img4All.height, 24, img4All.width - 1, img4All.height - 1);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var terrainValue = terrain[i] / 255;
        geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * height_scale;
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    let text;
    //text = new THREE.TextureLoader().load('textures/island.png');
    text = new THREE.TextureLoader().load("textures/terrains/" + (worldId) + "_" + (squareNo) + ".png");

    var materialFr = new THREE.MeshLambertMaterial({ map: text, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, materialFr);

    var q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
    //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
    plane.quaternion.multiplyQuaternions(q, plane.quaternion);
    plane.position.set(100 + zVal + yMult, yVal, xMult + xVal);
    plane.rotation.z = Math.PI / 2;
    //body.position.set(15,0,100);
    plane.scale.set(8.3333, 8.3333, 8.3333);
    //plane.position.set(0,0,0);
    scene.add(plane)
    terrain = null;


    if (worldId == 3) {

    }

}


function addFlatGround() {


    // var q = new THREE.Quaternion();
    // q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
    // //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
    // plane.quaternion.multiplyQuaternions( q, plane.quaternion );
    // plane.position.set(100,0,0);
    // plane.rotation.z = Math.PI/2;

    const geometry = new THREE.PlaneGeometry(601, 601, 601);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    var q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
    //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
    plane.quaternion.multiplyQuaternions(q, plane.quaternion);
    plane.position.set(100, -2, 0);
    plane.rotation.z = Math.PI / 2;

    scene.add(plane);

}

function fromImage(image, width, depth, minHeight, maxHeight) {

    width = width | 0;
    depth = depth | 0;

    var i, j;
    var matrix = [];
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    var imgData, pixel, channels = 4;
    var heightRange = maxHeight - minHeight;
    var heightData;

    canvas.width = width;
    canvas.height = depth;

    // document.body.appendChild( canvas );

    ctx.drawImage(image, 0, 0, width, depth);
    imgData = ctx.getImageData(0, 0, width, depth).data;

    for (i = 0 | 0; i < depth; i = (i + 1) | 0) { //row

        matrix.push([]);

        for (j = 0 | 0; j < width; j = (j + 1) | 0) { //col

            pixel = i * depth + j;
            heightData = imgData[pixel * channels] / 255 * heightRange + minHeight;
            matrix[i].push(heightData);
        }

    }

    return matrix;

}


function render() {

    renderer.render(scene, camera);

}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function randomNumber(min, max) {
    randomNumberGenerated = Math.floor(Math.random() * (max - min + 1)) + min;
}

function soundMute() {
    var volFade = listener.getMasterVolume();
    if (muteSound == true) {


        //console.log("volFade = " + volFade);
        volFade -= fadeSpeed;
        if (volFade < 0) {
            volFade = 0;
        }

        listener.setMasterVolume(volFade);

    } else {
        volFade += fadeSpeed;
        if (volFade > 1) {
            volFade = 1;
        }
        listener.setMasterVolume(volFade);

    }
}
