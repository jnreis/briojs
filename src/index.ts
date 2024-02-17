import { hydrate, store, internal, stores } from "./hydrate";
import { emit } from "./tools";

// Export the store
(window as any).Brio = {
    store,
}

// Hydrate elements with a valid scope attribute
emit(document.body, 'brio:init');
internal.init = true;
hydrate();

console.log('Brio is ready!');
console.log('Brio stores:', stores);