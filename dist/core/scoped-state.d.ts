export type ScopedState = Record<PropertyKey, any> & {
    readonly $parent: ScopedState | undefined;
};
export declare function createScopedState(source: object, parent?: ScopedState): ScopedState;
