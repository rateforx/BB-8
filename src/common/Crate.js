import PhysicalObject from 'lance/serialize/PhysicalObject';
import Serializer from "lance/serialize/Serializer";

const THREE = require( 'three/build/three' );

const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const Utils = require( '../client/Utils' );

const CANNON = require( 'cannon' );
const Box = require( 'cannon/src/shapes/Box' );

const MASS = 135; // kg
const FRICTION = .25; // ???

export default class Crate extends PhysicalObject {

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
        this.class = Crate;
        this.gameEngine = gameEngine;

        this.ready = this.ready !== undefined;

        this.health = 100;
    }

    onAddToWorld( gameEngine ) {

        // create physical body
        this.physicsObj = gameEngine.physicsEngine.addBox( 1, 1, 1, MASS, FRICTION );
        this.physicsObj.position.set(
            this.position.x,
            this.position.y,
            this.position.z,
        );
        this.physicsObj.angularDamping = .1;

        // create 3D body
        let gCrate = new THREE.BoxGeometry; // ( 1, 1, 1 )
        let mCrate = new THREE.MeshLambertMaterial;
        this.object3D = new THREE.Mesh( gCrate, mCrate );
    }

     static loadResources( rm ) {
        rm.loadTexture( 'crate/crate_DIFFUSE.jpg', 'crate-DIFFUSE' );
        rm.loadTexture( 'crate/crate_NORMAL.jpg', 'crate-NORMAL' );
        rm.loadTexture( 'crate/crate_SPECULAR.jpg', 'crate-SPECULAR' );
        rm.loadTexture( 'crate/crate_DISPLACE.jpg', 'crate-DISPLACE' );
        this.ready = true;
    }
};