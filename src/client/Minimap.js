const THREE = require( 'three/build/three' );

export default class Minimap {

    constructor( renderer ) {
        this.renderer = renderer;

        // topdown ortho camera
        this.camera = new THREE.OrthographicCamera(
            renderer.w / -2, renderer.w / 2,
            renderer.h / 2., renderer.h / -2,
            0, 1000
        );

        this.target = new THREE.WebGLRenderTarget( renderer.w, renderer.h, {
            anisotropy: 8,
        } );

        // map with be shown on the screen
        this.phone = renderer.resourceManager.getObject( 'phone' );
    }

    draw() {
        // todo minimap drawing
    }

    static loadResources( rm ) {
        rm.loadJSON( 'phone.json', 'phone' );
    }
}
