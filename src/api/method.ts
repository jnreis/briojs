import { MagicMethod } from ".."

import { _reservedNames, _settings } from ".";
import { _methods } from "../methods"
import { has } from "../tools";
import { arrayAdd } from "../tools/array";
import { BEFORE_INIT, METHOD } from "../tools/constants";
import { capitalize, startsWith } from "../tools/string";


export let addMethod = (name: string, fn: MagicMethod) => {
    let METHOD_CAP = capitalize(METHOD);

    // Can't add methods after init
    if (_settings.init)
        return console.error(`${METHOD_CAP} ${BEFORE_INIT}`);

    // Method already exists
    if (has(_reservedNames, name))
        return console.error(`${METHOD_CAP} "${name}" already exists`);

    // Methods must start with "$"
    if (!startsWith(name, "$"))
        return console.error(`${METHOD_CAP} "${name}" must start with "$"`);

    // Add the method to the list of methods
    arrayAdd(_methods, [name, fn]);

    // Add the method to the list of reserved names
    arrayAdd(_reservedNames, name);
}