/** The context passed to the listener function */
type ListenerFunctionContext = {
    operation: 'create'|'update'|'delete',
    state: any,
    target: any,
    prop: Prop,
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

    /** The original target object */
    target: any,

    /** The listeners to be called when a property in the state is set */
    state: ListenerFunctions,

    /** The listeners to be called when a property is set */
    props: {
        [prop: Prop]: ListenerFunctions
    },

    /** Skip specific keys/indexes from being automatically observed */
    skip: Set<Prop>,
    cleanup?: Set<FunctionType>,
}

type SetFunction = (proxied: any, prop: string | number | symbol, stateObject: StateObject) => any;

type StateOptions = {
    parent?: any,
    path?: string,
}

type State = {
    (target: any, parent?: any): any,
    skip: (value: any) => FunctionType,
};
type Watch = (proxied: any, prop: Prop | null, callback: ListenerFunction, priority?: number) => () => void;
type Effect = (listener: ListenerFunction, dependencies?: ListenerFunction, priority?: number) => () => any;
type Computed = (value: FunctionType) => FunctionType;
type InitStorage = (value: any, alias?: string | undefined) => any;

type Reactivity = {
    state: State,
    watch: Watch,
    effect: Effect,
}