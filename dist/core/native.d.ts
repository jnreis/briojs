export declare const GET_OWN_PROPERTY_DESCRIPTOR: 'getOwnPropertyDescriptor';
export declare const $PARENT: '$parent';
export declare const TEMPLATE: 'template';
export declare const TELEPORT: 'teleport';
export declare const B_TELEPORT: "b-teleport";
export declare const ATTRIBUTES: 'attributes';
export declare const objectConstructor: ObjectConstructor;
export declare const ReflectApi: typeof Reflect;
export declare const isArray: typeof Array.isArray;
export declare const objectKeys: typeof Object.keys;
export declare const objectEntries: typeof Object.entries;
export declare const ownKeys: typeof Reflect.ownKeys;
export declare function arrayFrom<T>(items: Iterable<T> | ArrayLike<T>): T[];
export declare function arrayFrom<T, U>(items: Iterable<T> | ArrayLike<T>, map: (value: T, index: number) => U, thisArg?: unknown): U[];
export declare const createError: (message: string) => Error;
export declare const createTypeError: (message: string) => TypeError;
export declare const createSyntaxError: (message: string) => SyntaxError;
export declare const isString: (value: unknown) => value is string;
export declare const isObjectType: <T>(value: T) => value is T & (object | null);
export declare const isNumber: (value: unknown) => value is number;
export declare const isBoolean: (value: unknown) => value is boolean;
export declare const isFunction: <T>(value: T) => value is T & Function;
export declare const getLength: (value: {
    readonly length: number;
}) => number;
export declare const isInstanceOf: <T>(value: unknown, constructor: abstract new (...args: never[]) => T) => value is T;
export declare const removeElement: (element: {
    remove(): void;
} | null | undefined) => void;
export declare const deleteItem: <T>(collection: {
    delete(item: T): boolean;
} | null | undefined, item: T) => boolean | undefined;
export declare const includesItem: <T>(collection: {
    includes(item: T): boolean;
}, item: T) => boolean;
export declare const startsWith: (value: string, prefix: string) => boolean;
