import * as THREE from '/node_modules/three/build/three.module.js'
import * as CANNON from '/node_modules/cannon-es/dist/cannon-es.js'

/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */

var hideHud, hideHudi,hideHude;
// var worldId
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

var PointerLockControls = function (camera, cannonBody) {
  var eyeYPos = 2 // eyes are 2 meters above the ground
  var velocityFactor = 0.2
  var jumpVelocity = 20
  var scope = this

  var pitchObject = new THREE.Object3D()
  pitchObject.add(camera)

  var yawObject = new THREE.Object3D()
  yawObject.position.y = 2
  yawObject.add(pitchObject)

  var quat = new THREE.Quaternion()

  var moveForward = false
  var moveBackward = false
  var moveLeft = false
  var moveRight = false
  //hideHud = false

  var canJump = false



  var contactNormal = new CANNON.Vec3() // Normal in the contact, pointing out of whatever the player touched
  var upAxis = new CANNON.Vec3(0, 1, 0)
  cannonBody.addEventListener('collide', function (e) {
    var contact = e.contact

    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == cannonBody.id)
      // bi is the player body, flip the contact normal
      contact.ni.negate(contactNormal)
    else contactNormal.copy(contact.ni) // bi is something else. Keep the normal as it is

    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    if (contactNormal.dot(upAxis) > 0.5)
      // Use a "good" threshold value between 0 and 1 here!
      canJump = true
  })

  var velocity = cannonBody.velocity

  var PI_2 = Math.PI / 2

  var onMouseMove = function (event) {
    if (scope.enabled === false) return

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    yawObject.rotation.y -= movementX * 0.002
    pitchObject.rotation.x -= movementY * 0.002

    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x))
  }

  var onKeyDown = function (event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true
        break

      case 37: // left
      case 65: // a
        moveLeft = true
        break

      case 40: // down
      case 83: // s
        moveBackward = true
        break

      case 39: // right
      case 68: // d
        moveRight = true
        break

      case 32: // space
        if (canJump === true) {
          velocity.y = jumpVelocity
        }
        canJump = false
        break

        //case 104: // hide
      case 72: // hide      "h"
        hideHud = !hideHud;
        //console.log("hide hud is "+hideHud);
        break

        case 69: // hide this is e
          hideHude = !hideHude;
          break



          case 73: // hide "i"
            hideHudi = !hideHudi;
            //console.log("hide hud is "+hideHud);
            break
    }
  }

  var onKeyUp = function (event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false
        break

      case 37: // left
      case 65: // a
        moveLeft = false
        break

      case 40: // down
      case 83: // a
        moveBackward = false
        break

      case 39: // right
      case 68: // d
        moveRight = false
        break
    }
  }

  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('keydown', onKeyDown, false)
  document.addEventListener('keyup', onKeyUp, false)

  this.lock = function () {

			this.domElement.requestPointerLock();

		};

  this.unlock = function () {

			scope.domElement.ownerDocument.exitPointerLock();

		};

  this.enabled = false

  this.getObject = function () {
    return yawObject
  }

  this.getDirection = function (targetVec) {
    targetVec.set(0, 0, -1)
    quat.multiplyVector3(targetVec)
  }

  // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
  var inputVelocity = new THREE.Vector3()
  var euler = new THREE.Euler()
  this.update = function (delta) {
    if (scope.enabled === false) return

    delta *= 0.1

    inputVelocity.set(0, 0, 0)

    if (moveForward) {
      inputVelocity.z = -velocityFactor * delta
    }
    if (moveBackward) {
      inputVelocity.z = velocityFactor * delta
    }

    if (moveLeft) {
      inputVelocity.x = -velocityFactor * delta
    }
    if (moveRight) {
      inputVelocity.x = velocityFactor * delta
    }

    //do all if statements here?
    if (hideHudi==true) {
      // js: document.getElementById("encyclo-4").style.visibility = "visible";
      //js: document.getElementById("info1").style.visibility = "visible";
      js: document.getElementById("info1").style.top = "15%";
      //js: document.getElementById("info2").style.visibility = "visible";
      js: document.getElementById("info2").style.top = "15%";
      //js: document.getElementById("info3").style.visibility = "visible";
      js: document.getElementById("info3").style.top = "15%";
      //js: document.getElementById("info4").style.visibility = "visible";
      js: document.getElementById("info4").style.top = "15%";
    }else {
      js: document.getElementById("info1").style.top = "-120%";
      js: document.getElementById("info2").style.top = "-120%";
      js: document.getElementById("info3").style.top = "-120%";
      js: document.getElementById("info4").style.top = "-120%";
    }

    if (hideHude==true) {
      //js: document.getElementById("encyclo1").style.visibility = "visible";
      js: document.getElementById("encyclo1").style.top = "195%";
      //js: document.getElementById("encyclo-4").style.visibility = "visible";
      js: document.getElementById("encyclo-4").style.top = "195%";
      //js: document.getElementById("encyclo2").style.visibility = "visible";
      js: document.getElementById("encyclo2").style.top = "195%";
      //js: document.getElementById("encyclo4").style.visibility = "visible";
      js: document.getElementById("encyclo3").style.top = "195%";
    }else {
      js: document.getElementById("encyclo1").style.top = "0%";
      js: document.getElementById("encyclo-4").style.top = "0%";
      js: document.getElementById("encyclo2").style.top = "0%";
      js: document.getElementById("encyclo3").style.top = "0%";
    }

    if (hideHud==true) {
      //js: document.getElementById("cursor").style.visibility = "visible";
      js: document.getElementById("map2").style.left = "-20%";
      js: document.getElementById("map2-1").style.left = "-20%";
      js: document.getElementById("map2-1-1").style.left = "-20%";
      js: document.getElementById("map2-1-2").style.left = "-20%";
      js: document.getElementById("map2-1-3").style.left = "-20%";
      js: document.getElementById("map2-1-4").style.left = "-20%";
      js: document.getElementById("map2-2").style.left = "-20%";
      js: document.getElementById("map2-2-1").style.left = "-20%";
      js: document.getElementById("map2-2-2").style.left = "-20%";
      js: document.getElementById("map2-2-2").style.left = "-20%";
      js: document.getElementById("map2-2-3").style.left = "-20%";
      js: document.getElementById("map2-2-4").style.left = "-20%";
      js: document.getElementById("map").style.right = "-20%";
      js: document.getElementById("map2w2").style.left = "-20%";
      js: document.getElementById("mapw2").style.right = "-20%";
      js: document.getElementById("map2w3").style.left = "-20%";
      js: document.getElementById("mapw3").style.right = "-20%";
      js: document.getElementById("map2w4").style.left = "-20%";
      js: document.getElementById("mapw4").style.right = "-20%";
      js: document.getElementById("world4critteroverlay").style.right = "-20%";
      js: document.getElementById("world4critteroverlay1").style.right = "-20%";
      js: document.getElementById("world4critteroverlay2").style.right = "-20%";
      js: document.getElementById("world4critteroverlay3").style.right = "-20%";
      js: document.getElementById("world4critteroverlay4").style.right = "-20%";
      js: document.getElementById("world3critteroverlay").style.right = "-20%";
      js: document.getElementById("world3critteroverlay1").style.right = "-20%";
      js: document.getElementById("world3critteroverlay2").style.right = "-20%";
      js: document.getElementById("world3critteroverlay3").style.right = "-20%";
      js: document.getElementById("world2critteroverlay").style.right = "-20%";
      js: document.getElementById("world1critteroverlay4").style.right = "-20%";
      js: document.getElementById("world1critteroverlay3").style.right = "-20%";
      js: document.getElementById("world1critteroverlay2").style.right = "-20%";
      js: document.getElementById("world1critteroverlay1").style.right = "-20%";
      js: document.getElementById("world1critteroverlay").style.right = "-20%";
      js: document.getElementById("world1crittercounter1").style.right = "-20%";
      js: document.getElementById("world1crittercounter2").style.right = "-20%";
      js: document.getElementById("world1crittercounter3").style.right = "-20%";
      js: document.getElementById("world1crittercounter4").style.right = "-20%";
      js: document.getElementById("world1crittercounter").style.right = "-20%";
      js: document.getElementById("world2crittercounter").style.right = "-20%";
      js: document.getElementById("world2critteroverlay4").style.right = "-20%";
      js: document.getElementById("world2critteroverlay3").style.right = "-20%";
      js: document.getElementById("world2critteroverlay2").style.right = "-20%";
      js: document.getElementById("world2critteroverlay1").style.right = "-20%";
      js: document.getElementById("world2crittercounter1").style.right = "-20%";
      js: document.getElementById("world2crittercounter2").style.right = "-20%";
      js: document.getElementById("world2crittercounter3").style.right = "-20%";
      js: document.getElementById("world2crittercounter4").style.right = "-20%";
      js: document.getElementById("world3crittercounter").style.right = "-20%";
      js: document.getElementById("world3crittercounter1").style.right = "-20%";
      js: document.getElementById("world3crittercounter2").style.right = "-20%";
      js: document.getElementById("world3crittercounter3").style.right = "-20%";
      js: document.getElementById("world4crittercounter").style.right = "-20%";
      js: document.getElementById("world4crittercounter1").style.right = "-20%";
      js: document.getElementById("world4crittercounter2").style.right = "-20%";
      js: document.getElementById("world4crittercounter3").style.right = "-20%";
      js: document.getElementById("world4crittercounter4").style.right = "-20%";

    }else {
      js: document.getElementById("map2").style.left = "0%";
      js: document.getElementById("map2-1").style.left = "0%";
      js: document.getElementById("map2-1-1").style.left = "0%";
      js: document.getElementById("map2-1-2").style.left = "0%";
      js: document.getElementById("map2-1-3").style.left = "0%";
      js: document.getElementById("map2-1-4").style.left = "0%";
      js: document.getElementById("map2-2").style.left = "0%";
      js: document.getElementById("map2-2-1").style.left = "0%";
      js: document.getElementById("map2-2-2").style.left = "0%";
      js: document.getElementById("map2-2-3").style.left = "0%";
      js: document.getElementById("map2-2-4").style.left = "0%";
      js: document.getElementById("map").style.right = "0%";
      js: document.getElementById("map2w2").style.left = "0%";
      js: document.getElementById("mapw2").style.right = "0%";
      js: document.getElementById("map2w3").style.left = "0%";
      js: document.getElementById("mapw3").style.right = "0%";
      js: document.getElementById("map2w4").style.left = "0%";
      js: document.getElementById("mapw4").style.right = "0%";
      js: document.getElementById("world4critteroverlay").style.right = "0%";
      js: document.getElementById("world4critteroverlay1").style.right = "0%";
      js: document.getElementById("world4critteroverlay2").style.right = "0%";
      js: document.getElementById("world4critteroverlay3").style.right = "0%";
      js: document.getElementById("world4critteroverlay4").style.right = "0%";
      js: document.getElementById("world3critteroverlay").style.right = "0%";
      js: document.getElementById("world3critteroverlay1").style.right = "0%";
      js: document.getElementById("world3critteroverlay2").style.right = "0%";
      js: document.getElementById("world3critteroverlay3").style.right = "0%";
      js: document.getElementById("world2critteroverlay").style.right = "0%";
      js: document.getElementById("world1critteroverlay").style.right = "0%";
      js: document.getElementById("world1critteroverlay4").style.right = "0%";
      js: document.getElementById("world1critteroverlay3").style.right = "0%";
      js: document.getElementById("world1critteroverlay2").style.right = "0%";
      js: document.getElementById("world1critteroverlay1").style.right = "0%";
      js: document.getElementById("world1crittercounter1").style.right = "0%";
      js: document.getElementById("world1crittercounter2").style.right = "0%";
      js: document.getElementById("world1crittercounter3").style.right = "0%";
      js: document.getElementById("world1crittercounter4").style.right = "0%";
      js: document.getElementById("world1crittercounter").style.right = "0%";
      js: document.getElementById("world2crittercounter").style.right = "0%";
      js: document.getElementById("world2critteroverlay4").style.right = "0%";
      js: document.getElementById("world2critteroverlay3").style.right = "0%";
      js: document.getElementById("world2critteroverlay2").style.right = "0%";
      js: document.getElementById("world2critteroverlay1").style.right = "0%";
      js: document.getElementById("world2crittercounter1").style.right = "0%";
      js: document.getElementById("world2crittercounter2").style.right = "0%";
      js: document.getElementById("world2crittercounter3").style.right = "0%";
      js: document.getElementById("world2crittercounter4").style.right = "0%";
      js: document.getElementById("world3crittercounter").style.right = "0%";
      js: document.getElementById("world3crittercounter1").style.right = "0%";
      js: document.getElementById("world3crittercounter2").style.right = "0%";
      js: document.getElementById("world3crittercounter3").style.right = "0%";
      js: document.getElementById("world4crittercounter").style.right = "0%";
      js: document.getElementById("world4crittercounter1").style.right = "0%";
      js: document.getElementById("world4crittercounter2").style.right = "0%";
      js: document.getElementById("world4crittercounter3").style.right = "0%";
      js: document.getElementById("world4crittercounter4").style.right = "0%";

    }

    // Convert velocity to world coordinates
    euler.x = pitchObject.rotation.x
    euler.y = yawObject.rotation.y
    euler.order = 'XYZ'
    quat.setFromEuler(euler)
    inputVelocity.applyQuaternion(quat)
    //quat.multiplyVector3(inputVelocity);

    // Add to the object
    velocity.x += inputVelocity.x
    velocity.z += inputVelocity.z

    yawObject.position.copy(cannonBody.position)
  }
}

export { PointerLockControls }
