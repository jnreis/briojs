import { http, HttpError } from './plugins/http';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ http, HttpError });
