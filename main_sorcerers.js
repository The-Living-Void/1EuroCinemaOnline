import * as THREE from './node_modules/three/build/three.module.js'
import * as CANNON from './node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControls } from './customPackage/controls/PointerLockControls.js'
import CannonDebugRenderer from './customPackage/CannonDebugRenderer.js';
import {GLTFLoader} from './customPackage/loader/GLTFLoader.js'
import { threeToCannon } from './node_modules/three-to-cannon/index.js';
import { RGBELoader } from './customPackage/loader/RGBELoader.js';
import { RoughnessMipmapper } from './customPackage/utils/RoughnessMipmapper.js';
// import { EffectComposer } from './postprocessing/EffectComposer.js';
// import { RenderPass } from './postprocessing/RenderPass';
// import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';


var debug=false;
var checkObjId=false;
var worldId = 4; //1= socerers 2=lighthouse 3=forest 4= cave
var objectName = 'spider-anim2.glb';
var adjustHeigth = -20;
//var imgHeightWorld = new Array();
var boolMushroom;

const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );

var zVal= 0;
var yVal= 0;
var xVal= 0;

let dt2,mixer,lastframe = Date.now(),jumpAction,idleAction;
var height_scale = 3;
//1sp person login stuff
var blocker = document.getElementById('blocker')
var instructions = document.getElementById('instructions'+worldId)
var mouse = new THREE.Vector2(), INTERSECTED;
var boolMouseOn = false,boolMouseClick = false;
var id;

const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	//console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
};
manager.onProgress = function (url,itemsLoaded,itemsTotal) {
	//console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

pointerLock();

var plane2;
var sphereShape,sphereBody,world,physicsMaterial,walls = [],balls = [],ballMeshes = [],boxes = [],boxMeshes = [],
voxels,groundBody,groundBody2,groundBodyMesh,cannonDebugRenderer;

var camera, scene, renderer,time,raycaster;
var geometry, material, mesh,controls,light;
//OLDCODE
var torusGeo, torusMaterial, shaderMaterial, uniforms, buffGeo, torus;

time = Date.now()
var img = new Image();
var imgForrest = new Image();

var imagesTiles = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];
//var textureTiles = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];

for (var i = 0; i < imagesTiles.length; i++) {
	imagesTiles[i].src = "heightMap/"+(worldId)+"_"+(i+1)+".png";
}

initCannon();
init();
render();
addFlatGround();

for (var i = 1; i < 10; i++) {
addHeightMapAll(i);
}
animate();

console.log("heyaa I am working :)");

