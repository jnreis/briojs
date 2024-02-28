import { VNode } from "..";

import { ListenerFunction, watch } from "../reactivity";
import { uid } from "../tools";

export let $watch = (vnode: VNode) => (observedState: any, prop: string | number, fn: ListenerFunction) => {

    // Watch the prop of the observedState
    let cleanup = watch(observedState, prop, fn);

    // Generate a unique id for the watch
    let watchId = uid(4, ()=>true);

    // Register the effect
    vnode.effect[`watch_${prop}_${watchId}`] = cleanup;
}