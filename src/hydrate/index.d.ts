export type ObjectType = {
    [prop: string]: any
}

export type RawObject = {
    [id: string]: RawElement | RawText
}

export type RawElement = {
    // [prop: string]: HTMLElement | ObjectType | string | SpecialPropsValue[] | undefined,
    id: string,
    
    // Magic attributes
    $el: HTMLElement, // the element itself
    $refs: ObjectType, // available to all elements in the same $props context. Except for nested contexts.
    $props: ObjectType, // context
    
    // Magic methods
    $emit: Function, // emit an event
    $uid: Function, // uses the id generated to the scope name

    // UIDs
    uids: ObjectType, // context

    // Raw attributes
    attrs: ObjectType,
}

export type SpecialProps = 'bind'|'on'|'model';
export type SpecialPropsValue = {
    attrName: string,
    attrValue: string,
}

export type RawText = {
    id: string,
    $el: Text,
    attrs: ObjectType,
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