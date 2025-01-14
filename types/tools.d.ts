/** A generic object */
type ObjectType = {
    [prop: string]: any
    [prop: symbol]: any
}

/** A generic function */
type FunctionType = (...args: any) => any;

type WalkSyncCallback = (node: Node) => boolean | null;

type WalkAsyncCallback = (node: Node) => Promise<boolean | null>;

type Hooks = Map<Node, {
    [hookName: string]: Map<HookFunction, number>
}>;

type HookControls = {
    play: FunctionType,
    pause: FunctionType,
    remove: FunctionType
}

type HookFunction = (ctx: any, controls: HookControls) => Promise<void> | void;

/** Sets a hook to a target */
type SetHook = (target: any, hookName: string, hookFunction: HookFunction, priority?: number) => void;

/** Calls all the functions under a hook name on a target by priority */
type PlayHook = (target: any, hookName: string, context?: any) => Promise<void>;

interface PropertyDescriptorShorthand extends PropertyDescriptor {
    v?: any; // value
    w?: boolean; // writable: means the value can be changed
    e?: boolean; // enumerable: means the value can be iterated over
    c?: boolean; // configurable: means the property can be deleted or its attributes changed
}