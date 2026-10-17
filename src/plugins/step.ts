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
    if (!value || typeof value !== 'object' ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
        throw new TypeError(`${label} must be a plain object.`);
    const result: Record<string, unknown> = Object.create(null);
    for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
        if (typeof key !== 'string' || !('value' in descriptor))
            throw new TypeError(`${label} must contain string-keyed data properties.`);
        result[key] = descriptor.value;
    }
    return result;
}

const validName = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function createStepEngine(options: StepOptions): StepEngine {
    const config = properties(options, 'Step options');
    if (Object.keys(config).some(key => key !== 'initial' && key !== 'steps'))
        throw new TypeError('Step options support only initial and steps.');
    const definitions = properties(config.steps, 'Step definitions');
    const names = Object.keys(definitions);
    if (!names.length || names.some(name => !validName(name)))
        throw new TypeError('Step definitions require nonempty step names.');
    const links = new Map<string, string | undefined>();
    for (const name of names) {
        const definition = properties(definitions[name], `Step "${name}"`);
        if (Object.keys(definition).some(key => key !== 'next'))
            throw new TypeError(`Step "${name}" supports only next.`);
        const next = definition.next;
        if (Object.prototype.hasOwnProperty.call(definition, 'next') && !validName(next))
            throw new TypeError(`Step "${name}" next must be a nonempty string.`);
        links.set(name, typeof next === 'string' ? next : undefined);
    }
    const initial = config.initial;
    if (!validName(initial) || !links.has(initial))
        throw new TypeError('Step initial must name a registered step.');
    for (const [name, next] of links) {
        if (next !== undefined && !links.has(next))
            throw new TypeError(`Step "${name}" has an unknown next step "${next}".`);
    }

    let current = initial;
    const history: string[] = [];
    const revision = signal(0);
    let version = 0;
    const notify = () => { revision.value = ++version; };
    const observe = () => { revision.value; };
    const go = (name: string): boolean => {
        if (!validName(name) || !links.has(name))
            throw new TypeError('Step go target must name a registered step.');
        if (name === current) return true;
        history.push(current);
        current = name;
        notify();
        return true;
    };
    return Object.freeze({
        get current() { observe(); return current; },
        get canGoNext() { observe(); return links.get(current) !== undefined; },
        get canGoBack() { observe(); return history.length > 0; },
        isActive(name: string) { observe(); return current === name; },
        go,
        next() {
            const next = links.get(current);
            return next === undefined ? false : go(next);
        },
        back() {
            if (!history.length) return false;
            current = history.pop()!;
            notify();
            return true;
        },
        reset() {
            if (current === initial && !history.length) return false;
            current = initial;
            history.length = 0;
            notify();
            return true;
        },
    });
}
