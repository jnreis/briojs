import { persist } from './plugins/persistence';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ persist });
