import TheClientEngine from './TheClientEngine';
import TheGameEngine from '../common/TheGameEngine';

// options sent to both game engine and client engine
const options = {
    traceLevel: 1000,
    delayInputCount: 2,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: 'extrapolate',
        localObjBending: 0.6,
        remoteObjBending: 0.8,
        bendingIncrements: 3
    },
    autoConnect: false
};

// create the singletons
const gameEngine = new TheGameEngine( options );
const clientEngine = new TheClientEngine( gameEngine, options );

document.addEventListener( 'DOMContentLoaded', () => { clientEngine.start(); } );

window.gameEngine = gameEngine;
window.clientEngine = clientEngine;