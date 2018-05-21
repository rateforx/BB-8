import Serializer from 'lance/serialize/Serializer';
import PhysicalObject from 'lance/serialize/PhysicalObject';

const THREE = require( 'three/build/three' );
THREE.Reflector = require( '../lib/Reflector' );
THREE.Refractor = require( '../lib/Refractor' );
THREE.Water = require( '../lib/Water2' );
const Scene = THREE.Scene;
const CANNON = require( 'cannon' );

const tSCALE = {
    x: 500,
    y: 50,
    z: 500
};

export default class Map extends PhysicalObject {

    /*static get netScheme () {
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
    }*/

    /**
     * @param gameEngine {TheGameEngine}
     * @param options
     * @param props
     */
    constructor ( gameEngine, options, props ) {
        super( gameEngine, options, props );
        this.gameEngine = gameEngine;
        this.class = Map;
        // this.vertices = [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ];
        // this.faces = [ 0, 1, 2 ];
    }

    /**
     * @param scene {Scene}
     */
    static setScene( scene ) {
        Map.scene = scene;
    }

    static getData () {
        return Map.data;
    }

    static setData ( data ) {
        Map.data = data;
    }
    static setJSON ( json ) {
        Map.json = json;
    }

    addTerrain () {
        // create the terrain model and add to maps object3D
        let gTerrain = new THREE.Geometry();
        gTerrain.name = 'gTerrain';

        // calculate plane vertices from heights array
        let squareSide = Math.sqrt( Map.data.heights.length );

        for ( let depth = 0; depth < squareSide; depth++ ) {

            for ( let width = 0; width < squareSide; width++ ) {

                gTerrain.vertices.push( new THREE.Vector3(
                    width,
                    Map.data.heights[ depth * squareSide + width ],
                    depth
                ) );
            }
        }

        // calculate faces indices
        for ( let depth = 0; depth < squareSide - 1; depth++ ) {

            for ( let width = 0; width < squareSide - 1; width++ ) {

                let faceA = new THREE.Face3(
                    ( depth + 1 ) * squareSide + width + 1,
                    depth * squareSide + width + 1,
                    depth * squareSide + width,
                );
                let faceB = new THREE.Face3(
                    depth * squareSide + width,
                    ( depth + 1 ) * squareSide + width,
                    ( depth + 1 ) * squareSide + width + 1,
                );

                gTerrain.faces.push( faceA, faceB );
            }

        }

        /*for ( let n = 0; n < gTerrain.vertices.length; n++ ) {

            let isLastRow = n >= squareSide * squareSide - squareSide;
            let isLastInRow = (n + 1) / Math.floor( n / squareSide ) === 1;

            if ( !isLastInRow && !isLastRow ) {
                // two faces for each vertex
                let faceA = new THREE.Face3(
                    n, // nth vertex
                    n + 1, // vertex on its right
                    n + squareSide + 1 // vetex below the second one
                );
                let faceB = new THREE.Face3(
                    n, // nth vertex
                    n + squareSide, // vertex below it
                    n + squareSide + 1 // vertex on the right of the second
                );

                gTerrain.faces.push( faceA, faceB );
            }
        }*/

        /*for ( let i = 0; i < Map.data.vertices.length; i += 3 ) {
            let x = Map.data.vertices[ i ];
            let y = Map.data.vertices[ i + 1 ];
            let z = Map.data.vertices[ i + 2 ];
            gTerrain.vertices.push( new THREE.Vector3( x, y, z ) );
        }

        for ( let i = 0; i < Map.data.faces.length; i += 3 ) {
            let a = Map.data.faces[ i ];
            let b = Map.data.faces[ i + 1 ];
            let c = Map.data.faces[ i + 2 ];
            gTerrain.faces.push( new THREE.Face3( a, b, c ) );
        }*/

        gTerrain.center();
        gTerrain.computeFaceNormals();
        // gTerrain.computeFlatVertexNormals();

        // todo right material
        let mTerrain = new THREE.MeshToonMaterial( {
            color: 0x333333,
            // side: THREE.DoubleSide, // 2
            // flatShading: true,
        } );
        mTerrain.name = 'mTerrain';

        let terrain = new THREE.Mesh( gTerrain, mTerrain );
        terrain.name = 'Terrain';
        terrain.position.set( 0, 0, 0 );
        // terrain.rotation.set( 0, 0, 0 );
        // terrain.scale.set( tSCALE.x, tSCALE.y, tSCALE.z );

        this.object3D.add( terrain );
    }

    addGround () {
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
        ground.position.y = -60;
        ground.rotation.x = -Math.PI / 2;
        ground.scale.setScalar( 100 );

        this.object3D.add( ground );
    }

