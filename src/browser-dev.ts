import api from './browser-api';
import { devtools, inspectDevtools, devtoolsPanel } from './devtools-entry';

const brio = { ...api, devtools, inspectDevtools, devtoolsPanel };

if (typeof window !== 'undefined') {
    Object.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
