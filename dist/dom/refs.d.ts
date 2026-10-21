export type RefMap = Readonly<Record<string, Element | undefined>>;
export declare function createRefs(): RefMap;
/** Defines a `$ref` registry on `context` that is created on first read; most loop rows never use refs. */
export declare function defineLazyRefs<T extends object>(context: T): T;
export declare function registerRef(refs: RefMap, name: string, element: Element): void;
