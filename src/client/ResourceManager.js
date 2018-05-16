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

        this.loadingManager = THREE.DefaultLoadingManager;
        this.loadingManager.onProgress = ( url, itemsLoaded, itemsTotal ) => {
            if ( url.length > 32 ) url = url.slice(0,32) + '...';
            console.log( `Loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files.` );
        };
        this.loadingManager.onLoad = () => {
            this.emit( 'resourcesLoaded' );
        };
        this.loadingManager.onError = url => {
            console.log( `There was an error loading ${url}` );
        };

        this.textureLoader = new THREE.TextureLoader( this.loadingManager );
        this.textureLoader.setPath( '/textures/' );

        this.cubeTextureLoader = new THREE.CubeTextureLoader( this.loadingManager );
        this.cubeTextureLoader.setPath( '/textures/skybox/' );

        // this.colladaLoader = new ColladaLoader( this.loadingManager ));

        this.objectLoader = new THREE.ObjectLoader( this.loadingManager );
        // this.objectLoader.setPath( '' );

        this.jsonLoader = new THREE.JSONLoader( this.loadingManager );

        this.fileLoader = new THREE.FileLoader( this.loadingManager );

        this.objLoader = new THREE.OBJLoader( this.loadingManager );
        this.objLoader.setPath( '/models/' );

        this.textures = [];
        this.models = [];
        this.objects = [];
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
                if ( name !== undefined )
                    this.models[ name ] = obj;
                this.emit( name, obj );
            }
        );
    }

    loadObject( url, name ) {
        this.objectLoader.load(
            url,
            object3D => {
                if ( name !== undefined )
                    this.objects[ name ] = object3D;
                this.emit( name, object3D );
            }
        )
    }

    loadJSON( url, name ) {
        this.jsonLoader.load(
            url,
            obj => {
                if ( name !== undefined )
                    this.objects[ name ] = obj;
                this.emit( name, obj );
            }
        )
    }

    getTexture( name ) {
        return this.textures[ name ];
    }

    getModel( name ) {
        return this.models[ name ];
    }

    getObject( name ) {
        return this.objects[ name ];
    }

    assignEmitter() {
        // extend the ResourceManager class with EventEmitter fields and methods
        _.extend( this, EventEmitter.prototype );
        // call the init method of the emitter to warm it up and apply the lube
        EventEmitter.prototype.init.call( this );
    }
}
