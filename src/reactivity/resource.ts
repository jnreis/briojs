import { effect } from './effect';
import type { Signal } from './types';

export type Resource<T> = {
    readonly data: Signal<T | undefined>;
    readonly loading: Signal<boolean>;
    readonly error: Signal<unknown | undefined>;
    refetch(): Promise<void>;
};

import { signal } from './state-v4';

export function resource<T>(fetcher: () => Promise<T>): Resource<T> {
    const data = signal<T | undefined>(undefined);
    const loading = signal<boolean>(true);
    const error = signal<unknown | undefined>(undefined);

    const run = async () => {
        loading.value = true;
        error.value = undefined;
        try {
            data.value = await fetcher();
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    };

    effect(() => {
        run();
    });

    return {
        data,
        loading,
        error,
        refetch: run,
    };
}
