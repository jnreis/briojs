import { Stop } from '../../reactivity/types.js';
/** How a directive reads its attribute value; `text` passes the raw string and `none` rejects a value. */
export type DirectiveValue = 'expression' | 'statement' | 'text' | 'none';
export type DirectiveCleanup = (() => void) | void;
export type DirectiveBinding<V = any> = {
    /** The directive's registered name, such as `b-tooltip`. */
    readonly directive: string;
    /** The attribute as written, such as `b-tooltip-top.delay`. */
    readonly name: string;
    /** The part after the directive name for directives registered with `arg: true`. */
    readonly arg: string | undefined;
    readonly modifiers: Readonly<Record<string, boolean>>;
    /** The object from the matching `.options` attribute, such as `b-tooltip.options="{ delay: 300 }"`; `{}` without one. */
    readonly options: Readonly<Record<string, unknown>>;
    readonly expression: string;
    /** The element's expression context, including names added by `scope` hooks. */
    readonly context: Record<PropertyKey, any>;
    readonly app: unknown;
    /** Evaluates the attribute value (or returns it unchanged for `value: 'text'`); reactive inside `effect`. */
    value(): V;
    evaluate<R = any>(expression: string, locals?: Record<string, unknown>): R;
    /** Runs the attribute value as statements, with optional extra names such as `{ $event }`. */
    run(locals?: Record<string, unknown>): void;
    /** Assigns to the attribute value, for model-like directives: `b-thing="$data.field"`. */
    assign(value: unknown): void;
    effect(fn: () => void): Stop;
    on(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
    onCleanup(cleanup: () => void): void;
    /** Hydrates a node the directive put inside its element (use with `children: false`), in the element's context and current scope. */
    hydrate(node: Node): void;
};
export type DirectiveHook<R> = (element: Element, binding: DirectiveBinding) => R;
export type DirectiveDefinition = {
    /** `b-` followed by lowercase kebab-case, such as `b-tooltip`. */
    name: string;
    /** Also match `name-<arg>` attributes, such as `b-tooltip-top`. */
    arg?: boolean;
    /** Allowed modifiers. Omit to accept any; `[]` rejects all. */
    modifiers?: readonly string[];
    /** Keys allowed in a `.options` attribute. Omit to reject `.options`. */
    options?: readonly string[];
    value?: DirectiveValue;
    /** `false` means the directive owns the element's content: Brio does not hydrate its children. */
    children?: boolean;
    /** Editor and documentation metadata; not used at runtime. */
    description?: string;
    example?: string;
    /** Adds names for this element's other directives and its descendants. Runs after `b-data`, `b-id`, and `b-provide`. */
    scope?: DirectiveHook<Record<string, unknown> | void>;
    /** Runs with the element's other directives, before its children hydrate. */
    mount?: DirectiveHook<DirectiveCleanup>;
    /** Runs after the element's children hydrate. */
    ready?: DirectiveHook<DirectiveCleanup>;
};
export type DirectiveMatch = {
    definition: DirectiveDefinition;
    arg?: string;
};
type Entry = {
    definition: DirectiveDefinition;
    owner: string;
};
export type DirectiveRegistry = {
    exact: Map<string, Entry>;
    withArg: Entry[];
    scoped: boolean;
};
export declare const addonFor: (name: string) => string | undefined;
export declare function addonError(attrName: string, addon: string): Error;
export declare const reservedDirectives: string[];
export declare const reservedPrefixes: string[];
export declare const createRegistry: () => DirectiveRegistry;
export declare function registerDirective(registry: DirectiveRegistry, definition: DirectiveDefinition, owner: string): void;
export declare function findPluginDirective(registry: DirectiveRegistry | undefined, baseName: string): DirectiveMatch | undefined;
export type OptionSources = Map<string, {
    expression: string;
    used?: boolean;
}>;
/** Collects an element's `name.options` attributes by directive base name. */
export declare function collectOptions(element: Element): OptionSources;
/** Evaluates the `.options` object for a directive, checking it against the keys the directive accepts. */
export declare function readOptions(sources: OptionSources, baseName: string, allowed: readonly string[] | undefined, context: Record<PropertyKey, any>, element: Element): Record<string, unknown>;
/** Reports `.options` attributes that no directive read; `names` are the element's directive base names. */
export declare function checkOptionsUsed(sources: OptionSources, names: string[]): void;
export declare function createBinding(element: Element, attrName: string, expression: string, modifiers: Readonly<Record<string, boolean>>, options: OptionSources, match: DirectiveMatch, app: unknown, hydrate: (node: Node) => void): DirectiveBinding;
/** Runs one hook. Failures from plugin code are wrapped with the attribute and element; Brio errors pass through. */
export declare function runHook<R>(hook: DirectiveHook<R>, element: Element, binding: DirectiveBinding): R;
export declare function keepCleanup(result: unknown, binding: DirectiveBinding): void;
export {};
