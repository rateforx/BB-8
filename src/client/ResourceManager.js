const _ = require( 'underscore' );
const THREE = require( 'three/build/three' );
const OBJLoader = require( 'three-obj-loader' );
OBJLoader( THREE );
// const OBJLoader2 = require( 'wwobjloader2' );
const ColladaLoader = require( 'three-collada-loader' );

THREE.CubeTextureLoader = require( 'three/src/loaders/CubeTextureLoader' ).CubeTextureLoader;

const EventEmitter = require( 'eventemitter4' );

export default class ResourceManager {

    constructor() {

        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setPath( '/resources/textures/' );

        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.cubeTextureLoader.setPath( '/resources/textures/skybox/' );

        this.colladaLoader = new ColladaLoader();

        this.objLoader = new THREE.OBJLoader();
        this.objLoader.setPath( '/resources/models/' );

        this.textures = [];
        this.models = [];

        this.assignEmitter();
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

    /*loadCubeTexture( urls, name ) {
        let texture = this.cubeTextureLoader.load( urls );
        if ( name !== undefined ) {
            this.textures[ name ] = texture;
        }
        return texture;
    }*/

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
