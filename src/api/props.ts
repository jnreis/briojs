import { _settings } from "."
import { _props } from "../directives/props";
import { capitalize } from "../tools/string";
import { isFunction, isObject } from "../tools/typeCheck";
import { BEFORE_INIT, FUNCTION, INIT, MUST_BE, OBJECT, PROPS } from "../tools/constants";


export let addProps = (propsName: string, fn: any) => {
    let PROPS_CAP = capitalize(PROPS);

    // Can't add props after init
    if (_settings[INIT])
        return console.error(`${PROPS_CAP} ${BEFORE_INIT}`);

    // Props must be a function that returns an object
    if (!isFunction(fn) || !isObject(fn()))
        return console.error(`${PROPS_CAP} ${MUST_BE} a ${FUNCTION} and must return an ${OBJECT}.`);

    // Add the props to the list of props
    _props[propsName] = fn;
}