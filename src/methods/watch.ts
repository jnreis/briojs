import { saveEffect } from "../hydration";
import { watch } from "../reactivity";

export let $watch = (vnode: VNode) => (observedState: any, prop: string | number, fn: ListenerFunction) => {

    // Watch the prop of the observedState and save the effect
    saveEffect(vnode, watch(observedState, prop, fn));
}