const EventEmitter = require( 'eventemitter3' );
const $ = require( 'jquery' );

// keyboard handling
const keyCodeTable = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'left',
    87: 'up',
    68: 'right',
    83: 'down',
};

/**
 * This class handles keyboard device controls
 */
export default class KeyboardControls {

    constructor() {
        Object.assign( this, EventEmitter.prototype );

        this.setupListeners();

        // keep a reference for key press state
        this.activeInput = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    setupListeners() {
        // add special handler for space key
        $( window ).keydown( e => {
            if ( e.key === ' ' && !this.activeInput.space ) {
                this.emit( 'fire' );
            }
        } );

        $( window ).keydown( e => {
            this.onKeyChange( e, true );
        } );
        $( window ).keyup( e => {
            this.onKeyChange( e, false );
        } );
    }

    onKeyChange( e, isDown ) {
        console.log( 'keychange' );
        e = e || window.event;

        let keyName = keyCodeTable[ e.keyCode ];
        if ( keyName ) {
            this.activeInput[ keyName ] = isDown;
            // keep reference to the last key pressed to avoid duplicates
            this.lastKeyPressed = isDown ? e.keyCode : null;
            // this.renderer.onKeyChange({ keyName, isDown });
            e.preventDefault();
        }
    }
}
