import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';

const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );
const CANNON = require( 'cannon' );
const Trimesh = require( 'cannon/src/shapes/Trimesh' );

export default class Map extends PhysicalObject {

    static get netScheme () {
        return Object.assign( {
            vertices: {
                type: Serializer.TYPES.LIST,
                itemType: Serializer.TYPES.FLOAT32,
            },
            faces: {
                type: Serializer.TYPES.LIST,
                itemType: Serializer.TYPES.INT32,
            },
        }, super.netScheme );
    }

    /**
     * @param gameEngine {TheGameEngine}
     * @param options
     * @param props
     */
    constructor ( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.gameEngine = gameEngine;
        this.class = Map;
        // this.vertices = [];
        // this.faces = [];

        if ( typeof Map.data !== 'undefined' ) {
            this.vertices = Map.data.vertices;
            this.faces = Map.data.faces;
        }
    }

    static getData() {
        return Map.data;
    }

    static setData( data ) {
        Map.data = data;
    }

    addTerrain () {
        // create the terrain model and add to maps object3D
        let gTerrain = new THREE.Geometry();

        for ( let i = 0; i < Map.data.vertices.length; i += 3 ) {
            gTerrain.vertices.push( new THREE.Vector3( Map.data.vertices[ i ] ) );
            gTerrain.vertices.push( new THREE.Vector3( Map.data.vertices[ i + 1 ] ) );
            gTerrain.vertices.push( new THREE.Vector3( Map.data.vertices[ i + 2 ] ) );
        }

        for ( let i = 0; i < Map.data.faces.length; i += 3 ) {
            let a = Map.data.faces[ i ];
            let b = Map.data.faces[ i + 1 ];
            let c = Map.data.faces[ i + 2 ];
            gTerrain.faces.push( new THREE.Face3( a, b, c ) );
        }

        gTerrain.computeVertexNormals();
        gTerrain.computeFaceNormals();

        // todo right material
        let mTerrain = new THREE.MeshNormalMaterial();
        let terrain = new THREE.Mesh( gTerrain, mTerrain );
        // todo check if terrain needs a 90deg flip

        this.object3D.add( terrain );
    }

    addGround () {
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

    addOcean () {
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

    addPhysicsBodies () {
        let shape = new Trimesh( Map.data.vertices, Map.data.faces );

        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( shape );

        this.gameEngine.physicsEngine.world.addBody( this.physicsObj );
    }

    onAddToWorld () {
        // if ( this.gameEngine.isServer ) {
            this.addPhysicsBodies();
        if ( !this.gameEngine.isServer() ) {
        // } else {
            this.object3D = new THREE.Object3D();
            // prepare models
            this.addOcean();
            this.addGround();
            this.addTerrain();
            // add models
            this.gameEngine.renderer.add( this.object3D );
        }
    }

    toString () {
        return `Map::${super.toString()}`;
    }

    destroy () {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
}
