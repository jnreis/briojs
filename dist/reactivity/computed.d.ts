export declare function computed<T>(getter: () => T): {
    readonly value: T;
    dispose: () => void;
};
