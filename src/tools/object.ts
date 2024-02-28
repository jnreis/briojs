import { ObjectType } from "..";
import { CREATE } from "./constants";

export let getKeys = (value: Object) => {
    return Object.keys(value);
}

export let getAllKeys = (value: Object) => {
    let keys = new Set();

    // Recursively traverse the prototype chain
    let currentObj = value;
    while (currentObj) {
        getKeys(currentObj).forEach((key) => keys.add(key));
        currentObj = getProto(currentObj);
    }

    return keys;
}

export let newObject = (proto: object | null = null) => {
    return (Object as any)[CREATE](proto);
}

export let createContext = (parentContext: any, newContext = {}): any => {
    const mergedContext = newObject(parentContext);
    Object.defineProperties(
        mergedContext,
        Object.getOwnPropertyDescriptors(newContext)
    );
    return mergedContext;
};

export let getDescriptor = (value: any, key: string) => {
    return Object.getOwnPropertyDescriptor(value, key);
}

export let getProto = (object: any) => {
    return Object.getPrototypeOf(object);
}

export let getOwnProp = (object: any) => {
    return Object.getOwnPropertyNames(object);
}

export let defineProp = (object: any, key: string, descriptor: PropertyDescriptor) => {
    Object.defineProperty(object, key, descriptor);
}

export let createGetterSetter = (source: ObjectType, target: ObjectType, propertyName: string, alias: string = '') => {
    defineProp(target, alias || propertyName, {
        // Getter returns the value of the property in `source`
        get() {
            return source[propertyName];
        },
        // Setter sets the value of the property in `source`
        set(value) {
            source[propertyName] = value;
        }
    });
}

export let setHiddenKey = (object: any, key: string, value: any) => {
    defineProp(object, key, {
        value,
        enumerable: false,
        configurable: true,
    });
}