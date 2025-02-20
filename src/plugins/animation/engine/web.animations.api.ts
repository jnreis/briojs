import { PAUSE, PLAY, REVERSE } from "../../../tools/constants";

/** Get the duration of the animation (Web Animations API) */
let getAnimateDuration = (animation: ObjectType) => {
    let effect = animation.effect;
    return effect ? Number(effect.getTiming().duration) : 0;
}

export let webAnimationsApiAnimationEngine = {
    name: 'Web Animations API',
    validate: (animation: ObjectType) => animation instanceof Animation,
    [PLAY]: (animation: ObjectType, next: FunctionType) => {
        // Animation is set backwards
        if (animation.playbackRate < 0) {
            animation[REVERSE]();
            animation[PAUSE]();
        }

        // Play the animation, if it's not completed
        if (animation.currentTime != getAnimateDuration(animation)) animation[PLAY]();

        // Skip the animation, if it's completed
        else next();
    },
    [REVERSE]: (animation: ObjectType, next: FunctionType) => {
        // The animation is already at the beginning
        if (animation.currentTime == 0) next();

        // Animation is set forward
        else if (animation.playbackRate > 0) {
            animation[REVERSE]();
            animation[PAUSE]();
        }

        // Play the animation, if it's not completed
        if (animation.currentTime != 0) animation[PLAY]();

        // Skip the animation, if it's completed
        else next();
    },
    onComplete: (animation: ObjectType, next: FunctionType) => {
        animation.onfinish = next;
    }
}