type AnimationFunction = (animation: any, next: FunctionType) => void;

type AnimationEngine = {
    name: string,
    validate: (animation: any) => boolean,
    play: AnimationFunction,
    reverse: AnimationFunction,
    onComplete: AnimationFunction,
}

type PlayTransition = (animation: any, ctx: any, controls: HookControls) => void;

type ReverseTransition = (animation: any, ctx: any, controls: HookControls) => void;