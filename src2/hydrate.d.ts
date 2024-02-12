export type VNodes = {
    [uid: string]: VNode
}

export type VNode = {
    // A unique identifier for this node
    uid: string,

    // The DOM node (e.g. div, span, input)
    node: HTMLElement | Text,

    // The uid of each parent node that has a scope
    // They are ordered from the closest to the furthest scope
    // If this node has a scope, it will be the first item in the array
    // If the virtual node references a state or method, the following happens:
    // - Each scope is checked to see if the state or method exists
    // - An error is thrown if the state or method is `undefined` in all scopes
    scopes: string[],

    // Here is where the magic happens
    props: {
        // The raw name of the prop (e.g. id, class, on-click)
        [name: string]: VProp
    },
}

export type VText = {
    node: Text,
    scope: string[],
    content: VProp,
}

export type VProp = {
    // The raw value of the prop
    value: string,
    // An array of functions that evaluates the prop
    effects: VoidFunction[],
}

export type Scope = {
    [prop: string]: any
}