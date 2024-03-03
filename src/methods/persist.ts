import { state } from "../reactivity";
import { isObject } from "../tools/typeCheck";

export let persistState = state({});

export let initPersist = (storage = localStorage) => {
    let initialState = storage.getItem('$persist');
    if (initialState) {
        try {
            initialState = JSON.parse(initialState);
        } catch (e) {
            console.error('Error parsing persisted state.');
        }
    }
    if (isObject(initialState)) {
        persistState = state(initialState);
    }
};

export let $persist = (key: string, value?: any, storage = localStorage) => {
    let storedValue = storage.getItem(key);
    if (storedValue) {
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            return storedValue;
        }
    } else {
        storage.setItem(key, JSON.stringify(value));
        return value;
    }
}