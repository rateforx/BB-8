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

    static get netScheme() {
        return Object.assign( {
            playerId: { type: Serializer.TYPES.INT16 },
            position: { type: Serializer.TYPES.CLASSINSTANCE },
            quaternion: { type: Serializer.TYPES.CLASSINSTANCE },
            velocity: { type: Serializer.TYPES.CLASSINSTANCE },
            angularVelocity: { type: Serializer.TYPES.CLASSINSTANCE },
            health: { type: Serializer.TYPES.INT8 }
        } );
    }

    constructor( gameEngine, pos, rot ) {
        super( gameEngine, null, {
            position: pos,
            quaternion: rot,
        } );
        this.class = BB8;
        this.gameEngine = gameEngine;

        this.health = 100;
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

        pill.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        pill.quaternion.set(
            this.quaternion.x,
            this.quaternion.y,
            this.quaternion.z,
            this.quaternion.w
        );

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
        } );
        this.object3D.traverse( o => {
            if ( o.isMesh ) {
                o.material = material;
                o.castShadows = true;
                o.receiveShadows = true;
            }
        } );
    }

    refreshFromPhysics() {
        super.refreshFromPhysics();

        this.object3D.position.copy( this.position );
        this.object3D.quaternion.copy( this.quaternion );
        this.object3D.velocity.copy( this.velocity );
        this.object3D.angularVelocity.copy( this.angularVelocity );
    }

    onAddToWorld( gameEngine ) {
        this.scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        this.addPhysicalBody();
        this.addObject3D();
    }

    static loadResources( rm ) {
        rm.loadModel( 'bb8/bb8.obj', 'bb8' );

        rm.loadTexture( 'body_BUMP.jpg', 'bb8-body_BUMP');
        rm.loadTexture( 'body_DIFFUSE.jpg', 'bb8-body_DIFFUSE');
        rm.loadTexture( 'body_DISPLACE.jpg', 'bb8-body_DISPLACE');
        rm.loadTexture( 'body_EMMISIVE.jpg', 'bb8-body_EMMISIVE');
        rm.loadTexture( 'ENV.jpg', 'bb8-ENV');
        rm.loadTexture( 'head_BUMP.jpg', 'bb8-head_BUMP');
        rm.loadTexture( 'head_DIFFUSE.jpg', 'bb8-head_DIFFUSE');
        rm.loadTexture( 'METAL.jpg', 'bb8-METAL');
        rm.loadTexture( 'ring_DIFFUSE.jpg', 'bb8-ring_DIFFUSE');
        rm.loadTexture( 'top_DIFFUSE.jpg', 'bb8-top_DIFFUSE');
    }
}
