/**
 * To use the Web Animations API as Transition Engine
 * The minified version of this code was minified using UglifyJS online: https://skalman.github.io/UglifyJS-online/
 */

document.addEventListener('brio:init', () => {

    /** Get the duration of the animation (Web Animations API) */
    let getAnimateDuration = (animation) => {
        let effect = animation.effect;
        return effect ? Number(effect.getTiming().duration) : 0;
    }

    Brio.addTransitionEngine({
        name: 'Web Animations API',
        validate: (animation) => animation instanceof Animation,
        play: (animation, next) => {
            // Animation is set backwards
            if (animation.playbackRate < 0) {
                animation.reverse();
                animation.pause();
            }

            // Play the animation, if it's not completed
            if (animation.currentTime != getAnimateDuration(animation)) animation.play();

            // Skip the animation, if it's completed
            else next();
        },
        reverse: (animation, next) => {
            // The animation is already at the beginning
            if (animation.currentTime == 0) next();

            // Animation is set forward
            else if (animation.playbackRate > 0) {
                animation.reverse();
                animation.pause();
            }

            // Play the animation, if it's not completed
            if (animation.currentTime != 0) animation.play();

            // Skip the animation, if it's completed
            else next();
        },
        onComplete: (animation, next) => {
            animation.onfinish = next;
        }
    })
});