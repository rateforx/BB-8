import ResourceManager from "./ResourceManager";

const $ = require( 'jquery' );
const THREE = require( 'three/build/three' );
const Stats = require( '../lib/stats.min' );
THREE.CannonDebugRenderer = require( '../lib/CannonDebugRenderer' );
THREE.OutlineEffect = require( '../lib/OutlineEffect' );
THREE.TargetCamera = require( '../lib/TargetCamera' );
import Renderer from "lance/render/Renderer";

// GAME CLASSES
import Map from '../common/Map';
import BB8 from "../common/BB8";
import Crate from "../common/Crate";
import GUI from "./GUI";
import Minimap from "./Minimap";

export default class TheRenderer extends Renderer {

    /**
     * @param gameEngine {TheGameEngine}
     * @param clientEngine {TheClientEngine}
     */
    constructor ( gameEngine, clientEngine ) {
        super( gameEngine, clientEngine );
        this.gameEngine = gameEngine;
        this.clientEngine = clientEngine;

        this.THREE = THREE;

        this.AA = true;
        this.SHADOW = 4096;
        this.CANNON = false;
        this.DEBUG = true;
        this.OUTLINE = true;
        this.BLUR = false;
        this.RESOLUTION = 1; // must be greater than 0, more than 1 is overkill
        this.MINIMAP = false;
        this.ANISOTROPY = 8; // def: 1

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.resourceManager = null;
        this.isReady = false;
        this.frameNum = 0;
        this.gui = null;
    }

