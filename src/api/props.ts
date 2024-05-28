import { _settings } from "."
import { _props } from "../directives/props";
import { isFunction, isObject } from "../tools/typeCheck";
import { $PROPS, BEFORE_INIT, FUNCTION, INIT, MUST_BE, OBJECT } from "../tools/constants";
import { logger } from "../tools";


export let addProps = (propsName: string, fn: (...args: any) => ObjectType) => {
    let PROPS_NAME = `The ${$PROPS} "${propsName}"`;

    // Can't add props after initialization
    if (_settings[INIT])
        return logger(`${PROPS_NAME} ${BEFORE_INIT}`);

    // Props must be a function that returns an object
    if (!isFunction(fn) || !isObject(fn()))
        return logger(`${PROPS_NAME} ${MUST_BE} a ${FUNCTION} and must return an ${OBJECT}.`);

    // Add the props to the list of props
    _props[propsName] = fn;
}