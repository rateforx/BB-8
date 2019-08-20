import PhysicalObject from 'lance/serialize/PhysicalObject';

const THREE = require( 'three/build/three' );
const CANNON = require( 'cannon' );

const MASS = 90; // def 135 - empty oaken crate
const FRICTION = .01;
const RESTITUTION = 0;

export default class Crate extends PhysicalObject {

    /**
     * @param gameEngine {TheGameEngine}
     * @param options {Object}
     * @param props {Object}
     */
    constructor ( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.class = Crate;
        this.gameEngine = gameEngine;
    }

    /**
     * @param gameEngine {TheGameEngine}
     */
    onAddToWorld ( gameEngine ) {
        this.addPhysicsObj( gameEngine );
        if ( !gameEngine.isServer() ) this.addObject3D( gameEngine );
    }

    addPhysicsObj ( gameEngine ) {
        let shape = new CANNON.Box( new CANNON.Vec3(
            4 / 2,
            4 / 2,
            4 / 2,
        ) );
        let material = new CANNON.Material( {
            name: 'crateMaterial',
            friction: FRICTION,
            restitution: RESTITUTION,
        } );
        let body = new CANNON.Body( {
            mass: MASS,
            // material: material,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z,
            ),
            quaternion: new CANNON.Quaternion(
                this.quaternion.x,
                this.quaternion.y,
                this.quaternion.z,
                this.quaternion.w,
            ),
            type: CANNON.Body.DYNAMIC,
        } );
        body.addShape( shape );

        this.physicsObj = body;
        gameEngine.physicsEngine.world.add( body );
    }

    /**
     * @param gameEngine {TheGameEngine}
     */
    addObject3D ( gameEngine ) {
        let rm = gameEngine.renderer.resourceManager;

        let geometry = new THREE.BoxGeometry(
            4, 4, 4,
            128, 128, 128
        );
        let material = new THREE.MeshPhongMaterial( {
            map: rm.getTexture( 'crate_DIFFUSE' ),
            normalMap: rm.getTexture( 'crate_NORMAL' ),
            displaceMap: rm.getTexture( 'crate_DISPLACE' ),
            specularMap: rm.getTexture( 'crate_SPECULAR' ),
            shininess: 30,
            color: '#aeaeae',
        } );

        this.object3D = new THREE.Mesh( geometry, material );
        this.object3D.position.copy( this.position );
        this.object3D.quaternion.copy( this.quaternion );

        gameEngine.renderer.scene.add( this.object3D );
    }

    refreshFromPhysics () {
        super.refreshFromPhysics();

        if ( !this.gameEngine.isServer() ) {
            this.object3D.position.copy( this.position );
            this.object3D.quaternion.copy( this.quaternion );
        }
    }

    toString () {
        return `Crate::${super.toString()}`;
    }

    destroy () {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
};
