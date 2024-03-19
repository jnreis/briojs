import { wait } from "../tools";

export let animate = ($el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions = {}) => 
    $el.animate(keyframes, options = {
        duration: 200,
        easing: 'ease-in-out', // 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'
        fill: 'both', // 'auto', 'forwards', 'backwards', 'both', 'none'
        direction: 'alternate', // 'normal', 'reverse', 'alternate', 'alternate-reverse'
        // iterations: 1, // Number, Infinity
        ...options
    });

/**
 * Gets the remaining time of the longest running animation
 */
export let getAnimationsRemainingTime = ($el: HTMLElement) => {
    let maxRemainingTime = 0;

    for (let animation of $el.getAnimations()) {
        // Check if the animation is currently playing
        if (animation.playState === 'running') {
            // Get the animation effect and its duration
            let effect = animation.effect;
            let duration = effect ? Number(effect.getTiming().duration) : 0;

            // Calculate the remaining time of the animation
            let currentTime = Number(animation.currentTime || 0);
            let remainingTime = duration - currentTime;
    
            // Update maxRemainingTime if necessary
            if (remainingTime > maxRemainingTime) {
                maxRemainingTime = remainingTime;
            }
        }
    }

    return maxRemainingTime;
}

/**
 * Returns a function that calls the callback after the animations have finished
 */
export let afterAnimations = (callback: ($el: HTMLElement) => void) => {

    // `lastPlayNumber` is incremented when the animations are scheduled to play
    let lastPlayNumber = 0;

    // `playNumber` is incremented when the callback is about to be called
    let playNumber = 0;

    return ($el: HTMLElement) => {
        lastPlayNumber++;
        // Wait for the next tick to ensure the animation has started
        wait(() => {
            Promise.all($el.getAnimations().map(animation => animation.finished)).then(() => {
                playNumber++;
                // If the last play number is the same as the current play number, call the callback.
                // This ensures that the callback is only called for the last scheduled play.
                if (lastPlayNumber == playNumber) {
                    callback($el);
                }
            });
        });
    };
}