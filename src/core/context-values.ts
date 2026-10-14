import { effect } from '../reactivity/effect';
import { track, trigger } from '../reactivity/state';

export type ContextValues = Readonly<Record<string, unknown>>;

export function copyContextValues(value: unknown, label: string): Record<string, unknown> {
    if (value === null || typeof value !== 'object' ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
        throw new TypeError(`${label} must be a synchronous plain object.`);
    const result: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
        if (!('value' in descriptor))
            throw new TypeError(`${label} must contain data properties, not accessors.`);
        result[key] = Reflect.get(value, key);
    }
    return result;
}

export const emptyContextValues: ContextValues = Object.freeze(Object.create(null));

export function createProvidedValues(
    getValues: () => unknown,
    parent: ContextValues = emptyContextValues,
): ContextValues {
    let values: Record<string, unknown> = Object.create(null);
    const holder = {};
    effect(() => {
        values = copyContextValues(getValues(), 'b-provide');
        trigger(holder, 'values', 'set');
    });
    const readOnly = () => {
        throw new TypeError('$provided names are read-only.');
    };
    const hasOwn = (key: PropertyKey) => Object.prototype.hasOwnProperty.call(values, key);
    return new Proxy(Object.create(null), {
        get(_target, key) {
            track(holder, 'values');
            return hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key);
        },
        has(_target, key) {
            track(holder, 'values');
            return hasOwn(key) || Reflect.has(parent, key);
        },
        ownKeys() {
            track(holder, 'values');
            return [...new Set([...Reflect.ownKeys(parent), ...Reflect.ownKeys(values)])];
        },
        getOwnPropertyDescriptor(_target, key) {
            track(holder, 'values');
            if (!hasOwn(key) && !Object.prototype.hasOwnProperty.call(parent, key)) return;
            return {
                configurable: true,
                enumerable: true,
                writable: false,
                value: hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key),
            };
        },
        set: readOnly,
        deleteProperty: readOnly,
        defineProperty: readOnly,
        setPrototypeOf: readOnly,
        preventExtensions: readOnly,
    });
}
