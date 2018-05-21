import GameEngine from 'lance/GameEngine';
import CannonPhysicsEngine from 'lance/physics/CannonPhysicsEngine';
import BB8 from './BB8';
import BB8Control from './BB8Control';
import CarControl from './CarControl';
import StrafeControl from './StrafeControl';
import Crate from './Crate';
import Map from './Map';
import MapLoader from './MapLoader';
import ThreeVector from 'lance/serialize/ThreeVector';

const CANNON = require( 'cannon' );
const THREE = require( 'three/build/three' );

export default class TheGameEngine extends GameEngine {

    /**
     * @field renderer {TheRenderer}
     * @param options
     */
    constructor ( options ) {
        super( options );

        this.log = [];

        this.initPhysicsEngine();

        this.bb8Control = new BB8Control( { CANNON } );
        this.carControl = new CarControl( { CANNON } );
        this.mapLoader = new MapLoader( this );

        this.numPlayers = 0;
        this.metaData = {
            players: [],
        };

        this._isServer = typeof window === 'undefined';
        if ( !this.isServer ) {
            this.renderer = {}; // redundant?
        }

        // this.loadMapData.call( this );
        this.loadScene.call( this );

        this.on( 'server__init', () => {
            // this.loadMapData.call( this );
            // this.init.call( this );
        } );
    }

    isServer () {
        return this._isServer;
    }

    start () {
        super.start();
    }

    /**
     * The game engine step
     * @param isReenact {Boolean}
     * @param t {Number}
     * @param dt {Number}
     * @param physicsOnly {Boolean}
     */
    step ( isReenact, t, dt, physicsOnly ) {
        super.step( isReenact, t, dt, physicsOnly );

        this.world.forEachObject( ( id, obj ) => {
            if ( obj.class === BB8 ) {
                obj.adjustMovement();
            }
        } );

        // todo kill check?
    }

    loadMapData () {
        console.log( 'Loading map' );
        let mapName = 'terrain';
        this.mapLoader.on( mapName, data => {

            this.spawns = [];
            for ( let i = 0; i < data.spawns.length; i += 3 ) {
                let x = data.spawns[ i ];
                let y = data.spawns[ i + 1 ];
                let z = data.spawns[ i + 2 ];
                this.spawns.push( new ThreeVector( x, y, z ) );
            }

            Map.setData( data );
            if ( this.isServer() ) {
                this.init.call( this );
            }
        } );
        this.mapLoader.loadMapData( mapName );
    }

    loadScene () {
        console.log( 'Loading scene' );
        let name = 'hang-on2';

        this.mapLoader.on( name, json => {
            Map.setJSON( json );
            if ( this.isServer() ) {
                this.init.call( this );
            }
        } );
        this.mapLoader.loadBodiesData( name );
    }

    init () {
        this.map = new Map( this );
        this.addObjectToWorld( this.map );
    }

    registerClasses ( serializer ) {
        serializer.registerClass( BB8 );
        serializer.registerClass( Crate );
        serializer.registerClass( Map );
    }

    /**
     * @param playerId
     * @param team
     * @returns {BB8}
     */
    addPlayer ( playerId, team ) {
        console.log( 'adding a new player ' + playerId );

        let existingBB8 = this.world.queryObject( { playerId } );
        if ( existingBB8 ) {
            return existingBB8;
        }

        let options = {};
        let props = {
            position: this.spawns[ Math.floor( Math.random() * this.spawns.length ) ],
            // position: new ThreeVector( -17.28, 51.09, 26.23 )
        };
        let bb8 = new BB8( this, options, props );
        bb8.playerId = playerId;

        this.addObjectToWorld( bb8 );
        this.numPlayers++;

        console.log( `New BB8 [${bb8.id}] for player [${playerId}]` );

        return bb8;
    }

    removePlayer ( playerId ) {
        console.log( `removing player ${playerId}` );

        let obj = this.world.queryObject( { playerId } );
        if ( obj ) {
            this.removeObjectFromWorld( obj.id );
            this.numPlayers--;
        }
    }

    /**
     *
     * @param inputData
     * @param playerId
     */
    processInput ( inputData, playerId ) {
        super.processInput( inputData, playerId );
        let playerObj = this.world.queryObject( { playerId } );
        if ( playerObj ) {
            StrafeControl.accelerate( playerObj, inputData.input );
            playerObj.refreshFromPhysics();
        }
    }

    initPhysicsEngine () {
        this.physicsEngine = new CannonPhysicsEngine( { gameEngine: this } );
        this.physicsEngine.world.broadphase = new CANNON.SAPBroadphase( this.physicsEngine.world );
        // this.physicsEngine.world.broadphase = new CANNON.NaiveBroadphase();
        this.physicsEngine.world.gravity.set( 0, -9.81 * 4, 0 );
        this.physicsEngine.world.defaultContactMaterial.friction = 0;
        // this.physicsEngine.world.defaultContactMaterial.restitution = 0;

        let groundMaterial = new CANNON.Material( 'groundMaterial' );
        let wheelMaterial = new CANNON.Material( 'wheelMaterial' );
        let contactMaterial = new CANNON.ContactMaterial( groundMaterial, wheelMaterial, {
            friction: .3,
            restitution: 0,
            contactEquationStiffness: 1000,
        } );

        // this.physicsEngine.world.addMaterial( groundMaterial );
        // this.physicsEngine.world.addMaterial( wheelMaterial );
        this.physicsEngine.world.addContactMaterial( contactMaterial );
    }
}