import { _settings } from ".";
import { logger } from "../tools";
import { API_ADD_ERROR, INIT } from "../tools/constants";
import { setHook } from "../tools/hook";
import { isNumeric } from "../tools/typeCheck";

/**
 * API version of the `setHook` function.
 * It can only be called before initialization.
 * It is useful for setting up hooks that run during the hydration process.
 * @param node 
 * @param hookName 
 * @param fn 
 * @param priority 
 */
export let addHook = (node: Node, hookName: string, fn: HookFunction, priority?: number) => {

    // Can't add hooks after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR('hook', hookName));

    setHook(node, hookName, fn, priority && isNumeric(priority) ? +priority : -1);
}