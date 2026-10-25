import type { DirectiveDefinition } from '../dom/directives/registry';
import type { BrioPluginObject } from './types';

/** Identity helper that types a directive definition for `app.directive()` or a plugin's `directives`. */
export const defineDirective = <D extends DirectiveDefinition>(definition: D): D => definition;

/** Identity helper that types a plugin object for `app.use()`. */
export const definePlugin = <P extends BrioPluginObject>(plugin: P): P => plugin;
