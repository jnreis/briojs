/**
 * Creates a two-way binding between a reactive property and a storage object (like localStorage or sessionStorage).
 *
 * A "storage object" is any object that has the `getItem` and `setItem` methods.
 *
 * @param _storage - The storage object to use
 * @param value - The initial value to set the property to
 * @param alias - The key to use in the storage object. If not provided, the property name will be used.
 * @returns The property initialization function
 */
export declare let storage: (_storage: any, value: any, alias?: string) => any;
export declare let storageEvent: (event: StorageEvent) => void;
