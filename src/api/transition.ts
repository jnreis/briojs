import { _transitions } from "../directives/transition"
import { arrayAdd } from "../tools/array";


export let addTransition = (transitionName: string, cssPropertyName: string, cssPropertyValue: (value: string|number) => string) => {
    let transition = _transitions.find(transition => transition[0] == transitionName);

    // Overwrite core transition
    if (transition) {
        transition[1] = cssPropertyName;
        transition[2] = cssPropertyValue;
    }
    // Add new transition
    else arrayAdd(_transitions, [
        transitionName,
        cssPropertyName,
        cssPropertyValue
    ]);
}