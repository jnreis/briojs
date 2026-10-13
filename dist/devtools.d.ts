export type DevtoolsSnapshot = {
    appCount: number;
    mountedRoots: number;
    effectsCreated: number;
    activeEffects: number;
    apps: readonly {
        app: object;
        roots: readonly string[];
        state: unknown;
    }[];
};
export declare function inspectDevtools(): DevtoolsSnapshot;
export declare function devtoolsPanel(container: Element): () => void;
