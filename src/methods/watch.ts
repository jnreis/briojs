import { VNode } from "..";

import { ListenerFunction, watch } from "../reactivity";
import { uid } from "../tools";
import { EFFECT } from "../tools/constants";

export let $watch = (vnode: VNode) => (observedState: any, prop: string | number, fn: ListenerFunction) => {

    // Watch the prop of the observedState
    let cleanup = watch(observedState, prop, fn);

    // Register the effect
    vnode[EFFECT][`watch_${prop}_${uid()}`] = cleanup;
}