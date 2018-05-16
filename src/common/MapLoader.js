const _ = require( 'underscore' );
const EventEmitter = require( 'eventemitter4' );
const THREE = require( 'three/build/three' );
THREE.FileLoader = require( '../lib/FileLoader' );

export default class MapLoader {

    /**
     * @param gameEngine {TheGameEngine}
     */
    constructor( gameEngine ) {
        this.assignEmitter();
        this.loader = new THREE.FileLoader( THREE.DefaultLoadingManager );
        this.maps = [];
        this.gameEngine = gameEngine;
    }

    /*loadMapJson( name ) {
        let url = '/maps/' + name;
        if ( this.isServer ) {
            url = `http://localhost:${process.env.PORT}/maps/${name}`;
        }
        console.log( `Getting map data from ${url}` );
        this.loader.load(
            url,
            data => {
                let object = JSON.parse( data );
                if ( name !== undefined ) {
                    this.emit( name, object );
                    this.maps[ name ] = object;
                }
            }
        )
    }*/

    loadMapData( name ) {
        let url = `/maps/${name}.txt`;
        if ( this.gameEngine.isServer() ) {
            // url = `http://localhost:${process.env.PORT}/maps/${name}.txt`;
            url = `http://localhost:80/maps/${name}.txt`;
        }
        console.log( `Getting map data from ${url}` );
        this.loader.load(
            url,
            data => {
                let object = MapLoader.parseData( data );
                if ( name !== undefined ) {
                    this.emit( name, object );
                    this.maps[ name ] = object;
                }
            }
        )
    }

    getMapData( name ) {
        return this.maps[ name ];
    }

    /**
     * @param data {String}
     * @returns object {Object}
     */
    static parseData( data ) {

        let splitted = data.split( '\r\n' );
        let vStrings = splitted[0];
        let fStrings = splitted[1];

        let av = vStrings.split( ',' );
        let af = fStrings.split( ',' );
        // for ( let i = 0; i < v.length; i++ ) v[ i ] = +v[ i ];
        // for ( let i = 0; i < f.length; i++ ) f[ i ] = +f[ i ];

        // v = new Float32Array( v );
        // f = new Int32Array( f );
        let v = [];
        let f = [];
        for ( let i = 0; i < av.length; i++ ) v.push( +av[i] );
        for ( let i = 0; i < af.length; i++ ) f.push( +af[i] );

        // console.log( v );
        // console.log( f );

        return {
            vertices: v,
            faces: f,
        };
    }

    assignEmitter() {
        // extend the ResourceManager class with EventEmitter fields and methods
        _.extend( this, EventEmitter.prototype );
        // call the init method of the emitter to warm it up and apply the lube
        EventEmitter.prototype.init.call( this );
    }
};