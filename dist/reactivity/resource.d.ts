import { Signal } from './types';

export type Resource<T> = {
    readonly data: Signal<T | undefined>;
    readonly loading: Signal<boolean>;
    readonly error: Signal<unknown | undefined>;
    refetch(): Promise<void>;
};
export declare function resource<T>(fetcher: () => Promise<T>): Resource<T>;
