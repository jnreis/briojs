import { _settings } from ".";
import { _directives } from "../directives"
import { arrayAdd } from "../tools/array";
import { capitalize } from "../tools/string";
import { BEFORE_INIT, DIRECTIVE, INIT } from "../tools/constants";


export let addDirective = (validateAttribute: ValidateDirective, hydrateDirective: HydrateDirective) => {
    // Can't add directives after init
    if (_settings[INIT])
        return console.error(`${capitalize(DIRECTIVE)} ${BEFORE_INIT}`);

    // Add the directive to the list of directives
    arrayAdd(_directives, [validateAttribute, hydrateDirective])
}