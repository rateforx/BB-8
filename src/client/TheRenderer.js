const THREE = require( 'three' );
import Renderer from "lance/render/Renderer";

require( '../lib/CannonDebugRenderer' );
require( '../lib/OutlineShader' );

const $ = require( 'jquery' );

const AA = true;
const DEBUG = true;
const OUTLINE = true;

export default class TheRenderer extends Renderer {

    constructor( gameEngine, clientEngine ) {
        super( gameEngine, clientEngine );

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        // $( window ).on( 'load', this.init );
    }

    init() {
        super.init();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xff00ff ); // violet sky cause reasons

        let viewport = $( '#viewport' );
        let width = viewport.width();
        let height = viewport.height();

        this.camera = new THREE.PerspectiveCamera(
            60, // fov
            width / height, // aspect
            .1, // near
            1000 // far
        );
        this.scene.add( camera );

        this.topDownCamera = new THREE.OrthographicCamera(
            width / -2, width / 2, // left, right
            height / 2, height / -2, // top, bottom
            1, 1000 // near, far
        );
        this.scene.add( this.topDownCamera );

        this.renderer = !DEBUG
            ? new THREE.WebGLRenderer( { antialias: AA } )
            : new THREE.CannonDebugRenderer( this.scene, this.gameEngine.physicsEngine.world )
        ;
        viewport.append( this.renderer.domElement );

        if ( OUTLINE ) {
            this.outline = new THREE.OutlineEffect( this.renderer, {
                defaultColor: new THREE.Color( 0xffffff )
            } );
        }

        this.raycaster = new THREE.Raycaster();
    }

    draw() {
        super.draw();

        !OUTLINE
            ? this.renderer.render( this.scene, this.camera )
            : this.outline.render( this.scene, this.camera )
        ;

        // requestAnimationFrame( this.draw );
    }

    addObject( object ) {
        this.scene.add( object );
        return object; // for chainability
    }

    removeObject( object ) {
        this.scene.remove( object );
    }

    onMetaDataUpdate() {
        let metaData = this.gameEngine.metaData;
        // todo update the meta :v
    }

    static updateHUD( data ) {
        if ( data.RTT ) {
            $( '.latencyData' ).html( data.RTT );
        }
        if ( data.RTTAverage ) {
            $( '.averageLatencyData' ).html( data.RTTAverage );
        }
    }

    static enableFullScreen() {
        let isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);

        let docElm = document.documentElement;
        if ( !isInFullScreen ) {

            if ( docElm.requestFullscreen ) {
                docElm.requestFullscreen();
            } else if ( docElm.mozRequestFullScreen ) {
                docElm.mozRequestFullScreen();
            } else if ( docElm.webkitRequestFullScreen ) {
                docElm.webkitRequestFullScreen();
            }
        }
    }
}