import { state } from '../reactivity/state';

export type ScopedState = Record<PropertyKey, any> & {
    readonly $parent: ScopedState | undefined;
};

const sources = new WeakMap<object, object>();

export function createScopedState(source: object, parent?: ScopedState): ScopedState {
    const observed = state(sources.get(source) ?? source);
    if (Reflect.has(observed, '$parent'))
        throw new TypeError('$parent is reserved for Brio scope ancestry.');
    const readOnly = () => {
        throw new TypeError('Brio scope $parent is read-only.');
    };
    const view = new Proxy(observed, {
        get(target, key, receiver) {
            return key === '$parent' ? parent : Reflect.get(target, key, receiver);
        },
        has(target, key) {
            return key === '$parent' || Reflect.has(target, key);
        },
        set(target, key, value, receiver) {
            if (key === '$parent') return readOnly();
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            if (key === '$parent') return readOnly();
            return Reflect.deleteProperty(target, key);
        },
        defineProperty(target, key, descriptor) {
            if (key === '$parent') return readOnly();
            return Reflect.defineProperty(target, key, descriptor);
        },
    });
    sources.set(view, observed);
    return view as ScopedState;
}
