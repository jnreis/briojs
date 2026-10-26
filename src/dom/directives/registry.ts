import {
    createError, createSyntaxError, createTypeError, startsWith, getLength, objectKeys, isFunction,
    isObjectType, isString, isBrioError, includesItem, isArray, arrayFrom, ATTRIBUTES,
} from '../../core/native';
import { assign, createExpressionScope, evaluate, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';
import { directiveError } from '../../core/errors';
import { effect } from '../../reactivity/effect';
import type { Stop } from '../../reactivity/types';
import { addEventListener, removeEventListener } from '../native';
import { getNodeOwner } from '../ownership';
import { extractModifiers } from './modifier';

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

export type DirectiveMatch = { definition: DirectiveDefinition; arg?: string };
type Entry = { definition: DirectiveDefinition; owner: string };
export type DirectiveRegistry = { exact: Map<string, Entry>; withArg: Entry[]; scoped: boolean };

// Official directives that ship in add-ons. Only the matching official plugin may register them, and core
// names the add-on to load when one is used without it.
const observerPattern = /^b-on-(?:enter|exit|resize|addednodes|removednodes|attrs|text)$/;
export const addonFor = (name: string): string | undefined =>
    name === 'b-mask' || name === 'b-form' ? 'inputs'
        : name === 'b-router-outlet' ? 'router'
            : observerPattern.test(name) ? 'observers' : undefined;

export function addonError(attrName: string, addon: string): Error {
    return createError(addon === 'router'
        ? 'b-router-outlet requires a router on the Brio app.'
        : `${attrName} needs the Brio ${addon} add-on. Load brio.${addon}.min.js after brio.min.js, or call app.use(${addon}Plugin) with ${addon}Plugin from @jnreis/briojs/${addon}.`);
}

const namePattern = /^b-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
// Checked against the directive manifest by tests/plugin-api.test.js.
export const reservedDirectives = (
    'b-data b-provide b-id b-text b-html b-model b-if b-else-if b-else b-for b-key b-template b-teleport ' +
    'b-transition b-effect b-script b-ignore b-cloak b-app b-app-props b-props b-slot'
).split(' ');
export const reservedPrefixes = ['b-on', 'b-bind', 'b-prop', 'b-attr', 'b-ref', 'b-router'];
const hooks = ['scope', 'mount', 'ready'] as const;

export const createRegistry = (): DirectiveRegistry => ({ exact: new Map(), withArg: [], scoped: false });

export function registerDirective(registry: DirectiveRegistry, definition: DirectiveDefinition, owner: string): void {
    if (!definition || !isObjectType(definition)) throw createTypeError('A directive definition must be an object.');
    const { name, arg } = definition;
    if (!isString(name) || !namePattern.test(name))
        throw createTypeError(`Directive name "${String(name)}" must be "b-" followed by lowercase kebab-case, such as "b-tooltip".`);
    const addon = addonFor(name);
    if (addon ? owner !== `plugin "brio-${addon}"`
        : includesItem(reservedDirectives, name) || reservedPrefixes.some(stem => name === stem || startsWith(name, stem + '-')) ||
            (arg && reservedDirectives.some(reserved => startsWith(reserved, name + '-'))))
        throw createTypeError(`"${name}" is reserved by ${addon ? `the official Brio ${addon} add-on` : 'a built-in Brio directive'}; choose another name.`);
    if (definition.modifiers && includesItem(definition.modifiers, 'options'))
        throw createTypeError(`Directive "${name}" cannot declare an "options" modifier; .options is reserved for configuration.`);
    if (!hooks.some(hook => isFunction(definition[hook])))
        throw createTypeError(`Directive "${name}" needs a scope, mount, or ready function.`);
    for (const other of [...registry.exact.values(), ...registry.withArg]) {
        const otherName = other.definition.name;
        if (otherName === name || (other.definition.arg && startsWith(name, otherName + '-')) ||
            (arg && startsWith(otherName, name + '-')))
            throw createError(`Directive "${name}" from ${owner} conflicts with "${otherName}" from ${other.owner}.`);
    }
    const entry = { definition, owner };
    if (arg) registry.withArg.push(entry);
    else registry.exact.set(name, entry);
    if (definition.scope) registry.scoped = true;
}

export function findPluginDirective(registry: DirectiveRegistry | undefined, baseName: string): DirectiveMatch | undefined {
    if (!registry) return;
    const entry = registry.exact.get(baseName);
    if (entry) return { definition: entry.definition };
    for (const { definition } of registry.withArg) {
        if (baseName === definition.name) return { definition };
        if (startsWith(baseName, definition.name + '-'))
            return { definition, arg: baseName.slice(getLength(definition.name) + 1) };
    }
}

export type OptionSources = Map<string, { expression: string; used?: boolean }>;

/** Collects an element's `name.options` attributes by directive base name. */
export function collectOptions(element: Element): OptionSources {
    const sources: OptionSources = new Map();
    for (const { name, value } of arrayFrom(element[ATTRIBUTES])) {
        const { baseName, modifiers } = extractModifiers(name);
        if (!modifiers.options) continue;
        if (getLength(objectKeys(modifiers)) > 1)
            throw createSyntaxError(`${name}: .options cannot be combined with other modifiers.`);
        sources.set(baseName, { expression: value });
    }
    return sources;
}

/** Evaluates the `.options` object for a directive, checking it against the keys the directive accepts. */
export function readOptions(
    sources: OptionSources,
    baseName: string,
    allowed: readonly string[] | undefined,
    context: Record<PropertyKey, any>,
    element: Element,
): Record<string, unknown> {
    const source = sources.get(baseName);
    if (!source) return {};
    if (!allowed) throw createSyntaxError(`${baseName} does not take options.`);
    source.used = true;
    const label = baseName + '.options';
    const value: unknown = evaluate(source.expression, context, label, element);
    if (!value || !isObjectType(value) || isArray(value))
        throw createTypeError(`${label} must evaluate to an object.`);
    for (const key of objectKeys(value))
        if (!includesItem(allowed, key))
            throw createTypeError(`${label} has an unknown option "${key}". Supported: ${allowed.join(', ')}.`);
    return value as Record<string, unknown>;
}

/** Reports `.options` attributes that no directive read; `names` are the element's directive base names. */
export function checkOptionsUsed(sources: OptionSources, names: string[]): void {
    for (const [baseName, { used }] of sources)
        if (!used) throw createSyntaxError(includesItem(names, baseName)
            ? `${baseName} does not take options.`
            : `${baseName}.options needs a ${baseName} attribute on the same element.`);
}

export function createBinding(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Readonly<Record<string, boolean>>,
    options: OptionSources,
    match: DirectiveMatch,
    app: unknown,
    hydrate: (node: Node) => void,
): DirectiveBinding {
    const { definition } = match;
    for (const modifier of objectKeys(modifiers))
        if (definition.modifiers && !includesItem(definition.modifiers, modifier))
            throw createSyntaxError(getLength(definition.modifiers)
                ? `${attrName} does not support the "${modifier}" modifier. Supported: ${definition.modifiers.join(', ')}.`
                : `${definition.name} does not support modifiers.`);
    if (definition.value === 'none' && expression.trim())
        throw createSyntaxError(`${definition.name} does not take a value.`);
    const scope = (locals?: Record<string, unknown>) =>
        locals ? createExpressionScope(locals, binding.context) : binding.context;
    const binding: DirectiveBinding = {
        directive: definition.name,
        name: attrName,
        arg: match.arg,
        modifiers,
        options: {},
        expression,
        get context() {
            return getNodeOwner(element)!.context!;
        },
        app,
        hydrate,
        value: () => definition.value === 'text' ? expression : evaluate(expression, binding.context, attrName, element),
        evaluate: (source, locals) => evaluate(source, scope(locals), attrName, element),
        run: locals => execute(expression, scope(locals), undefined, attrName, element),
        assign: next => assign(expression, binding.context, next, attrName, element),
        effect: fn => effect(fn),
        on(target, type, listener, options) {
            addEventListener(target, type, listener, options);
            onCleanup(() => removeEventListener(target, type, listener, options));
        },
        onCleanup(cleanup) {
            onCleanup(cleanup);
        },
    };
    (binding as { options: Record<string, unknown> }).options =
        readOptions(options, attrName.split('.')[0], definition.options, binding.context, element);
    return binding;
}

/** Runs one hook. Failures from plugin code are wrapped with the attribute and element; Brio errors pass through. */
export function runHook<R>(hook: DirectiveHook<R>, element: Element, binding: DirectiveBinding): R {
    try {
        return hook(element, binding);
    } catch (error) {
        throw isBrioError(error) ? error : directiveError('Brio directive failed', error, binding.name, element);
    }
}

export function keepCleanup(result: unknown, binding: DirectiveBinding): void {
    if (isFunction(result)) onCleanup(result as () => void);
    else if (result !== undefined)
        throw createTypeError(`${binding.name} mount and ready hooks may only return a cleanup function.`);
}
