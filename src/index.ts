export type * from './types';

import { _reservedNames, _settings } from "./api";
import { hydrate } from "./hydration";
import { _methods } from './methods';
import { storageEvent } from './reactivity/storage';
import { each, arrayAdd } from './tools/array';
import { INIT } from './tools/constants';
import { emit } from "./tools/dom";


// Hydrate elements with a valid `props` attribute
export let start = () => {

    // If Brio is not initialized
    if (!_settings[INIT]) {
        // Listen to storage events
        window.addEventListener('storage', storageEvent);

        // Add custom methods to the reserved names
        each(_methods, ([name, _]) => arrayAdd(_reservedNames, name));

        // Emit the `brio:init` event
        emit(document.body, 'brio:'+INIT);

        // Mark Brio as initialized
        _settings[INIT] = true;

        // Hydrate the DOM
        hydrate();
    }
}

export { api } from './api';







// ! BUG LIST



// TODO LIST
// - [ ] Add a "morph" modifier to the `html` directive to preserve the element's state when the template changes.

// - [ ] Give the option to use a custom prefix for Brio directives. For example: `b-[directive]



// * DONE LIST
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
// - [ ] Implement a lightweigth $class method to generate utility classes on the fly, similar to Tailwind CSS.
//       - It should take something like this: $class('bg-red-500', 'text-white', 'p-4', 'rounded-md') and generate the classes on the fly.

// - [ ] Implement a $format method to format strings, numbers, and dates.

// - [ ] Implement a $async method to work with async functions and promises.

// - [ ] Create a $fetch method to make HTTP requests.

// - [ ] Implement a "dev mode" where the DOM is re-hydrated when Brio attributes are updated.

// - [ ] Create an Astro plugin to use Brio with Astro.
// - [ ] Create a WordPress plugin to use Brio with WordPress.
// - [ ] Create a page builder based on Brio.
