import { EVENT, ON_COMPLETE, PLAY, REVERSE } from "../../../tools/constants";

let EVENT_CALLBACK = EVENT + 'Callback' as 'eventCallback';

export let gsapAnimationEngine = {
    name: 'GSAP',
    // ? This validation can be improved
    validate: (animation: ObjectType) => [EVENT_CALLBACK, 'yoyo'].every(key => key in animation),
    [PLAY]: (animation: ObjectType) => {
        animation[PLAY]();
    },
    [REVERSE]: (animation: ObjectType) => {
        animation[REVERSE]();
    },
    [ON_COMPLETE]: (animation: ObjectType, next: FunctionType) => {
        animation[EVENT_CALLBACK](ON_COMPLETE, next);
        animation[EVENT_CALLBACK]('onReverseComplete', next);
    },
}