function initCannon(){
    //img.src = "textures/Heightmap.png";
      world = new CANNON.World();
      world.quatNormalizeSkip = 0;
      world.quatNormalizeFast = false;

      var solver = new CANNON.GSSolver();

      world.defaultContactMaterial.contactEquationStiffness = 1e9;
      world.defaultContactMaterial.contactEquationRelaxation = 4;

      solver.iterations = 2;//used to be 7
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
      var mass = 2, radius = 1.3;
      sphereShape = new CANNON.Sphere(radius);
      sphereBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
      sphereBody.addShape(sphereShape);
      // sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5);
			sphereBody.position.set(190,30,0);
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
      // Create a plane
      // var groundShape = new CANNON.Plane();
      // groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
      // groundBody.addShape(groundShape);
      // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      // groundBody.position.set(0, 0, 0);
      // world.addBody(groundBody);

      //CODE BOXES SUUS
      // sphere shapes (tegen klok in):
      var sphereChickShape1 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody1 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody1.addShape(sphereChickShape1);
      chickCircleBody1.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody1.position.set(-140, 5, -30);
      world.addBody(chickCircleBody1);

      var sphereChickShape2 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody2.addShape(sphereChickShape2);
      chickCircleBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody2.position.set(-90, 5, 150);
      world.addBody(chickCircleBody2);

      var sphereChickShape3 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody3 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody3.addShape(sphereChickShape3);
      chickCircleBody3.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody3.position.set(100, 5, 240);
      world.addBody(chickCircleBody3);

      var sphereChickShape4 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody4 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody4.addShape(sphereChickShape4);
      chickCircleBody4.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody4.position.set(290, 5, 160);
      world.addBody(chickCircleBody4);

      var sphereChickShape5 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody5 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody5.addShape(sphereChickShape5);
      chickCircleBody5.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody5.position.set(330, 5, -30);
      world.addBody(chickCircleBody5);

      var sphereChickShape6 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody6 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody6.addShape(sphereChickShape6);
      chickCircleBody6.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody6.position.set(230, 5, -250);
      world.addBody(chickCircleBody6);

      var sphereChickShape7 = new CANNON.Sphere(50, 60, 50);
      var chickCircleBody7 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody7.addShape(sphereChickShape7);
      chickCircleBody7.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody7.position.set(-68, 5, -250);
      world.addBody(chickCircleBody7);

      // plane
      var chassisShape8 = new CANNON.Box(new CANNON.Vec3(20, 40, 10));
      var chassisBody8 = new CANNON.Body({mass: 0});
      chassisBody8.addShape(chassisShape8);
      //chassisBody.position.set(0, 0, 0);
      chassisBody8.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chassisBody8.position.set(95, 5, -15);
      chassisBody8.angularVelocity.set(0, 0, 0); // initial velocity
      world.addBody(chassisBody8);

      //crystal
      var sphereChickShape9 = new CANNON.Sphere(40, 50, 40);
      var chickCircleBody9 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody9.addShape(sphereChickShape9);
      chickCircleBody9.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody9.position.set(100, 10, 5);
      world.addBody(chickCircleBody9);

      // pillars next to crystal:
      var sphereChickShape10 = new CANNON.Sphere(10);
      var chickCircleBody10 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody10.addShape(sphereChickShape10);
      chickCircleBody10.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody10.position.set(100, 30, -15);
      world.addBody(chickCircleBody10);

      var sphereChickShape11 = new CANNON.Sphere(10);
      var chickCircleBody11 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody11.addShape(sphereChickShape11);
      chickCircleBody11.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody11.position.set(80, 25, -40);
      world.addBody(chickCircleBody11);

      var sphereChickShape12 = new CANNON.Sphere(10);
      var chickCircleBody12 = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody12.addShape(sphereChickShape12);
      chickCircleBody12.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody12.position.set(115, 25, -38);
      world.addBody(chickCircleBody12);

			// Roos add
			//Platform
			var platform1Shape = new CANNON.Box(new CANNON.Vec3(40, 30, 23));
			var platform1Body = new CANNON.Body({mass: 0, material: physicsMaterial});
			platform1Body.addShape(platform1Shape);
			platform1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0.3, 0), -Math.PI / 2);
			platform1Body.position.set(87, 0, -27);
			platform1Body.angularVelocity.set(0, 0, 0);
			world.addBody(platform1Body);

      }

			if (worldId == 2) {

				var world2wall1Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
				var world2wall1Body = new CANNON.Body({mass: 0});
				world2wall1Body.addShape(world2wall1Shape);
				world2wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world2wall1Body.position.set(330, 0, 0);
				world.addBody(world2wall1Body);

				var world2wall2Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
				var world2wall2Body = new CANNON.Body({mass: 0});
				world2wall2Body.addShape(world2wall2Shape);
				world2wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world2wall2Body.position.set(-150, 0, 0);
				world.addBody(world2wall2Body);

				var world2wall3Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
				var world2wall3Body = new CANNON.Body({mass: 0});
				world2wall3Body.addShape(world2wall3Shape);
				world2wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world2wall3Body.position.set(0, 0, -240);
				world.addBody(world2wall3Body);

				var world2wall4Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
				var world2wall4Body = new CANNON.Body({mass: 0});
				world2wall4Body.addShape(world2wall4Shape);
				world2wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world2wall4Body.position.set(0, 0, 250);
				world.addBody(world2wall4Body);

				var vuurtorenShape = new CANNON.Box(new CANNON.Vec3(20, 20, 12));
				var vuurtorenBody = new CANNON.Body({mass: 0});
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
				var hutBody = new CANNON.Body({mass: 0});
				hutBody.addShape(hutShape);
				hutBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutBody.position.set(160, 4, -75);
				world.addBody(hutBody);

				var hutwall1Shape = new CANNON.Box(new CANNON.Vec3(0.5, 11, 9));
				var hutwall1Body = new CANNON.Body({mass: 0});
				hutwall1Body.addShape(hutwall1Shape);
				hutwall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutwall1Body.position.set(152, 8, -78);
				world.addBody(hutwall1Body);

				var hutwall2Shape = new CANNON.Box(new CANNON.Vec3(0.5, 11, 9));
				var hutwall2Body = new CANNON.Body({mass: 0});
				hutwall2Body.addShape(hutwall2Shape);
				hutwall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutwall2Body.position.set(168, 8, -72);
				world.addBody(hutwall2Body);

				var hutwall3Shape = new CANNON.Box(new CANNON.Vec3(8, 11, 0.5));
				var hutwall3Body = new CANNON.Body({mass: 0});
				hutwall3Body.addShape(hutwall3Shape);
				hutwall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutwall3Body.position.set(162, 8, -83);
				world.addBody(hutwall3Body);

				var hutwall4Shape = new CANNON.Box(new CANNON.Vec3(4, 11, 0.5));
				var hutwall4Body = new CANNON.Body({mass: 0});
				hutwall4Body.addShape(hutwall4Shape);
				hutwall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutwall4Body.position.set(161, 8, -66);
				world.addBody(hutwall4Body);

				var hutwall5Shape = new CANNON.Box(new CANNON.Vec3(2, 11, 0.5));
				var hutwall5Body = new CANNON.Body({mass: 0});
				hutwall5Body.addShape(hutwall5Shape);
				hutwall5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -170);
				hutwall5Body.position.set(151, 8, -69);
				world.addBody(hutwall5Body);

				var huttreeShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
				var huttreeBody = new CANNON.Body({mass: 0});
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
        var chassisBody = new CANNON.Body({mass: 0});
        chassisBody.addShape(chassisShape);
        chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -70);
        chassisBody.position.set(41, 4, -41);
        chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
        world.addBody(chassisBody);

				var boardwalkShape = new CANNON.Box(new CANNON.Vec3(45, 5, 5));
				var boardwalkBody = new CANNON.Body({mass: 0});
				boardwalkBody.addShape(boardwalkShape);
				boardwalkBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boardwalkBody.position.set(-48, -1, 37);
				world.addBody(boardwalkBody);

				var boardwalk2Shape = new CANNON.Box(new CANNON.Vec3(5, 30, 5));
				var boardwalk2Body = new CANNON.Body({mass: 0});
				boardwalk2Body.addShape(boardwalk2Shape);
				boardwalk2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boardwalk2Body.position.set(-88, -1, 37);
				world.addBody(boardwalk2Body);

				var boatShape = new CANNON.Box(new CANNON.Vec3(15, 25, 9));
				var boatBody = new CANNON.Body({mass: 0});
				boatBody.addShape(boatShape);
				boatBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.1);
				boatBody.position.set(-45, 0, 66);
				world.addBody(boatBody);

				var boat2Shape = new CANNON.Box(new CANNON.Vec3(6, 25, 6));
				var boat2Body = new CANNON.Body({mass: 0});
				boat2Body.addShape(boat2Shape);
				boat2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.9);
				boat2Body.position.set(-28, 0, 67);
				world.addBody(boat2Body);

				var boat3Shape = new CANNON.Box(new CANNON.Vec3(5, 25, 5));
				var boat3Body = new CANNON.Body({mass: 0});
				boat3Body.addShape(boat3Shape);
				boat3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.95);
				boat3Body.position.set(-70, 0, 63);
				world.addBody(boat3Body);

				var boat4Shape = new CANNON.Box(new CANNON.Vec3(9, 25, 7.5));
				var boat4Body = new CANNON.Body({mass: 0});
				boat4Body.addShape(boat4Shape);
				boat4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.1);
				boat4Body.position.set(-61, 0, 64);
				world.addBody(boat4Body);

				var treefree1Shape = new CANNON.Box(new CANNON.Vec3(1.2, 1.2, 16));
				var treefree1Body = new CANNON.Body({mass: 0});
				treefree1Body.addShape(treefree1Shape);
				treefree1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				treefree1Body.position.set(47, 15, 61);
				treefree1Body.angularVelocity.set(0, 0, 0);
				world.addBody(treefree1Body);

				var treefree2Shape = new CANNON.Box(new CANNON.Vec3(1.8, 1.8, 16));
				var treefree2Body = new CANNON.Body({mass: 0});
				treefree2Body.addShape(treefree2Shape);
				treefree2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				treefree2Body.position.set(103, 15, 11);
				treefree2Body.angularVelocity.set(0, 0, 0);
				world.addBody(treefree2Body);

				var treespiderislandShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
				var treespiderislandBody = new CANNON.Body({mass: 0});
				treespiderislandBody.addShape(treespiderislandShape);
				treespiderislandBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				treespiderislandBody.position.set(-68, 15, -195);
				treespiderislandBody.angularVelocity.set(0, 0, 0);
				world.addBody(treespiderislandBody);

				var treeemeraldShape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
				var treeemeraldBody = new CANNON.Body({mass: 0});
				treeemeraldBody.addShape(treeemeraldShape);
				treeemeraldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				treeemeraldBody.position.set(32, 15, 5);
				treeemeraldBody.angularVelocity.set(0, 0, 0);
				world.addBody(treeemeraldBody);

				var treeemerald2Shape = new CANNON.Box(new CANNON.Vec3(1, 1, 16));
				var treeemerald2Body = new CANNON.Body({mass: 0});
				treeemerald2Body.addShape(treeemerald2Shape);
				treeemerald2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				treeemerald2Body.position.set(97, 15, 101);
				treeemerald2Body.angularVelocity.set(0, 0, 0);
				world.addBody(treeemerald2Body);

				const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );



      }
      if (worldId==3) {

				var world3wall1Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
				var world3wall1Body = new CANNON.Body({mass: 0});
				world3wall1Body.addShape(world3wall1Shape);
				world3wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world3wall1Body.position.set(348, 0, 0);
				world.addBody(world3wall1Body);

				var world3wall2Shape = new CANNON.Box(new CANNON.Vec3(400, 200, 1));
				var world3wall2Body = new CANNON.Body({mass: 0});
				world3wall2Body.addShape(world3wall2Shape);
				world3wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world3wall2Body.position.set(-145, 0, 0);
				world.addBody(world3wall2Body);

				//west wall
				var world3wall3Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
				var world3wall3Body = new CANNON.Body({mass: 0});
				world3wall3Body.addShape(world3wall3Shape);
				world3wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world3wall3Body.position.set(0, 0, -260);
				world.addBody(world3wall3Body);

				// east wall
				var world3wall4Shape = new CANNON.Box(new CANNON.Vec3(1, 200, 400));
				var world3wall4Body = new CANNON.Body({mass: 0});
				world3wall4Body.addShape(world3wall4Shape);
				world3wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
				world3wall4Body.position.set(0, 0, 245);
				world.addBody(world3wall4Body);

				var mushroom2943Shape = new CANNON.Box(new CANNON.Vec3(0.7, 0.7, 6));
				var mushroom2943Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				mushroom2943Body.addShape(mushroom2943Shape);
				mushroom2943Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, -0.2, 0), -Math.PI / 2);
				mushroom2943Body.position.set(77, 25, 0);
				mushroom2943Body.angularVelocity.set(0, 0, 0);
				world.addBody(mushroom2943Body);

				var mushroomgrootShape = new CANNON.Box(new CANNON.Vec3(1, 1, 6));
				var mushroomgrootBody = new CANNON.Body({mass: 0, material: physicsMaterial});
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

				var cliff1Shape = new CANNON.Box(new CANNON.Vec3(10, 4, 19));
				var cliff1Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff1Body.addShape(cliff1Shape);
				cliff1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
				cliff1Body.position.set(103, 18, -19);
				cliff1Body.angularVelocity.set(0, 0, 0);
				world.addBody(cliff1Body);

				var cliff1aShape = new CANNON.Box(new CANNON.Vec3(9, 4, 9));
				var cliff1aBody = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff1aBody.addShape(cliff1aShape);
				cliff1aBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
				cliff1aBody.position.set(98, 19.7, -8);
				cliff1aBody.angularVelocity.set(0, 0, 0);
				world.addBody(cliff1aBody);

				var cliff2Shape = new CANNON.Box(new CANNON.Vec3(4, 6, 5));
				var cliff2Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff2Body.addShape(cliff2Shape);
				cliff2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.3);
				cliff2Body.position.set(98, 15, -4);
				cliff2Body.angularVelocity.set(0, 0, 0);
				world.addBody(cliff2Body);

				var cliff3Shape = new CANNON.Box(new CANNON.Vec3(4, 4, 4));
				var cliff3Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff3Body.addShape(cliff3Shape);
				cliff3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
				cliff3Body.position.set(114, 18.5, -23);
				cliff3Body.angularVelocity.set(0, 0, 0);
				world.addBody(cliff3Body);

				var cliff4Shape = new CANNON.Box(new CANNON.Vec3(3, 4, 4));
				var cliff4Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff4Body.addShape(cliff4Shape);
				cliff4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.55);
				cliff4Body.position.set(117, 14, -19);
				world.addBody(cliff4Body);

				var cliff5Shape = new CANNON.Box(new CANNON.Vec3(11, 10, 11));
				var cliff5Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff5Body.addShape(cliff5Shape);
				cliff5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
				cliff5Body.position.set(75, 16, -47);
				world.addBody(cliff5Body);

				var cliff6Shape = new CANNON.Box(new CANNON.Vec3(2, 10, 11));
				var cliff6Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff6Body.addShape(cliff6Shape);
				cliff6Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.4);
				cliff6Body.position.set(80, 15, -34);
				world.addBody(cliff6Body);

				var cliff7Shape = new CANNON.Box(new CANNON.Vec3(3.5, 10, 4));
				var cliff7Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff7Body.addShape(cliff7Shape);
				cliff7Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
				cliff7Body.position.set(103, 14, -41);
				world.addBody(cliff7Body);

				var cliff8Shape = new CANNON.Box(new CANNON.Vec3(5, 10, 5));
				var cliff8Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff8Body.addShape(cliff8Shape);
				cliff8Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
				cliff8Body.position.set(99, 16, -50);
				world.addBody(cliff8Body);

				var cliff9Shape = new CANNON.Box(new CANNON.Vec3(10, 10, 5));
				var cliff9Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff9Body.addShape(cliff9Shape);
				cliff9Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.1);
				cliff9Body.position.set(89, 16, -49);
				world.addBody(cliff9Body);

				var cliff10Shape = new CANNON.Box(new CANNON.Vec3(5, 10, 4));
				var cliff10Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff10Body.addShape(cliff10Shape);
				cliff10Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.1);
				cliff10Body.position.set(85, 16, -40);
				world.addBody(cliff10Body);

				var cliff11Shape = new CANNON.Box(new CANNON.Vec3(2.5, 10, 3.5));
				var cliff11Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff11Body.addShape(cliff11Shape);
				cliff11Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
				cliff11Body.position.set(104, 16, -51);
				world.addBody(cliff11Body);

				var cliff12Shape = new CANNON.Box(new CANNON.Vec3(3, 10, 7.5));
				var cliff12Body = new CANNON.Body({mass: 0, material: physicsMaterial});
				cliff12Body.addShape(cliff12Shape);
				cliff12Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.55);
				cliff12Body.position.set(115, 11, -27);
				world.addBody(cliff12Body);


				var cliff13Shape = new CANNON.Box(new CANNON.Vec3(2, 16, 6));
				var cliff13Body = new CANNON.Body({mass: 0, material: physicsMaterial});
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
				var cliff15Body = new CANNON.Body({mass: 0, material: physicsMaterial});
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
				var boomBody = new CANNON.Body({mass: 0});
				boomBody.addShape(boomShape);
				boomBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boomBody.position.set(333, 16, -157);
				boomBody.angularVelocity.set(0, 0, 0);
				world.addBody(boomBody);

				var boom2Shape = new CANNON.Box(new CANNON.Vec3(2.8, 2.8, 16));
				var boom2Body = new CANNON.Body({mass: 0});
				boom2Body.addShape(boom2Shape);
				boom2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boom2Body.position.set(288, 33, 189);
				boom2Body.angularVelocity.set(0, 0, 0);
				world.addBody(boom2Body);

				var boom3Shape = new CANNON.Box(new CANNON.Vec3(4.3, 4.3, 16));
				var boom3Body = new CANNON.Body({mass: 0});
				boom3Body.addShape(boom3Shape);
				boom3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boom3Body.position.set(182, 33, 194);
				boom3Body.angularVelocity.set(0, 0, 0);
				world.addBody(boom3Body);

				var boom4Shape = new CANNON.Box(new CANNON.Vec3(3.6, 3.6, 16));
				var boom4Body = new CANNON.Body({mass: 0});
				boom4Body.addShape(boom4Shape);
				boom4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boom4Body.position.set(19, 28, 152);
				boom4Body.angularVelocity.set(0, 0, 0);
				world.addBody(boom4Body);

				var boom5Shape = new CANNON.Box(new CANNON.Vec3(4.5, 4.5, 16));
				var boom5Body = new CANNON.Body({mass: 0});
				boom5Body.addShape(boom5Shape);
				boom5Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
				boom5Body.position.set(-117, 32, -158);
				boom5Body.angularVelocity.set(0, 0, 0);
				world.addBody(boom5Body);


      }
      if (worldId==4) {
        // Create a plane
        // var groundShape = new CANNON.Plane();
        // groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // groundBody.addShape(groundShape);
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        // groundBody.position.set(0, 0, 0);
        // world.addBody(groundBody);

        //box shapes:
        var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1, 3.2));
        var chassisBody = new CANNON.Body({mass: 0});
        chassisBody.addShape(chassisShape);
        //chassisBody.position.set(0, 0, 0);
        chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        chassisBody.position.set(20, 4, -40);
        chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
        world.addBody(chassisBody);

        var chickShape = new CANNON.Box(new CANNON.Vec3(3, 1, 4));
        var chickBody = new CANNON.Body({mass: 0});
        chickBody.addShape(chickShape);
      }
      // bodies.push(body);
}

