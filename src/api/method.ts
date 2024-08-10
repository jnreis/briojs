import { _settings, reservedNames } from ".";
import { _methods } from "../methods"
import { has, logger } from "../tools";
import { arrayAdd } from "../tools/array";
import { API_ADD_ERROR, INIT, METHOD, NAME_ALREADY_IN_USE } from "../tools/constants";
import { startsWith } from "../tools/string";


export let addMethod = (methodName: string, fn: MagicMethod) => {

    // Make sure the method name starts with "$"
    if (!startsWith(methodName, "$"))
        methodName = '$' + methodName;

    // Can't add methods after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR(METHOD, methodName));

    // Name already in use
    if (has(reservedNames, methodName))
        logger(NAME_ALREADY_IN_USE(methodName));

    // Add the method to the list of methods
    else {
        _methods[methodName] = fn;
        arrayAdd(reservedNames, methodName);
    }
}