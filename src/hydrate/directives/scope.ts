import { RawElement } from '../index.d';

// import { scope } from '..';
import { evaluate } from '../evaluate';
// import { interpolate } from '../interpolate';
import { getAttr, delAttr, q, isArray, isFn, isObject } from '../../tools';
import { observe } from '../../reactive';

export const createScopedContext = (parentScope: any, newScope = {}): any => {
    const mergedScope = Object.create(parentScope);
    Object.defineProperties(
        mergedScope,
        Object.getOwnPropertyDescriptors(newScope)
    );
    return observe(mergedScope);
};

export function hydrateScope(rawNode: RawElement, parent: RawElement | null = null) {
    const { node } = rawNode;

    // Parent scope
    const parentScope = parent ? parent.scope : {};

    const scopeExp = getAttr(node, 'scope');
    // Evalute the scope expression
    let newScope = {};
    if (scopeExp) {
        let evalScope = evaluate(parentScope, scopeExp, node);
        // Check if the scope is a function
        if (isFn(evalScope)) evalScope = evalScope();
        // Check if the scope is an object
        if (!isObject(evalScope)) 
            throw new Error(`The scope must be an object, but got ${typeof evalScope} instead.`);
        newScope = evalScope;
    }

    // Create the scoped context
    const sc = createScopedContext(parentScope, newScope);

    // Add the scope to the rawNode
    rawNode.scope = sc;

    // Remove the attribute from the node
    delAttr(node, 'scope');

    // Query all refs not inside another scope
    sc.refs = {};
    q(`[ref]:not([scope] [ref])`, node).forEach(ref => {
        const refName = getAttr(ref as HTMLElement, 'ref');
        if (refName) {
            // Check if the ref already exists
            const r = sc.refs[refName];
            if (r) {
                // Add the ref to the ref array
                if (isArray(r)) r.push(ref);
                // Convert the ref to an array
                else sc.refs[refName] = [r, ref];
            }
            // Add the ref to the scope
            else sc.refs[refName] = ref;
            // Remove the attribute from the node
            delAttr(ref as HTMLElement, 'ref');
        }
    });

    // // Interpolate functions
    // for (const prop in sc) {
    //     if (typeof sc[prop] === 'function') {
    //         sc[prop] = evaluate(
    //             scope, 
    //             interpolate(sc[prop].toString(), scopes, { wrap: true }).output,
    //             node
    //         );
    //     }
    // }
}