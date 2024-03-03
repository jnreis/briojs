export type * from './types';

import { _settings, api } from './api';
import { hydrate } from "./hydration";
import { emit } from "./tools/dom";

// console.log(vnodes);

// Add the Brio API to the window object
(window as any).Brio = api;

// Hydrate elements with a valid `props` attribute
emit(document.body, 'brio:init');
_settings.init = true;
hydrate();



// window.addEventListener('storage', function(event) {
//     console.log('Storage event occurred:', event);
// });


// * BUG LIST


// TODO LIST
// - [ ] Implement a "dev mode" where the DOM is re-hydrated when Brio attributes are updated.

// - [ ] Implement $persist to save state to localStorage. 
//       - Include reactivity and cross-tab communication (storage event).

// - [ ] Implement $session to save state to sessionStorage.
//       - Include reactivity. 
//       - Note: sessionStorage does not trigger storage events.

// - [ ] Implement a $format method to format strings, numbers, and dates.

// - [ ] Implement a mask directive to format input values.

// - [ ] Implement a intersect directive to react when an element enters or leaves the viewport.

// - [ ] Add a "morph" modifier to the `html` directive to preserve the element's state when the template changes.

// - [ ] Implement a transition directive to animate elements when they are added or removed from the DOM.

// - [ ] Implement a $async method to work with async functions and promises.

// - [ ] Create a $fetch method to make HTTP requests.

// - [ ] Create an Astro plugin to use Brio with Astro.
// - [ ] Create a WordPress plugin to use Brio with WordPress.
// - [ ] Create a page builder based on Brio.





// - [ ] Implement a lightweigth $class method to generate utility classes on the fly, similar to Tailwind CSS.
//       - It should take something like this: $class('bg-red-500', 'text-white', 'p-4', 'rounded-md') and generate the classes on the fly.

