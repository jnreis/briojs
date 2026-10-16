import { onCleanup } from '../core/scope';
import { batch } from '../reactivity/effect';
import { track, trigger } from '../reactivity/state';

export type RefMap = Readonly<Record<string, Element | undefined>>;

const registries = new WeakMap<RefMap, Record<string, Element>>();
const keys = Symbol('brio.refs');

export function createRefs(): RefMap {
    const values: Record<string, Element> = Object.create(null);
    const readOnly = () => { throw new TypeError('$ref names are read-only.'); };
    const refs: RefMap = new Proxy(values, {
        get(target, key) {
            track(target, key);
            return Reflect.get(target, key);
        },
        has(target, key) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target) {
            track(target, keys);
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(target, key) {
            track(target, key);
            const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
            return descriptor && { ...descriptor, writable: false };
        },
        set: readOnly,
        deleteProperty: readOnly,
        defineProperty: readOnly,
        setPrototypeOf: readOnly,
        preventExtensions: readOnly,
    });
    registries.set(refs, values);
    return refs;
}

export function registerRef(refs: RefMap, name: string, element: Element): void {
    const values = registries.get(refs);
    if (!values) throw new TypeError('b-ref requires a Brio ref registry.');
    if (Object.prototype.hasOwnProperty.call(values, name))
        throw new SyntaxError(`Duplicate b-ref name "${name}" in the same scope.`);
    const notify = () => batch(() => {
        trigger(values, name, 'set');
        trigger(values, keys, 'set');
    });
    values[name] = element;
    onCleanup(() => {
        if (values[name] !== element) return;
        delete values[name];
        notify();
    });
    notify();
}
