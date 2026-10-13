import { AppOptions, BrioApp } from './types';

export declare function createApp<T extends Record<string, unknown> = Record<string, unknown>>(options?: AppOptions<T>): BrioApp<T>;
