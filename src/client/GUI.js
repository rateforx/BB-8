import * as dat from 'dat.gui/src/dat/index';

const $ = require( 'jquery' );
const THREE = require( 'three/build/three' );

export default class GUI {

    /**
     * @param renderer {TheRenderer}
     */
    constructor ( renderer ) {
        this.renderer = renderer;

        this.gui = new dat.GUI();
        this.folders = [];

        let params = {
            resolution: renderer.RESOLUTION,
            shadowResolution: renderer.SHADOW,
            outlines: renderer.OUTLINE,
            antialiasing: renderer.AA,

            zoom: renderer.minimap.ZOOM,
            minimapRotation: renderer.minimap.ROTATION,
        };

        // graphics opts
        let graphics = this.folders.graphics = this.gui.addFolder( 'Graphics' );

        graphics.add( params, 'resolution', .01, 2 )
            .onFinishChange( value => {
                renderer.RESOLUTION = value;
                renderer.onResize();
            } );

        graphics.add( params, 'shadowResolution', [ 128, 256, 512, 1024, 2048, 4096 ] )
            .onChange( value => {
                renderer.renderer.SHADOW = renderer.renderer.shadowMap.width = renderer.renderer.shadowMap.height = value;
                renderer.scene.traverse( o => {
                    if ( o.type === 'PointLight' ) {
                        o.shadow.mapSize.width = o.shadow.mapSize.height = value;
                    }
                } );
            } );

        graphics.add( params, 'outlines' )
            .onChange( value => renderer.OUTLINE = value );

        graphics.add( params, 'antialiasing' )
            .onChange( value => renderer.AA = value );

        // minimap opts
        let minimap = this.folders.minimap = this.gui.addFolder( 'Minimap' );

        minimap.add( params, 'zoom', 1, 50 )
            .onChange( value => {
                this.renderer.minimap.camera.zoom = value;
                this.renderer.minimap.camera.updateProjectionMatrix();
            } );

        // minimap.add( params, 'minimapRotation' );

        // this.gui.open();

        // this.addTerrainHelper();
    }

    addTerrainHelper () {
        let raycaster = new THREE.Raycaster();
        let renderer = this.renderer;
        let domElement = $( '#target' );

        $( window ).mousemove( event => {

            let mouse = new THREE.Vector2();
            mouse.x = (event.clientX / renderer.canvas.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / renderer.canvas.innerHeight) * 2 + 1;
            raycaster.setFromCamera( mouse, renderer.camera );

            let intersects = raycaster.intersectObject( renderer.scene.getObjectByName( 'Terrain' ) );

            if ( intersects.length > 0 ) {
                domElement.text( intersects[ 0 ].point );
            } else {
                domElement.text( 'N/A' );
            }
        } );
    }
}