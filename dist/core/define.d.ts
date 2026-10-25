import { DirectiveDefinition } from '../dom/directives/registry.js';
import { BrioPluginObject } from './types.js';

/** Identity helper that types a directive definition for `app.directive()` or a plugin's `directives`. */
export declare const defineDirective: <D extends DirectiveDefinition>(definition: D) => D;
/** Identity helper that types a plugin object for `app.use()`. */
export declare const definePlugin: <P extends BrioPluginObject>(plugin: P) => P;
