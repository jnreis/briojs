import { inputsPlugin } from './plugins/inputs';
import { validate } from './plugins/forms';
import { moneyMask } from './plugins/money-mask';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ inputsPlugin, validate, moneyMask }, inputsPlugin);
