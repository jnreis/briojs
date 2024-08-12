import { _settings } from "../api";
import { size } from ".";
import { arrayFrom } from "./array";
import { DELETE } from "./constants";

export let hooks: Map<Node, {
    [hookName: string]: Map<HookFunction, number>
}> = new Map();

/**
 * Sets a function for a hook on a node
 * @param node 
 * @param hookName 
 * @param fn 
 * @param priority 
 */
export let setHook = (node: Node, hookName: string, fn: HookFunction, priority: number = 0) => {
    // Create the hook map if it doesn't exist
    if (!hooks.has(node)) {
        hooks.set(node, {});
    }
    // Create the hook map if it doesn't exist
    if (!hooks.get(node)![hookName]) {
        hooks.get(node)![hookName] = new Map();
    }
    // Set the hook function
    getHook(node, hookName)!.set(fn, priority);
}

/**
 * Gets a hook function from a node
 * @param node 
 * @param hookName 
 */
export let getHook = (node: Node, hookName: string) => {
    let hook = hooks.get(node);
    return hook && hook[hookName];
}

/**
 * Checks if a node has a hook
 * @param node 
 * @param hookName 
 */
export let hasHook = (node: Node, hookName: string) => {
    let hook = getHook(node, hookName);
    return hook && size(hook);
}

/**
 * Clears all the functions of a hook on a node
 * @param node 
 * @param hookName 
 */
export let clearHook = (node: Node, hookName: string) => {
    let hook = getHook(node, hookName);
    if (hook) {
        hook.clear();
    }
}

/**
 * Calls all the functions of a hook on a node by priority
 * @param node 
 * @param hookName 
 * @param context 
 */
export let callHook = async (node: Node, hookName: string, context?: any) => {
    let hook = getHook(node, hookName);
    if (hook && size(hook)) {

        // Convert the map to an array
        let _fns = arrayFrom(hook) as [HookFunction, number][];
    
        // Sort the functions by priority
        _fns.sort((a, b) => b[1] - a[1]);
    
        // Index of the running function
        let index = -1;

        // Flag to determine if the next function should be called
        let playing = true;
    
        // Create a runner function
        let play = async () => {
            // Increment the index to call the next function
            index++;

            // Set the playing flag to true
            playing = true;
    
            // Check if the index is within the range of the functions
            if (index < size(_fns)) {
                // Fixed local index
                // ? This is necessary because the index could be incremented before the removal of a function. E.g. next(); remove();
                let _index = index;
    
                // Call the function at the current index
                await _fns[_index][0](
                    /** Contextual data, if any */
                    context,
                    {
                        /** Call the next function */
                        play,
                        /** Disable the auto-run feature and choose when/if to call the next function */
                        pause: () => playing = false,
                        /** Remove the current function */
                        remove: () => hook[DELETE](_fns[_index][0]),
                    }
                );
    
                // Automatically call the next function if the `play` function was not paused
                if (playing) await play();
            }
        }
    
        // Run the functions
        await play();
    }
}