import { $hook } from './hook';
import { $emit, $root } from './dom';
import { $uid, $type } from './tools';
import { $http } from './http';
import { $watch, $persist, $session } from './reactivity';
import { $in, $out } from './transition';
import { arrayAdd } from '../tools/array';
import { reservedNames } from '../api';

/**
 * Brio methods.
 * These methods are available to all expressions.
 */
export let _methods: MagicMethods = {
    $hook,
    $emit,
    $root,
    $uid,
    $type,
    $http,
    $watch,
    $persist,
    $session,
    $in,
    $out
};

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
export let registerCoreMethods = () => {
    for (let methodName in _methods) {
        arrayAdd(reservedNames, methodName);
    }
};