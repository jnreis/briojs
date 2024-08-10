// EXPORTS

// API
declare type start = (nodes?: Node[]) => void;
declare type Api = {
    // To extend Brio.js
    // * Node: this methods may only be called before Brio.js is initialized
    addDirective: (directiveName: string, hasModifiers: boolean, hydrateDirective: HydrateDirective) => void,
    addMethod: (methodName: string, fn: MagicMethod) => void,
    addTransitionEngine: (engine: AnimationEngine) => void,

    // To add assets
    addComponent: (componentName: string, ...html: string[]) => void,
    addProps: (propsName: string, fn: (...args: any) => ObjectType) => void,
    addStore: (storeName: string, storeObject: ObjectType) => void,

    // Reactivity methods
    state: (target: any) => any,
    isState: (value: any) => boolean,
    computed: (fn: ListenerFunction, deps?: ListenerFunction) => ListenerFunction,
    removeComputed: (fn: ListenerFunction) => void,
    effect: (fn: ListenerFunction, deps?: ListenerFunction) => () => void,
    watch: (proxied: any, prop: string | number | null, callback: ListenerFunction) => () => void,
    storage: (_storage: any, value: any, alias?: string) => void | ((proxied: any, prop: string) => any),
}

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
            deps?: FunctionType,
            // hFns: FunctionType[], // hydration functions
            // lFns: FunctionType[], // lifecycle functions
            before: Interceptor[],
            after: Interceptor[],
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
        deps?: FunctionType;
        before: Interceptor[];
        after: Interceptor[];
    },
    saveAttr: (vnode: VNode, attrName: string, attrValue: string) => void,
    interceptor: (vnode: VNode, attrName: string, directiveFn: Interceptor) => (context: any, index?: number) => void,
    saveInterceptor: (vnode: VNode, attrName: string, interceptorType: 'before' | 'after', fn: Interceptor) => void,

    evaluate: (vnode: VNode, exp: string) => any,
}

type Interceptor = (ctx: any, next: NextFunction, remove: () => void) => void;
type NextFunction = (stop: boolean = false) => void;


// REACTIVITY TYPES
type ListenerContext = {
    operation: string, 
    state: any, 
    prop: string, 
    newValue: any, 
    oldValue: any
};
type ListenerFunction = (context: ListenerContext) => any;
type ListenerFunctions = Set<ListenerFunction>;
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
type State = Map<any, StateObject>;


// ANIMATION TYPES
type AnimationFunction = (animation: any, next: NextFunction) => void;
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