type AppsObject = {
    [appKey: string]: AppObject
}

type AppObject = {
    // ! CACHE
    // cache: CacheObject,

    template: {
        [templateName: string]: string
    },

    /** `(ctx: Context) => string` */
    style: {
        [styleName: string]: string
    },

    /** `(ctx: Context) => void` */
    script: {
        [scriptName: string]: (ctx: Context) => void
    },

    /** `(ctx: Context) => ObjectType` */
    props: {
        [propsName: string]: (ctx: Context) => ObjectType
    },

    /** `(ctx: Context) => ObjectType` */
    data: {
        [dataName: string]: (ctx: Context) => ObjectType
    },

    // ! HYDRATION
    /** How the local context should be set up for each element */
    lcFns: LocalContextFns,
    /** The directives to be hydrated */
    directives: Directive[],
    vnodes: Map<Node, VNode>,
    hooks: Hooks,

    masks: MasksObject,
    maskTokens: MaskTokensObject,

    routes: RoutesObject,
    routeRules: RouteRulesObject,

    ctxArgs: FunctionType,
    exec: (vnode: VNode, exp: string, args?: string, returns?: boolean | "text") => FunctionType,
    cacheExp: CacheExp,
    evalEffect: (vnode: VNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => HookFunction) => void,
    vnode: [NewVNode, GetVNode],
    hook: [SetHook, PlayHook],
    transition: [PlayTransition, ReverseTransition],
    // route: [SetRoute, Route],
    // insert: (content: any, where: "outer" | "inner" | "text" | "before" | "first" | "last" | "after", target: HTMLElement | string, options?: InsertOptions) => Promise<any>,

    // ! PUBLIC CONTEXT
    /** The public items available to all contexts */
    gc: GlobalContext,
}

type CacheObject = {
    [cacheKey: string]: FunctionType
}

type CacheAssetObject = {
    [assetName: string]: CacheKey
}

type CacheKey = string;

type Context = LocalContext & GlobalContext;

type CacheKey = string;

/** The global context of an app */
type GlobalContext = {
    $dom: DomObject,
    $http: HttpObject,
    $set: SetObject,
    // $tools: HydrationTools,
    $store: ObjectType,
    $state: State,
    $watch: Watch,
    $effect: Effect,
}

/** The global $set object */
type SetObject = {
    hook: SetHook,
    route: SetRoute,
    router: SetRouter,
    routeRule: SetAsset,
    template: SetAsset,
    script: SetAsset,
    style: SetAsset,
    props: SetAsset,
    data: SetAsset,
    mask: SetAsset,
    maskToken: SetAsset,
    animationEngine: (engine: AnimationEngine) => void,
}

type SetContext = (contextName: string, contextValue: any) => void;

/** The directive array: [directiveName, hydrationFunction] */
type Directive = [string | RegExp, HydrateDirective];

type SetDirective = (name: string | RegExp, hydrateDirective: HydrateDirective, evaluateDirective: EvaluateDirective) => number;

type GetCache = (key: string, type?: keyof CacheObject) => any;
type SetCache = (value: any, key?: string, type?: keyof CacheObject) => string;
type CacheExp = (exp: string, args?: string, returns?: boolean | "text") => string;
type EvalFn = (exp: string, args?: string, returns?: boolean | "text") => FunctionType;
type SetCtxArgs = (args: string) => string;

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
    ctx: Context,

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

    app: AppObject,
} & DomObject & AppObject;

type NewVNode = (el: HTMLElement, ctxNode?: Node) => VNode;
type GetVNode = (node: Node) => VNode | undefined;

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

type LocalContextFns = {
    [contextName: string]: (vnode: VNode, parent?: VNode) => any,
}

type ContextFunction = (contextDestructured: Context) => (...args: any[]) => any;

type NewVnode = (el: HTMLElement, ctxNode?: Node) => VNode;
type GetVnode = (node: Node) => VNode | undefined;

/** The tools passed to the hydration function of a directive */
type HydrationTools = {
    evalEffect: (vnode: VNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => HookFunction) => void,
    vnode: [NewVnode, GetVnode],
    hooks: [SetHook, PlayHook],
    transition: [PlayTransition, ReverseTransition],
};

/** The object that holds the saved templates */
type TemplateObject = {
    [templateName: string]: () => string
}

/** The object that holds the saved scripts */
type ScriptObject = {
    [scriptName: string]: FunctionType | string
}

/** The object that holds the saved styles */
type StyleObject = {
    [styleName: string]: () => string
}

type AssetType = 'template' | 'script' | 'style' | 'props' | 'data' | 'masks' | 'maskTokens' | 'routeRules';
type SetAsset = (assetName: string, assetValue: any) => void;
type GetAsset = (assetType: AssetType, assetName: string) => FunctionType;