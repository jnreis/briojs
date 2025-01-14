export declare let newTransitions: () => [PlayTransition, ReverseTransition];
export declare let addAnimationEngine: (engine: AnimationEngine) => void;
/**
 * ! Experimental !
 * A thin wrapper around the Web Animations API that allows `opacity`, `blur`, and all `transforms`, as well as `duration`, `easing`, `delay`, `endDelay`, and `pause` properties
 */
export declare let $animate: () => ($el: HTMLElement, options: ObjectType) => Animation;
