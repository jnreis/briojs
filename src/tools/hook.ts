import { size } from ".";
import { arrayFrom, sort, sortPriority } from "./array";
import { DELETE, REMOVE } from "./constants";
import { newMap } from "./object";

let getHook = (_hooks: Hooks, key: any, hookName: string) => {
    let hook = _hooks.get(key);
    return hook && hook[hookName];
}

export let newHooks = (_hooks: Hooks): [SetHook, PlayHook] => ([

    // Adds a hook to a target
    (target: any, hookName: string, hookFunction: HookFunction, priority: number = 0) => {
        // Add the node to the hooks map if it doesn't exist
        if (!_hooks.has(target)) {
            _hooks.set(target, {});
        }
        // Add the hook to the node if it doesn't exist
        if (!_hooks.get(target)![hookName]) {
            _hooks.get(target)![hookName] = newMap();
        }
        // Set the hook function
        getHook(_hooks, target, hookName)!.set(hookFunction, priority);
    },

    // Calls all the functions under a hook name on a target by priority
    async (target: any, hookName: string, context?: any) => {
        let hook = getHook(_hooks, target, hookName);

        if (hook && size(hook)) {
            // Convert the map to an array
            let _fns = arrayFrom(hook) as [HookFunction, number][];

            // Sort the functions by priority
            sort(_fns, sortPriority);

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
                            [REMOVE]: () => hook[DELETE](_fns[_index][0]),
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
]);