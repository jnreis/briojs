export type VNodes = Map<Node, VNode>;

export type VNode = {
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

export type ObjectType = {
    [prop: string]: any
    [prop: symbol]: any
}

export type WatchCallback = (newValue: any, oldValue: any, key: string|number) => void;

export type ValidateDirective = (vnode: VNode) => [string, string] | undefined;
export type HydrateDirective = (vnode: VNode, attrName: string, attrValue: string) => any;

export type MagicMethod = (vnode: VNode) => (...args: any) => any;


/**
 * Astro types
 */
export declare namespace astroHTML.JSX {
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