import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';

const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );
const CANNON = require( 'cannon' );
const Trimesh = require( 'cannon/src/shapes/Trimesh' );
const Material = require( 'cannon/src/material/Material' );

export default class Map extends PhysicalObject {

    static get netScheme() {
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
    constructor( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.gameEngine = gameEngine;
        this.class = Map;
        this.vertices = [];
        this.faces = [];

        if ( typeof Map.data !== 'undefined' ) {
            this.vertices = Map.data.vertices;
            this.faces = Map.data.faces;
            // if ( gameEngine.isServer() ) {
            //     console.log( Map.data.vertices );
            //     console.log( Map.data.faces );
            // }
        }
    }

    static getData() {
        return Map.data;
    }

    static setData( data ) {
        Map.data = data;
    }

    addTerrain() {
        // create the terrain model and add to maps object3D
        let gTerrain = new THREE.Geometry();
        gTerrain.name = 'gTerrain';

        for ( let i = 0; i < this.vertices.length; i += 3 ) {
            let x = this.vertices[ i ];
            let y = this.vertices[ i + 1 ];
            let z = this.vertices[ i + 2 ];
            gTerrain.vertices.push( new THREE.Vector3( x, y, z ) );
        }

        for ( let i = 0; i < this.faces.length; i += 3 ) {
            let a = this.faces[ i ];
            let b = this.faces[ i + 1 ];
            let c = this.faces[ i + 2 ];
            gTerrain.faces.push( new THREE.Face3( a, b, c ) );
        }

        gTerrain.computeVertexNormals();
        gTerrain.computeFaceNormals();

        // todo right material
        let mTerrain = new THREE.MeshToonMaterial( {
            color: 0x333333,
        });
        mTerrain.name = 'mTerrain';

        let terrain = new THREE.Mesh( gTerrain, mTerrain );
        terrain.name = 'Terrain';
        terrain.position.set( 0, 90, 0 );
        terrain.rotation.x = -Math.PI / 2;
        terrain.scale.setScalar( 1 );

        this.object3D.add( terrain );
    }

    addGround() {
        let resourceManager = this.gameEngine.renderer.resourceManager;

        let gGround = new THREE.PlaneBufferGeometry( 100, 100 );
        gGround.name = 'gGround';
        let mGround = new THREE.MeshPhysicalMaterial( {
            name: 'mGround',
            map: resourceManager.getTexture( 'sand1_DIFFUSE' ),
            bumpMap: resourceManager.getTexture( 'sand1_BUMP' ),
            displaceMap: resourceManager.getTexture( 'sand1_DISPLACE' ),
            normalMap: resourceManager.getTexture( 'sand1_NORMAL' ),
        } );
        let ground = new THREE.Mesh( gGround, mGround );

        ground.name = 'Ground';
        ground.position.set( 0, 0, 0 );
        ground.rotation.x = -Math.PI / 2;
        ground.scale.setScalar( 100 );

        this.object3D.add( ground );
    }

    addWater() {
        let resourceManager = this.gameEngine.renderer.resourceManager;

        let gWater = new THREE.PlaneBufferGeometry( 100, 100 );
        gWater.name = 'gWater';
        let water = new THREE.Water( gWater, {
            color: 0xc8ebff,
            scale: 1,
            flowDirection: new THREE.Vector2( 1, 1 ),
            // textureWidth: 1024,
            // textureHeight: 1024,
            normalMap0: resourceManager.getTexture( 'water1' ),
            normalMap1: resourceManager.getTexture( 'water2' ),
        } );

        water.position.y = 1;
        water.rotation.x = -Math.PI / 2;
        water.scale.setScalar( 100 );
        water.material.name = 'mWater';
        water.name = 'Water';

        this.object3D.add( water );
    }

    addPhysicsBodies() {
        let shape = new Trimesh( this.vertices, this.faces );

        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( shape );

        this.gameEngine.physicsEngine.world.addBody( this.physicsObj );
    }

    onAddToWorld() {
        // if ( this.gameEngine.isServer ) {
        if ( !this.gameEngine.isServer() ) {
            // } else {
            this.object3D = new THREE.Object3D();
            // prepare models
            this.addWater();
            this.addGround();
            this.addTerrain();
            // add models
            this.gameEngine.renderer.add( this.object3D );
        }
        this.addPhysicsBodies();
    }

    toString() {
        let p = this.position.toString();
        let v = this.velocity.toString();
        let q = this.quaternion.toString();
        let a = this.angularVelocity.toString();
        let vc = this.vertices.length.toString();
        let fc = this.faces.length.toString();
        return `Map::phyObj[${this.id}] player${this.playerId} Pos=${p} Vel=${v} Dir=${q} AVel=${a} Vc=${vc} Fc=${fc}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
}
