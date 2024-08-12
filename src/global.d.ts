// METHODS
type MagicMethod = (vnode: VNode) => FunctionType;
type MagicMethods = {
    [methodName: string]: MagicMethod
};

// GENERAL TYPES
type VNodes = Map<Node, VNode>;
type VNode = {
    // Magic attributes
    $el: HTMLElement, // the element itself
    $refs: ObjectType, // References to other elements available to all elements in the same $props context. Except for nested contexts.
    $props: ObjectType, // context

    // UIDs
    uid: ObjectType, // context

    // Attributes or directives
    attr: {
        [attrName: string]: {
            value: string,
        }
    },

    // Cleanup functions
    cleanup: FunctionType[],

    // Hydration status
    status: 'ok' | 'temp' | 'skip', /*
        ok: the element is about to be hydrated or has been hydrated
        temp: the element will be hydrated later
        skip: skips the hydration process
    */
}
type ObjectType = {
    [prop: string]: any
    [prop: symbol]: any
}
type FunctionType = (...args: any) => any;


// HYDRATION TYPES

/** 0: not a directive, 1: directive without modifiers, 2: directive with modifiers */
type ValidateDirective = (vnode: VNode, attrName: string) => 0|1|2;
type HydrateDirective = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => any;

type HydrationTools = {
    vnodes: VNodes,
    wrapper: (vnode: VNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => FunctionType) => void,
    hydrate: (nodes?: Node[]) => void,
    dehydrate: (node: Node, removeVNode?: boolean) => void,
    saveCleanup: (vnode: VNode, fn: FunctionType) => void,
    newVNode: ($el: HTMLElement) => VNode,
    saveVNode: (vnode: VNode) => void,
    attr: (vnode: VNode, attrName: string, attrValue?: string) => {
        value: string;
    },

    setHook: (node: Node, hookName: string, fn: HookFunction, priority?: number) => void,
    callHook: (node: Node, hookName: string, context?: any) => Promise<void>,

    saveAttr: (vnode: VNode, attrName: string, attrValue: string) => void,
    evaluate: (vnode: VNode, exp: string) => any,
}

type HookControls = {
    play: FunctionType,
    pause: FunctionType,
    remove: FunctionType,
};
type HookFunction = (ctx: any, controls: HookControls) => Promise<void> | void;


// REACTIVITY TYPES
type ListenerFunction = (context: {
    operation: string, 
    state: any, 
    prop: string, 
    newValue: any, 
    oldValue: any
}) => any;
type ListenerFunctions = Map<ListenerFunction, number>;
/** [proxied, prop] */
type AccessedProp = [any, string|number|symbol];

type StateObject = {
    // Parent state, used for scope resolution.
    proxied: any,
    target: any,
    parent: any,
    ignoreKeys: string[],
    // Listeners
    state: ListenerFunctions,
    props: {
        [prop: string|number]: ListenerFunctions
    },
}


// ANIMATION TYPES
type AnimationFunction = (animation: any, next: FunctionType) => void;
type AnimationEngine = {
    name: string,
    validate: (animation: any) => boolean,
    play: AnimationFunction,
    reverse: AnimationFunction,
    onComplete: AnimationFunction,
};


// ASTRO HTML TYPES
// * Node: this is no longer needed since every Brio.js directive is now prefixed with `b-` or `on-`.
declare namespace astroHTML.JSX {
    interface HTMLAttributes {
        ignore?: string;
        each?: string;
        props?: string;
        init?: string;
        uid?: string;
        if?: string;
        show?: string;
        html?: string;
        text?: string;
        effect?: string;
        teleport?: string;
        transition?: string;
        model?: string;
        mask?: string;
    }
}