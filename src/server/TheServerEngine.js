import ServerEngine from "lance/ServerEngine";

export default class TheServerEngine extends ServerEngine {

    constructor( io, gameEngine, inputOptions ) {
        super( io, gameEngine, inputOptions );
    }

    onPlayerConnected( socket ) {
        super.onPlayerConnected( socket );

        let addPlayer = () => {
            this.gameEngine.addPlayer( socket.playerId, 0 );
        };

        socket.on( 'requestRestart', addPlayer );
        socket.on( 'requestMetaDataUpdate', () => {
            // this.updateMetaData( socket );
        });
        socket.on( 'keepAlive', () => {
            this.resetIdleTimeout( socket );
        } );

        // this.updateMetaData();
    }
    onPlayerDisconnected( socketId, playerId ) {
        super.onPlayerDisconnected( socketId, playerId );

        // todo stuff
    }

    updateMetaData() {
        // todo update metadata on the server
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
}
