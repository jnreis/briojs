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
 * Returns a setTimeout that runs after the longest running animation is finished
 */
export let afterAnimations = ($el: HTMLElement, callback: () => void) => {
    // Get the remaining time of the longest running animation
    let offset = getAnimationsRemainingTime($el);
    // Remove the node after the animations are finished
    return setTimeout(callback, offset);
}