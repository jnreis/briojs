/**
 TODO: I need to wrap it up and release the first version of this amazing framework by the end of the month.
 * This means I need to finish the following tasks:
 * - Complete all pending TODOs. [DONE]
 * - Test each feature to make sure it works as expected. [IN PROGRESS]
 * - Test the framework with Astro. [IN PROGRESS]
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
export { settings, newApp, setup } from "./app";
export { allDirectives } from "./directives";
export { ignoreDirective } from "./directives/ignore";
export { eachDirective } from "./directives/each";
export { propsDirective, dataDirective } from "./directives/context";
export { uidDirective } from "./directives/uid";
export { htmlDirective } from "./directives/html";
export { templateDirective } from "./directives/template";
export { scriptDirective } from "./directives/script";
export { styleDirective } from "./directives/styles";
export { teleportDirective } from "./directives/teleport";
export { ifDirective } from "./directives/if";
export { showDirective } from "./directives/show";
export { transitionDirectives } from "./directives/transition";
export { intersectionDirectives } from "./directives/intersection";
export { resizeDirectives } from "./directives/resize";
export { onDirective } from "./directives/on";
export { bindDirective } from "./directives/bind";
export { modelDirective } from "./directives/model";
export { maskDirective, moneyMask, setDefaultMaskTokens } from "./directives/mask";
export { newFn } from "./tools/evaluation";

// ! BUG LIST
// - [ ] FIX: methods can not be used in addProps.

// TODO LIST

// - [ ] Investigate what it takes to have a modern build system with Astro and Brio, including TypeScript, Tailwind CSS, and PostCSS.

// - [ ] Add a "morph" modifier to the `html` directive to preserve the element's state when the template changes.



// * DONE LIST

// - [x] Create a $http method to make HTTP requests.

// - [x] Implement a "$insert" method to insert some content (html or text) at a specific position in the DOM.
// - [x] Implement a router. It should use the history API and cache the body of previous pages to avoid re-rendering.

// - [x] Implement a `$context` method to get the context of an element, which includes the $el, $props, $refs, and $uid.

// - [x] Nested props are not reacting to changes. If a parent $props has a year property, and the year property is changed from a nested $props, the year property in the parent $props does not react to the change.

// - [x] - create the ability to add any number of interceptor functions at any stage of the hydration and lifecycle steps for each attribute.
// - [x] - create a way to remove interceptor functions programmatically.

// - [x] [FAILED, REVERSED] Implement my own version of the prototype chain to avoid the createContext function. Do this by passing the parent object to the child object.

// - [x] Implement a `$before` and `$after` methods to run functions before and after a directive is executed.
//       - Syntax: `$before|$after($el:Node, directiveName:string, middlewareFn:Function, removeFn:Function)`.
//       - The function of the $before and $after methods receive $ctx and $next as arguments.
//       - The remove argument is optional and is a mechanism to remove the function programmatically.

// - [x] Implement a `before` and `after` directive to run functions before and after the element is hydrated.
//       - Syntax: `before-<directive>="functionName"`, `after-<directive>="functionName"`.
//         Example: `before-if="transitionOut"`, `after-if="transitionIn"`.

// - [x] Fix package.json to properly export the types.

// - [x] Implement a `ignore` directive to ignore the element and its children from being hydrated.

// - [x] Implement a `mask` directive to format input values.

// - [x] Implement $persist to save state to localStorage. 
//       - Include reactivity and cross-tab communication (storage event).

// - [x] Implement $session to save state to sessionStorage.
//       - Include reactivity. 
//       - Note: sessionStorage does not trigger storage events.

// - [x] Implement a `transition` directive to animate elements when they are added or removed from the DOM.

// - [x] Implement a `enter` and `exit` directives to react when an element enters or exits the viewport.
//       It takes an optional options object. `[enter-options | exit-options]="{ root: null, rootMargin: '0px', threshold: 50, once: true}"`

// - [x] (!!! TOP PRIORITY !!!) Support key modifiers for the `on` directive. For example: `on-keydown-enter="submit"`.
//       - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key



// * POSSIBLE FUTURE FEATURES LIST

// - [ ] Create a page builder based on Brio.
// - [ ] Create an Astro plugin to use Brio with Astro.
// - [ ] Create a WordPress plugin to use Brio with WordPress.

// - [ ] Implement a "dev mode" where the DOM is re-hydrated when Brio attributes are updated.

// - [ ] Implement a lightweigth $class method to generate utility classes on the fly, similar to Tailwind CSS.
//       - It should take something like this: $class('bg-red-500', 'text-white', 'p-4', 'rounded-md') and generate the classes on the fly.