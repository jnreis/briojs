import { deleteItem } from '../core/native';
export type CleanupFn = () => void;

const nodeCleanups = new WeakMap<Node, Set<CleanupFn>>();

export function registerCleanup(node: Node, cleanup: CleanupFn): void {
    let cleanups = nodeCleanups.get(node);
    if (!cleanups) {
        cleanups = new Set();
        nodeCleanups.set(node, cleanups);
    }
    cleanups.add(cleanup);
}

export function cleanupNode(node: Node): void {
    const cleanups = nodeCleanups.get(node);
    if (cleanups) {
        for (const cleanup of cleanups) {
            try {
                cleanup();
            } catch (err) {
                console.error(err);
            }
        }
        cleanups.clear();
        deleteItem(nodeCleanups, node);
    }
}
