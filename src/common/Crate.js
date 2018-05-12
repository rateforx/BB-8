import PhysicalObject from 'lance/serialize/PhysicalObject';

const THREE = require( 'three/build/three' );


const MASS = 135; // kg
const FRICTION = .25; // ???

export default class Crate extends PhysicalObject {

    constructor( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.class = Crate;
        this.gameEngine = gameEngine;

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

        // create 3D body
        this.renderer = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if ( this.scene ) {
            let gCrate = new THREE.BoxGeometry; // ( 1, 1, 1 )
            let mCrate = new THREE.MeshLambertMaterial;
            this.object3D = new THREE.Mesh( gCrate, mCrate );
        }
    }
};
