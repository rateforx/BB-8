const fs = require( 'fs' );

const mapName = process.argv[ 2 ];

const map = require( `./dist/maps/${ mapName }.json` );

let v = [];
let f = [];

for ( let i = 0; i < map.vertices.length; i++ ) {
    v.push( map.vertices[ i ].x );
    v.push( map.vertices[ i ].y );
    v.push( map.vertices[ i ].z );
}

for ( let i = 0; i < map.faces.length; i++ ) {
    v.push( map.faces[ i ].a );
    v.push( map.faces[ i ].b );
    v.push( map.faces[ i ].c );
}

let ws = fs.createWriteStream( `./dist/maps/${ mapName }.txt` );

ws.once( 'open', () => {

    for ( let i = 0; i < v.length; i++ ) {
        ws.write( `${ v[ i ] }` );
        if ( i !== v.length - 1 )
            ws.write( ',' );
    }

    ws.write( '\r\n' );

    for ( let i = 0; i < f.length; i++ ) {
        ws.write( `${ f[ i ] }` );
        if ( i !== f.length - 1 )
            ws.write( ',' );
    }

    ws.end();

} );
