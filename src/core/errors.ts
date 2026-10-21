import { objectConstructor, createError } from './native';
export function causedError(message: string, cause: unknown): Error {
    const error = createError(message);
    objectConstructor.defineProperty(error, 'cause', { configurable: true, value: cause });
    return error;
}

export function combinedError(message: string, errors: unknown[]): Error {
    const error = createError(message);
    objectConstructor.defineProperty(error, 'errors', { configurable: true, value: errors });
    return error;
}
