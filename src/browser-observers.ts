import { observersPlugin } from './plugins/observers';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ observersPlugin }, observersPlugin);
