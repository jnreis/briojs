import { ObjectConstructor } from './core/native';
import { createApp } from './core/csp-app';
import { createBrowserApi } from './browser-api';
import { devtools, inspectDevtools, devtoolsPanel, enableDevtools } from './devtools-entry';

const api = createBrowserApi(createApp);
const brio: typeof api & Record<string, unknown> = {
    ...api, devtools, inspectDevtools, devtoolsPanel, enableDevtools,
    use(plugin) {
        api.use(plugin);
        return brio;
    },
};
enableDevtools();

if (typeof window !== 'undefined') {
    ObjectConstructor.assign(window, { brio });
    window.dispatchEvent(new CustomEvent('brio'));
}

export default brio;
