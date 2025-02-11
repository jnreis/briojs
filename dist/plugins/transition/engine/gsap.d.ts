export declare let gsapAnimationEngine: {
    name: string;
    validate: (animation: ObjectType) => boolean;
    play: (animation: ObjectType) => void;
    reverse: (animation: ObjectType) => void;
    onComplete: (animation: ObjectType, next: FunctionType) => void;
};
