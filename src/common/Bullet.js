import PhysicalObject from 'lance-gg/src/serialize/PhysicalObject';

const R = 1;
const MASS = 1;

export default class Bullet extends PhysicalObject {

    /**
     * @param gameEngine {TheGameEngine}
     * @param options
     * @param props
     */
    constructor ( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.class = Bullet;
        this.gameEngine = gameEngine;
    }

    /**
     * @param gameEngine {TheGameEngine}
     */
    onAddToWorld ( gameEngine ) {
        this.addPhysicsObj( gameEngine );
        if ( !gameEngine.isServer() ) {
            this.addObject3D( gameEngine );
        }
    }

    addPhysicsObj ( gameEngine ) {
        let shape = new CANNON.Sphere( R );
        let body = new CANNON.Body( {
            mass: MASS,
            linearDamping: 0,
            fixedRotation: true,
        } );
        body.addShape( shape );

        this.physicsObj = body;
        gameEngine.
    }

    addObject3D ( gameEngine ) {
        let g = new THREE.SphereGeometry( R );
        let m = new THREE.MeshBasicMaterial( {
            color: Math.random() * 0xffffff,
        } );
        this.object3D = new THREE.Mesh( g, m );
    }


}