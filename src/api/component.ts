import { _settings } from ".";
import { sanitizeAttrValue } from "../hydration";
import { logger } from "../tools";
import { API_ADD_ERROR, COMPONENT, INIT } from "../tools/constants";

export let _components: { [componentName: string]: string } = {};

export let addComponent = (componentName: string, ...html: string[]) => {

    // Can't add components after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR(COMPONENT, componentName));

    // Add the component to the components object
    _components[componentName] = sanitizeAttrValue(html.join(''));
}