type ParsedName = {
    baseName: string;
    modifiers: Readonly<Record<string, boolean>>;
};
export declare function extractModifiers(attrName: string): ParsedName;
export {};