    init () {
        return super.init().then( () => {

            window.renderer = this;
            this.scene = new THREE.Scene();
            window.scene = this.scene;
            this.scene.background = new THREE.Color( 0 );
            this.updateViewportSize();

            // show cannon objects
            if ( this.DEBUG ) {
                window.CANNON = this.gameEngine.physicsEngine.CANNON;
                window.THREE = this.THREE;
                this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.gameEngine.physicsEngine.world );
            }

            this.resourceManager = new ResourceManager( this );
            this.resourceManager.once( 'resourcesLoaded', () => {
                this.onResourcesLoaded.call( this );
            } );
            this.loadResources();

            // this.camera = new THREE.PerspectiveCamera (
            this.camera = new THREE.TargetCamera(
                60, // fov
                this.w / this.h, // aspect
                .1, // near
                5000 // far
            );

            // target camera setup
            this.camera.addTarget( {
                name: 'Scene',
                targetObject: this.scene,
                cameraPosition: new THREE.Vector3( -100, 80, -15 ),
                fixed: true,
            } );
            this.camera.setTarget( 'Scene' );

            // this.add( this.camera );
            // this.camera.position.set( 80, 80, -80 );
            // this.camera.lookAt( this.scene.position );

            this.renderer = !this.CANNON
                ? new THREE.WebGLRenderer( { antialias: this.AA } )
                : new THREE.CannonDebugRenderer(
                    this.scene,
                    this.gameEngine.physicsEngine.world
                )
            ;

            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.onResize(); // todo better function name?
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.width = this.SHADOW;
            this.renderer.shadowMap.height = this.SHADOW;

            // noinspection ES6ModulesDependencies
            viewport.append( this.renderer.domElement );
            this.canvas = this.renderer.domElement;
            $( window ).on( 'resize', this.onResize.bind( this ) );

            if ( this.OUTLINE ) {
                this.outline = new THREE.OutlineEffect( this.renderer, {
                    defaultColor: new THREE.Color( 0xffffff ),
                } );
            }
            if ( this.BLUR ) {
                let blurShader = THREE.TriangleBlurShader;
                // todo textureId: 'texture'?
                let effectBlurX = new THREE.ShaderPass( blurShader, 'texture' );
                let effectBlurY = new THREE.ShaderPass( blurShader, 'texture' );
            }

            this.raycaster = new THREE.Raycaster();

            this.stats = new Stats();
            $( '#stats' ).append( this.stats.dom );

            // this.orbitControls = new THREE.OrbitControls( this.camera, document );
        } );
    }

    onResourcesLoaded () {
        this.emit( 'ready' );
        $( '#loading' ).remove();

        this.minimap = new Minimap( this );
        this.MINIMAP = true;

        this.gui = new GUI( this );

        // let overlay = $( '#overlay' );
        // overlay.click( () => {
        //     overlay.remove();
        //     $( 'canvas' )[0].requestPointerLock();
        // } );
    }

    /**
     * Request animation frame called internally by the ClientEngine
     */
    draw ( t, dt ) {
        super.draw( t, dt );
        this.stats.update();
        this.frameNum++;

        this.camera.update();

        if ( this.cannonDebugRenderer ) {
            this.cannonDebugRenderer.update();
        }

        !this.OUTLINE
            ? this.renderer.render( this.scene, this.camera )
            : this.outline.render( this.scene, this.camera )
        ;

        if ( this.MINIMAP ) {
            this.minimap.draw();
        }
    }

    /**
     * @param object {Object3D}
     */
    add ( object ) {
        this.scene.add( object );
    }

    /**
     * @param object {Object3D}
     */
    remove ( object ) {
        this.scene.remove( object );
    }

    onMetaDataUpdate () {
        let metaData = this.gameEngine.metaData;
        // todo update the meta :v
    }

    // noinspection JSMethodCanBeStatic
    updateHUD ( data ) {
        if ( data.RTT ) {
            $( '.latencyData' ).html( data.RTT );
        }
        if ( data.RTTAverage ) {
            $( '.averageLatencyData' ).html( data.RTTAverage );
        }
    }

    /** @deprecated use add() */
    addObject () {}

    /** @deprecated use remove() */
    removeObject () {}

    static enableFullScreen () {
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

    updateViewportSize () {
        let viewport = $( '#viewport' ); // todo optimize (glob const)
        this.w = viewport.width();
        this.h = viewport.height();
    }

    onResize () {
        this.updateViewportSize();
        let w = this.w;
        let h = this.h;
        this.renderer.setSize( w * this.RESOLUTION, h * this.RESOLUTION );

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    loadResources () {
        // scene
        this.resourceManager.loadTexture( 'metal/metal_BUMP.jpg', 'metal' );
        this.resourceManager.loadScene( 'hang-on2' );
        this.scene.background = this.resourceManager.loadCubeTexture( 'galaxy', 'galaxy' );
        // this.scene.background = THREE.Color( 0 );
        // BB8
        this.resourceManager.loadObject( 'bb8.json', 'bb8' );
        this.resourceManager.loadTexture( 'bb8/bb8_DIFFUSE.jpg', 'bb8_DIFFUSE' );
        this.resourceManager.loadTexture( 'bb8/bb8_NORMAL.jpg', 'bb8_NORMAL' );
        // Map
        // this.resourceManager.loadTexture( 'water/water1.jpg', 'water1' );
        // this.resourceManager.loadTexture( 'water/water2.jpg', 'water2' );
        // this.resourceManager.loadTexture( 'sand/sand1_BUMP.jpg', 'sand1_BUMP' );
        // this.resourceManager.loadTexture( 'sand/sand1_DIFFUSE.jpg', 'sand1_DIFFUSE' );
        // this.resourceManager.loadTexture( 'sand/sand1_DISPLACE.jpg', 'sand1_DISPLACE' );
        // this.resourceManager.loadTexture( 'sand/sand1_NORMAL.jpg', 'sand1_NORMAL' );
        // Minimap
        this.resourceManager.loadObject( 'phone.json', 'phone' );
        // Crate
        // this.resourceManager.loadTexture( 'crate/crate_DIFFUSE.jpg', 'crate_DIFFUSE' );
        // this.resourceManager.loadTexture( 'crate/crate_NORMAL.jpg', 'crate_NORMAL' );
        // this.resourceManager.loadTexture( 'crate/crate_SPECULAR.jpg', 'crate_SPECULAR' );
        // this.resourceManager.loadTexture( 'crate/crate_DISPLACE.jpg', 'crate_DISPLACE' );
    }
}