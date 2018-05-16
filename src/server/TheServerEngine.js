import ServerEngine from "lance/ServerEngine";

export default class TheServerEngine extends ServerEngine {

    /**
     *
     * @param io
     * @param gameEngine {TheGameEngine}
     * @param inputOptions
     */
    constructor( io, gameEngine, inputOptions ) {
        inputOptions.timeoutInterval = 0;
        super( io, gameEngine, inputOptions );

        gameEngine.on( 'scoreChange', this.updateMetaData, this );
    }

    onPlayerConnected( socket ) {
        super.onPlayerConnected( socket );

        let addPlayer = () => {
            // add to team with less players

            this.gameEngine.metaData.players[ socket.playerId ] = 0; // initial score = 0
            this.gameEngine.addPlayer( socket.playerId, 0 );
            this.updateMetaData();
        };

        socket.on( 'requestRestart', addPlayer );
        socket.on( 'requestMetaDataUpdate', () => {
            this.updateMetaData( socket );
        });

        socket.on( 'keepAlive', () => {
            this.resetIdleTimeout( socket );
        } );

        this.updateMetaData();
    }

    onPlayerDisconnected( socketId, playerId ) {
        super.onPlayerDisconnected( socketId, playerId );

        this.gameEngine.removePlayer( playerId );

        let playerIndex = this.gameEngine.metaData.players.indexOf( playerId );
        if ( playerIndex > -1 ) {
            this.gameEngine.metaData.players.splice( playerIndex, 1 );
        }

        this.updateMetaData();
    }

    updateMetaData( socket ) {
        if ( socket ) {
            socket.emit( 'metaDataUpdate', this.gameEngine.metaData );
        } else {
            // emit to all
            // delay so player socket can catch up
            setTimeout( () => {
                this.io.sockets.emit( 'metaDataUpdate', this.gameEngine.metaData );
            }, 100 );
        }
    }

    gameStatus( statusQuery ) {
        let statusString = super.gameStatus();
        if ( statusQuery && statusQuery.debug ) {
            let lanceStatus = JSON.parse( statusString );
            lanceStatus.log = this.gameEngine.log;
            statusString = JSON.stringify( lanceStatus );
        }
        return statusString;
    }

    onReceivedInput( data, socket ) {
        super.onReceivedInput( data, socket );
    }
}
