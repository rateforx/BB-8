const fs = require( 'fs' );

const mapName = process.argv[ 2 ];

const map = require( `./dist/maps/${ mapName }.json` );

let y = [];

for ( let i = 0; i < map.vertices.length; i++ ) {
    y.push( map.vertices[ i ].z ); // x, not y
}

let ws = fs.createWriteStream( `./dist/maps/${ mapName }.y` );

ws.once( 'open', () => {

    for ( let i = 0; i < y.length; i++ ) {
        ws.write( `${ y[ i ] }\r\n` );
    }

    ws.end();

} );
