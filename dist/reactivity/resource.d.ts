import { Resource } from './types';

export type { Resource } from './types';
export declare function resource<T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T>;
