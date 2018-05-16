let CANNON;

const Ray = require( 'cannon/src/collision/Ray' );
const Vec3 = require( 'cannon/src/math/Vec3' );

export default class Spawner {

    /**
     * @param gameEngine {TheGameEngine}
     */
    constructor( gameEngine ) {
        this.gameEngine = gameEngine;
        CANNON = gameEngine.physicsEngine.CANNON;
    }

    getSpawnpoint() {
        return this.dropPin();
    }

    /**
     *
     * @returns {Vec3}
     */
    dropPin() {
        let terrain = this.gameEngine.map.physicsObj;
        let distance = -1;

        while ( distance !== 100 ) {

            // todo use terrain aabb
            let x = Math.random() * 1800 - 900;
            let z = Math.random() * 1800 - 900;

            let ray = new Ray(
                new Vec3( x, 400, z ), // origin
                new Vec3( x, 200, z ) // direction
            );

            ray.intersectBody( terrain );

            distance = ray.result.distance;
        }

        return new Vec3( x, 320, z );
    }
}