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
    skip: Set<string|number>,
    onSet: {
        [prop: string|number]: Set<FunctionType>
    },
}

type SetFunction = (proxied: any, prop: string | number | symbol, stateObject: StateObject) => any;

type StateOptions = {
    parent?: any,
}

type State = {
    (target: any, options?: StateOptions): any,
    skip: (value: any) => any,
    persist: (value: any, alias?: string) => any,
    session: (value: any, alias?: string) => any,
};
type Watch = (proxied: any, prop: string | number | null, callback: ListenerFunction, priority?: number) => () => void;
type Effect = (listener: ListenerFunction, dependencies?: ListenerFunction, priority?: number) => () => any;

type Reactivity = {
    state: State,
    watch: Watch,
    effect: Effect,
}