import { hydrate } from "./hydrate";
import { observe, computed } from "./reactive";

export const createScopedContext = (parentScope: any, newScope = {}): any => {
    const mergedScope = Object.create(parentScope);
    Object.defineProperties(
        mergedScope,
        Object.getOwnPropertyDescriptors(newScope)
    );
    return observe(mergedScope);
};


// Hydrate elements with a valid scope attribute
hydrate();

// Test observe and computed
const scope = observe({});

scope.a = {
    person1: "John",
    count: 1
};

scope.b = createScopedContext(scope.a, {
    person1: "Jane",
    count: 0,
    increment(value = 10) {
        this.count += value;
    }
});

scope.c = createScopedContext(scope.b, {
    person1: "Jack",
    increment(value = 9) {
        this.count += value;
    }
});

computed(() => {
    console.log("Person1:", scope.a.person1);
});

console.log(scope.a.person1, scope.b.person1, scope.c.person1);
scope.b.person1 = "Jill";
console.log(scope.a.person1, scope.b.person1, scope.c.person1);

console.log(scope.a.count, scope.b.count, scope.c.count);
scope.c.increment();
console.log(scope.a.count, scope.b.count, scope.c.count);