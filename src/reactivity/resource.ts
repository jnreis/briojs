import { createError } from '../core/native';
import { createScope, onDispose } from '../core/scope';
import { batch, effect } from './effect';
import { signal } from './state';
import type { Resource } from './types';
export type { Resource } from './types';

export function resource<T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> {
    const data = signal<T | undefined>(undefined);
    const loading = signal<boolean>(true);
    const error = signal<unknown | undefined>(undefined);
    const scope = createScope();
    let current: AbortController | undefined;

    onDispose(scope, () => {
        const pending = current;
        current = undefined;
        pending?.abort();
        loading.value = false;
    });

    const run = async () => {
        if (scope.disposed) throw createError('Cannot refetch a disposed Brio resource.');
        const previous = current;
        const controller = new AbortController();
        current = controller;
        previous?.abort();
        if (scope.disposed || current !== controller) return;
        batch(() => {
            loading.value = true;
            error.value = undefined;
        });
        if (scope.disposed || current !== controller) return;
        let value: T | undefined;
        let failure: unknown;
        let failed = false;
        try {
            value = await fetcher(controller.signal);
        } catch (err) {
            failed = true;
            failure = err;
        }
        if (scope.disposed || current !== controller) return;
        current = undefined;
        batch(() => {
            if (failed) error.value = failure;
            else data.value = value;
            loading.value = false;
        });
    };

    scope.run(() => {
        effect(() => { void run(); });
    });

    return {
        data,
        loading,
        error,
        refetch: run,
        dispose: () => scope.dispose(),
    };
}