    addWater () {
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

        water.position.y = 10;
        water.rotation.x = -Math.PI / 2;
        water.scale.setScalar( 10 );
        water.material.name = 'mWater';
        water.name = 'Water';

        this.object3D.add( water );
    }

    addPhysicsBodies () {
        /*let shape = new CANNON.Trimesh( Map.data.vertices, Map.data.faces );
        let scale = .2;
        shape.setScale( new CANNON.Vec3( scale, scale, scale ) );

        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( shape );
        this.physicsObj.quaternion.setFromAxisAngle(
            new CANNON.Vec3( 1, 0, 0 ),
            -Math.PI / 2
        );*/

        /*let boxShape = new CANNON.Box( new CANNON.Vec3( 1000, 1, 1000 ) );
        let boxBody = new CANNON.Body();
        boxBody.addShape( boxShape );
        boxBody.position.y = 40;
        this.physicsObj = boxBody;*/

        let squareSide = Math.sqrt( Map.data.heights.length );

        let matrix = [];
        
        for ( let depth = 0; depth < squareSide - 1; depth++ ) {

            matrix.push( [] );
            for ( let width = 0; width < squareSide - 1; width++ ) {

                matrix[ depth ].push( Map.data.heights[ depth * squareSide + width ] );
            }
        }

        let sHeightfield = new CANNON.Heightfield( matrix, {
            elementSize: 1, // or tSCALE.z
        } );

        this.physicsObj = new CANNON.Body();
        this.physicsObj.addShape( sHeightfield );
        this.physicsObj.quaternion.setFromAxisAngle( new CANNON.Vec3( 1, 0, 0 ), Math.PI / 2 );

        this.gameEngine.physicsEngine.world.addBody( this.physicsObj );
    }

    /*onAddToWorld () {
        // this.vertices = Map.data.vertices;
        // this.faces = Map.data.faces;

        if ( !this.gameEngine.isServer() ) {
            this.object3D = new THREE.Object3D();
            // prepare models
            this.addWater();
            this.addGround();
            this.addTerrain();
            // add models
            this.gameEngine.renderer.add( this.object3D );
        }
        this.addPhysicsBodies();
    }*/

    /**
     * @param gameEngine {TheGameEngine}
     */
    generateBodiesFromObjects3D ( gameEngine ) {
        for( let i = 0; i < Map.json.object.children.length; i++ ) {
            let o = Map.json.object.children[ i ];

            if ( o.type === "Mesh" && o.name === "Box" ) {
                let matrix = new THREE.Matrix4();
                matrix.fromArray( o.matrix );
                let p = new THREE.Vector3();
                let q = new THREE.Quaternion();
                let s = new THREE.Vector3();
                matrix.decompose( p, q, s );

                let shape = new CANNON.Box( new CANNON.Vec3(
                    s.x / 2, // half width
                    s.y / 2, // half height
                    s.z / 2, // half depth
                ) );
                let body = new CANNON.Body( {
                    mass: 0,
                } );
                body.addShape( shape );
                body.position.set(
                    p.x,
                    p.y,
                    p.z,
                );
                body.quaternion.set(
                    q.x,
                    q.y,
                    q.z,
                    q.w
                );

                gameEngine.physicsEngine.world.add( body );
            }
        }
    }

    /**
     * @param gameEngine {TheGameEngine}
     */
    setSpawns ( gameEngine ) {
        gameEngine.spawns = [];
        for( let i = 0; i < Map.json.object.children.length; i++ ) {
            let o = Map.json.object.children[ i ];

            if ( o.type === 'Mesh' && o.name === 'Cylinder' ) {
                let matrix = new THREE.Matrix4();
                matrix.fromArray( o.matrix );
                let p = new THREE.Vector3();
                let q = new THREE.Quaternion();
                let s = new THREE.Vector3();
                matrix.decompose( p, q, s );

                gameEngine.spawns.push( {
                    x: p.x,
                    y: p.y,
                    z: p.z,
                } );
            }
        }
    }

    /**
     * @param gameEngine {TheGameEngine}
     */
    onAddToWorld ( gameEngine ) {
        this.physicsObj = new CANNON.Body;
        this.generateBodiesFromObjects3D( gameEngine );
        this.setSpawns( gameEngine );
    }

    toString () {
        let p = this.position.toString();
        let v = this.velocity.toString();
        let q = this.quaternion.toString();
        let a = this.angularVelocity.toString();
        return `Map::phyObj[${this.id}] player${this.playerId} Pos=${p} Vel=${v} Dir=${q} AVel=${a}`;
    }

    destroy () {
        this.gameEngine.physicsEngine.removeObject( this.physicsObj );
        this.gameEngine.renderer.remove( this.object3D );
    }
}
