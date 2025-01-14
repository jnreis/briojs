/**
 * To use Anime.js as Transition Engine
 * The minified version of this code was minified using UglifyJS online: https://skalman.github.io/UglifyJS-online/
 */

document.addEventListener('brio:init', () => {
    let CURRENT_TIME = 'currentTime';
    let PAUSE = 'pause';
    let PLAY = 'play';
    let REVERSE = 'reverse';
    let REVERSED = REVERSE+'d';

    Brio.addTransitionEngine({
        name: 'Anime.js',
        // ? This validation can be improved
        validate: (animation) => ['animatables', 'autoplay'].every(key => animation.hasOwnProperty(key)),
        [PLAY]: (animation, next) => {
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
        [REVERSE]: (animation, next) => {
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
        onComplete: (animation, next) => {
            animation.complete = next;
        }
    })
});