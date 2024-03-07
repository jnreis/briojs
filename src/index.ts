export type * from './types';

import { _reservedNames, _settings } from "./api";
import { _methods } from './methods';
import { hydrate } from "./hydration";
import { emit } from "./tools/dom";
import { storageEvent } from './reactivity/storage';


// Hydrate elements with a valid `props` attribute
export let start = () => {

    // If Brio is not initialized
    if (!_settings.init) {

        window.addEventListener('storage', storageEvent);

        // Add custom methods to the reserved names
        _methods.forEach(([name, _]) => _reservedNames.push(name));

        // Emit the `brio:init` event
        emit(document.body, 'brio:init');

        // Mark Brio as initialized
        _settings.init = true;

        // Hydrate the DOM
        hydrate();
    }
}

export { api } from './api';







// * BUG LIST


// TODO LIST
// - [ ] Implement a "dev mode" where the DOM is re-hydrated when Brio attributes are updated.

// - [x] Implement $persist to save state to localStorage. 
//       - Include reactivity and cross-tab communication (storage event).

// - [x] Implement $session to save state to sessionStorage.
//       - Include reactivity. 
//       - Note: sessionStorage does not trigger storage events.

// - [ ] Implement a $format method to format strings, numbers, and dates.

// - [ ] Implement a `mask` directive to format input values.

// - [ ] Implement a `intersect` directive to react when an element enters or leaves the viewport.

// - [ ] Add a "morph" modifier to the `html` directive to preserve the element's state when the template changes.

// - [x] Implement a `transition` directive to animate elements when they are added or removed from the DOM.

// - [ ] Implement a $async method to work with async functions and promises.

// - [ ] Create a $fetch method to make HTTP requests.

// - [ ] Create an Astro plugin to use Brio with Astro.
// - [ ] Create a WordPress plugin to use Brio with WordPress.
// - [ ] Create a page builder based on Brio.





// - [ ] Implement a lightweigth $class method to generate utility classes on the fly, similar to Tailwind CSS.
//       - It should take something like this: $class('bg-red-500', 'text-white', 'p-4', 'rounded-md') and generate the classes on the fly.

