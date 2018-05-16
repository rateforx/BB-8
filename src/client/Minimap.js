const THREE = require( 'three/build/three' );

export default class Minimap {

    constructor( renderer ) {
        this.renderer = renderer;

        // topdown ortho camera
        this.camera = new THREE.OrthographicCamera(
            // height and width swapped on purpose
            renderer.h / -2, renderer.h / 2,
            renderer.w / 2, renderer.w / -2,
            1, 1000
        );
        this.camera.position.set( 0, 10, 0 );
        this.camera.lookAt( renderer.scene.position );
        this.ZOOM = 10;
        this.camera.zoom = this.ZOOM;
        renderer.scene.add( this.camera );
        this.ROTATION = true;

        this.target = new THREE.WebGLRenderTarget(
            renderer.h * .2,
            renderer.w * .2,
            {
                anisotropy: 4,
                depthbuffer: false,
                stencilBuffer: false,
            }
        );

        this.addObject3D();
    }

    addObject3D() {
        this.phone = this.renderer.resourceManager.getObject( 'phone' ).clone();

        this.renderer.camera.add( this.phone );
        this.phone.position.set( .75, -.3, -1.1 );
        // this.phone.rotation.set( -5, -15, 0 );
        this.phone.scale.setScalar( 3 );

        // material for the phones screen
        this.screen = this.phone.getObjectByName( 'Screen' );

        this.screen.material = new THREE.MeshBasicMaterial( {
            map: this.target.texture,
        } );

        this.renderer.camera.layers.enable( 3 );
        this.phone.layers.set( 3 );

        /*this.screen.material = new THREE.ShaderMaterial( {
            uniforms: {
                tDiffuse: { value: this.target.texture },
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,
            depthWrite: false,
        });*/
    }

    draw() {
        if ( this.ROTATION ) {

            // renderer.camera -> main camera
            // this.camera -> minimap camera
            // let q = new THREE.Quaternion( 0, this.renderer.camera.rotation.y, 0, 0 );

            // this.camera.quaternion.multiply( q );
            // this.camera.quaternion.setFromAxisAngle(
            //     new THREE.Vector3( asdfg ),
            //     Math.PI / 2
            // );
            // this.camera.rotation.set( Math.PI / 2, 0, this.renderer.camera.rotation.y );

        }

        this.renderer.outline.render(
            this.renderer.scene,
            this.camera,
            this.target,
            true
        );
    }
}
