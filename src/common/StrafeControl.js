const CANNON = require( 'cannon' );

const IMPULSE = 1;
const VELOCITY = .5;
const MAX_VELOCITY = 5;

export default class StrafeControl {

    /**
     * @param o {BB8}
     * @param direction {String}
     */
    static move ( o, direction ) {
        let directionVector = new CANNON.Vec3();
        let diag = 1 / Math.sqrt( 2 );

        switch ( direction ) {
            case 'up':
                directionVector.set( -1, 0, 0 ); break;
            case 'down':
                directionVector.set( 1, 0, 0 ); break;
            case 'left':
                directionVector.set( 0, 0, 1 ); break;
            case 'right':
                directionVector.set( 0, 0, -1 ); break;
            case 'upleft':
                directionVector.set( -diag , 0, diag ); break;
            case 'upright':
                directionVector.set( -diag, 0, -diag ); break;
            case 'downleft':
                directionVector.set( diag, 0, diag ); break;
            case 'downright':
                directionVector.set( diag, 0, -diag ); break;
        }

        // set the object velocity
        let velocityVector = directionVector.scale( VELOCITY );
        o.physicsObj.velocity.vadd( velocityVector, o.physicsObj.velocity );

        let angularVelocityVector = new CANNON.Vec3( 0, velocityVector.y, 0 );
        o.physicsObj.angularVelocity.vadd( angularVelocityVector, o.physicsObj.angularVelocity );
    }

    /**
     * @param o {BB8}
     * @param direction {String}
     */
    static accelerate ( o, direction ) {
        let currentVelocity = o.physicsObj.velocity.length();
        if ( currentVelocity > MAX_VELOCITY ) {
            return;
        }

        let directionVector = new CANNON.Vec3();
        let diag = 1 / Math.sqrt( 2 );

        switch ( direction ) {
            case 'up':
                directionVector.set( -1, 0, 0 ); break;
            case 'down':
                directionVector.set( 1, 0, 0 ); break;
            case 'left':
                directionVector.set( 0, 0, 1 ); break;
            case 'right':
                directionVector.set( 0, 0, -1 ); break;
            case 'upleft':
                directionVector.set( -diag , 0, diag ); break;
            case 'upright':
                directionVector.set( -diag, 0, -diag ); break;
            case 'downleft':
                directionVector.set( diag, 0, diag ); break;
            case 'downright':
                directionVector.set( diag, 0, -diag ); break;
        }

        directionVector = directionVector.scale( IMPULSE );
        let velocityVector = o.physicsObj.quaternion.vmult( directionVector );
        o.physicsObj.velocity.vadd( velocityVector, o.physicsObj.velocity );
    }

    /**
     * @param o {BB8}
     * @param rotation {Object}
     */
    static aim ( o, rotation ) {
        switch ( rotation.axis ) {
            case 'yaw':
                o.physicsObj.quaternion.x += rotation.value;
                break;
            // case 'pitch':
            //     o.physicsObj.quaternion.y += rotation.value;
            //     break;
        }
    }
}