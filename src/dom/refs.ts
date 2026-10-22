import { ObjectConstructor, ReflectApi, createTypeError, ownKeys, createSyntaxError, GET_OWN_PROPERTY_DESCRIPTOR } from '../core/native';
import { onCleanup } from '../core/scope';
import { batch } from '../reactivity/effect';
import { track, trigger } from '../reactivity/state';

export type RefMap = Readonly<Record<string, Element | undefined>>;

const registries = new WeakMap<RefMap, Record<string, Element>>();
const keys = Symbol('brio.refs');

export function createRefs(): RefMap {
    const values: Record<string, Element> = ObjectConstructor.create(null);
    const readOnly = () => { throw createTypeError('$ref names are read-only.'); };
    const refs: RefMap = new Proxy(values, {
        get(target, key) {
            track(target, key);
            return ReflectApi.get(target, key);
        },
        has(target, key) {
            track(target, key);
            return ReflectApi.has(target, key);
        },
        ownKeys(target) {
            track(target, keys);
            return ownKeys(target);
        },
        [GET_OWN_PROPERTY_DESCRIPTOR](target, key) {
            track(target, key);
            const descriptor = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](target, key);
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

/** Defines a `$ref` registry on `context` that is created on first read; most loop rows never use refs. */
export function defineLazyRefs<T extends object>(context: T): T {
    let refs: RefMap | undefined;
    return ObjectConstructor.defineProperty(context, '$ref', {
        enumerable: true,
        configurable: true,
        get: () => refs ??= createRefs(),
        // Child scopes assigning their own `$ref` shadow this accessor instead of hitting a getter-only property.
        set(this: object, value: RefMap) {
            ObjectConstructor.defineProperty(this, '$ref', { value, writable: true, enumerable: true, configurable: true });
        },
    });
}

export function registerRef(refs: RefMap, name: string, element: Element): void {
    const values = registries.get(refs);
    if (!values) throw createTypeError('b-ref requires a Brio ref registry.');
    if (ObjectConstructor.prototype.hasOwnProperty.call(values, name))
        throw createSyntaxError(`Duplicate b-ref name "${name}" in the same scope.`);
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
