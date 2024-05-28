import { _settings } from ".";
import { _directives } from "../directives"
import { arrayAdd } from "../tools/array";
import { capitalize, toString } from "../tools/string";
import { BEFORE_INIT, DIRECTIVE, INIT } from "../tools/constants";
import { logger } from "../tools";


export let addDirective = (validateAttribute: ValidateDirective, hydrateDirective: HydrateDirective) => {
    // Can't add directives after initialization
    if (_settings[INIT])
        return logger(`${capitalize(DIRECTIVE)}s ${BEFORE_INIT}`, toString(validateAttribute));

    // Add the directive to the list of directives
    arrayAdd(_directives, [validateAttribute, hydrateDirective])
}