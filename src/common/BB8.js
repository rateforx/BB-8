import PhysicalObject from 'lance/serialize/PhysicalObject';
import Serializer from "lance/serialize/Serializer";

const THREE = require( 'three/build/three' );

const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const MASS = 18;
const Utils = require( '../client/Utils' );

const Vec3 = require( 'cannon/src/math/Vec3' );
const Quaternion = require( 'cannon/src/math/Quaternion' );

// const CANNON = require( 'cannon/src/Cannon' );
const Cylinder = require( 'cannon/src/shapes/Cylinder' );
const Body = require( 'cannon/src/objects/Body' );
const Sphere = require( 'cannon/src/shapes/Sphere' );
const RaycastVehicle = require( 'cannon/src/objects/RaycastVehicle' );

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

    addPhysicalBody() {
        // create physical body
        let chassisBody = new Body( {
            mass: 18,
            fixedRotation: true,
        } );
        let collisionSphere = new Sphere( .5 );
        chasisBody.addShape( Sphere );

        // create vehicle
        let raycastVehicle = new RaycastVehicle( {
            chassisBody: chasisBody,
        } );

        // add wheel to vehicle
        raycastVehicle.addWheel( {
            radius: 1,
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3( 0, 1, 0 ),
            chassisConnectionPointLocal: new CANNON.Vec3( 0, 0, 0 ),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        } );

        // add vehicle to world
        raycastVehicle.addToWorld( this.gameEngine.physicsEngine.world );

        // config the wheel body
        let wheel = raycastVehicle.wheelInfos[ 0 ];
        let cylinderShape = new CANNON.Cylinder( wheel.radius, wheel.radius, wheel.radius / 2, 20 );
        let wheelBody = new CANNON.Body( {
            mass: 0,
        } );
        wheelBody.type = CANNON.Body.KINEMATIC;
        wheelBody.collisionFilterGroup = 0; // turn off collisions
        let q = new CANNON.Quaternion();
        q.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / 2 );
        wheelBody.addShape( cylinderShape, new CANNON.Vec3(), q );
        // and add it to world

        this.gameEngine.physicsEngine.world.addBody( wheelBody );

        this.physicsObj = raycastVehicle;
    }

    addObject3D() {
        // get the Object3D
        let rm = this.gameEngine.renderer.resourceManager;
        this.object3D = rm.getObject( 'bb8' ).clone();

        let material = new THREE.MeshPhysicalMaterial( {
            roughness: .12,
            metalness: .22,
            color: `hsl( ${Math.random() * 360}, 100%, 90% )`,
        } );
        // this.object3D.material.outlineParameters = {
        //     color: material.color,
        // };

        this.object3D.traverse( o => {
            if ( o.isMesh ) {
                o.material = material;
                o.castShadows = true;
                o.receiveShadows = true;
            }
        } );
        this.gameEngine.renderer.add( this.object3D );
    }

    onAddToWorld() {
        if ( !this.gameEngine.isServer ) {
            this.addObject3D();
        }
        this.addPhysicalBody();
    }

    adjustMovement() {
        this.refreshFromPhysics();

        if ( !this.gameEngine.isServer() ) {
            this.object3D.position.set(
                this.position.x,
                this.position.y,
                this.position.z,
            );
            this.object3D.quaternion.set(
                this.quaternion.x,
                this.quaternion.y,
                this.quaternion.z,
                this.quaternion.w,
            )
        }
    }

    // setColor( color ) {
    //     if ( typeof color !== 'object' ) {
    //         color = new THREE.Color( color );
    //     }
    //
    // }

    toString() {
        return `BB8::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
}
