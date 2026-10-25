import { enterDirective, exitDirective } from '../dom/directives/intersection';
import { addedNodesDirective, removedNodesDirective, attrsDirective, textDirective } from '../dom/directives/mutation';
import { resizeDirective } from '../dom/directives/resize';
import type { BrioPluginObject } from '../core/types';

/** Official add-on: `b-on-enter`/`exit` (intersection), `b-on-resize`, and the mutation directives, configured with `.options`. */
export const observersPlugin: BrioPluginObject = {
    name: 'brio-observers',
    directives: [enterDirective, exitDirective, resizeDirective, addedNodesDirective, removedNodesDirective, attrsDirective, textDirective],
};