function init() {

			cssSteps();


   camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
   camera.position.z = 1;

   //var game = this;
   var white = "rgb(255,255,255)";
   scene = new THREE.Scene(white);

   scene.background = new THREE.Color(white);
   raycaster = new THREE.Raycaster();

  //  var ambient = new THREE.AmbientLight(0xffffff, 0.7);
  //  scene.add(ambient);

   //louisa's code: onclick (window is placeholder for what should be clicked) makes it appear:
   //if (boolcrittercaught = false){
     window.addEventListener("mousedown", function(){
       //gltf.scene.visible = !gltf.scene.visible;
       //count+=1;
       boolMouseClick = true;
       //document.getElementById("btn").innerHTML = count;
       //console.log( "mousedown Event" );
       //boolcrittercaught = true;
     });
   //}


   skybox();
   addCharacters();
   modelLoader();
	 //soundGo();

   //modelLoaderAnimate();

   //controls
   //controls = new PointerLockControls(camera, sphereBody);
   //var cannonDebugRenderer = new CannonDebugRenderer( scene, world );

   controls = new PointerLockControls(camera, sphereBody)

   if (debug ==true) {
   cannonDebugRenderer = new CannonDebugRenderer( scene, world );
   }

   scene.add(controls.getObject())

   renderer = new THREE.WebGLRenderer( { antialias: true } );
   renderer.setSize( window.innerWidth, window.innerHeight );
   document.body.appendChild( renderer.domElement );


   renderer.setPixelRatio( window.devicePixelRatio );

   renderer.toneMapping = THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure = 1;
   renderer.outputEncoding = THREE.sRGBEncoding;


}

