import PhysicalObject from 'lance/serialize/PhysicalObject';
import Serializer from "lance/serialize/Serializer";

const THREE = require( 'three/build/three' );

const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const MASS = 180;
const Utils = require( '../client/Utils' );

const Vec3 = require( 'cannon/src/math/Vec3' );
const Quaternion = require( 'cannon/src/math/Quaternion' );

const CANNON = require( 'cannon' );

export default class BB8 extends PhysicalObject {

    /**
     * @param {TheGameEngine} gameEngine
     * @param {Object} options
     * @param {Object} props
     */
    constructor( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.class = BB8;
        this.gameEngine = gameEngine;

        this.health = 100;
        // todo! on add to world
    }

    addObject3D() {
        // get the Object3D
        let rm = this.gameEngine.renderer.resourceManager;
        this.object3D = rm.getObject( 'bb8' ).clone();

        let material = this.object3D.children[0].material;
        let hue = Math.floor( Math.random() * 360 );
        material.map = rm.getTexture( 'bb8_DIFFUSE' );
        material.normalMap = rm.getTexture( 'bb8_NORMAL' );
        material.color = new THREE.Color (`hsl( ${hue}, 100%, 90% )` );

        this.gameEngine.renderer.add( this.object3D );
    }

    addPhysicsObj() {
        let shape = new CANNON.Sphere( 2 );
        let body = new CANNON.Body( {
            mass: 18,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z
            ),
            quaternion: new CANNON.Quaternion(
                this.quaternion.x,
                this.quaternion.y,
                this.quaternion.z,
                this.quaternion.w
            ),
            type: CANNON.Body.DYNAMIC,
        } );
        body.addShape( shape );

        this.physicsObj = body;
        this.gameEngine.physicsEngine.world.add( body );
    }

    /**
     * @param gameEngine {TheGameEngine}
     * */
    onAddToWorld( gameEngine ) {
        this.addPhysicsObj();
        if ( !gameEngine.isServer() ) {
            this.addObject3D();

            // attach camera to this bb8 if it belongs to the current player
            let playerId = gameEngine.playerId;
            let playerObj = gameEngine.world.queryObject( { playerId } );
            if ( playerObj === this ) {

                // connect main camera to player
                let camera = this.gameEngine.renderer.camera;
                camera.addTarget( {
                    name: 'Player',
                    targetObject: this.object3D,
                    cameraPosition: new THREE.Vector3( 10, 10, 0 ),
                    fixed: false,
                    stiffness: .1,
                    matchRotation: false,
                });
                camera.setTarget( 'Player' );

                // connect minimap camera to player too
                let mini = this.gameEngine.renderer.minimap.camera;
                mini.position.copy( this.object3D.position );
                mini.position.y = 50;
                mini.lookAt( this.object3D.position );
            }
        }
    }

    adjustMovement() {
        this.refreshFromPhysics();

        if ( ( !this.gameEngine.isServer() ) ) {

            if ( typeof this.object3D !== 'undefined' ) {
                this.object3D.position.set(
                    this.physicsObj.position.x,
                    this.physicsObj.position.y,
                    this.physicsObj.position.z,
                );
                let body = this.object3D.children[0];
                this.object3D.quaternion.set(
                    this.physicsObj.quaternion.x,
                    this.physicsObj.quaternion.y,
                    this.physicsObj.quaternion.z,
                    this.physicsObj.quaternion.w,
                )
            }
        }
    }

    toString() {
        return `BB8::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
}
