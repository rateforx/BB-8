const THREE = require( 'three' );

class ResourceManager {

    constructor() {

        this.textureLoader = new THREE.TextureLoader()
            .setPath( '/assets/textures/' );

        this.cubeTextureLoader = new THREE.CubeTextureLoader()
            .setPath( '/assets/textures/skybox/' );

        this.objLoader = new THREE.OBJLoader()
            .setPath( '/assets/models/' );

        this.textures = [];
        this.models = [];
    }

    loadTexture( url, name ) {
        this.textureLoader.load( url, texture => {
            this.textures[ name ] = texture;
        } )
    }

    loadCubeTexture( urls, name ) {
        this.cubeTextureLoader.load( urls, texture => {
            this.textures[ name ] = texture;
        } )
    }

    loadObj( url, name ) {
        this.objLoader.load( url, obj => {
            this.models[ name ] = obj;
        } )
    }

    getTexture( name ) {
        return this.textures[ name ];
    }

    getModel( name ) {
        return this.models[ name ];
    }
}
