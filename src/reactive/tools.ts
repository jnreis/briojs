const BIND_IGNORED = ["String", "Number", "Object", "Array", "Boolean", "Date"];

export function isObj(object: any) {
    return object && typeof object === "object";
}

export function setHiddenKey(object: any, key: string, value: any) {
    Object.defineProperty(object, key, {
        value,
        enumerable: false,
        configurable: true,
    });
}

export function defineBubblingProperties(
    object: any,
    key: string,
    parent: any
) {
    setHiddenKey(object, "__key", key);
    setHiddenKey(object, "__parent", parent);
}
export function getInstanceMethodKeys(object: any) {
    return getOwnProp(object)
        .concat(
            getProto(object) &&
                BIND_IGNORED.indexOf(getProto(object).constructor.name) < 0
                ? getOwnProp(getProto(object))
                : []
        )
        .filter(
            (prop) =>
                prop !== "constructor" && typeof object[prop] === "function"
        );
}

export function getProto(object: any) {
    return Object.getPrototypeOf(object);
}

export function getOwnProp(object: any) {
    return Object.getOwnPropertyNames(object);
}
