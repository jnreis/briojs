/** The context passed to the listener function */
type ListenerFunctionContext = {
    operation: 'create'|'update'|'delete',
    state: any,
    prop: string,
    newValue: any,
    oldValue: any
}

type ListenerFunction = (context: ListenerFunctionContext) => any;

/** [ListenerFunction, PriorityNumber] */
type ListenerFunctions = Map<ListenerFunction, number>;

/** [ProxiedObject, PropertyName] */
type AccessedProp = [any, string|number|symbol];

type StateObject = {
    state: ListenerFunctions,
    props: {
        [prop: string|number]: ListenerFunctions
    },
}

type StateOptions = {
    parent?: any,
    skip?: string[]
}

type State = (target: any, options?: StateOptions) => any;
type Watch = (proxied: any, prop: string | number | null, callback: ListenerFunction, priority?: number) => () => void;
type Effect = (listener: ListenerFunction, dependencies?: ListenerFunction, priority?: number) => () => any;

type Reactivity = {
    state: State,
    watch: Watch,
    effect: Effect,
}