let currentContext: any = null;
let batching = false;
let batchQueue = new Set();
let effectQueue: Set<FunctionType> = new Set();

export function batch(fn: FunctionType) {
    batching = true;
    fn();
    batching = false;
    effectQueue.forEach(effect => effect());
    effectQueue.clear();
}

export function state(initialValue: any) {
    const s = new State(initialValue);
    return s.fn.bind(s);
}

export function computed(fn: FunctionType) {
    let computedValue: any = null;

    // Create a new effect
    const effect: any = () => {
        // Cleanup the previous effect
        cleanup(effect);

        // Set the current context to the effect
        currentContext = effect;
        effect.dependents = new Set();

        // Execute the function
        computedValue = fn();

        // Reset the current context
        currentContext = null;
    };

    // Initial execution to establish dependencies
    effect();

    return () => {
        if (currentContext) {
            // Add the effect to the dependents of the current context
            effect.dependents.add(currentContext);
            currentContext.dependents.add(effect);
        }
        return computedValue;
    };
}

class State {
    value: any;
    subscribers: Set<FunctionType>;

    constructor(initialValue: any) {
        this.value = initialValue;
        this.subscribers = new Set();
    }

    // The default value is a string that is unlikely to be used as a value. It represents the Primitive Irish spelling of 'BRIO'.
    fn(newValue: any = 'ᚁᚏᚔᚑ') {
        // Get the value
        if (newValue === 'ᚁᚏᚔᚑ') {
            if (currentContext) {
                this.subscribers.add(currentContext);
                currentContext.dependents.add(this);
            }
        }
        else if (this.value !== newValue) {
            this.value = newValue;
            if (batching) {
                this.subscribers.forEach(sub => batchQueue.add(sub));
            } else {
                this.subscribers.forEach(sub => effectQueue.add(sub));
                queueMicrotask(runEffects);
            }
        }
        return this.value;
    }

    subscribe(fn: FunctionType) {
        this.subscribers.add(fn);
    }

    unsubscribe(fn: FunctionType) {
        this.subscribers.delete(fn);
    }
}

function cleanup(effect: any) {
    if (effect.dependents) {
        effect.dependents.forEach((dep: any) => dep.subscribers?.delete(effect));
        effect.dependents.clear();
    }
}

function runEffects() {
    effectQueue.forEach(effect => effect());
    effectQueue.clear();
}