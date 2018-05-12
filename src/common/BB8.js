import PhysicalObject from 'lance/serialize/PhysicalObject';
import Serializer from "lance/serialize/Serializer";

const THREE = require( 'three/build/three' );

const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const MASS = 18;
const Utils = require( '../client/Utils' );

const Vec3 = require( 'cannon/src/math/Vec3' );
const Quaternion = require( 'cannon/src/math/Quaternion' );

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
        // create THREE Object3D
        let rm = this.gameEngine.renderer.resourceManager;
        this.object3D = rm.getModel( 'bb8' ).clone();

        this.gameEngine.renderer.addObject( this.object3D );

        this.material = new THREE.MeshPhysicalMaterial( {
            roughness: .12,
            metalness: .22,
            color: `hsl( ${Math.random() * 360}, 100%, 90% )`,
        } );
        this.object3D.traverse( o => {
            if ( o.isMesh ) {
                o.material = material;
                o.castShadows = true;
                o.receiveShadows = true;
            }
        } );

        this.gameEngine.renderer.addObject( this.object3D );
    }

    onAddToWorld() {
        if ( !this.gameEngine.isServer ) {
            this.addObject3D();
        }
        this.addPhysicalBody();
    }
}
