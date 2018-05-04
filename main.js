const express = require( 'express' );
const socketIO = require( 'socket.io' );
const path = require( 'path' );


// Constants
const PORT = process.env.PORT || 3000;
const INDEX = path.join( __dirname, './dist/index.html' );

// network servers
const server = express();
const requestHandler = server.listen( PORT, () => console.log( `Listening on ${PORT}` ) );
const io = socketIO( requestHandler );

// get game classes
const TheServerEngine = require( './src/server/TheServerEngine' );
const TheGameEngine = require( './src/common/TheGameEngine' );
const Trace = require( 'lance/lib/Trace' );

// create instances
const gameEngine = new TheGameEngine( { traceLevel: Trace.TRACE_NONE } );
const serverEngine = new TheServerEngine( io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 20 } );

// can define routes after the matchmaker
server.get( '/gameStatus', ( req, res ) => { res.send( serverEngine.gameStatus() ); } );
server.get( '/', ( req, res ) => { res.sendFile( INDEX ); } );
server.use( '/', express.static( path.join( __dirname, './dist/' ) ) );

// start the game
serverEngine.start();
