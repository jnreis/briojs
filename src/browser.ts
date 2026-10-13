import {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    createScope,
    onCleanup,
    persist,
    createRouter,
    newStepEngine,
    createStepEngine,
    validate,
    http,
    trustedHTML,
    devtools,
} from './index';

const brio = {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    createScope,
    onCleanup,
    persist,
    createRouter,
    newStepEngine,
    createStepEngine,
    validate,
    http,
    trustedHTML,
    devtools,
};

if (typeof window !== 'undefined') {
    (window as any).brio = brio;
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
