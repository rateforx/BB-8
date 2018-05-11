import GameEngine from "lance/GameEngine";
import CannonPhysicsEngine from "lance/physics/CannonPhysicsEngine";
import BB8 from "./BB8";
import BB8Control from "./BB8Control";
import Crate from "./Crate";
import Map from "./Map";

export default class TheGameEngine extends GameEngine {

    constructor( options ) {
        super( options );

        this.log = [];
        this.physicsEngine = new CannonPhysicsEngine( { gameEngine: this } );
        // todo bb8 control
        // this.bb8Control = new BB8Control( {} );

        // todo init meta
        this.players = [];
        this.numPlayers = 0;

        this.on( 'server__init', this.init.bind( this ) );
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
        this.map = new Map( this );
        this.addObjectToWorld( this.map );
    }

    /**
     * Checks if the TheGameEngine instance is on the server side.
     * @returns {boolean}
     */
    isServer() {
        return typeof window === 'undefined';
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

        let bb8 = new BB8( this, new Vec3( 0, 0, 0 ) );
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
