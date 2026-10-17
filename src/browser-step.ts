import { createStepEngine } from './plugins/step';
import { installBrowserPlugin } from './browser-plugin';

installBrowserPlugin({ createStepEngine });
