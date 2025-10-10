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
    /** The directives to be hydrated */
    directives: Directive[],
    bnodes: Map<Node, BNode>,

    masks: MasksObject,
    maskTokens: MaskTokensObject,

    routes: RoutesObject,
    routeRules: RouteRulesObject,

    ctxArgs: string,
    exec: (bnode: BNode, exp: string, args?: string, returns?: boolean | "text") => FunctionType,
    evalEffect: (bnode: BNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => DirectiveCallback) => void,
    bnode: [NewBNode, GetBNode],
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
    $store: ObjectType,
    $state: State,
    $watch: Watch,
    $effect: Effect,
    $tools: BrioTools,
}

type BrioTools = {
    hasProp: (object: any, key: string) => boolean;
    getProp: (object: any, key: string, defaultValue?: any) => any;
    setProp: (object: any, key: string, descriptor?: PropertyDescriptorShorthand) => void;

    /** Performs a in-place deep sync between `target` and `source` values */
    sync: (target: any, source: any) => any;

    /** Creates a deep clone of the given value */
    clone: (value: any) => any;

    validate: (data: ObjectType) => {
        prop: (name: string, rules: SchemaRules) => void;
        rule: (name: string, fn: RuleFn, message?: MessageFn) => void;
        validate: () => boolean;
        errors: ObjectType;
    }
}

/** The global $set object */
type SetObject = {
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
}

type SetContext = (contextName: string, contextValue: any) => void;

/** The directive array: [directiveName, hydrationFunction] */
type Directive = [string | RegExp, HydrateDirective];

type SetDirective = (name: string | RegExp, hydrateDirective: HydrateDirective, evaluateDirective: EvaluateDirective) => number;

type GetCache = (key: string, type?: keyof CacheObject) => any;
type SetCache = (value: any, key?: string, type?: keyof CacheObject) => string;
type CacheExp = (bnode: BNode, exp: string, args?: string, returns?: boolean | "text") => string;
type EvalFn = (exp: string, args?: string, returns?: boolean | "text") => FunctionType;
type SetCtxArgs = (args: string) => string;

/** Sets the primary router */
type SetRouter = (route: FunctionType) => void;

/** The global $dom object */
type DomObject = {
    hydrate: (node: Node, ctxNode?: Node) => void,
    dehydrate: (node: Node, _removeNode?: boolean, _removeBNode?: boolean) => void,
    insert: (content: any, where: "outer" | "inner" | "text" | "before" | "first" | "last" | "after", target: HTMLElement | string, options?: InsertOptions) => Promise<any>,
    route: Route,
    emit: (target: HTMLElement | string, eventName: string, eventData?: any) => boolean,
    listen: (target: HTMLElement | string, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => () => void,
    query: (selector: string | Node, root?: Node) => Element | undefined,
    queryAll: (selector: string, root?: Node) => Element[],
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
type BNode = {
    /** The local context available to all expressions evaluated with this bnode. e.g. $el, $data, $props, $refs, $uid, etc. */
    ctx: Context,

    /** The parent bnode */
    parent: BNode | undefined,

    /** The element itself */
    el: HTMLElement,

    /** A comment node that serves as a placeholder for `b-if` when the condition is false */
    ph?: Comment,

    /** The actual nodes in the DOM */
    nodes?: Node[],

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
    skip: number,
} & DomObject & AppObject;

type NewBNode = (el: HTMLElement, ctxNode?: Node) => BNode;
type GetBNode = (node: Node) => BNode | undefined;

/** The local context of a bnode */
type LocalContext = {
    $el: HTMLElement,
    $uid: ObjectType,
    $props: ObjectType,
    $data: ObjectType,
    $refs: ObjectType,
    $slots: ObjectType,
    $each?: ObjectType,
    $cleanup: (fn: FunctionType) => void,
}

type LocalContextFns = {
    [contextName: string]: (bnode: BNode, parent?: BNode) => any,
}

type ContextFunction = (contextDestructured: Context) => (...args: any[]) => any;

type NewVnode = (el: HTMLElement, ctxNode?: Node) => BNode;
type GetVnode = (node: Node) => BNode | undefined;

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