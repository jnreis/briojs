import { _transitions } from "../directives/transition"


export let addTransition = (transitionName: string, cssPropertyName: string, cssPropertyValue: (value: string|number) => string) => {
    let transition = _transitions.find(transition => transition[0] == transitionName);

    // Overwrite core transition
    if (transition) {
        transition[1] = cssPropertyName;
        transition[2] = cssPropertyValue;
    }
    // Add new transition
    else _transitions.push([
        transitionName,
        cssPropertyName,
        cssPropertyValue
    ]);
}