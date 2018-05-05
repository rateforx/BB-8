// Constants
import * as Express from "express";
import SocketIO from 'socket.io';
import * as path from "path";
import TheGameEngine from "./src/common/TheGameEngine";
import TheServerEngine from './src/server/TheServerEngine';
import Trace from 'lance/lib/Trace';

const PORT = process.env.PORT || 3000;
const INDEX = path.join( __dirname, './dist/index.html' );

// network servers
const server = Express();
const requestHandler = server.listen( PORT, () => console.log( `Listening on ${PORT}` ) );
const io = SocketIO( requestHandler );

// create instances
const gameEngine = new TheGameEngine( { traceLevel: Trace.TRACE_NONE } );
const serverEngine = new TheServerEngine( io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 20 } );

// can define routes after the matchmaker
server.get( '/gameStatus', ( req, res ) => {
    res.send( serverEngine.gameStatus() );
} );
server.get( '/', ( req, res ) => {
    res.sendFile( INDEX );
} );
server.use( '/', Express.static( path.join( __dirname, './dist/' ) ) );

// start the game
serverEngine.start();
