export type ObjectType = {
    [prop: string]: any
}

export type RawObject = {
    [id: string]: RawElement | RawText
}

export type RawElement = {
    // [prop: string]: HTMLElement | Text | string | string[] | undefined,
    id: string,
    node: HTMLElement,
    scopes: string[],
    // special attributes
    scope?: string,
    if?: string,
    show?: string,
    each?: string,
    ref?: string,
    html?: string,
    text?: string,
    model?: {
        prop: string, // two-way binding
        modifiers: string[],
    }[],
    bind?: {
        prop: string, // one-way binding
        modifiers: string[],
    }[],
    on?: {
        event: string, // event attributes
        modifiers: string[],
    }[],
}

export type RawElementProps = 'bind'|'on'|'model';

export type RawText = {
    id: string,
    node: Text,
    scopes: string[],
}

export type ScopeObject = {
    [id: string]: ObjectType
}

export type EffectObject = {
    [id: string]: {
        [prop: string]: any // (...argsList: any[]) => any
    }
}

export type ContextObject = {
    raw: RawObject,
    scope: ScopeObject,
    effect: EffectObject
}