function skybox(){
let materialArray = [];
let texture_ft;
let texture_bk;
let texture_up;
let texture_dn;
let texture_rt;
let texture_lf;

  if (worldId==1) {
  texture_ft = new THREE.TextureLoader().load('skybox/blizzard4_ft.png');
  texture_bk = new THREE.TextureLoader().load('skybox/blizzard4_bk.png');
  texture_up = new THREE.TextureLoader().load('skybox/blizzard4_up.png');
  texture_dn = new THREE.TextureLoader().load('skybox/blizzard4_dn.png');
  texture_rt = new THREE.TextureLoader().load('skybox/blizzard4_rt.png');
  texture_lf = new THREE.TextureLoader().load('skybox/blizzard4_lf.png');
  }else if (worldId==2) {
  texture_ft = new THREE.TextureLoader().load('skybox/blizzard2_ft.png');
  texture_bk = new THREE.TextureLoader().load('skybox/blizzard2_bk.png');
  texture_up = new THREE.TextureLoader().load('skybox/blizzard2_up.png');
  texture_dn = new THREE.TextureLoader().load('skybox/blizzard2_dn.png');
  texture_rt = new THREE.TextureLoader().load('skybox/blizzard2_rt.png');
  texture_lf = new THREE.TextureLoader().load('skybox/blizzard2_lf.png');
  }else if (worldId==3) {
  texture_ft = new THREE.TextureLoader().load('skybox/blizzard3_ft.png');
  texture_bk = new THREE.TextureLoader().load('skybox/blizzard3_bk.png');
  texture_up = new THREE.TextureLoader().load('skybox/blizzard3_up.png');
  texture_dn = new THREE.TextureLoader().load('skybox/blizzard3_dn.png');
  texture_rt = new THREE.TextureLoader().load('skybox/blizzard3_rt.png');
  texture_lf = new THREE.TextureLoader().load('skybox/blizzard3_lf.png');
  }else if (worldId==4) {
  texture_ft = new THREE.TextureLoader().load('skybox/blizzard_ft.jpg');
  texture_bk = new THREE.TextureLoader().load('skybox/blizzard_bk.jpg');
  texture_up = new THREE.TextureLoader().load('skybox/blizzard_up.jpg');
  texture_dn = new THREE.TextureLoader().load('skybox/blizzard_dn.jpg');
  texture_rt = new THREE.TextureLoader().load('skybox/blizzard_rt.jpg');
  texture_lf = new THREE.TextureLoader().load('skybox/blizzard_lf.jpg');
  }
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

  for (var i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
  }

  let skyboxGeo = new THREE.BoxGeometry(10000,10000,10000);
  let skybox = new THREE.Mesh(skyboxGeo,materialArray);

  scene.add(skybox);
  }

