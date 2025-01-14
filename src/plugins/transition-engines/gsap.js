/**
 * To use GSAP as Transition Engine
 * The minified version of this code was minified using UglifyJS online: https://skalman.github.io/UglifyJS-online/
 */

document.addEventListener('brio:init', () => {
    let EVENT_CALLBACK = 'eventCallback';
    let ON_COMPLETE = 'onComplete';
    let PLAY = 'play';
    let REVERSE = 'reverse';
    Brio.addTransitionEngine({
        name: 'GSAP',
        // ? This validation can be improved
        validate: (animation) => [EVENT_CALLBACK, 'yoyo'].every(key => key in animation),
        [PLAY]: (animation) => {
            animation[PLAY]();
        },
        [REVERSE]: (animation) => {
            animation[REVERSE]();
        },
        [ON_COMPLETE]: (animation, next) => {
            animation[EVENT_CALLBACK](ON_COMPLETE, next);
            animation[EVENT_CALLBACK]('onReverseComplete', next);
        },
    })
});