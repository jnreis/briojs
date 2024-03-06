export type VNodes = Map<Node, VNode>;

export type VNode = {
    // Magic attributes
    $el: HTMLElement, // the element itself
    $refs: ObjectType, // available to all elements in the same $props context. Except for nested contexts.
    $props: ObjectType, // context
    $root: HTMLElement | null, // the closest element with a `props` attribute

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

export type ValidateAttribute = (attrName: string) => boolean;
export type HydrateDirective = (vnode: VNode, attrName: string, attrValue: string) => void;

export type MagicMethod = (vnode: VNode) => (...args: any) => any;