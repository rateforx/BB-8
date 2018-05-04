import TheClientEngine from './TheClientEngine';
import TheGameEngine from '../common/TheGameEngine';
require('../../dist/resources/sass/main.scss');

// options sent to both game engine and client engine
const options = {
    traceLevel: 1000,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: 'extrapolate',
        localObjBending: 0.6,
        remoteObjBending: 0.8,
        bendingIncrements: 6
    },
    autoConnect: false
};

// create the singletons
const gameEngine = new TheGameEngine(options);
const clientEngine = new TheClientEngine(gameEngine, options);

document.addEventListener('DOMContentLoaded', function(e) { clientEngine.start(); });
