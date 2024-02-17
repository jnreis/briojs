export const getKeys = (value: Object) => {
    return Object.keys(value);
}

export const getAllKeys = (value: Object) => {
    const keys = new Set();

    // Recursively traverse the prototype chain
    let currentObj = value;
    while (currentObj) {
        getKeys(currentObj).forEach((key) => keys.add(key));
        currentObj = getProto(currentObj);
    }

    return keys;
}

export const newObject = (proto: object | null = null) => {
    return Object.create(proto);
}

export const createContext = (parentContext: any, newContext = {}): any => {
    const mergedContext = newObject(parentContext);
    Object.defineProperties(
        mergedContext,
        Object.getOwnPropertyDescriptors(newContext)
    );
    return mergedContext;
};

export const getDescriptor = (value: any, key: string) => {
    return Object.getOwnPropertyDescriptor(value, key);
}

export const getProto = (object: any) => {
    return Object.getPrototypeOf(object);
}

export const getOwnProp = (object: any) => {
    return Object.getOwnPropertyNames(object);
}

export const defineProp = (object: any, key: string, descriptor: PropertyDescriptor) => {
    Object.defineProperty(object, key, descriptor);
}