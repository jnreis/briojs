import { _settings } from ".";
import { _engines } from "../methods/transition"
import { logger } from "../tools";
import { arrayAdd } from "../tools/array";
import { BEFORE_INIT, INIT, INVALID, NAME, ON_COMPLETE, PLAY, REVERSE, TRANSITION_ENGINE, VALIDATE } from "../tools/constants";

export let addTransitionEngine = (engine: AnimationEngine) => {

    // Can't add transition engine after initialization
    if (_settings[INIT])
        return logger(`The ${TRANSITION_ENGINE} ${BEFORE_INIT}`);

    // Validate the engine properties
    if (!engine || ![NAME,VALIDATE,PLAY,REVERSE,ON_COMPLETE].every(key => key in engine))
        return logger(INVALID + ' ' + TRANSITION_ENGINE, engine ? engine.name : '');

    // Check if the engine already exists
    let engineIndex = _engines.findIndex(item => item[NAME] == engine[NAME]);

    // Overwrite the engine
    if (engineIndex >= 0) _engines[engineIndex] = engine;
    // Add new engine
    else arrayAdd(_engines, engine);
}