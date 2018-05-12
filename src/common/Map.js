import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';
const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );
const CANNON = require( 'cannon' );

export default class Map extends PhysicalObject {

    /**
     * @param gameEngine {TheGameEngine}
     * @param options
     * @param props
     * @param data vertices and faces describing a terrain highfield
     */
    constructor( gameEngine, options, props, data ) {
        super( gameEngine, options, props );
        this.gameEngine = gameEngine;
        this.class = Map;
        this.data = data;
        this.object3D = new THREE.Object3D();
    }

    addTerrain () {
        // todo fix the var names and organize things better
        let resourceManager = this.gameEngine.renderer.resourceManager;

        let terrainData = resourceManager.getObject( 'terrain' );
        let vertices = terrain.vertices;
        let faces = terrain.faces;

        // create physics terrain highfield body from map data and add it to physics engine
        let data = [];
        for ( let i = 0; i < vertices.length; i++ ) {
            if ( typeof data[ vertices[ i ].x ] === "undefined" ) {
                data[ vertices[ i ].x ] = [];
            }
            data[ vertices[i].x ][ vertices[i].z ] = vertices[i].y;
        }
        let heightfieldShape = new CANNON.Heightfield( data );
        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( heightfieldShape );

        this.gameEngine.physicsEngine.world.addBody( this.terrain );

        // create the terrain model and add to maps object3D
        let gTerrain = new THREE.Geometry();
        gTerrain.vertices = terrainData.vertices;
        gTerrain.faces = terrainData.faces;
        // todo right material
        let mTerrain = new THREE.MeshNormalMaterial();
        let terrain = new THREE.Mesh( gTerrain, mTerrain );
        // todo check if terrain 90deg flip needed

        this.object3D.add( terrain );
    }

    addGround() {
        let resourceManager = this.gameEngine.renderer.resourceManager;

        let gGround = new THREE.PlaneBufferGeometry( 100, 100 );
        let mGround = new THREE.MeshPhongMaterial( {
            name: 'sand',
            map: resourceManager.getTexture( 'sand1' ),
        } );
        let ground = new THREE.Mesh( gGround, mGround );

        ground.rotation.x = Math.PI / -2;

        this.object3D.add( ground );
    }

    addOcean() {
        let resourceManager = this.gameEngine.renderer.resourceManager;

        let gWater = new THREE.PlaneBufferGeometry( 100, 100 );
        this.water = new THREE.Water( gWater, {
            color: 0xc8ebff,
            scale: 1,
            flowDirection: new THREE.Vector2( 1, 1 ),
            // textureWidth: 1024,
            // textureHeight: 1024,
            normalMap0: resourceManager.getTexture( 'water1' ),
            normalMap1: resourceManager.getTexture( 'water2' ),
        } );

        this.water.position.y = .2;
        this.water.rotation.x = Math.PI / -2;

        this.object3D.add( this.water );
    }

    addPhysicsBodies() {
        this.physicsObj = this.gameEngine.physicsEngine.addSphere( 1, 0 );
    }

    onAddToWorld() {
        this.addPhysicsBodies();
        if ( !this.gameEngine.isServer ) {
            // prepare models
            this.addOcean();
            this.addGround();
            this.addTerrain();
            // add map to scene
            this.gameEngine.renderer.addObject( this.object3D );
        }
    }
}
