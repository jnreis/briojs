import brio from './browser-api';

if (typeof window !== 'undefined') {
    Object.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
