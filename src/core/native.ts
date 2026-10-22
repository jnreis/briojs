export const GET_OWN_PROPERTY_DESCRIPTOR: 'getOwnPropertyDescriptor' = 'getOwnPropertyDescriptor';
export const $PARENT: '$parent' = '$parent';
export const TEMPLATE: 'template' = 'template';
export const TELEPORT: 'teleport' = 'teleport';
export const B_TELEPORT = 'b-' + TELEPORT as 'b-teleport';
export const ATTRIBUTES: 'attributes' = 'attributes';

export const ObjectConstructor = Object;
export const ReflectApi = Reflect;

export const isArray: typeof Array.isArray = value => Array.isArray(value);
export const objectKeys: typeof Object.keys = value => ObjectConstructor.keys(value);
export const objectEntries: typeof Object.entries = (value: {}) => ObjectConstructor.entries(value);
export const ownKeys: typeof Reflect.ownKeys = value => ReflectApi.ownKeys(value);

export function arrayFrom<T>(items: Iterable<T> | ArrayLike<T>): T[];
export function arrayFrom<T, U>(
    items: Iterable<T> | ArrayLike<T>,
    map: (value: T, index: number) => U,
    thisArg?: unknown,
): U[];
export function arrayFrom(items: Iterable<unknown> | ArrayLike<unknown>, map?: (value: unknown, index: number) => unknown, thisArg?: unknown): unknown[] {
    // Forward only the arguments given so a replaced Array.from sees the original call shape.
    return getLength(arguments) === 1 ? Array.from(items) : Array.from(items, map as (value: unknown, index: number) => unknown, thisArg);
}

/** Indexed copy of a live list (attributes, child nodes); far cheaper than iterating a NodeList or NamedNodeMap. */
export const snapshotList = <T>(list: ArrayLike<T>): T[] => {
    const length = getLength(list);
    const copy = new Array<T>(length);
    for (let index = 0; index < length; index++) copy[index] = list[index];
    return copy;
};

/** Errors Brio raised itself; only these get DOM locations appended, never errors thrown by application code. */
export const brioErrors = new WeakSet<object>();
const ownError = <E extends Error>(error: E): E => (brioErrors.add(error), error);
export const createError = (message: string): Error => ownError(new Error(message));
export const createTypeError = (message: string): TypeError => ownError(new TypeError(message));
export const createSyntaxError = (message: string): SyntaxError => ownError(new SyntaxError(message));
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isObjectType = <T>(value: T): value is T & (object | null) => typeof value === 'object';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isFunction = <T>(value: T): value is T & Function => typeof value === 'function';
export const getLength = (value: { readonly length: number }): number => value.length;

export const isInstanceOf = <T>(value: unknown, constructor: abstract new (...args: never[]) => T): value is T =>
    value instanceof constructor;
export const removeElement = (element: { remove(): void } | null | undefined): void => element?.remove();
export const deleteItem = <T>(
    collection: { delete(item: T): boolean } | null | undefined,
    item: T,
): boolean | undefined => collection?.delete(item);
export const includesItem = <T>(collection: { includes(item: T): boolean }, item: T): boolean =>
    collection.includes(item);
export const startsWith = (value: string, prefix: string): boolean =>
    value.startsWith(prefix);