import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';
const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );

export default class Map extends PhysicalObject {

    constructor( gameEngine ) {
        super( gameEngine );
        this.gameEngine = gameEngine;
        this.class = Map;

        this.position.set( 0, 0, 0 );
    }

    // getObject() {
    //     return this.group;
    // }

    addTerrain () {
        // todo generate or load terrain from file
        this.physicsObj = this.gameEngine.physicsEngine.addBox( 10, 10, 10, 0, 0 );
    }

    addGround() {
        let rm = this.gameEngine.renderer.resourceManager;

        let gGround = new THREE.PlaneBufferGeometry( 100, 100 );
        let mGround = new THREE.MeshPhongMaterial( {
            name: 'sand',
            map: rm.getTexture( 'sand1' ),
        } );
        this.ground = new THREE.Mesh( gGround, mGround );

        this.ground.rotation.x = Math.PI / -2;

        this.group.add( this.ground );
    }

    addOcean() {
        let rm = this.gameEngine.renderer.resourceManager;

        let gWater = new THREE.PlaneBufferGeometry( 100, 100 );
        this.water = new THREE.Water( gWater, {
            color: 0xc8ebff,
            scale: 1,
            flowDirection: new THREE.Vector2( 1, 1 ),
            // textureWidth: 1024,
            // textureHeight: 1024,
            normalMap0: rm.getTexture( 'water1' ),
            normalMap1: rm.getTexture( 'water2' ),
        } );

        this.water.position.y = .2;
        this.water.rotation.x = Math.PI / -2;

        this.group.add( this.water );
    }

    onAddToWorld( gameEngine ) {
        this.gameEngine = gameEngine;
        this.addTerrain();

        this.position.set( 0, 0, 0 );

        this.renderer = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if ( this.scene ) {
            this.addOcean();
            this.addGround();
        }
    }

    static loadResources( rm ) {
        this.textures.water1 = rm.loadTexture( 'water1.jpg', 'water1' );
        this.textures.water2 = rm.loadTexture( 'water2.jpg', 'water2' );
        this.textures.sand = rm.loadTexture( 'sand1.jpg', 'sand1' );
    }
}
