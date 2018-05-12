import ResourceManager from "./ResourceManager";
import * as dat from 'dat.gui/src/dat/index';

const $ = require( 'jquery' );
const THREE = require( 'three/build/three' );
const Stats = require( '../lib/stats.min' );
THREE.CannonDebugRenderer = require( '../lib/CannonDebugRenderer' );
THREE.OutlineEffect = require( '../lib/OutlineEffect' );
import Renderer from "lance/render/Renderer";

// GAME CLASSES
import Map from '../common/Map';
import BB8 from "../common/BB8";
import Crate from "../common/Crate";

export default class TheRenderer extends Renderer {

    constructor( gameEngine, clientEngine ) {
        super( gameEngine, clientEngine );
        this.gameEngine = gameEngine;
        this.clientEngine = clientEngine;

        this.THREE = THREE;

        this.AA = true;
        this.SHADOW = 2048;
        this.CANNON = false;
        this.DEBUG = true;
        this.OUTLINE = true;
        this.BLUR = false;
        this.RESOLUTION = 1; // must be greater than 0, more than 1 is overkill
        this.MINIMAP = true;
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

    init() {
        return super.init().then( () => {

            this.scene = new THREE.Scene();
            window.scene = this.scene;
            this.scene.background = new THREE.Color( 0 );

            this.resourceManager = new ResourceManager();
            this.resourceManager.once( 'finished', () => {
                this.emit('ready');
                $( '#loading' ).remove();
            } );
            this.loadResources();

            this.updateViewportSize();

            this.camera = new THREE.PerspectiveCamera(
                60, // fov
                this.w / this.h, // aspect
                .1, // near
                1000 // far
            );
            this.scene.add( this.camera );
            this.camera.position.set( 10, 10, 10 );
            this.camera.lookAt( this.scene.position );

            let frustrum = this.h < this.w ? this.h : this.w;
            this.topDownCamera = new THREE.OrthographicCamera(
                frustrum / -2, frustrum / 2, // left, right
                frustrum / 2, frustrum / -2, // top, bottom
                1, 1000 // near, far
            );
            this.topDownCamera.position.y = 100;
            this.topDownCamera.lookAt( this.scene.position );
            this.scene.add( this.topDownCamera );

            if ( this.DEBUG ) {
                this.axesHelper = new THREE.AxesHelper( 50 );
                this.addObject( this.axesHelper );

                // this.gridHelper = new THREE.GridHelper( 100, 20 );
                // this.addObject( this.gridHelper );

                this.polarGridHelper = new THREE.PolarGridHelper( 50, 24, 5, 16 );
                this.addObject( this.polarGridHelper );
            }

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

            viewport.append( this.renderer.domElement );
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
            if ( this.MINIMAP ) {
                let res = this.h < this.w ? this.h : this.w; // todo optimize
                this.renderTarget = new THREE.WebGLRenderTarget( res, res, {
                    anisotropy: this.ANISOTROPY,
                } );

                let mSprite = new THREE.SpriteMaterial();
                this.sprite = new THREE.Sprite( mSprite );
                this.sprite.position.y = 5;
                this.sprite.scale.setScalar( 5 );
                this.sprite.material.map = this.renderTarget.texture;

                this.addObject( this.sprite );
            }

            this.raycaster = new THREE.Raycaster();

            this.stats = new Stats();
            $( '#stats' ).append( this.stats.dom );

            this.gui = new dat.GUI();
            let params = {
                resolution: this.RESOLUTION,
                shadowResolution: this.SHADOW,
                outlines: this.OUTLINE,
                antialiasing: this.AA,
            };
            this.gui.add( params, 'resolution', .01, 2 )
                .onFinishChange( value => {
                    this.RESOLUTION = value;
                    this.onResize();
                } );
            this.gui.add( params, 'shadowResolution', [ 128, 256, 512, 1024, 2048, 4096 ] )
                .onChange( value => {
                    this.SHADOW = this.renderer.shadowMap.width = this.renderer.shadowMap.height = value;
                } );
            this.gui.add( params, 'outlines' )
                .onChange( value => this.OUTLINE = value );
            this.gui.add( params, 'antialiasing' )
                .onChange( value => this.AA = value );
            // this.gui.open();

            this.clientEngine.controls = this.controls = new THREE.OrbitControls( this.camera, document );
            // $( 'body' ).removeClass( 'loading' );
        } );
    }

    /**
     * Request animation frame called internally by the ClientEngine
     */
    draw() {
        // todo fix fps stats :(
        this.stats.update();
        this.frameNum++;

        !this.OUTLINE
            ? this.renderer.render( this.scene, this.camera )
            : this.outline.render( this.scene, this.camera )
        ;

        if ( this.MINIMAP ) {
            this.outline.render( this.scene, this.topDownCamera, this.renderTarget, true );
        }
    }

    addObject( object ) {
        this.scene.add( object );
    }

    removeObject( object ) {
        this.scene.remove( object );
    }

    onMetaDataUpdate() {
        let metaData = this.gameEngine.metaData;
        // todo update the meta :v
    }

    // noinspection JSMethodCanBeStatic
    updateHUD( data ) {
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

    updateViewportSize() {
        let viewport = $( '#viewport' ); // todo optimize (glob const)
        this.w = viewport.width();
        this.h = viewport.height();
    }

    onResize() {
        this.updateViewportSize();
        let w = this.w;
        let h = this.h;
        this.renderer.setSize( w * this.RESOLUTION, h * this.RESOLUTION );

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    loadResources() {
        // scene
        this.scene.background = this.resourceManager.loadCubeTexture( 'sky2', 'skybox' );
        // BB8
        this.resourceManager.loadObj( 'bb8/bb8.obj', 'bb8' );
        // Map
        this.resourceManager.loadTexture( 'water/water1.jpg', 'water1' );
        this.resourceManager.loadTexture( 'water/water2.jpg', 'water2' );
        this.resourceManager.loadTexture( 'sand/sand1_BUMP.jpg', 'sand1_BUMP' );
        this.resourceManager.loadTexture( 'sand/sand1_DIFFUSE.jpg', 'sand1_DIFFUSE' );
        this.resourceManager.loadTexture( 'sand/sand1_DISPLACE.jpg', 'sand1_DISPLACE' );
        this.resourceManager.loadTexture( 'sand/sand1_NORMAL.jpg', 'sand1_NORMAL' );
        // Crate
        this.resourceManager.loadTexture( 'crate/crate_DIFFUSE.jpg', 'crate_DIFFUSE' );
        this.resourceManager.loadTexture( 'crate/crate_NORMAL.jpg', 'crate_NORMAL' );
        this.resourceManager.loadTexture( 'crate/crate_SPECULAR.jpg', 'crate_SPECULAR' );
        this.resourceManager.loadTexture( 'crate/crate_DISPLACE.jpg', 'crate_DISPLACE' );
    }
}