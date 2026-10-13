import { hydrateNode } from './bindings';
import type { DomRuntime } from './types';

export function hydrateRoot(
    root: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    hydrateNode(root, context, runtime);
}
