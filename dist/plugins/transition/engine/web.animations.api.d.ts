export declare let webAnimationsApiAnimationEngine: {
    name: string;
    validate: (animation: ObjectType) => animation is Animation;
    play: (animation: ObjectType, next: FunctionType) => void;
    reverse: (animation: ObjectType, next: FunctionType) => void;
    onComplete: (animation: ObjectType, next: FunctionType) => void;
};
