import {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    flush,
    untrack,
    resource,
    createScope,
    onCleanup,
    getCurrentScope,
    trustedHTML,
} from './index';

const brio = {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    flush,
    untrack,
    resource,
    createScope,
    onCleanup,
    getCurrentScope,
    trustedHTML,
};

export default brio;
