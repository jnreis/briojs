import { objectConstructor } from './core/native';
import brio from './browser-api';

if (typeof window !== 'undefined') {
    objectConstructor.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
