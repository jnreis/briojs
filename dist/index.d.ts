/**
 * I need to wrap it up and release the first version of this amazing framework by the end of the month.
 * This means I need to finish the following tasks:
 * - Complete all pending TODOs. [DONE]
 * - Test each feature to make sure it works as expected. [IN PROGRESS]
 * IMPORTANT: - Test the framework with Astro. Make sure TailwindCSS recognizes dynamic classes (see: tailwind-merge). [IN PROGRESS]
 * - Write documentation for each feature.
 * - Write a getting started guide.
 * - Create a website for the framework.
 * - Create a GitHub repository and push the code.
 * - Publish the package to npm.
 * - Create a Twitter account for the framework.
 * - Promote the framework on social media, forums, and other platforms (Reddit, Hacker News, LinkedIn).
 */
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
export { newApp, setup } from './app';
export { setAllDirectives } from './directives';
export { ignoreDirective } from './directives/ignore';
export { forDirective } from './directives/for';
export { propsDirective, dataDirective } from './directives/context';
export { idDirective } from './directives/id';
export { htmlDirective } from './directives/html';
export { templateDirective } from './directives/template';
export { scriptDirective } from './directives/script';
export { styleDirective } from './directives/styles';
export { teleportDirective } from './directives/teleport';
export { ifDirective } from './directives/if';
export { showDirective } from './directives/show';
export { transitionDirective } from './directives/transition';
export { intersectionDirectives } from './directives/intersection';
export { resizeDirectives } from './directives/resize';
export { onDirective } from './directives/on';
export { bindDirective } from './directives/bind';
export { modelDirective } from './directives/model';
export { maskDirective } from './directives/mask';
