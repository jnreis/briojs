declare module "briojs" {
    export let settings: ObjectType;
    export let setup: (brioWindow?: ObjectType) => void;
    export let newApp: () => AppObject;

    export let setAllDirectives: (app: AppObject) => void;
    export let ignoreDirective: Directive;
    export let eachDirective: Directive;
    export let propsDirective: Directive;
    export let dataDirective: Directive;
    export let uidDirective: Directive;
    export let htmlDirective: Directive;
    export let templateDirective: Directive;
    export let scriptDirective: Directive;
    export let styleDirective: Directive;
    export let teleportDirective: Directive;
    export let ifDirective: Directive;
    export let showDirective: Directive;
    export let transitionDirective: Directive;
    export let intersectionDirectives: [string, Directive][];
    export let resizeDirectives: [string, Directive][];
    export let onDirective: Directive;
    export let bindDirective: Directive;
    export let modelDirective: Directive;
    export let maskDirective: Directive;
    export let moneyMask: ($mask: MaskContext) => void
    export let setDefaultMaskTokens: (maskTokens: MaskTokensObject) => void;
}
