// EXPORTS
declare type start = (nodes?: Node[]) => void;
declare type api = {
    // Global data store
    store: ObjectType,

    // Methods that may only be called before Brio is initialized
    addProps: (propsName: string, fn: (...args: any) => ObjectType) => void,
    addMethod: (name: string, fn: MagicMethod) => void,
    addDirective: (validateAttribute: ValidateDirective, hydrateDirective: HydrateDirective) => void,
    addTransition: (transitionName: string, cssPropertyName: string, cssPropertyValue: (value: string | number) => string) => void,

    // Animate helpers
    animate: ($el: HTMLElement, keyframes: Keyframe[], options?: KeyframeAnimationOptions) => Animation,
    afterAnimations: (callback: ($el: HTMLElement) => void) => ($el: HTMLElement) => void,

    // Helper functions
    emit: (node: HTMLElement, eventName: string, eventData?: any) => boolean,
    listen: (node: HTMLElement, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions | undefined) => () => void,

    // Reactivity methods
    state: (target: any) => any,
    computed: (fn: ListenerFunction, callback?: ListenerFunction | undefined) => ListenerFunction,
    removeComputed: (fn: ListenerFunction) => void,
    effect: (fn: ListenerFunction) => () => void,
    watch: (observedState: any, prop: string | number | null, callback: ListenerFunction) => () => void,
    storage: (_storage: any, value: any, alias?: string | undefined) => void | ((observedState: any, prop: string) => any),
    isStorage: (obj: any) => any,
    getItem: (storage: any, key: string) => any,
    setItem: (storage: any, key: string, value: any) => any,
}

// GENERAL TYPES
type VNodes = Map<Node, VNode>;
type VNode = {
    // Magic attributes
    $el: HTMLElement, // the element itself
    $refs: ObjectType, // available to all elements in the same $props context. Except for nested contexts.
    $props: ObjectType, // context
    $root: HTMLElement, // the closest element with a `props` attribute or the element itself

    // UIDs
    uid: ObjectType, // context

    // Raw attributes
    attr: ObjectType,

    // Reactivity effects
    effect: ObjectType,
}
type ObjectType = {
    [prop: string]: any
    [prop: symbol]: any
}
type ValidateDirective = (vnode: VNode) => [string, string] | undefined;
type HydrateDirective = (vnode: VNode, attrName: string, attrValue: string) => any;
type MagicMethod = (vnode: VNode) => (...args: any) => any;


// REACTIVITY TYPES
type ListenerFunction = (context: {operation: string, observedState: any, prop: string, newValue: any, oldValue: any}) => any;
type ListenerFunctions = Set<ListenerFunction>;
type ListenerObject = {
    state: ListenerFunctions,
    props: {
        [prop: string|number]: ListenerFunctions
    }
};
type Listeners = Map<any, ListenerObject>;


// ASTRO HTML TYPES
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
        enter?: string;
        leave?: string;
        model?: string;
        mask?: string;
    }
}