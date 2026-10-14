import { AppOptions, BrioApp, StoreMap } from './types';

export declare function createApp<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap>(options?: AppOptions<T, S>): BrioApp<T, S>;
