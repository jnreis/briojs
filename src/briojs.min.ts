import { newApp, setup } from "./app";
import { arrayAdd, each } from "./tools/array";
import { DIRECTIVES, MASK_TOKENS, MASKS } from "./tools/constants";
import { allDirectives } from "./directives";
import { moneyMask, setDefaultMaskTokens } from "./directives/mask";

/**
 * TODO: INSTEAD OF HYDRATING THE APP USING JSDOM, I CAN SIMPLY MAP ALL BRIO DIRECTIVES TO AN ATTRIBUTE ID.
 * EXAMPLE OF SERVER SIDE PRE-RENDERING:
 * 
 *   The following HTML element:
 *   <div b-hydrate bind-class="$props.moreClasses" class="container"></div>
 * 
 *   Becomes:
 *   <div b8za35q2></div>
 * 
 *   Where "b8za35q2" is the ID for the object that contains the directives:
 *   [
 *     ['b8za35q2', { b-hydrate: '', bind-class: '$props.moreClasses'}] // [id, directives]
 *   ]
 * 
 *   The hydration process will do the following:
 *   - Get the element by the attribute ID
 *   - Hydrate the element with the directives
 *   - Remove the attribute ID
 *   - Remove the attribute ID from the object
 * 
 *   Templates added during runtime must also go through the pre-rendering process before being added to the DOM.
 *   This will make much harder to tamper with the app's directives, since the attribute ID will be randomly generated and no raw code will be present in the HTML.
 *   Note that <style b-style> and <script b-script> will also be pre-rendered and will receive an attribute ID.
 */

setup({
    newApp: () => {
        let app = newApp();

        // Load all directives
        each(allDirectives, directive => arrayAdd(app[DIRECTIVES], directive));

        // Load the money mask
        app[MASKS].money = moneyMask;

        // Set the default mask tokens
        setDefaultMaskTokens(app[MASK_TOKENS]);

        // each(queryAll(`[b-${HYDRATE}]`), el => app.gc.$dom[HYDRATE](el));

        return app;
    }
});