export type RefMap = Readonly<Record<string, Element | undefined>>;
export declare function createRefs(): RefMap;
export declare function registerRef(refs: RefMap, name: string, element: Element): void;
