import PhysicalObject from 'lance-gg/src/serialize/PhysicalObject';

const THREE = require( 'three/build/three.module' );
const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );

const MASS = 18;
const Utils = require( '../client/Utils' );

const Vec3 = require( 'cannon/src/math/Vec3' );
const Quaternion = require( 'cannon/src/math/Quaternion' );

const Cylinder = require( 'cannon/src/shapes/Cylinder' );
const Body = require( 'cannon/src/objects/Body');
const Sphere = require( 'cannon/src/shapes/Sphere' );

export default class BB8 extends PhysicalObject {

    constructor( gameEngine, pos, rot ) {
        super( gameEngine, null, {
            position: pos,
            quaternion: rot,
        } );
        this.class = BB8;
        this.gameEngine = gameEngine;
    }

    addPhysicalBody() {
        // create physical body
        let capsule = new Body( {
            mass: MASS,
        } );

        let sphereA = new Sphere( .25 );
        let sphereB = new Sphere( .25 );
        let cylinder = new Cylinder( .5, .5, 1.25, 12 );

        capsule
            .addShape( cylinder )
            .addShape( sphereA, new Vec3( 0, .625, 0 ) )
            .addShape( sphereB, new Vec3( 0, -.625, 0 ) )
        ;

        this.gameEngine.physicsEngine.world.addBody( capsule );

        capsule.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        capsule.quaternion.set(
            this.quaternion.x,
            this.quaternion.y,
            this.quaternion.z,
            this.quaternion.w
        );

        this.physicalBody = capsule;
    }

    addObject3D() {
        // create THREE Object3D
        let objLoader = new THREE.OBJLoader()
            .setPath( '/assets/models/' )
            .setTexturePath( '/assets/textures/' );

        objLoader.load( '/bb8/bb8.obj', obj => {
            this.object3D = obj;
            this.gameEngine.scene.add( obj );
        } );
    }

    onAddToWorld( gameEngine ) {
        this.scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        this.addPhysicalBody();
        this.addObject3D();
    }
}
