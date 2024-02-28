import { defineProp, getOwnProp, getProto } from "../tools/object";
import { lower } from "../tools/string";
import { isFunction } from "../tools/typeCheck";
import { ARRAY, BOOLEAN, DATE, NUMBER, OBJECT, STRING } from "../tools/constants";

const BIND_IGNORED = [STRING,NUMBER,OBJECT,ARRAY,BOOLEAN,DATE];

export const isObj = (object: any) => {
    return object && typeof object === OBJECT;
}

export const setHiddenKey = (object: any, key: string, value: any) => {
    defineProp(object, key, {
        value,
        enumerable: false,
        configurable: true,
    });
}

export const defineBubblingProperties = (
    object: any,
    key: string,
    parent: any
) => {
    setHiddenKey(object, "__key", key);
    setHiddenKey(object, "__parent", parent);
}

export const getInstanceMethodKeys = (object: any) => {
    return getOwnProp(object)
        .concat(
            getProto(object) &&
                BIND_IGNORED.indexOf(lower(getProto(object).constructor.name)) < 0
                ? getOwnProp(getProto(object))
                : []
        )
        .filter(
            (prop) =>
                prop !== "constructor" && isFunction(object[prop])
        );
}
