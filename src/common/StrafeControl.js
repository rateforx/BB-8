const CANNON = require( 'cannon' );

const IMPULSE = 1;
const VELOCITY = 5;
const MAX_VELOCITY = 15;

export default class StrafeControl {

    /**
     * @param o {BB8}
     * @param direction
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
        o.physicsObj.angularVelocity.vadd( velocityVector, o.physicsObj.angularVelocity );
    }

    /**
     * @param o {BB8}
     * @param direction
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
     * @param physicalObj {Body}
     * @return {Vec3}
     */
    static getXZPlaneOrientation ( physicalObj ) {
        return physicalObj.quaternion.vmult( new CANNON.Vec3( 0, 0, 1 ) );
    }
}