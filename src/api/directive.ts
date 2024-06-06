import { _settings } from ".";
import { _directives, regDirective } from "../directives"
import { arrayAdd } from "../tools/array";
import { API_ADD_ERROR, DIRECTIVE, INIT } from "../tools/constants";
import { logger } from "../tools";


export let addDirective = (directiveName: string, hasModifiers: boolean, hydrateDirective: HydrateDirective) => {
    // Can't add directives after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR(DIRECTIVE, directiveName));

    // Add the directive to the list of directives
    arrayAdd(_directives, [regDirective(directiveName, hasModifiers), hydrateDirective])
}