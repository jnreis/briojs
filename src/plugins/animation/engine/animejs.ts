import { PAUSE, PLAY, REVERSE } from "../../../tools/constants";
import { hasProp } from "../../../tools/object";

let CURRENT_TIME = 'currentTime';
let REVERSED = REVERSE+'d';

export let animeAnimationEngine = {
    name: 'Anime.js',
    // ? This validation can be improved
    validate: (animation: ObjectType) => ['animatables', 'autoplay'].every(key => hasProp(animation, key)),
    [PLAY]: (animation: ObjectType, next: FunctionType) => {
        // Animation is set backwards
        if (animation[REVERSED]) {
            // Pause the animation before reversing
            // ! This is necessary because reversing the animation while it's playing will cause the animation to play forward 
            // ! and may not fire the `complete` callback because the animation will never reach the end that it was set to
            animation[PAUSE]();

            // Set the animation forward
            animation[REVERSE]();
        }

        // Play the animation, if it's not completed
        if (animation[CURRENT_TIME] != animation.duration) animation[PLAY]();

        // Skip the animation, if it's completed
        else next();
    },
    [REVERSE]: (animation: ObjectType, next: FunctionType) => {
        // Animation is set forward
        if (!animation[REVERSED]) {
            // Pause the animation before reversing
            // ! This is necessary because reversing the animation while it's playing will cause the animation to play forward 
            // ! and may not fire the `complete` callback because the animation will never reach the end that it was set to
            animation[PAUSE]();

            // Set the animation backwards
            animation[REVERSE]();
        }

        // Play the animation, if it's not completed
        if (animation[CURRENT_TIME] != 0) animation[PLAY]();

        // Skip the animation, if it's completed
        else next();
    },
    onComplete: (animation: ObjectType, next: FunctionType) => {
        animation.complete = next;
    }
}