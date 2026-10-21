import { ReflectApi, createTypeError, $PARENT } from './native';
import { state } from '../reactivity/state';

export type ScopedState = Record<PropertyKey, any> & {
    readonly $parent: ScopedState | undefined;
};

const sources = new WeakMap<object, object>();

export function createScopedState(source: object, parent?: ScopedState): ScopedState {
    const observed = state(sources.get(source) ?? source);
    if (ReflectApi.has(observed, $PARENT))
        throw createTypeError($PARENT + ' is reserved for Brio scope ancestry.');
    const readOnly = () => {
        throw createTypeError('Brio scope $parent is read-only.');
    };
    const view = new Proxy(observed, {
        get(target, key, receiver) {
            return key === $PARENT ? parent : ReflectApi.get(target, key, receiver);
        },
        has(target, key) {
            return key === $PARENT || ReflectApi.has(target, key);
        },
        set(target, key, value, receiver) {
            if (key === $PARENT) return readOnly();
            return ReflectApi.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            if (key === $PARENT) return readOnly();
            return ReflectApi.deleteProperty(target, key);
        },
        defineProperty(target, key, descriptor) {
            if (key === $PARENT) return readOnly();
            return ReflectApi.defineProperty(target, key, descriptor);
        },
    });
    sources.set(view, observed);
    return view as ScopedState;
}
