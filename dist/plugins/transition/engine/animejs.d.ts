export declare let animeAnimationEngine: {
    name: string;
    validate: (animation: ObjectType) => boolean;
    play: (animation: ObjectType, next: FunctionType) => void;
    reverse: (animation: ObjectType, next: FunctionType) => void;
    onComplete: (animation: ObjectType, next: FunctionType) => void;
};
