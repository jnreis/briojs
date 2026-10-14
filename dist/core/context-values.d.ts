export type ContextValues = Readonly<Record<string, unknown>>;
export declare function copyContextValues(value: unknown, label: string): Record<string, unknown>;
export declare const emptyContextValues: ContextValues;
export declare function createProvidedValues(getValues: () => unknown, parent?: ContextValues): ContextValues;
