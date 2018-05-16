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

        this.ready = this.ready !== undefined;

        this.health = 100;
        // todo! on add to world
    }

    addPhysicalBody() {
        // create physical body
        let pill = new Body( {
            mass: MASS,
        } );

        let sphereA = new Sphere( .25 );
        let sphereB = new Sphere( .25 );
        let cylinder = new Cylinder( .5, .5, 1.25, 12 );

        pill
            .addShape( cylinder )
            .addShape( sphereA, new Vec3( 0, .625, 0 ) )
            .addShape( sphereB, new Vec3( 0, -.625, 0 ) )
        ;

        this.gameEngine.physicsEngine.world.addBody( pill );

        this.physicsObj = pill;
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
