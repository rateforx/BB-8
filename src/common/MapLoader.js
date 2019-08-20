const _ = require( 'underscore' );
const EventEmitter = require( 'eventemitter4' );
const THREE = require( 'three/build/three' );
THREE.FileLoader = require( '../lib/FileLoader' );

export default class MapLoader {

    /**
     * @param gameEngine {TheGameEngine}
     */
    constructor ( gameEngine ) {
        this.assignEmitter();
        this.loadingManager = new THREE.LoadingManager();
        this.loader = new THREE.FileLoader( this.loadingManager );
        this.maps = [];
        this.scenes = [];
        this.json = [];
        this.gameEngine = gameEngine;
    }

    loadMapJson ( name ) {
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
    }

    loadMapData ( name ) {
        this.maps[ name ] = {};

        let yUrl = `/maps/${name}.y`;
        let sUrl = `/maps/${name}.s`;
        if ( this.gameEngine.isServer() ) {
            yUrl = `http://localhost:80/maps/${name}.y`;
            sUrl = `http://localhost:80/maps/${name}.s`;
        }

        this.loadingManager.onLoad = () => {
            console.log( 'Map data loaded' );
            this.emit( name, this.maps[ name ] );
        };

        console.log( `Getting map height data from ${yUrl}.` );
        this.loader.load(
            yUrl,
            data => {
                this.maps[ name ].heights = MapLoader.parseHeights( data );
            }
        );
        console.log( `Getting map spawns data from ${sUrl}.` );
        this.loader.load(
            sUrl,
            data => {
                this.maps[ name ].spawns = MapLoader.parseSpawns( data );
            }
        )
    }

    getMapData ( name ) {
        return this.maps[ name ];
    }

    /**
     * @param data {String}
     * @returns object {Object}
     */
    static parseData ( data ) {

        let splitted = data.split( '\r\n' );
        let vStrings = splitted[ 0 ];
        let fStrings = splitted[ 1 ];
        let sStrings = splitted[ 2 ];

        let av = vStrings.split( ',' );
        let af = fStrings.split( ',' );
        let as = sStrings.split( ',' );
        // for ( let i = 0; i < v.length; i++ ) v[ i ] = +v[ i ];
        // for ( let i = 0; i < f.length; i++ ) f[ i ] = +f[ i ];

        // v = new Float32Array( v );
        // f = new Int32Array( f );
        let v = [];
        let f = [];
        let s = [];
        for ( let i = 0; i < av.length; i++ ) v.push( +av[ i ] );
        for ( let i = 0; i < af.length; i++ ) f.push( +af[ i ] );
        for ( let i = 0; i < as.length; i++ ) s.push( +as[ i ] );

        // console.log( v );
        // console.log( f );

        return {
            vertices: v,
            faces: f,
            spawns: s,
        };
    }



    /**
     * @param data
     * @return {Array}
     */
    static parseHeights ( data ) {

        let yStrings = data.split( '\r\n' );
        yStrings.pop(); // remove the last, empty line

        let yFloats = [];

        for ( let i = 0; i < yStrings.length; i++ ) {
            yFloats.push( +yStrings[ i ] ); // convert string values to numbers
        }

        return yFloats;
    }

    /**
     * @param data
     * @return {Array}
     */
    static parseSpawns ( data ) {

        let sStrings = data.split( '\r\n' );
        sStrings.pop();

        let spawns = [];

        for ( let i = 0; i < sStrings.length; i++ ) {
            let spawnPos = {};

            let pos = sStrings[ i ].split( ',' );

            spawnPos.x = +pos[ 0 ];
            spawnPos.y = +pos[ 1 ];
            spawnPos.z = +pos[ 2 ];

            spawns.push( spawnPos );
        }

        return spawns;
    };

    loadBodiesData ( name ) {

        this.scenes[ name ] = {};

        let url = this.gameEngine.isServer() ?
            `http://localhost:${process.env.PORT}/maps/${name}.json` :
            `/maps/${name}.json`;

        // this.loadingManager.onLoad = () => {
        //     console.log( 'Scene loaded' );
        //     this.emit( name, this.json[ name ] );
        // };

        this.loader.load(
            url,
            data => {
                // console.log( data );
                let json = JSON.parse( data );
                this.json[ name ] = json;
                this.emit( name, json );
            }
        )
    }

    assignEmitter () {
        // extend the ResourceManager class with EventEmitter fields and methods
        _.extend( this, EventEmitter.prototype );
        // call the init method of the emitter to warm it up and apply the lube
        EventEmitter.prototype.init.call( this );
    }
};