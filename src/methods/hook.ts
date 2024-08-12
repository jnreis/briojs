import { setHook } from "../tools/hook";
import { isNumeric } from "../tools/typeCheck";

export let $hook = () => (node: Node, hookName: string, fn: HookFunction, priority?: number) => 
    setHook(node, hookName, fn, priority && isNumeric(priority) ? +priority : -1);