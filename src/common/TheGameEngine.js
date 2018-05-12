import GameEngine from "lance/GameEngine";
import CannonPhysicsEngine from "lance/physics/CannonPhysicsEngine";
import BB8 from "./BB8";
import BB8Control from "./BB8Control";
import Crate from "./Crate";
import Map from "./Map";
import MapLoader from "./MapLoader";

export default class TheGameEngine extends GameEngine {

    /**
     *
     * @filed renderer {TheRenderer}
     * @param options
     */
    constructor( options ) {
        super( options );

        this.log = [];
        this.physicsEngine = new CannonPhysicsEngine( { gameEngine: this } );
        // todo bb8 control
        // this.bb8Control = new BB8Control( {} );

        // todo init meta
        this.players = [];
        this.numPlayers = 0;

        this._isServer = typeof window === 'undefined';

        this.on( 'server__init', () => {
            console.log( 'server__init emmited' );
            this.init.bind( this );
            //todo??
            this.init();
        } );

        this.mapLoader = new MapLoader();
    }


    get isServer() {
        return this._isServer;
    }

    start() {
        super.start();
    }

    // The Game engine step
    step( isReenact, t, dt, physicsOnly ) {
        super.step( isReenact, t, dt, physicsOnly );

        // todo update positions and stuff
    }

    init() {
        console.log( 'GameEngine: initializing map' );

        let map = 'terrain.json';
        // if ( this.isServer ) {
        //     // this.map = new Map( this, data );
        //     // this.addObjectToWorld( this.map );
        // } else {
            this.mapLoader.on( map, data => {
                let options = {};
                let props = {};
                this.map = new Map( this, data );
                this.addObjectToWorld( this.map );
            } );
            this.mapLoader.loadMapData( map );
        // }
    }

    registerClasses( serializer ) {
        serializer.registerClass( BB8 );
        serializer.registerClass( Crate );
        serializer.registerClass( Map );
    }

    /**
     * @param playerId
     * @param team
     * @returns {BB8}
     */
    addPlayer( playerId, team ) {
        console.log( 'adding a new player ' + playerId );

        let bb8 = new BB8( this );
        bb8.playerId = playerId;

        this.addObjectToWorld( bb8 );
        this.players.push( bb8 );
        this.numPlayers++;

        console.log( `New BB8 [${bb8.id}] for player [${playerId}]` );

        return bb8;
    }

    removePlayer( playerId ) {
        console.log( `removing player ${playerId}` );

        let obj = this.world.queryObject( { playerId } );
        if ( obj ) {
            this.removeObjectFromWorld( obj.id );
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
            // todo process input
        }
    }
}
