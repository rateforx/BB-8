import * as dat from 'dat.gui/src/dat/index';

export default class GUI {

    constructor( renderer ) {
        this.renderer = renderer;

        this.gui = new dat.GUI();
        this.folders = [];

        let params = {
            resolution: renderer.RESOLUTION,
            shadowResolution: renderer.SHADOW,
            outlines: renderer.OUTLINE,
            antialiasing: renderer.AA,

            zoom: renderer.minimap.camera.zoom,
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
                renderer.SHADOW = renderer.renderer.shadowMap.width = renderer.renderer.shadowMap.height = value;
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
            });

        // minimap.add( params, 'minimapRotation' );

        // this.gui.open();
    }
}