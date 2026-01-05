/** The context passed to the listener function */
type ListenerFunctionContext = {
    operation: 'create'|'update'|'delete',
    state: any,
    target: any,
    prop: string,
    newValue: any,
    oldValue: any
}

type ListenerFunction = (context: ListenerFunctionContext) => any;

/** [ListenerFunction, PriorityNumber] */
type ListenerFunctions = Map<ListenerFunction, number>;

type Prop = string | number | symbol;

/** [ProxiedObject, PropertyName] */
type AccessedProp = [any, Prop];

/** [ProxiedObject, PropertyName] */
type PropertyReference = [any, Prop];

type StateObject = {

    /** The listeners to be called when a property in the state is set */
    state: ListenerFunctions,

    /** The listeners to be called when a property is set */
    props: {
        [prop: Prop]: ListenerFunctions
    },

    /** Skip specific keys/indexes from being automatically observed */
    skip: Set<Prop>,
}

type SetFunction = (proxied: any, prop: string | number | symbol, stateObject: StateObject) => any;

type StateOptions = {
    parent?: any,
    path?: string,
}

type State = {
    (target: any, parent?: any): any,
    skip: (value: any) => any,
    persist: (value: any, alias?: string) => any,
    session: (value: any, alias?: string) => any,
};
type Watch = (proxied: any, prop: string | number | null, callback: ListenerFunction, priority?: number) => () => void;
type Effect = (listener: ListenerFunction, dependencies?: ListenerFunction, priority?: number) => () => any;
type Computed = (value: FunctionType) => FunctionType;
type InitStorage = (value: any, alias?: string | undefined) => any;

type Reactivity = {
    state: State,
    watch: Watch,
    effect: Effect,
}