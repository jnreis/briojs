import { _reservedNames, _settings } from ".";
import { _methods } from "../methods"
import { has, logger } from "../tools";
import { arrayAdd } from "../tools/array";
import { BEFORE_INIT, INIT, METHOD } from "../tools/constants";
import { startsWith } from "../tools/string";


export let addMethod = (name: string, fn: MagicMethod) => {
    let METHOD_NAME = `The ${METHOD} "${name}"`;

    // Can't add methods after initialization
    if (_settings[INIT])
        return logger(`${METHOD_NAME} ${BEFORE_INIT}`);

    // Method already exists
    if (has(_reservedNames, name))
        return logger(`${METHOD_NAME} already exists`);

    // Methods must start with "$"
    if (!startsWith(name, "$"))
        return logger(`${METHOD_NAME} must start with "$"`);

    // Add the method to the list of methods
    arrayAdd(_methods, [name, fn]);

    // Add the method to the list of reserved names
    arrayAdd(_reservedNames, name);
}