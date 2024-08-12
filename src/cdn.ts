import { api } from './api';
import { registerCoreMethods } from './methods';
import { INIT } from './tools/constants';
import { emit } from './tools/dom';
import { init, hydrate } from './tools/hydration';
import { D, W } from './tools/object';

/**
 * Registers the core methods
 * - $hook
 * - $emit
 * - $uid
 * - $type
 * - $http
 * - $watch
 * - $persist
 * - $session
 * - $in
 * - $out
 */
registerCoreMethods();

/**
 * Exposes Brio API to the global scope
 */
(W as any).Brio = api;

/**
 * Emits the `brio:init` event to allow the programmatic addition of:
 * - directives
 * - methods
 * - transition engines
 * - components
 * - props
 * - and stores
 */
emit(D.body, 'brio:'+INIT);

/**
 * Hydrates the DOM
 */
hydrate();

/**
 * Initializes Brio and effectively prevents further programmatic addition of:
 * - directives
 * - methods
 * - transition engines
 * - components
 * - props
 * - and stores
 */
init();