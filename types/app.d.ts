/** The global context of an app */
type GlobalContext = {
    $set: SetObject,
    $dom: DomObject,
    $http: HttpObject,
    $stores: ObjectType,
    $plugins: ObjectType,
    $state: State,
    $watch: Watch,
    $effect: Effect,
}

/** The global $set object */
type SetObject = {
    hook: SetHook,
    route: SetRoute,
    routeRule: ObjectType,
    router: SetRouter,
    // method: SetContext,
    // store: SetContext,
    directive: SetDirective,
    script: SetContext,
    style: SetContext,
    tokens: MaskTokens,
    template: SetContext,
    props: SetContext,
    data: SetContext,
    mask: SetContext,
}

type SetContext = (contextName: string, contextValue: any) => void;

/** Add a directive to the list of directives */
type SetDirective = (directiveName: string | RegExp, hydrationFunction: HydrationFunction, afterDirective?: string) => void;

/** Sets the primary router */
type SetRouter = (route: FunctionType) => void;

/** The global $dom object */
type DomObject = {
    hydrate: (node: Node, ctxNode?: Node) => void,
    dehydrate: (node: Node, _removeNode?: boolean, _removeVNode?: boolean) => void,
    insert: (content: any, where: "outer" | "inner" | "text" | "before" | "first" | "last" | "after", target: HTMLElement | string, options?: InsertOptions) => Promise<any>,
    route: Route,
    emit: (target: HTMLElement | string, eventName: string, eventData?: any) => boolean,
    listen: (target: HTMLElement | string, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => () => void,
    query: (selector: string | Node, root?: Node) => Element | undefined,
    queryAll: (selector: string, root?: Node) => Element[],
    closest(target: HTMLElement | string, directiveName?: string): HTMLElement | undefined,
    context: (target: HTMLElement | string) => ObjectType | undefined,
}

/** Route rules object */
type RouteRulesObject = {
    [ruleName: string]: RouteRuleFunction;
}

/** Route rule function */
type RouteRuleFunction = (value: string) => boolean

/** The global $http object */
type HttpObject = {
    get: HttpMethod;
    post: HttpMethod;
    put: HttpMethod;
    patch: HttpMethod;
    delete: HttpMethod;
}

/** A HTTP method: get, post, put, patch, delete */
type HttpMethod = (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;

/** Virtual Node */
type VNode = {
    /** The local context available to all expressions evaluated with this vnode. e.g. $el, $data, $props, $refs, $uid, etc. */
    lc: LocalContext,

    /** The global context */
    gc: GlobalContext,

    /** The element itself */
    el: HTMLElement,

    /** UID context */
    uid: ObjectType,

    options: ObjectType,

    /** Hydrated attributes or directives */
    attr: {
        [attrName: string]: string,
    },

    /** Cleanup functions */
    cFns: FunctionType[],

    /** Skip the hydration process */
    skip?: boolean,
}

/** The local context of a vnode */
type LocalContext = {
    $el: HTMLElement,
    $refs: ObjectType,
    $uid: (uidName: string) => string,
    $props: ObjectType,
    $data: ObjectType,
    $each?: ObjectType,
    [contextName: string]: any,
}

/** The tools passed to the hydration function of a directive */
type HydrationTools = {
    newVNode: (el: HTMLElement, ctxNode?: Node) => VNode,
    getVNode: (node: Node) => VNode | undefined,
    eval: (vnode: VNode, exp: string, args?: string, isVoid?: boolean, cacheIt?: boolean) => [FunctionType, 0 | 1 | 2],
    evalEffect: (vnode: VNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => HookFunction) => void,
    // evalAttr: (vnode: VNode, ...attrNameParts: string[]) => FunctionType | undefined,
    // makeFn: (exp: string, args?: string, isVoid?: boolean) => string,

    templates: TemplateObject,
    scripts: ScriptObject,
    styles: StyleObject,
    tokens: MaskTokens,
    props: ContextObject,
    data: ContextObject,
    masks: ObjectType,
    hooks: [SetHook, PlayHook],
    transition: [PlayTransition, ReverseTransition],

} & GlobalContext;

/** The object that holds the saved templates */
type TemplateObject = {
    [templateName: string]: string
}

/** The object that holds the saved scripts */
type ScriptObject = {
    [scriptName: string]: FunctionType | string
}

/** The object that holds the saved styles */
type StyleObject = {
    [styleName: string]: string
}

/** The object that holds the saved context functions */
type ContextObject = {
    [contextName: string]: (localContext?: LocalContext, globalContext?: GlobalContext) => ObjectType
}