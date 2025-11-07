type AppsObject = {
    [appKey: string]: AppObject
}

type AppObject = {
    template: {
        [templateName: string]: string
    },

    style: {
        [styleName: string]: string
    },

    script: {
        [scriptName: string]: (ctx: Context) => void
    },

    props: {
        [propsName: string]: (ctx: Context) => ObjectType | Promise<ObjectType>
    },

    data: {
        [dataName: string]: (ctx: Context) => ObjectType | Promise<ObjectType>
    },

    // ! HYDRATION
    /** The directives to be hydrated */
    directives: Directive[],
    bnodes: Map<Node, BNode>,

    masks: MasksObject,
    maskTokens: MaskTokensObject,

    routes: RoutesObject,
    routeRules: RouteRulesObject,

    exec: (bnode: BNode, exp: string, args?: string, returns?: boolean | "text") => FunctionType,
    // evalEffect: (bnode: BNode, exp: string, callback: DirectiveCallback) => void,
    bnode: [NewBNode, GetBNode],

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
    $http: HttpObject,
    $set: SetObject,
    $store: ObjectType,
    $state: State,
    $watch: Watch,
    $effect: Effect,
    $uid: (length?: number) => string,
} & DomObject & BrioTools;

type BrioTools = {
    $hasProp: (object: any, key: string) => boolean;
    $getProp: (object: any, key: string, defaultValue?: any) => any;
    $setProp: (object: any, key: string, descriptor?: PropertyDescriptorShorthand) => void;

    /** Performs a in-place deep sync between `target` and `source` values */
    $sync: (target: any, source: any) => any;

    /** Creates a deep clone of the given value */
    $clone: (value: any) => any;

    $validator: (data: ObjectType) => {
        prop: (name: string, rules: SchemaRules) => void;
        rule: (name: string, fn: RuleFn, message?: MessageFn) => void;
        validate: () => boolean;
        errors: ObjectType;
    }
}

/** The global $set object */
type SetObject = {
    route: SetRoute,
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

/** The global $dom object */
type DomObject = {
    $hydrate: (node: Node, ctxNode?: Node) => Promise<void>,
    $dehydrate: (node: Node, _removeNode?: boolean, _removeBNode?: boolean) => Promise<void>,
    $insert: (content: any, where: 'before'|'after'|'prepend'|'append'|'replaceWith'|'replaceChildren'|'text', target: HTMLElement | string, options?: InsertOptions) => Promise<any>,
    $route: Route,
    $emit: (target: HTMLElement | string, eventName: string, eventData?: any) => boolean,
    $listen: (target: HTMLElement | string, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => () => void,
    $context: (target: HTMLElement | string) => ObjectType | undefined,
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
    /** Local and global context */
    ctx: Context,

    /** The parent bnode */
    parent: BNode | undefined,

    /** The element itself */
    el: HTMLElement,

    /** A comment node that serves as a placeholder for `b-if` when the condition is false */
    ph?: Comment,

    /** The actual nodes in the DOM */
    nodes?: Node[],

    /** Unique ID context */
    id: ObjectType,

    options: ObjectType,

    /** Hydrated attributes or directives */
    attr: {
        [attrName: string]: string,
    },

    /** Cleanup functions */
    cFns: FunctionType[],

    /** Skip the hydration process */
    skip: number,
} & AppObject;

type NewBNode = (el: HTMLElement, ctxNode?: Node) => BNode;
type GetBNode = (node: Node) => BNode | undefined;

/** The local context of a bnode */
type LocalContext = {
    $el: HTMLElement,
    $id: ObjectType,
    $props: ObjectType,
    $data: ObjectType,
    $ref: ObjectType,
    $slot: ObjectType,
    $for?: ObjectType,
    $cleanup: (fn: FunctionType) => void,
};

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