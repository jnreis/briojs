export { init, hydrate } from './tools/hydration';

export { api } from './api';




// TO USE BRIO LOCALLY DURING DEVELOPMENT:
// - Make npm aware of the local package by running `npm link` in the Brio root folder.
// - In the project folder, run `npm link brio` to use the local package.
// - To unlink the local package, run `npm unlink brio` in the project folder.
// - To unlink the local package from npm, run `npm unlink` in the Brio root folder.

// If the types are not recognized, add this to the tsconfig.json file:
// "compilerOptions": {
//     "baseUrl": ".",
//     "paths": {
//       "briojs": ["node_modules/briojs/src"],
//     }
//   }



// ! BUG LIST

// TODO LIST
// - [ ] - create the ability to add any number of interceptor functions at any stage of the hydration and lifecycle steps for each attribute.
// - [ ] - create a way to remove interceptor functions programmatically.

// - [ ] Implement my own version of the prototype chain to avoid the createContext function. Do this by passing the parent object to the child object.

// - [ ] Add a "morph" modifier to the `html` directive to preserve the element's state when the template changes.

// - [ ] Give the option to use a custom prefix for Brio directives. For example: `b-[directive]



// * DONE LIST
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

// - [x] Implement a `enter` and `leave` directives to react when an element enters or leaves the viewport.
//       It takes an optional options object. `[enter-options | leave-options]="{ root: null, rootMargin: '0px', threshold: 50, once: true}"`

// - [x] (!!! TOP PRIORITY !!!) Support key modifiers for the `on` directive. For example: `on-keydown-enter="submit"`.
//       - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key



// * POSSIBLE FUTURE FEATURES LIST
// - [ ] Create a $fetch method to make HTTP requests.

// - [ ] Implement a $async method to work with async functions and promises.

// - [ ] Implement a "dev mode" where the DOM is re-hydrated when Brio attributes are updated.

// - [ ] Implement a $format method to format strings, numbers, and dates.

// - [ ] Create a page builder based on Brio.
// - [ ] Create an Astro plugin to use Brio with Astro.
// - [ ] Create a WordPress plugin to use Brio with WordPress.

// - [ ] Implement a lightweigth $class method to generate utility classes on the fly, similar to Tailwind CSS.
//       - It should take something like this: $class('bg-red-500', 'text-white', 'p-4', 'rounded-md') and generate the classes on the fly.