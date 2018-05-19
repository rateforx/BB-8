import PhysicalObject from 'lance/serialize/PhysicalObject';
import Serializer from "lance/serialize/Serializer";

const THREE = require( 'three/build/three' );

const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const MASS = 18;
const Utils = require( '../client/Utils' );

const Vec3 = require( 'cannon/src/math/Vec3' );
const Quaternion = require( 'cannon/src/math/Quaternion' );

const CANNON = require( 'cannon' );
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
        // let chassisBody = new Body( {
        //     mass: 180,
        //     position: new CANNON.Vec3(
        //         this.position.x,
        //         this.position.y,
        //         this.position.z,
        //     )
        // } );
        // let collisionSphere = new Sphere( .5 );
        // chassisBody.addShape( collisionSphere );
        let chassisShape = new CANNON.Box( new CANNON.Vec3( 2, 1, .5 ) );
        let chassisBody = new CANNON.Body( {
            mass: 150,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z,
            )
        } );
        chassisBody.addShape( chassisShape );
        chassisBody.quaternion.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / 2 );
        chassisBody.angularVelocity.set( 0, .5, 0 );

        let options = {
            radius: .5,
            directionLocal: new CANNON.Vec3( 0, 0, -1 ),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3( 0, 1, 0 ),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // create vehicle
        let vehicle = new RaycastVehicle( {
            chassisBody: chassisBody,
        } );

        // add wheel to vehicle
        options.chassisConnectionPointLocal.set( 1, 1, 0 );
        vehicle.addWheel( options );

        options.chassisConnectionPointLocal.set(1, -1, 0);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, 1, 0);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, -1, 0);
        vehicle.addWheel(options);

        // add vehicle to world
        vehicle.addToWorld( this.gameEngine.physicsEngine.world );

        // config the wheel body
        // let wheel = vehicle.wheelInfos[ 0 ];
        // let cylinderShape = new CANNON.Sphere( 1 );
        // let wheelBody = new CANNON.Body( {
        //     mass: 0,
        //     type: CANNON.Body.KINEMATIC,
        // } );
        // wheelBody.type = CANNON.Body.KINEMATIC;
        // wheelBody.collisionFilterGroup = 0; // turn off collisions
        // let q = new CANNON.Quaternion();
        // q.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / 2 );
        // wheelBody.addShape( cylinderShape, new CANNON.Vec3(), q );
        // and add it to world

        // this.gameEngine.physicsEngine.world.addBody( wheelBody );

        // this.wheelObj = wheelBody;

        let wheelBodies = [];
        for ( let i = 0; i < vehicle.wheelInfos.length; i++ ) {
            let wheel = vehicle.wheelInfos[ i ];
            let wheelShape = new CANNON.Cylinder( wheel.radius, wheel.radius, wheel.radius / 2, 20 );
            let wheelBody = new CANNON.Body( {
                mass: 0,
            } );
            wheelBody.type = CANNON.Body.KINEMATIC;
            wheelBody.collisionFilterGroup = 0; // turn off collisions
            let q = new CANNON.Quaternion();
            q.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / 2 );
            wheelBody.addShape( wheelShape, new CANNON.Vec3(), q );
            wheelBodies.push( wheelBody );
            this.gameEngine.physicsEngine.world.addBody( wheelBody );
        }
        this.wheelObjs = wheelBodies;
        this.physicsObj = chassisBody;
        this.vehicleObj = vehicle;
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

    /**
     * @param gameEngine {TheGameEngine}
     * */
    onAddToWorld( gameEngine ) {
        this.addPhysicalBody();
        if ( !gameEngine.isServer() ) {
            this.addObject3D();
        }
    }

    adjustMovement() {
        // update wheels
        // let t = this.vehicleObj.wheelInfos[0].worldTransform;
        // this.wheelObj.position.copy( t.position );
        // this.wheelObj.quaternion.copy( t.quaternion );
        for ( let i = 0; i < this.wheelObjs.length; i++ ) {
            this.vehicleObj.updateWheelTransform( i );
            let t = this.vehicleObj.wheelInfos[ i ].worldTransform;
            let wheelBody = this.wheelObjs[ i ];
            wheelBody.position.copy( t.position );
            wheelBody.quaternion.copy( t.quaternion );
        }

        this.refreshFromPhysics();

        if ( ( !this.gameEngine.isServer() ) && ( typeof this.object3D !== 'undefined' ) ) {
            this.object3D.position.set(
                this.physicsObj.position.x,
                this.physicsObj.position.y,
                this.physicsObj.position.z,
            );
            this.object3D.quaternion.set(
                this.physicsObj.quaternion.x,
                this.physicsObj.quaternion.y,
                this.physicsObj.quaternion.z,
                this.physicsObj.quaternion.w,
            )
        }
    }

    refreshFromPhysics() {
        super.refreshFromPhysics();
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
