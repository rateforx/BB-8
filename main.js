// Constants
import express from 'express';
import SocketIO from 'socket.io';
import path from 'path';
import TheGameEngine from './src/common/TheGameEngine';
import TheServerEngine from './src/server/TheServerEngine';
import Trace from 'lance/lib/Trace';

import pug from 'pug';

const PORT = process.env.PORT || 3000;

// network servers
const server = express();
const requestHandler = server.listen( PORT, () => console.log( `Listening on ${PORT}` ) );
const io = SocketIO( requestHandler );

// create instances
const gameEngine = new TheGameEngine( { traceLevel: Trace.TRACE_NONE } );
const serverEngine = new TheServerEngine( io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 20 } );

server.set('views', path.join(__dirname, './dist/'));
server.set( 'view engine', 'pug' );

server.get( '/gameStatus', ( req, res ) => {
    res.send( serverEngine.gameStatus() );
} );
server.get( '/', ( req, res ) => {
    res.render( 'index' );
} );
server.use( '/', express.static( path.join( __dirname, './dist/' ) ) );

// start the game
serverEngine.start();
