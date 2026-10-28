import { ObjectConstructor } from './core/native';
import { createApp } from './core/create-app';
import { createBrowserApi } from './browser-api';

const brio = createBrowserApi(createApp);

if (typeof window !== 'undefined') {
    ObjectConstructor.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
