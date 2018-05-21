const $ = require( 'jquery' );
const EventEmitter = require( 'eventemitter3' );

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
    27: 'esc',
};

const SENS = .002;

/**
 * This class handles keyboard device controls
 */
class MouseAndKeyboardControls {

    constructor () {
        Object.assign( this, EventEmitter.prototype );

        this.setupListeners();

        // keep a reference for key press state
        this.inputs = {
            down: false,
            up: false,
            left: false,
            right: false,
            yaw: 0,
            pitch: 0,
        };

        this.pointerLocked = false;
    }

    setupListeners () {
        // add special handler for space key
        document.addEventListener( 'keydown', ( e ) => {
            if ( e.keyCode === '32' && !this.inputs.space ) {
                this.emit( 'fire' );
            }
        } );

        document.addEventListener( 'keydown', e => {
            this.onKeyChange( e, true );
        } );
        document.addEventListener( 'keyup', e => {
            this.onKeyChange( e, false );
        } );
        document.body.addEventListener( 'mousemove', e => {
            this.onMouseMove( e );
        } );
        // document.addEventListener( 'pointerlockchange', this.onPointerLockChange );
        document.getElementById( 'viewport' ).addEventListener('click', () => {
            this.pointerLocked = true;
            document.getElementById( 'viewport' ).requestPointerLock();
        } );
    }

    onKeyChange ( e, isDown ) {
        e = e || window.event;

        if ( e.keyCode === 27 ) {
            this.pointerLocked = false;
            document.exitPointerLock();
            return;
        }

        let keyName = keyCodeTable[ e.keyCode ];
        if ( keyName ) {
            this.inputs[ keyName ] = isDown;
            // keep reference to the last key pressed to avoid duplicates
            this.lastKeyPressed = isDown ? e.keyCode : null;
            // this.renderer.onKeyChange({ keyName, isDown });
            e.preventDefault();
        }
    }

    onMouseMove ( e ) {
        if ( this.pointerLocked ) {

            let x = e.movementX;
            let y = e.movementY;

            /*
                x and y swapped on purpose
                x represents yaw rotation - around y axis, left and right
                y represent pitch rotation - around x axis, up and down
            */

            let deltaX = y * SENS;
            let deltaY = x * SENS;

            this.inputs.yaw = deltaX;
            this.inputs.pitch = deltaY;
        }
        e.preventDefault();
    }
}

module.exports = MouseAndKeyboardControls;
