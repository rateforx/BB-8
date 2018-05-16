import GameEngine from "lance/GameEngine";
import CannonPhysicsEngine from "lance/physics/CannonPhysicsEngine";
import BB8 from "./BB8";
import BB8Control from "./BB8Control";
import Crate from "./Crate";
import Map from "./Map";
import MapLoader from "./MapLoader";

let CANNON = null;

export default class TheGameEngine extends GameEngine {

    /**
     * @field renderer {TheRenderer}
     * @param options
     */
    constructor( options ) {
        super( options );

        this.log = [];
        this.physicsEngine = new CannonPhysicsEngine( { gameEngine: this } );
        this.physicsEngine.world.gravity.set( 0, -9.81, 0 );
        CANNON = this.physicsEngine.CANNON;

        this.bb8Control = new BB8Control( { CANNON } );
        this.mapLoader = new MapLoader( this );

        // todo init meta
        this.numPlayers = 0;
        this.metaData = {
            players: [],
        };

        this._isServer = typeof window === 'undefined';
        if ( !this.isServer ) {
            this.renderer = {}; // redundant?
        }

        this.loadMapData();
        this.on( 'server__init', () => {
            // this.init.bind( this );
            this.init.call( this );
        } );
    }

    isServer() {
        return this._isServer;
    }

    start() {
        super.start();
    }

    /**
     * The game engine step
     * @param isReenact {Boolean}
     * @param t {Number}
     * @param dt {Number}
     * @param physicsOnly {Boolean}
     */
    step( isReenact, t, dt, physicsOnly ) {
        super.step( isReenact, t, dt, physicsOnly );

        this.world.forEachObject( (id, obj) => {
            if ( obj.class === BB8 ) {
                obj.adjustMovement();
            }
        } );

        // todo kill check?
    }

    loadMapData() {
        console.log( 'Loading map' );
        let mapName = 'terrain';
        this.mapLoader.on( mapName, data => {
            Map.setData( data );
        });
        this.mapLoader.loadMapData( mapName );
    }

    init() {
        this.map = new Map( this );
        this.addObjectToWorld( this.map );
    }

    registerClasses( serializer ) {
        serializer.registerClass( BB8 );
        serializer.registerClass( Crate );
        serializer.registerClass( Map );
        // serializer.registerClass( Int32Array );
        // serializer.registerClass( Float32Array );
    }

    /**
     * @param playerId
     * @param team
     * @returns {BB8}
     */
    addPlayer( playerId, team ) {
        console.log( 'adding a new player ' + playerId );

        let existingBB8 = this.world.queryObject( { playerId } );
        if ( existingBB8 ) {
            return existingBB8;
        }

        let bb8 = new BB8( this );
        bb8.playerId = playerId;
        // bb8.team = team;

        this.addObjectToWorld( bb8 );
        this.numPlayers++;

        console.log( `New BB8 [${bb8.id}] for player [${playerId}]` );

        return bb8;
    }

    removePlayer( playerId ) {
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
    processInput( inputData, playerId ) {
        super.processInput( inputData, playerId );
        let playerObj = this.world.queryObject( { playerId } );
        if ( playerObj ) {
            if ( [ 'up', 'down' ].includes( inputData.input ) ) {
                this.bb8Control.accelerate( playerObj, inputData.input );
            }
            if ( [ 'left', 'right' ].includes( inputData.input ) ) {
                this.bb8Control.turn( playerObj, inputData.input );
            }
            playerObj.refreshFromPhysics();
        }
    }
}