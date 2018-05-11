const _ = require( 'underscore' );
const EventEmitter = require( 'eventemitter4' );
const THREE = require( 'three/build/three' );
const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );
// const OBJLoader2 = require( 'wwobjloader2' );
// const ColladaLoader = require( 'three-collada-loader' );
THREE.CubeTextureLoader = require( 'three/src/loaders/CubeTextureLoader' ).CubeTextureLoader;

export default class ResourceManager {

    constructor() {
        this.assignEmitter();

        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setPath( '/textures/' );

        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.cubeTextureLoader.setPath( '/textures/skybox/' );

        // this.colladaLoader = new ColladaLoader();

        this.objLoader = new THREE.OBJLoader();
        this.objLoader.setPath( '/models/' );

        this.textures = [];
        this.models = [];
    }

    loadTexture( url, name ) {
        let texture;
        if ( typeof url === 'string' ) {
            texture = this.textureLoader.load( url );
        }
        if ( typeof url === 'object' ) {
            texture = this.cubeTextureLoader.load( url );
        }
        if ( name !== undefined ) {
            this.textures[ name ] = texture;
        }
        return texture;
    }

    loadCubeTexture( url, name ) {
        this.cubeTextureLoader.setPath( `/textures/skybox/${url}/` );

        let texture = this.cubeTextureLoader.load(
            [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ]
        );
        if ( name !== undefined ) {
            this.textures[ name ] = texture;
        }
        return texture;
    }

    loadObj( url, name ) {
        this.objLoader.load(
            url,
            obj => {
                this.models[ name ] = obj;
                this.emit( name, this.models[ name ] );
            },
            req => {
                let progress = Math.floor( req.loaded / req.total * 100 );
                console.log( `Loading ${name}: ${progress}%` );
            }
        );
    }

    getTexture( name ) {
        return this.textures[ name ];
    }

    getModel( name ) {
        return this.models[ name ];
    }

    assignEmitter() {
        // extend the ResourceManager class with EventEmitter fields and methods
        _.extend( this, EventEmitter.prototype );
        // call the init method of the emitter to warm it up and apply the lube
        EventEmitter.prototype.init.call( this );
    }
}
