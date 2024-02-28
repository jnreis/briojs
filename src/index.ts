export * from './types';

import { hydrate, props, internal, store } from "./hydrate";
import { emit } from "./tools/dom";

// console.log(vnodes);

// Export the store
(window as any).Brio = { store, props };

// Hydrate elements with a valid scope attribute
emit(document.body, 'brio:init');
internal.init = true;
hydrate();


// TODO: BUGS
// - [ ] The `each` directive doesn't work with nested `each` directives


