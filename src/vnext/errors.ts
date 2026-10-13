export function causedError(message: string, cause: unknown): Error {
    const error = new Error(message);
    Object.defineProperty(error, 'cause', { configurable: true, value: cause });
    return error;
}

export function combinedError(message: string, errors: unknown[]): Error {
    const error = new Error(message);
    Object.defineProperty(error, 'errors', { configurable: true, value: errors });
    return error;
}
