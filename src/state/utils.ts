/**
 * Splits the path of the state into an array of strings
 * @param path The path of the state
 * @returns The path of the state as an array of strings
 */
export function splitPath(path: string) {
    // Check if the path is a string
    if (typeof path !== 'string') {
        throw new Error('The path of the state must be a string.')
    }
    // Split the path
    return path.trim().split('.').filter((l) => l.trim())
}

/**
 * Subtracts the start path from the path
 * @param path The path of the state
 * @param startPath The path to subtract from the path
 * @returns The path of the state without the start path
 */
export function subPath(path: string, startPath: string): undefined | string {
    const p = splitPath(path)
    const s = splitPath(startPath)
    // Check if the path does not start with the start path
    if (!s.every((l, i) => l === p[i])) {
        return undefined
    }
    return p.slice(s.length).join('.')
}

/**
 * Splits the name of the state from the path of the state
 * @param namePath The name and path of the state separated by a dot
 * @returns The name and path of the state as an object
 */
export function splitNamePath(namePath: string) {
    const p = splitPath(namePath)
    return {
        name: p[0], 
        path: p.slice(1).join('.')
    }
}

/**
 * Gets the data of a path from the state
 * @param path The path of the state
 * @param data An object containing a value property
 * @returns The data of the path
 */
export function get(path: string, data: any) {
    // Split the path
    const p = splitPath(path)

    // Check if the path is empty
    if (!p.length) {
        return data.value
    }

    // Check if data is an object or an array
    if (!isObject(data.value) && !Array.isArray(data.value)) {
        return undefined
    }

    let current = data.value
    const pSize = p.length - 1

    for (let i = 0; i < pSize; i++) {
        // Check if the path exists
        if (!isObject(current[p[i]]) && !Array.isArray(current[p[i]])) {
            return undefined
        }
        current = current[p[i]]
    }
    // Return the data of the path
    return current[p[pSize]]
}

/**
 * Sets the data of a path in the state
 * @param path The path where the data will be set
 * @param data An object containing a value property
 * @param newData The data to set
 * @returns The data that was set
 */
export function set(path: string, data: any, newData: any) {
    // Split the path
    const p = splitPath(path)

    // Check if the path is empty
    if (!p.length) {
        data.value = newData
        return data.value
    }

    if (!isObject(data.value) && !Array.isArray(data.value)) {
        data.value = isNaN(Number(p[0])) ? {} : []
    }
    let current = data.value

    const pSize = p.length - 1

    for (let i = 0; i < pSize; i++) {
        // Check if the path exists
        if (!isObject(current[p[i]]) && !Array.isArray(current[p[i]])) {
            current[p[i]] = isNaN(Number(p[i + 1])) ? {} : []
        }
        current = current[p[i]]
    }
    // Return the path for the new data
    return current[p[pSize]] = newData
}

/**
 * Checks if a value is an object
 * @param value The value to check
 * @returns True if the value is an object, else false
 */
export function isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Performs a deep comparison between two values to determine if they are equivalent
 * @param a Value to compare
 * @param b Other value to compare
 * @returns True if the values are equivalent, else false
 */
export function deepEqual(a: any, b: any): boolean {
    // Check if the values are objects
    if (isObject(a) && isObject(b)) {
        // Check if the objects have the same keys
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false
        }
        // Check if the objects have the same values
        for (const key in a) {
            if (!deepEqual(a[key], b[key])) {
                return false
            }
        }
        return true
    }

    // Check if the values are arrays
    if ((Array.isArray(a) && Array.isArray(b))) {
        console.log(a, b)
        // Check if the arrays have the same length
        if (a.length !== b.length) {
            return false
        }
        // Check if the arrays have the same values
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false
            }
        }
        return true
    }

    // Check if the values are sets or maps
    if ((a instanceof Set && b instanceof Set) || (a instanceof Map && b instanceof Map)) {
        return deepEqual(Array.from(a), Array.from(b));
    }

    // Check if the values are functions or regexes
    if ((typeof a === 'function' && typeof b === 'function') || (a instanceof RegExp && b instanceof RegExp)) {
        return a.toString() === b.toString()
    }

    // Check if the values are dates
    if (a instanceof Date && b instanceof Date) {
        // Check if the dates are the same
        return a.getTime() === b.getTime()
    }

    // Check if the values are the same
    return a === b
}