function objectLoader(){

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

function modelLoader(){


    if (worldId==1) {

      var ambient = new THREE.AmbientLight(0xd5c3e8, 0.2);
      scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight( 0xd5c3e8, 0.3 );
      scene.add( directionalLight );

      const color = 0xd5c3e8;  // purple
      const near = 10;
      const far = 6000;
      scene.fog = new THREE.Fog(color, near, far);

    let model1, model2, model3, model4,model5, model6, model7, model8;
    //add names and locations of models here #SUUS
    let p1 = loadModel('models/druid-winter-scene/winter.gltf').then(result => {  model1 = result.scene.children[0]; });
    let p2 = loadModel('models/arbol/arbol.gltf').then(result => {  model2 = result.scene.children[0]; });
    let p3 = loadModel('models/purple-crystal/purple-crystal.gltf').then(result => {  model3 = result.scene.children[0]; });
    let p4 = loadModel('models/island.glb').then(result => {  model4 = result.scene.children[0]; });
    let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
    let p6 = loadModel('models/portal/portal.gltf').then(result => {  model6 = result.scene.children[0]; });
    let p7 = loadModel('models/stars/stars.gltf').then(result => {  model7 = result.scene.children[0]; });
    let p8 = loadModel('models/AnimationModels/Robot.glb').then(result => {  model8 = result.scene.children[0]; });

    function loadModel(url) {
    return new Promise(resolve => {
        new GLTFLoader(manager).load(url, resolve);
        });
    }

    
    const loader = new GLTFLoader()

    loader.load('models/critters/world1/pleunhand.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(300,10,50);
      gltf.scene.scale.set(3,3,3);
      scene.add(gltf.scene);
  
    }
    );

    loader.load('models/critters/world1/pleunleg.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(-30,-2,-120);
      gltf.scene.scale.set(3,3,3);
      scene.add(gltf.scene);
  
    }
    );

    loader.load('models/critters/world1/levi.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(80,20,-20);
      gltf.scene.scale.set(3,3,3);
      gltf.scene.rotation.set(0,255,0);
      scene.add(gltf.scene);
  
    }
    );

    loader.load('models/critters/world1/vanessa.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(100,2,320);
      gltf.scene.scale.set(6,6,6);
      scene.add(gltf.scene);
  
    }
    );

    loader.load('models/critters/world1/pien-bouquet.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(-96,4,0);
      gltf.scene.scale.set(1,1,1);
      scene.add(gltf.scene);
  
    }
    );

    loader.load('models/critters/world1/carmen-phone-new.glb', (gltf)  => {
      gltf.scene.traverse( function( object ) {
      object.frustumCulled = false;
  
  
      } );
      gltf.scene.position.set(50,15,-200);
      gltf.scene.scale.set(2,2,2);
      gltf.scene.rotation.set(45,0,0);
      scene.add(gltf.scene);
  
    }
    );

    Promise.all([p1,p2,p3,p4,p5, p6, p7,p8]).then(() => {

        var scaleSizeModel1 = 1;
        model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
        model1.position.set(100,20,-20);
        //model1.rotation.x = Math.PI/2;

        var scaleSizeModel2 = 400;
        model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
        model2.position.set(100,-200,0);
        //model2.rotation.x = Math.PI/2;

        var scaleSizeModel3 = 100;
        model3.scale.set(scaleSizeModel3,scaleSizeModel3,scaleSizeModel3);
        model3.position.set(100,10,0);
        //model3.rotation.x = Math.PI/2;

        var scaleSizeModel4 = 40;
        model4.scale.set(scaleSizeModel4,scaleSizeModel4,scaleSizeModel4);
        model4.position.set(100,-10,0);
        model4.rotation.x = Math.PI/2;
        //add amount of model mods here here #SUUS
        //model3.position.set(0,50,0);
        //add model to the scene

        var scaleSizeModel6 = 4;
        model6.scale.set(scaleSizeModel6,scaleSizeModel6,scaleSizeModel6);
        model6.position.set(80,-500,0);
        //model6.rotation.x = Math.PI/2;

        var scaleSizeModel7 = 10;
        model7.scale.set(scaleSizeModel7,scaleSizeModel7,scaleSizeModel7);
        model7.position.set(50, 70,-50);

        var scaleSizeModel8 = 2000;
        model8.scale.set(scaleSizeModel8,scaleSizeModel8,scaleSizeModel8);
        model8.position.set(150, -50, -10);
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
    }
    );
    }
		if (worldId==2) {


      var ambient = new THREE.AmbientLight(0xb5580d, 0.7);
      scene.add(ambient);

      const light = new THREE.PointLight( 0xb5580d, 0.5, 100 );
      light.position.set( 50, 50, 50 );
      scene.add( light );

      const directionalLight = new THREE.DirectionalLight( 0x2261ab, 0.3 );
      scene.add( directionalLight );

      const color = 0x2261ab;  // blue
      const near = 40;
      const far = 350;
      scene.fog = new THREE.Fog(color, near, far);


      let model1, model2, model3, model4,model5, model6, model7, model8, model9, model10, model11, model12, model13, model14;

      //add names and locations of models here #SUUS
      let p1 = loadModel('models/nature-tree3/scene.gltf').then(result => {  model1 = result.scene.children[0]; });
      let p2 = loadModel('models/lighthouse-island/lighthouse-island.gltf').then(result => {  model2 = result.scene.children[0]; });
      let p3 = loadModel('models/nature-tree/scene.gltf').then(result => {  model3 = result.scene.children[0]; });
      let p4 = loadModel('models/island.glb').then(result => {  model4 = result.scene.children[0]; });
      let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
      let p6 = loadModel('models/rocks/rocks.gltf').then(result => {  model6 = result.scene.children[0]; });
      let p7 = loadModel('models/stars/stars.gltf').then(result => {  model7 = result.scene.children[0]; });
      let p8 = loadModel('models/fishing-boat/fishing.gltf').then(result => {  model8 = result.scene.children[0]; });
      let p9 = loadModel('models/hut/hut.gltf').then(result => {  model9 = result.scene.children[0]; });
      let p10 = loadModel('models/nature-tree3/scene.gltf').then(result => {  model10 = result.scene.children[0]; });
			let p11 = loadModel('models/cartoon_boardwalk_large_t/scene.gltf').then(result => {  model11 = result.scene.children[0]; });
			let p12 = loadModel('models/nature-tree3/scene.gltf').then(result => {  model12 = result.scene.children[0]; });
			let p13 = loadModel('models/low_poly_tree/scene.gltf').then(result => {  model13 = result.scene.children[0]; });
			let p14 = loadModel('models/low_poly_tree/scene.gltf').then(result => {  model14 = result.scene.children[0]; });


      function loadModel(url) {
      return new Promise(resolve => {
          new GLTFLoader(manager).load(url, resolve);
          });
      }


      Promise.all([p1,p2,p3,p4,p5, p6, p7, p8,p9,p10,p11, p12, p13, p14]).then(() => {

					let theResult = model2.getObjectByName("Plane", true);
										theResult.visible = false;

					let theResult2 = model2.getObjectByName("water", true);
										theResult2.visible = false;

					let theResult3 = model2.getObjectByName("Cube011_rocks_0", true);
										theResult3.visible = false;

					let theResult4 = model2.getObjectByName("Cube007_rocks_0", true);
										theResult4.visible = false;


          var scaleSizeModel1 = 5;
          model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
          model1.position.set(180,32,-50);
          //model1.rotation.x = Math.PI/2;

          var scaleSizeModel2 = 1;
          model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
          model2.position.set(165,-68,85);
          model2.rotation.z = -0.4;

          var scaleSizeModel3 = 5;
          model3.scale.set(scaleSizeModel3,scaleSizeModel3,scaleSizeModel3);
          model3.position.set(100,44,10);
          //model3.rotation.x = Math.PI/2;

          var scaleSizeModel6 = 40;
          model6.scale.set(scaleSizeModel6,scaleSizeModel6,scaleSizeModel6);
          model6.position.set(50, 25,-40);
          model6.rotation.z = 10;

          var scaleSizeModel7 = 10;
          model7.scale.set(scaleSizeModel7,scaleSizeModel7,scaleSizeModel7);
          model7.position.set(50, 70-adjustHeigth,-50);
          //model6.rotation.x = Math.PI/2;

          var scaleSizeModel8 = 0.1;
          model8.scale.set(scaleSizeModel8,scaleSizeModel8,scaleSizeModel8);
          model8.position.set(-50, 0, 65);
          model8.rotation.z = 80;

          var scaleSizeModel9 = 0.06;
          model9.scale.set(scaleSizeModel9,scaleSizeModel9,scaleSizeModel9);
          model9.position.set(160, 6, -75);
          model9.rotation.z = -170;

          var scaleSizeModel10 = 5;
          model10.scale.set(scaleSizeModel10,scaleSizeModel10,scaleSizeModel10);
          model10.position.set(50, 38, 60);
          //model6.rotation.x = Math.PI/2;

					var scaleSizeModel11 = 1;
          model11.scale.set(scaleSizeModel11,scaleSizeModel11,scaleSizeModel11);
          model11.position.set(-30, 0, 40);

					var scaleSizeModel12 = 4;
					model12.scale.set(scaleSizeModel12,scaleSizeModel12,scaleSizeModel12);
					model12.position.set(-65, 28, -195);
					model12.rotation.z = 50;

					var scaleSizeModel13 = 8;
          model13.scale.set(scaleSizeModel13,scaleSizeModel13,scaleSizeModel13);
          model13.position.set(35, 0, 5);
					model13.rotation.z = 50;

					var scaleSizeModel14 = 8;
          model14.scale.set(scaleSizeModel14,scaleSizeModel14,scaleSizeModel14);
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
    if (worldId==3) {

      var ambient = new THREE.AmbientLight(0x477a79, 0.4);
      scene.add(ambient);

      // const light = new THREE.PointLight( 0x477a79, 1, 10 );
      // light.position.set( 100, 50, 50 );
      // scene.add( light );

      const color = 0xdff0eb;  // greenish
      const near = 50;
      const far = 500;
      scene.fog = new THREE.Fog(color, near, far);

			let model1, model2, model3, model4,model5, model6, model7;

      //add names and locations of models here #SUUS
      let p1 = loadModel('models/forest-scene/forest.gltf').then(result => {  model1 = result.scene.children[0]; });
      let p2 = loadModel('models/space/scene.gltf').then(result => {  model2 = result.scene.children[0]; });
      let p3 = loadModel('models/stump/tree-stump.gltf').then(result => {  model3 = result.scene.children[0]; });
      let p4 = loadModel('models/island.glb').then(result => {  model4 = result.scene.children[0]; });
      let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
      let p6 = loadModel('models/mushroom/mushroom.gltf').then(result => {  model6 = result.scene.children[0]; });
      let p7 = loadModel('models/oak/tree.gltf').then(result => {  model7 = result.scene.children[0]; });


			const loader = new GLTFLoader()

			// alondra tree
			loader.load('models/critters/world3/alondra.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
			} );1
				gltf.scene.position.set(240,0.2,-50);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,0.6,0);
				scene.add(gltf.scene);
			}
			);

			// stan piano
			loader.load('models/critters/world3/stan.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(270,24.6,160);
				gltf.scene.scale.set(0.7,0.7,0.7);
				gltf.scene.rotation.set(0,0.6,0);
				scene.add(gltf.scene);
			}
			);

			// nathalie like buttons

			// nathalie queen critter
			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(186,47,180);
				gltf.scene.scale.set(0.1,0.1,0.1);
				gltf.scene.rotation.set(0,0,-1.55);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(190,48,165);
				gltf.scene.scale.set(0.06,0.06,0.06);
				gltf.scene.rotation.set(0,0.6,-1.55);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(159.5,42,150);
				gltf.scene.scale.set(0.1,0.1,0.1);
				gltf.scene.rotation.set(0,0.8,-1.55);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(167,90,200.5);
				gltf.scene.scale.set(0.1,0.1,0.1);
				gltf.scene.rotation.set(0,-0.3,-1.55);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(196.7,97,145);
				gltf.scene.scale.set(0.06,0.06,0.06);
				gltf.scene.rotation.set(0,1,-1.55);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/world3/nathalie2.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(160,55,204);
				gltf.scene.scale.set(0.07,0.07,0.07);
				gltf.scene.rotation.set(0,-0.8,-1.55);
				scene.add(gltf.scene);
			}
			);

			// Lara cloth ghosts
			loader.load('models/critters/lara.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(5,5,100);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,0,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/lara.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(12,3.2,90);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,4,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/lara.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(3,3.5,75);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,7,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/lara.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(4,-0.5,85);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,8,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/lara.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(-5,3,90);
				gltf.scene.scale.set(3,3,3);
				gltf.scene.rotation.set(0,17,0);
				scene.add(gltf.scene);
			}
			);




			// Inwoo apples
			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(32,20,-170);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(2,0,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(54,15,-175);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(0,0,7);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(90,17.5,-155);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(0,3,2);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(42,12,-150);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(0,0,1);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(62,16,-163);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(30,2,0);
				scene.add(gltf.scene);
			}
			);

			loader.load('models/critters/inwoo.glb', (gltf)  => {
				gltf.scene.traverse( function( object ) {
				object.frustumCulled = false;
				} );

				gltf.scene.position.set(119,93,-110);
				gltf.scene.scale.set(17,17,17);
				gltf.scene.rotation.set(0,0,0);
				scene.add(gltf.scene);
			}
			);

      function loadModel(url) {
        return new Promise(resolve => {
          new GLTFLoader(manager).load(url, resolve);
          });
      }

      Promise.all([p1,p2,p3,p4,p5,p6,p7]).then(() => {
				let theResult = model1.getObjectByName("Plane_0", true);
					theResult.visible = false;

				let theResult2 = model1.getObjectByName("Plane378_0", true);
					theResult2.position.set(0,0,0.2);

				let theResult3 = model1.getObjectByName("Plane371_0", true);
					theResult3.visible = false;

				let theResult4 = model1.getObjectByName("Plane370_0", true);
					theResult4.visible = false;

				let theResult5 = model1.getObjectByName("Cylinder065_Cylinder070_0", true);
					theResult5.position.set(0,-0.2,-2);

        var scaleSizeModel1 = 35;
        model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
				//model1.position.set(20,-9,25);
        model1.position.set(100,-5,0);
        //model1.rotation.x = Math.PI/2;

        var scaleSizeModel2 = 4000;
        model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
        // model2.position.set(10,50,0);
				model2.position.set(90,50,25);
        //model2.rotation.x = Math.PI/2;

        var scaleSizeModel3 = 3;
        model3.scale.set(scaleSizeModel3,scaleSizeModel3,scaleSizeModel3);
        model3.position.set(100,-3,0);
        //model3.rotation.x = Math.PI/2;

        var scaleSizeModel4 = 400;
        model4.scale.set(scaleSizeModel4,scaleSizeModel4,scaleSizeModel4);
        // model4.position.set(50,-10,0);
				model4.position.set(130,-10,25);
        model4.rotation.x = Math.PI/2;
        //add amount of model mods here here #SUUS
        //model3.position.set(0,50,0);
        //add model to the scene

        var scaleSizeModel6 = 9;
        model6.scale.set(scaleSizeModel6,scaleSizeModel6,scaleSizeModel6);
        model6.position.set(80,14,0);
        //model6.rotation.x = Math.PI/2;

        var scaleSizeModel7 = 50;
        model7.scale.set(scaleSizeModel7,scaleSizeModel7,scaleSizeModel7);
        model7.position.set(100,10,-200);
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
    if (worldId==4){

      var ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      // const light = new THREE.PointLight( 0x400318, 1, 100 );
      // light.position.set( 20, 10, 50 );
      // scene.add( light );

      const directionalLight = new THREE.DirectionalLight( 0x400318, 0.3 );
      scene.add( directionalLight );

      const color = 0x400318;  // dark-red
      const near = 10;
      const far = 3000;
      scene.fog = new THREE.Fog(color, near, far);

      let model1, model2, model3, model4,model5, model6;

      //add names and locations of models here #SUUS
      let p1 = loadModel('models/crystal-cave/crystal-cave.gltf').then(result => {  model1 = result.scene.children[0]; });
      let p2 = loadModel('models/crystal/crystal.gltf').then(result => {  model2 = result.scene.children[0]; });
      let p3 = loadModel('models/skybox/skybox.gltf').then(result => {  model3 = result.scene.children[0]; });
      let p4 = loadModel('models/island.glb').then(result => {  model4 = result.scene.children[0]; });
      let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
      let p6 = loadModel('models/gemstone-02/gem.gltf').then(result => {  model6 = result.scene.children[0]; });


      function loadModel(url) {
        return new Promise(resolve => {
          new GLTFLoader(manager).load(url, resolve);
          });
      }

      const loader = new GLTFLoader()
      
      loader.load('models/critters/world4/yifan.glb', (gltf)  => {
        gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
    
    
        } );
        gltf.scene.position.set(10,30,0);
        gltf.scene.scale.set(10,10,10);
        scene.add(gltf.scene);
    
      }
      );

      loader.load('models/critters/world4/valentine.glb', (gltf)  => {
        gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
    
    
        } );
        gltf.scene.position.set(245,5,0);
        gltf.scene.scale.set(0.7,0.7,0.7);
        scene.add(gltf.scene);
    
      }
      );

      loader.load('models/critters/world4/minhong.glb', (gltf)  => {
        gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
    
    
        } );
        gltf.scene.position.set(0,0,100);
        gltf.scene.scale.set(3.5,3.5,3.5);
        scene.add(gltf.scene);
    
      }
      );

      loader.load('models/critters/world4/emily.glb', (gltf)  => {
        gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
    
    
        } );
        gltf.scene.position.set(-180,30,-200);
        gltf.scene.scale.set(5,5,5);
        scene.add(gltf.scene);
    
      }
      );

      loader.load('models/critters/world4/benjamin-anim.glb', (gltf)  => {

        gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
        } );
        gltf.scene.position.set(120,0,-200);
        gltf.scene.scale.set(80,80,80);
        scene.add(gltf.scene);

      }
      );

      Promise.all([p1,p2,p3,p4,p5, p6]).then(() => {
        var scaleSizeModel1 = 2;
        model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
        model1.position.set(20,50,0);
        //model1.rotation.x = Math.PI/2;

        var scaleSizeModel2 = 400;
        model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
        model2.position.set(100,400,0);
        //model2.rotation.x = Math.PI/2;

        var scaleSizeModel3 = 20;
        model3.scale.set(scaleSizeModel3,scaleSizeModel3,scaleSizeModel3);
        model3.position.set(0,-10,0);
        //model3.rotation.x = Math.PI/2;

        var scaleSizeModel4 = 400;
        model4.scale.set(scaleSizeModel4,scaleSizeModel4,scaleSizeModel4);
        model4.position.set(500,-100,0);
        // model4.rotation.x = Math.PI/2;

        //add amount of model mods here here #SUUS
        //model3.position.set(0,50,0);
        //add model to the scene

        var scaleSizeModel6 = 100;
        model6.scale.set(scaleSizeModel6,scaleSizeModel6,scaleSizeModel6);
        model6.position.set(100,40,0);
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

function addCharacters(){

	const loader = new GLTFLoader()

  loader.load('models/critters/spider.glb', (gltf)  => {
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;


    } );
    gltf.scene.position.set(1,3,1);
    scene.add(gltf.scene);

  }
  );

  loader.load('models/critters/spider-core.glb', (gltf)  => {
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;


    } );
    gltf.scene.position.set(1,0.5,1);
    scene.add(gltf.scene);

  }
  );

  new RGBELoader()
  .setDataType( THREE.UnsignedByteType )
  .setPath( 'textures/equirectangular/' )
  .load( 'venice_sunset_1k.hdr', function ( texture ) {

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
    const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

    scene.background = envMap;
    scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();

    render();

    // model

    // use of RoughnessMipmapper is optional
    const roughnessMipmapper = new RoughnessMipmapper( renderer );

    const loader = new GLTFLoader().setPath( 'models/critters/' );
    loader.load( 'adam-gloss.glb', function ( gltf ) {
      mixer = new THREE.AnimationMixer( gltf.scene );
      gltf.animations;
      jumpAction = mixer.clipAction( gltf.animations[ 0 ] )

      gltf.scene.traverse( function ( child ) {

        if ( child.isMesh ) {

          // TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
          // roughnessMipmapper.generateMipmaps( child.material );

        }

      } );
      gltf.scene.position.set(1,0.5,1);

      scene.add( gltf.scene );
      jumpAction.play();
      roughnessMipmapper.dispose();

      render();

    } );

  } );

	//this gives an error:
  //const myMaterial = new THREE.MeshNormalMaterial( { color: 0xffee00, refractionRatio: 0.95 }  );
	const myMaterial = new THREE.MeshNormalMaterial();
  loader.load('models/critters/spider.glb', (gltf)  => {


    mixer = new THREE.AnimationMixer( gltf.scene );
    jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;
    } );
    gltf.scene.position.set(1,0.5,1);

    scene.add(gltf.scene);
    jumpAction.play();
  }
  );
  loader.load('models/critters/spider-anim2.glb', (gltf)  => {


    mixer = new THREE.AnimationMixer( gltf.scene );
    jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;
    } );
    gltf.scene.position.set(3,1,4);
    gltf.scene.scale.set(0.1,0.1,0.1);
    scene.add(gltf.scene);
    jumpAction.play();
  }
  );

  loader.load('models/critters/spider-anim3.glb', (gltf)  => {


    mixer = new THREE.AnimationMixer( gltf.scene );
    jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;
    } );
    gltf.scene.position.set(10,1,2);
    gltf.scene.scale.set(1,1,1);
    scene.add(gltf.scene);
    jumpAction.play();
  }
  );

  loader.load('models/critters/spider-anim3.glb', (gltf)  => {
		mixer = new THREE.AnimationMixer( gltf.scene );
    jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )
    gltf.scene.traverse( function( object ) {
    object.frustumCulled = false;
    } );
    gltf.scene.position.set(-10,1,3);
    gltf.scene.scale.set(0.1,0.1,0.1);
    scene.add(gltf.scene);
    jumpAction.play();
  }
  );

  		loader.load('models/critters/'+objectName, (gltf)  => {
      mixer = new THREE.AnimationMixer( gltf.scene );
      //gltf.animations;
      //idleAction = mixer.clipAction( gltf.animations[ 1 ] )
      jumpAction =  mixer.clipAction( gltf.animations[ 0 ] )

      gltf.scene.traverse( function( object ) {
        object.frustumCulled = false;
      } );
      // gltf.scene.traverse((o) => {
	    //   if (o.isMesh) {
	    //     o.material.emissive = new THREE.Color( "rgb(194, 85, 226)" );
	    //   }
      // });
      scene.add(gltf.scene);
      // starts idle animation
      jumpAction.play();
    }, function ( xhr ) {
      if (xhr.loaded/xhr.total * 100 == 100) {
      console.log("finished loading characters!")
      }
  		//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  	},
  	// called when loading has errors
  	function ( error ) {
  		console.log( 'An error happened' );
  	}
  );
}

