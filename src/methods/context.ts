import { logError } from "../tools";
import { $, FUNCTION, MUST_BE, OF_TYPE } from "../tools/constants";
import { startsWith } from "../tools/string";
import { isFunction } from "../tools/typeCheck";

export let newLocalContext = (objectName: string, object: ObjectType, validationFunction: FunctionType = isFunction, valueType: string = FUNCTION) => (contextName: string, contextValue: any) => {

    // Validate and save the local context
    if (validationFunction(contextValue)) object[contextName] = contextValue;
    
    // ! ERROR: Validation failed
    else logError('the', objectName, `"${contextName}"`, MUST_BE, OF_TYPE, valueType);
}

export let newGlobalContext = (object: ObjectType, validationFunction: FunctionType, valueType: string) => (contextName: string, contextValue: any) => {

    // Make sure the context name starts with '$'
    if (!startsWith(contextName, $)) contextName = $+contextName;

    // ! ERROR: Name already in use
    if (contextName in object) logError(`The name "${contextName}" is already in use.`);

    // Validate and save the global context
    else if (validationFunction(contextValue)) object[contextName] = contextValue;

    // ! ERROR: Validation failed
    else logError(contextName, MUST_BE, OF_TYPE, valueType);
}