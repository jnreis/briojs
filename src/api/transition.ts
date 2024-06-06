import { _settings } from ".";
import { _engines } from "../methods/transition"
import { logger } from "../tools";
import { arrayAdd } from "../tools/array";
import { API_ADD_ERROR, INIT, INVALID, NAME, ON_COMPLETE, PLAY, REVERSE, TRANSITION_ENGINE, VALIDATE } from "../tools/constants";

export let addTransitionEngine = (engine: AnimationEngine) => {

    // Can't add transition engine after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR(TRANSITION_ENGINE, engine[NAME]));

    // Validate the engine properties
    if (!engine || ![NAME,VALIDATE,PLAY,REVERSE,ON_COMPLETE].every(key => key in engine))
        return logger(INVALID + ' ' + TRANSITION_ENGINE, engine ? engine[NAME] : '');

    // Check if the engine already exists
    let engineIndex = _engines.findIndex(item => item[NAME] == engine[NAME]);

    // Overwrite the engine
    if (engineIndex >= 0) _engines[engineIndex] = engine;
    // Add new engine
    else arrayAdd(_engines, engine);
}