function soundGo(){

	const audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'sound/sound_1.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play();
	});

}

function LoadAnimatedModelAndPlay(path, modelFile, animFile, offset){
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
dt2 = (Date.now()-lastframe)/1000;

function animate() {
  //console.log("test");
  const numObjects = 14;
  const idToObject = {};

	cssStepsWalk();
  cursorCheck();

  if (debug ==true) {
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
  dt2 = (Date.now()-lastframe)/1000;
  if(mixer){
      mixer.update(dt2)
  }

  controls.update(Date.now() - time);
  renderer.render(scene, camera);
  lastframe=Date.now();
  time = Date.now();

  requestAnimationFrame(animate);
}


function cursorCheck(){
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( scene.children,true);
  // If only interested in one intersection, you can use .intersectObject()

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[0].object) {
      // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      //console.log("hit this = "+INTERSECTED.userData.index);
      var object = intersects[0].object;
      var material = object.material;
      var userD = object.userData;
      id = object.id;

      //material.color = new THREE.Color( Math.random(), Math.random(), Math.random());
      //console.log(model2.userData.STRING);
      if (checkObjId==true) {

				if (id==24||id==3157) {
					//console.log('mushroom!');
					boolMushroom = true;
				}else {
					boolMushroom = false;
				}

      	console.log('intersect!'+id);
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
      boolMouseOn = true;
      //pop up on hover:
      //trailer.style.visibility = "visible";
      //trailer.style.opacity = 1;
    }
  } else {
    //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    boolMouseOn = false;
    INTERSECTED = null;
  }


  //louisa's code, trying to make the pop up happen onclick of an object
  if(boolMouseOn == true && boolMouseClick == true ){
      //console.log("its a hit!");
      if (id == 192) {
      console.log("Caught a Bird");
      }
      if (id == 200 || id == 199) {
      console.log("Caught a Dino");
      }
      if (id == 209) {
      console.log("Caught an Upside Down World!");
      }
    // INTERSECTED.material.emissive.setHex( 0x0011ff )
    //video pop-up from html:
    //trailer.style.visibility = "visible";
    //trailer.style.opacity = 1;
  }
  //turn off mouseclick after possible event
  if (boolMouseClick== true) {
  boolMouseClick = false;
  }
}

function cssStepsWalk(){
		if (worldId==3) {
			if (boolMushroom==true) {
				js: document.getElementById("found").style.visibility = "visible";
				js: document.getElementById("hintsfade3").style.visibility = "hidden";
				js: document.getElementById("hintsfade3-2").style.visibility = "visible";
				//console.log("hii mushroompi");
			}else {
				js: document.getElementById("found").style.visibility = "hidden";
			}
		}
}

function cssSteps(){
	if (worldId==1) {
		js: document.getElementById("world1").style.visibility = "visible";
		js: document.getElementById("world2").style.visibility = "hidden";
		js: document.getElementById("world3").style.visibility = "hidden";
		js: document.getElementById("world4").style.visibility = "hidden";

		js: document.getElementById("instructions1").style.visibility = "visible";
		js: document.getElementById("instructions2").style.visibility = "hidden";
		js: document.getElementById("instructions3").style.visibility = "hidden";
		js: document.getElementById("instructions4").style.visibility = "hidden";

		js: document.getElementById("encyclo1").style.visibility = "visible";
		js: document.getElementById("encyclo2").style.visibility = "hidden";
		js: document.getElementById("encyclo3").style.visibility = "hidden";
		js: document.getElementById("encyclo-4").style.visibility = "hidden";

		js: document.getElementById("info1").style.visibility = "visible";
		js: document.getElementById("info2").style.visibility = "hidden";
		js: document.getElementById("info3").style.visibility = "hidden";
		js: document.getElementById("info4").style.visibility = "hidden";

	}else if (worldId==2) {
		js: document.getElementById("world1").style.visibility = "hidden";
		js: document.getElementById("world2").style.visibility = "visible";
		js: document.getElementById("world3").style.visibility = "hidden";
		js: document.getElementById("world4").style.visibility = "hidden";

		js: document.getElementById("instructions1").style.visibility = "hidden";
		js: document.getElementById("instructions2").style.visibility = "visible";
		js: document.getElementById("instructions3").style.visibility = "hidden";
		js: document.getElementById("instructions4").style.visibility = "hidden";

		js: document.getElementById("encyclo1").style.visibility = "hidden";
		js: document.getElementById("encyclo2").style.visibility = "visible";
		js: document.getElementById("encyclo3").style.visibility = "hidden";
		js: document.getElementById("encyclo-4").style.visibility = "hidden";

		js: document.getElementById("info1").style.visibility = "hidden";
		js: document.getElementById("info2").style.visibility = "visible";
		js: document.getElementById("info3").style.visibility = "hidden";
		js: document.getElementById("info4").style.visibility = "hidden";

	}else if (worldId==3) {
		js: document.getElementById("world1").style.visibility = "hidden";
		js: document.getElementById("world2").style.visibility = "hidden";
		js: document.getElementById("world3").style.visibility = "visible";
		js: document.getElementById("world4").style.visibility = "hidden";
		js: document.getElementById("hintsfade3").style.visibility = "visible";


		js: document.getElementById("instructions1").style.visibility = "hidden";
		js: document.getElementById("instructions2").style.visibility = "hidden";
		js: document.getElementById("instructions3").style.visibility = "visible";
		js: document.getElementById("instructions4").style.visibility = "hidden";

		js: document.getElementById("encyclo1").style.visibility = "hidden";
		js: document.getElementById("encyclo2").style.visibility = "hidden";
		js: document.getElementById("encyclo3").style.visibility = "visible";
		js: document.getElementById("encyclo-4").style.visibility = "hidden";

		js: document.getElementById("info1").style.visibility = "hidden";
		js: document.getElementById("info2").style.visibility = "hidden";
		js: document.getElementById("info3").style.visibility = "visible";
		js: document.getElementById("info4").style.visibility = "hidden";


		//js: document.getElementById("found").style.visibility = "visible";



	}else if (worldId==4) {
		js: document.getElementById("world1").style.visibility = "hidden";
		js: document.getElementById("world2").style.visibility = "hidden";
		js: document.getElementById("world3").style.visibility = "hidden";
		js: document.getElementById("world4").style.visibility = "visible";

		js: document.getElementById("instructions1").style.visibility = "hidden";
		js: document.getElementById("instructions2").style.visibility = "hidden";
		js: document.getElementById("instructions3").style.visibility = "hidden";
		js: document.getElementById("instructions4").style.visibility = "visible";

		js: document.getElementById("encyclo1").style.visibility = "hidden";
		js: document.getElementById("encyclo2").style.visibility = "hidden";
		js: document.getElementById("encyclo3").style.visibility = "hidden";
		js: document.getElementById("encyclo-4").style.visibility = "visible";

		js: document.getElementById("info1").style.visibility = "hidden";
		js: document.getElementById("info2").style.visibility = "hidden";
		js: document.getElementById("info3").style.visibility = "hidden";
		js: document.getElementById("info4").style.visibility = "visible";
	}

}

function pointerLock(){

  var havePointerLock =
    'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document

    if (havePointerLock) {
      var element = document.body

      var pointerlockchange = function (event) {
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

      var pointerlockerror = function (event) {
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
        function (event) {
          instructions.style.display = 'none'

          // Ask the browser to lock the pointer
          element.requestPointerLock =
            element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock

          if (/Firefox/i.test(navigator.userAgent)) {
            var fullscreenchange = function (event) {
              if (
                document.fullscreenElement === element ||
                document.mozFullscreenElement === element ||
                document.mozFullScreenElement === element
              ) {
                document.removeEventListener('fullscreenchange', fullscreenchange)
                document.removeEventListener('mozfullscreenchange', fullscreenchange)

                element.requestPointerLock()
              }
            }

            document.addEventListener('fullscreenchange', fullscreenchange, false)
            document.addEventListener('mozfullscreenchange', fullscreenchange, false)

            element.requestFullscreen =
            element.requestFullscreen ||
            element.mozRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen

            element.requestFullscreen()
          } else {
            element.requestPointerLock()
          }
        },
        false
      )
    } else {
      instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API"
    }
}
//return array with height data from img
function getTerrainPixelData(image){
	  //var canvas = document.getElementById("canvas");
	  var canvas = document.createElement( 'canvas' );
	  canvas.width = image.width;
	  canvas.height = image.height;
	  canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

	  var data = canvas.getContext('2d').getImageData(0,0, image.width, image.height).data;
	  var normPixels = []

	  for (var i = 0, n = data.length; i < n; i += 4) {
	    // get the average value of R, G and B.
	    normPixels.push((data[i] + data[i+1] + data[i+2]) / 3);
	  }
	  //console.log(normPixels);
	  //normPixels = null;
	  return normPixels;
}

function addHeightMapAll(squareNo){
//heigthmapfun
		var xMult;
		var yMult;
		var img4All = imagesTiles[squareNo-1];
		//var img4AllText = textureTiles[squareNo-1];

		if (squareNo==1) {
			xMult = 200;
			yMult = -200;
		}else if (squareNo==2) {
			xMult = 0;
			yMult = -200;
		}else if (squareNo==3) {
			xMult = -200;
			yMult = -200;
		}else if (squareNo==4) {
			xMult = 200;
			yMult = 0;
		}else if (squareNo==5) {
			xMult = 0;
			yMult = 0;
		}else if (squareNo==6) {
			xMult = -200;
			yMult = 0;
		}else if (squareNo==7) {
			xMult = 200;
			yMult = 200;
		}else if (squareNo==8) {
			xMult = 0;
			yMult = 200;
		}else if (squareNo==9) {
			xMult = -200;
			yMult = 200;
		}

		//what would we need?
		//an Img for the heightMap
		//an X multiplier and an Y multiplier

		//here is the physics part
		var allBody = new CANNON.Body({ mass: 0 });
		var matrix = fromImage(img4All,img4All.width,img4All.height,0,25);
		var shape = new CANNON.Heightfield(matrix, { elementSize: 2.0 });
		var quat = new CANNON.Quaternion(0, 0, 0, 0);
		quat.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
		quat.normalize();
		allBody.addShape(shape, new CANNON.Vec3, quat);
		allBody.position.set(xVal+yMult,yVal,100+zVal+xMult);
		world.addBody(allBody);

		//here is the visual part
		var terrain = getTerrainPixelData(img4All);
		var geometry = new THREE.PlaneGeometry(24*img4All.width/img4All.height, 24, img4All.width-1, img4All.height-1);
				for (var i = 0, l = geometry.vertices.length; i < l; i++)
		    {
		        var terrainValue = terrain[i] / 255;
		        geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * height_scale ;
		    }
		geometry.computeFaceNormals();
    geometry.computeVertexNormals();
		let text;
		//text = new THREE.TextureLoader().load('textures/island.png');
		text = new THREE.TextureLoader().load("textures/terrains/"+(worldId)+"_"+(squareNo)+".png");

		var materialFr = new THREE.MeshLambertMaterial( { map: text , side: THREE.DoubleSide} );
		var plane = new THREE.Mesh(geometry, materialFr);

		var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
    //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
    plane.quaternion.multiplyQuaternions( q, plane.quaternion );
    plane.position.set(100+zVal+yMult,yVal,xMult+xVal);
    plane.rotation.z = Math.PI/2;
    //body.position.set(15,0,100);
    plane.scale.set(8.3333,8.3333,8.3333);
    //plane.position.set(0,0,0);
    scene.add(plane)
    terrain = null;


	if (worldId==3) {

	}

}


function addFlatGround(){


	// var q = new THREE.Quaternion();
	// q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
	// //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
	// plane.quaternion.multiplyQuaternions( q, plane.quaternion );
	// plane.position.set(100,0,0);
	// plane.rotation.z = Math.PI/2;

	const geometry = new THREE.PlaneGeometry( 601,601, 601 );
	const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	var q = new THREE.Quaternion();
	q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
	//var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
	plane.quaternion.multiplyQuaternions( q, plane.quaternion );
	plane.position.set(100,-2,0);
	plane.rotation.z = Math.PI/2;

	scene.add( plane );

}

function fromImage ( image, width, depth, minHeight, maxHeight ) {

    width = width|0;
    depth = depth|0;

    var i, j;
    var matrix = [];
    var canvas = document.createElement( 'canvas' ),
        ctx = canvas.getContext( '2d' );
    var imgData, pixel, channels = 4;
    var heightRange = maxHeight - minHeight;
    var heightData;

    canvas.width  = width;
    canvas.height = depth;

    // document.body.appendChild( canvas );

    ctx.drawImage( image, 0, 0, width, depth );
    imgData = ctx.getImageData( 0, 0, width, depth ).data;

    for ( i = 0|0; i < depth; i = ( i + 1 )|0 ) { //row

      matrix.push( [] );

      for ( j = 0|0; j < width; j = ( j + 1 )|0 ) { //col

        pixel = i * depth + j;
        heightData = imgData[ pixel * channels ] / 255 * heightRange + minHeight;
        matrix[ i ].push( heightData );
      }

    }

    return matrix;

  }


  function render() {

    renderer.render( scene, camera );

  }
