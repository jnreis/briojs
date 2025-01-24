/**
 * Each app has the following items:
 *
 * Reactivity methods:
 * - $state. Includes: skip, persist, session. Example: $state.skip()
 * - $effect
 * - $watch
 * $http methods object: get, post, put, patch, delete
 * $set methods object: hook, route, router
 * $dom methods object:
 * - Brio specific: closest, context, dehydrate, hydrate, insert, route
 * - Browser specific: emit, listen, query, queryAll
 * $store object:
 * - Default stores: data, directive, mask, maskToken, props, routeRules, script, style, template
 */
export { newApp } from './app';
