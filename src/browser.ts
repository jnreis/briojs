import { ObjectConstructor } from './core/native';
import brio from './browser-api';

if (typeof window !== 'undefined') {
    ObjectConstructor.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
