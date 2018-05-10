import ResourceManager from "./ResourceManager";

const THREE = require( 'three/build/three' );
const Stats = require( 'three-stats/dist/index.js' ).Stats;
import Renderer from "lance/render/Renderer";

THREE.CannonDebugRenderer = require( '../lib/CannonDebugRenderer' );
THREE.OutlineEffect = require( '../lib/OutlineEffect' );

const $ = require( 'jquery' );

const AA = true;
const CANNON = false;
const DEBUG = true;
const OUTLINE = true;
const BLUR = false;

export default class TheRenderer extends Renderer {

    constructor( gameEngine, clientEngine ) {
        super( gameEngine, clientEngine );

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.resourceManager = null;
        // $( window ).on( 'load', this.init );
    }

    init() {
        return super.init().then( _ => {

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
            this.scene.add( this.camera );
            this.camera.position.set( 10, 10, 10 );
            this.camera.lookAt( this.scene.position );

            /*this.topDownCamera = new THREE.OrthographicCamera(
                width / -2, width / 2, // left, right
                height / 2, height / -2, // top, bottom
                1, 1000 // near, far
            );
            this.scene.add( this.topDownCamera );*/

            if ( DEBUG ) {
                this.axesHelper = new THREE.AxesHelper( 50 );
                this.addObject( this.axesHelper );

                this.gridHelper = new THREE.GridHelper( 100, 20 );
                this.addObject( this.gridHelper );
            }

            this.renderer = !CANNON
                ? new THREE.WebGLRenderer( { antialias: AA } )
                : new THREE.CannonDebugRenderer( this.scene, this.gameEngine.physicsEngine.world )
            ;

            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.enabled = true;

            viewport.append( this.renderer.domElement );
            $( window ).on( 'resize', this.onResize.bind( this ) );

            if ( OUTLINE ) {
                this.outline = new THREE.OutlineEffect( this.renderer, {
                    defaultColor: new THREE.Color( 0xffffff ),
                    // defaultThickness: .006, // double thickness
                } );
            }
            if ( BLUR ) {
                let blurShader = THREE.TriangleBlurShader;
                // todo textureId: 'texture'?
                let effectBlurX = new THREE.ShaderPass( blurShader, 'texture' );
                let effectBlurY = new THREE.ShaderPass( blurShader, 'texture' );

            }

            this.raycaster = new THREE.Raycaster();

            this.resourceManager = new ResourceManager();

            this.stats = new Stats();
            $( '#stats' ).append( this.stats.dom );
            this.frameNum = 0;
            // todo load assets here

            this.loadResources();

            $( 'body' ).removeClass( 'loading' );
        } );
    }

    draw() {
        this.stats.update();
        this.frameNum++;
        $( '#frameNum' ).text( `#${this.frameNum}` );

        !OUTLINE
            ? this.renderer.render( this.scene, this.camera )
            : this.outline.render( this.scene, this.camera )
        ;

        if ( this.bb8 !== undefined ) {
            this.bb8.rotation.y += Math.PI / 180; // 1 deg a frame;
        }

        if ( this.spotLight !== undefined ) {
            let t = Date.now() * .0001; // ?
            let amplitude = 20; // -10 : 10
            this.spotLight.position.z = Math.sin( t ) * amplitude;
        }

        requestAnimationFrame( this.draw );
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

    onResize() {
        let SCREEN_WIDTH = window.innerWidth;
        let SCREEN_HEIGHT = window.innerHeight;
        let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

        this.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }

    loadResources() {
        this.scene.background = this.resourceManager.loadTexture(
            [
                'skybox3X+.png', 'skybox3X-.png',
                'skybox3Y+.png', 'skybox3Y-.png',
                'skybox3Z+.png', 'skybox3Z-.png',
            ],
            'galaxy'
        );

        this.resourceManager.loadObj( 'bb8/bb8.obj', 'bb8' );
        this.resourceManager.once( 'bb8', bb8 => {
            this.bb8 = bb8.clone();
            this.bb8.position.set( 0, 0, 0 );
            this.bb8.scale.setScalar( .05 ); // scale down the giant fucker
            this.addObject( this.bb8 );

            this.spotLight = new THREE.SpotLight( 0xffffff );
            this.spotLight.position.set( 0, 10, 10 );
            this.spotLight.castShadow = true;
            this.spotLight.penumbra = .25;
            this.spotLight.shadow.mapSize.width = 2048;
            this.spotLight.shadow.mapSize.height = 2048;
            this.spotLight.target = this.bb8;
            this.addObject( this.spotLight );

            this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
            this.addObject( this.spotLightHelper );

            this.ambientLight = new THREE.AmbientLight( 0x1a2e39, .2 );
            this.addObject( this.ambientLight );

            let gPlane = new THREE.PlaneGeometry( 100, 100 );
            let mPlane = new THREE.MeshStandardMaterial();
            mPlane.side = THREE.DoubleSide;
            this.ground = new THREE.Mesh( gPlane, mPlane );
            this.ground.rotateX( Math.PI / 2 );
            this.ground.position.setY = -10;
            this.addObject( this.ground );

            this.scene.traverse( o => {
                if ( o.isMesh === true ) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            } );
        } );
    }
}