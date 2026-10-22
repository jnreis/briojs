import { Resource } from './types.js';

export type { Resource } from './types.js';
export declare function resource<T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T>;
