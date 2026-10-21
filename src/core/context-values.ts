import {
    isObjectType, objectConstructor, ReflectApi, createTypeError, objectKeys,
    ownKeys, GET_OWN_PROPERTY_DESCRIPTOR,
    includesItem,
} from './native';
import { effect } from '../reactivity/effect';
import { track, trigger } from '../reactivity/state';

export type ContextValues = Readonly<Record<string, unknown>>;

export function copyContextValues(value: unknown, label: string): Record<string, unknown> {
    if (value === null || !isObjectType(value) ||
        !includesItem([objectConstructor.prototype, null], objectConstructor.getPrototypeOf(value)))
        throw createTypeError(`${label} must be a synchronous plain object.`);
    const result: Record<string, unknown> = objectConstructor.create(null);
    for (const key of objectKeys(value)) {
        const descriptor = objectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](value, key)!;
        if (!('value' in descriptor))
            throw createTypeError(`${label} must contain data properties, not accessors.`);
        result[key] = ReflectApi.get(value, key);
    }
    return result;
}

export const emptyContextValues: ContextValues = objectConstructor.freeze(objectConstructor.create(null));

export function createProvidedValues(
    getValues: () => unknown,
    parent: ContextValues = emptyContextValues,
): ContextValues {
    let values: Record<string, unknown> = objectConstructor.create(null);
    const holder = {};
    effect(() => {
        values = copyContextValues(getValues(), 'b-provide');
        trigger(holder, 'values', 'set');
    });
    const readOnly = () => {
        throw createTypeError('$provided names are read-only.');
    };
    const hasOwn = (key: PropertyKey) => objectConstructor.prototype.hasOwnProperty.call(values, key);
    return new Proxy(objectConstructor.create(null), {
        get(_target, key) {
            track(holder, 'values');
            return hasOwn(key) ? ReflectApi.get(values, key) : ReflectApi.get(parent, key);
        },
        has(_target, key) {
            track(holder, 'values');
            return hasOwn(key) || ReflectApi.has(parent, key);
        },
        ownKeys() {
            track(holder, 'values');
            return [...new Set([...ownKeys(parent), ...ownKeys(values)])];
        },
        [GET_OWN_PROPERTY_DESCRIPTOR](_target, key) {
            track(holder, 'values');
            if (!hasOwn(key) && !objectConstructor.prototype.hasOwnProperty.call(parent, key)) return;
            return {
                configurable: true,
                enumerable: true,
                writable: false,
                value: hasOwn(key) ? ReflectApi.get(values, key) : ReflectApi.get(parent, key),
            };
        },
        set: readOnly,
        deleteProperty: readOnly,
        defineProperty: readOnly,
        setPrototypeOf: readOnly,
        preventExtensions: readOnly,
    });
}
