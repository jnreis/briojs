import { _settings } from "."
import { isFunction, isObject } from "../tools/typeCheck";
import { $PROPS, API_ADD_ERROR, FUNCTION, INIT, MUST_BE, OBJECT } from "../tools/constants";
import { logger } from "../tools";

export let _props: ObjectType = {};

export let addProps = (propsName: string, fn: (...args: any) => ObjectType) => {

    // Can't add props after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR($PROPS, propsName));

    // Props must be a function that returns an object
    if (!isFunction(fn) || !isObject(fn()))
        return logger(`The ${$PROPS} "${propsName}" ${MUST_BE} a ${FUNCTION} and must return an ${OBJECT}.`);

    // Add the props to the list of props
    _props[propsName] = fn;
}