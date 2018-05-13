import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';
const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );
const CANNON = require( 'cannon' );
const Trimesh = require( 'cannon/src/shapes/Trimesh' );
Object.sizeof = require( 'object-sizeof' );

export default class Map extends PhysicalObject {

    /**
     * @param gameEngine {TheGameEngine}
     * @param options
     * @param props
     * @param data {Object}
     * @param data.vertices {Array} array of vertices describing highfield {Vec3}
     * @param data.faces {Array} array of faces
     */
    constructor( gameEngine, options, props, data ) {
        super( gameEngine, options, props );
        this.gameEngine = gameEngine;
        this.class = Map;
        this.data = data;
        this.object3D = new THREE.Object3D();
    }

    addTerrain () {
        // create the terrain model and add to maps object3D
        let gTerrain = new THREE.Geometry();
        gTerrain.vertices = this.data.vertices;
        gTerrain.faces = this.data.faces;
        // todo right material
        let mTerrain = new THREE.MeshNormalMaterial();
        let terrain = new THREE.Mesh( gTerrain, mTerrain );
        // todo check if terrain needs a 90deg flip

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
        // prepare trimesh data
        let v = [];
        for( let i = 0; i < this.data.vertices.length; i++ ) {
            v.push( this.data.vertices[ i ].x );
            v.push( this.data.vertices[ i ].y );
            v.push( this.data.vertices[ i ].z );
        }
        let f = [];
        for( let i = 0; i < this.data.faces.length; i++ ) {
            f.push( this.data.faces[ i ].a );
            f.push( this.data.faces[ i ].b );
            f.push( this.data.faces[ i ].c );
        }
        console.log( 'loops have looped successfully' );

        let shape = new Trimesh( v, f );
        console.log( 'shape created' );

        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( shape );
        console.log( 'body created' );
        // console.log( 'Terrain physicsObj: ' + Object.sizeof( this.physicsObj ) );

        this.gameEngine.physicsEngine.world.addBody( this.physicsObj );
    }

    onAddToWorld() {
        this.addPhysicsBodies();
        if ( !this.gameEngine.isServer ) {
            // prepare models
            this.addOcean();
            this.addGround();
            this.addTerrain();
            // add models
            this.gameEngine.renderer.addObject( this.object3D );
        }
        // conserve memory!
        delete this.data;
    }
}
