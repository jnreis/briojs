import { isState, stateObjects, initPropFns } from '.';
import { accessedProps, trackProps } from './track';
import { arrayFrom, each, some, sort, sortPriority } from '../tools/array';
import { R, createContext, hasProp, newMap, newSet, sync } from '../tools/object';
import { isArray, isObject } from '../tools/typeCheck';
import { CREATE, DEFINE_PROPERTY, DELETE, DELETE_PROPERTY, PROPS, STATE, VALUE, UPDATE, NEW_VALUE, OLD_VALUE, OPERATION, TARGET } from '../tools/constants';

const proxiesByTarget = new WeakMap<object, any>();

/**
 * State wraps an object or array in a Proxy to track changes and notify listeners.
 */
export let state: State = ((target: any, parent?: any) => {
    if (!isArrayOrObject(target) || isState(target))
        return target;

    let existingProxy = proxiesByTarget.get(target);
    if (existingProxy && isState(existingProxy)) return existingProxy;
    if (existingProxy) proxiesByTarget.delete(target);

    let proxyTarget = isState(parent) ? createContext(parent, target) : target;
    let skip = newSet() as Set<string | number | symbol>;
    let stateObject: StateObject = {
        [TARGET]: target,
        [STATE]: newMap(),
        [PROPS]: Object.create(null),
        skip,
    };

    let notify = (prop: PropertyKey, oldValue: any, newValue: any, operation: 'create' | 'update' | 'delete') => {
        notifyListeners(stateObject, {
            [TARGET]: target,
            [STATE]: proxied,
            prop,
            [OLD_VALUE]: oldValue,
            [NEW_VALUE]: newValue,
            [OPERATION]: operation,
        } as ListenerFunctionContext);
    };

    let handler: ProxyHandler<any> = {
        get(currentTarget, prop, receiver) {
            if (trackProps && (hasProp(currentTarget, prop) || !(prop in currentTarget))) {
                if (!some(accessedProps, ([trackedState, trackedProp]) => trackedState === receiver && trackedProp === prop))
                    accessedProps.push([receiver, prop]);
            }
            return R.get(currentTarget, prop, receiver);
        },

        set(currentTarget, prop, incomingValue) {
            let hadOwn = hasProp(currentTarget, prop);
            let oldValue = R.get(currentTarget, prop, proxied);
            let oldLength = isArray(currentTarget) ? currentTarget.length : 0;
            let truncatedValues = isArray(currentTarget) && prop === 'length' && Number(incomingValue) < oldLength
                ? getTruncatedValues(currentTarget, Number(incomingValue))
                : [];

            if (oldValue === incomingValue && hadOwn)
                return true;

            if (initPropFns.has(incomingValue)) {
                initPropFns.delete(incomingValue);
                incomingValue = incomingValue({
                    [TARGET]: currentTarget,
                    [STATE]: proxied,
                    prop,
                    [OLD_VALUE]: oldValue,
                });
            }

            if (!hadOwn) {
                R.defineProperty(currentTarget, prop, {
                    value: undefined,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }

            let sameContainerType = (isArray(incomingValue) && isArray(oldValue)) ||
                (isObject(incomingValue) && isObject(oldValue));

            let newValue = incomingValue;
            if (sameContainerType) {
                sync(oldValue, incomingValue);
                newValue = oldValue;
            } else if (!skip.has(prop)) {
                newValue = state(incomingValue);
            }

            let result = R.set(currentTarget, prop, newValue, currentTarget);
            if (!result) return false;

            if (isArray(currentTarget) && prop === 'length') {
                let newLength = currentTarget.length;
                for (let [index, oldItem] of truncatedValues)
                    notify(index, oldItem, undefined, DELETE);
                if (oldLength !== newLength)
                    notify(prop, oldLength, newLength, UPDATE);
            } else {
                notify(prop, oldValue, newValue, hadOwn ? UPDATE : CREATE);
                if (isArray(currentTarget) && isArrayIndex(prop) && Number(prop) >= oldLength)
                    notify('length', oldLength, currentTarget.length, UPDATE);
            }

            return true;
        },

        [DELETE_PROPERTY](currentTarget, prop) {
            let hadOwn = hasProp(currentTarget, prop);
            let oldValue = R.get(currentTarget, prop, proxied);
            let result = R[DELETE_PROPERTY](currentTarget, prop);
            if (result && hadOwn)
                notify(prop, oldValue, undefined, DELETE);
            return result;
        },

        [DEFINE_PROPERTY](currentTarget, prop, descriptor) {
            let hadOwn = hasProp(currentTarget, prop);
            let oldValue = R.get(currentTarget, prop, proxied);
            let oldLength = isArray(currentTarget) ? currentTarget.length : 0;
            let truncatedValues = isArray(currentTarget) && prop === 'length' && Number(descriptor[VALUE]) < oldLength
                ? getTruncatedValues(currentTarget, Number(descriptor[VALUE]))
                : [];
            let nextDescriptor = {...descriptor};
            let newValue = nextDescriptor[VALUE];

            if (VALUE in nextDescriptor && initPropFns.has(newValue)) {
                initPropFns.delete(newValue);
                newValue = newValue({
                    [TARGET]: currentTarget,
                    [STATE]: proxied,
                    prop,
                    [OLD_VALUE]: oldValue,
                });
            }

            if (!skip.has(prop) && VALUE in nextDescriptor)
                newValue = state(newValue);
            if (VALUE in nextDescriptor)
                nextDescriptor[VALUE] = newValue;

            let result = R[DEFINE_PROPERTY](currentTarget, prop, nextDescriptor);
            if (result && isArray(currentTarget) && prop === 'length') {
                for (let [index, oldItem] of truncatedValues)
                    notify(index, oldItem, undefined, DELETE);
                if (oldLength !== currentTarget.length)
                    notify(prop, oldLength, currentTarget.length, UPDATE);
            } else if (result && (!hadOwn || oldValue !== R.get(currentTarget, prop, proxied))) {
                notify(prop, oldValue, R.get(currentTarget, prop, proxied), hadOwn ? UPDATE : CREATE);
                if (isArray(currentTarget) && isArrayIndex(prop) && Number(prop) >= oldLength)
                    notify('length', oldLength, currentTarget.length, UPDATE);
            }
            return result;
        },
    };

    const proxied = new Proxy(proxyTarget, handler);
    proxiesByTarget.set(target, proxied);
    stateObjects.set(proxied, stateObject);

    for (let prop in target) {
        if (!hasProp(target, prop)) continue;

        let descriptor = R.getOwnPropertyDescriptor(target, prop);
        if (!descriptor || !(VALUE in descriptor)) continue;

        let value = descriptor[VALUE];
        if (initPropFns.has(value)) {
            initPropFns.delete(value);
            value = value({
                [TARGET]: target,
                [STATE]: proxied,
                prop,
                [OLD_VALUE]: undefined,
            });
        }

        if (!skip.has(prop) && isArrayOrObject(value)) {
            let observedValue = state(value);
            if (descriptor.configurable || descriptor.writable) {
                R.defineProperty(proxyTarget, prop, {...descriptor, [VALUE]: observedValue});
            }
        } else if (value !== descriptor[VALUE]) {
            R.defineProperty(proxyTarget, prop, {...descriptor, [VALUE]: value});
        }
    }

    return proxied;
}) as State;

let isArrayOrObject = (value: any) => isArray(value) || isObject(value);

let isArrayIndex = (prop: PropertyKey) =>
    typeof prop === 'string' && prop !== '' && String(Number(prop)) === prop &&
    Number(prop) >= 0 && Number(prop) < 4294967295 && Number.isInteger(Number(prop));

let getTruncatedValues = (array: any[], newLength: number): [string, any][] => {
    if (!Number.isInteger(newLength) || newLength < 0) return [];
    return Object.getOwnPropertyNames(array)
        .filter(prop => isArrayIndex(prop) && Number(prop) >= newLength)
        .map(prop => [prop, array[Number(prop)]]);
};

let notifyListeners = (stateObject: StateObject, context: ListenerFunctionContext) => {
    let listeners = newMap() as ListenerFunctions;

    let propListeners = stateObject[PROPS][context.prop];
    if (propListeners)
        each(propListeners, (priority, fn) => listeners.set(fn, priority));

    each(stateObject[STATE], (priority, fn) => listeners.set(fn, priority));
    let orderedListeners = arrayFrom(listeners) as [ListenerFunction, number][];
    sort(orderedListeners, sortPriority);
    for (let [listener] of orderedListeners)
        listener(context);
}
