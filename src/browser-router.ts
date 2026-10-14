import { createRouter } from './plugins/router';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ createRouter });
