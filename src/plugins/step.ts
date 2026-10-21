import {
    isObjectType, objectConstructor, isString, getLength, createTypeError, ownKeys, GET_OWN_PROPERTY_DESCRIPTOR,
    objectKeys,
    includesItem,
} from '../core/native';
import { signal } from '../reactivity/state';

export type StepDefinition = { readonly next?: string };
export type StepRecord = Readonly<Record<string, StepDefinition>>;
export type StepOptions = { readonly initial: string; readonly steps: StepRecord };

export type StepEngine = {
    readonly current: string;
    readonly canGoNext: boolean;
    readonly canGoBack: boolean;
    readonly isActive: (name: string) => boolean;
    readonly go: (name: string) => boolean;
    readonly next: () => boolean;
    readonly back: () => boolean;
    readonly reset: () => boolean;
};

function properties(value: unknown, label: string): Record<string, unknown> {
    if (!value || !isObjectType(value) ||
        !includesItem([objectConstructor.prototype, null], objectConstructor.getPrototypeOf(value)))
        throw createTypeError(`${label} must be a plain object.`);
    const result: Record<string, unknown> = objectConstructor.create(null);
    for (const key of ownKeys(value)) {
        const descriptor = objectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](value, key)!;
        if (!isString(key) || !('value' in descriptor))
            throw createTypeError(`${label} must contain string-keyed data properties.`);
        result[key] = descriptor.value;
    }
    return result;
}

const validName = (value: unknown): value is string => isString(value) && getLength(value.trim()) > 0;

export function createStepEngine(options: StepOptions): StepEngine {
    const config = properties(options, 'Step options');
    if (objectKeys(config).some(key => key !== 'initial' && key !== 'steps'))
        throw createTypeError('Step options support only initial and steps.');
    const definitions = properties(config.steps, 'Step definitions');
    const names = objectKeys(definitions);
    if (!getLength(names) || names.some(name => !validName(name)))
        throw createTypeError('Step definitions require nonempty step names.');
    const links = new Map<string, string | undefined>();
    for (const name of names) {
        const definition = properties(definitions[name], `Step "${name}"`);
        if (objectKeys(definition).some(key => key !== 'next'))
            throw createTypeError(`Step "${name}" supports only next.`);
        const next = definition.next;
        if (objectConstructor.prototype.hasOwnProperty.call(definition, 'next') && !validName(next))
            throw createTypeError(`Step "${name}" next must be a nonempty string.`);
        links.set(name, isString(next) ? next : undefined);
    }
    const initial = config.initial;
    if (!validName(initial) || !links.has(initial))
        throw createTypeError('Step initial must name a registered step.');
    for (const [name, next] of links) {
        if (next !== undefined && !links.has(next))
            throw createTypeError(`Step "${name}" has an unknown next step "${next}".`);
    }

    let current = initial;
    const history: string[] = [];
    const revision = signal(0);
    let version = 0;
    const notify = () => { revision.value = ++version; };
    const observe = () => { revision.value; };
    const go = (name: string): boolean => {
        if (!validName(name) || !links.has(name))
            throw createTypeError('Step go target must name a registered step.');
        if (name === current) return true;
        history.push(current);
        current = name;
        notify();
        return true;
    };
    return objectConstructor.freeze({
        get current() { observe(); return current; },
        get canGoNext() { observe(); return links.get(current) !== undefined; },
        get canGoBack() { observe(); return getLength(history) > 0; },
        isActive(name: string) { observe(); return current === name; },
        go,
        next() {
            const next = links.get(current);
            return next === undefined ? false : go(next);
        },
        back() {
            if (!getLength(history)) return false;
            current = history.pop()!;
            notify();
            return true;
        },
        reset() {
            if (current === initial && !getLength(history)) return false;
            current = initial;
            history.length = 0;
            notify();
            return true;
        },
    });
}
