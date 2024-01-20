import { get, set, subPath, deepEqual } from './utils'

type error = 'allowEvent' | 'callback'
type eventName = 'beforeCreate' | 'created' | 'beforeRead' | 'read' | 'beforeUpdate' | 'updated' | 'beforeDelete' | 'deleted'
type listeners = {
    [path: string]: {
        [eventName: string]: Set<callback>
    }
}
type callback = (newData: any, oldData: any) => any

// All the errors
function errors(error: error, subString = '') {
    const errors = {
        'allowEvent': `The event "${subString}" is not allowed.`,
        'callback': 'The callback must be a function.',
    }
    return errors[error]
}

export function state(value: any) {
    let data = {value}

    let listeners: listeners = {}
    let events = {
        beforeCreate: true,
        created: true,
        beforeRead: true,
        read: true,
        beforeUpdate: true,
        updated: true,
        beforeDelete: true,
        deleted: true,
    }

    function allowEvent(event: eventName) {
        return (event in events && events[event] === true)
    }

    // Adds an event listener to a path
    function on(event: eventName, path: string, callback: callback) {
        // Check if the event is allowed
        if (!allowEvent(event)) {
            throw new Error(errors('allowEvent', event))
        }
        // Check if the callback is a function
        else if (typeof callback !== 'function') {
            throw new Error(errors('callback'))
        }
        // Check if the path already has events
        if (!listeners[path]) {
            listeners[path] = {}
        }
        // Check if the event already has listeners
        if (!listeners[path][event]) {
            listeners[path][event] = new Set()
        }
        // Add the listener to the path
        listeners[path][event].add(callback)
        // Return a clean up function
        return () => {
            listeners[path][event].delete(callback)
        }
    }

    // Notifies the listeners of an event on a path
    async function notify(event: eventName, path: string, newData: any = { value: undefined }) {
        // Check if the event is allowed
        if (!allowEvent(event)) {
            throw new Error(errors('allowEvent', event))
        }

        // Notify every listener that is listening to the path or nested paths
        // e.g. 'a.b' will notify 'a.b' and 'a.b.c'
        for (const p in listeners) {
            // Check if the path is a subpath of the listener
            const s = subPath(p, path)
            if (s === undefined) {
                continue
            }
            // Check if the event exists
            if (!listeners[p][event]) {
                continue
            }
            // Get the data of the path
            const cData = get(p, data)
            // Get the new data of the path
            const nData = get(s, newData)

            // Check if the data change is relevant to the event
            if (event == 'beforeUpdate') {
                // Skip event if data is the same
                if (deepEqual(cData, nData)) continue
            }
            else if (event == 'updated') {
                // Skip event if data is not the same
                // If this happens, it means that the data was changed by another event
                if (!deepEqual(cData, nData)) continue
            }
            else if (['beforeRead','read','created','beforeDelete'].includes(event)) {
                // Skip event if data is undefined
                if (cData === undefined) continue
            }
            else if (event == 'beforeCreate') {
                // Skip event if path already has data or new data will be undefined
                if (cData !== undefined || nData === undefined) continue
            }
            else if (event == 'deleted') {
                // Skip event if data is not undefined
                // If this happens, it means that the data was changed by another event
                if (cData !== undefined) continue
            }

            // Notify every listener of the event on the path
            for (const callback of listeners[p][event]) {
                await callback(nData, cData)
            }
        }
    }

    return {
        isState: true,
        on,
        get: async (path = '') => {
            await notify('beforeRead', path)
            const d = get(path, data)
            await notify('read', path)
            return d
        },
        set: async (path: string, newData: any) => {
            const nData = {value: newData}
            const noPath = get(path, data) === undefined
            await notify(noPath ? 'beforeCreate' : 'beforeUpdate', path, nData)
            set(path, data, newData)
            await notify(noPath ? 'created' : 'updated', path, nData)
        },
        delete: async (path = '') => {
            await notify('beforeDelete', path)
            set(path, data, undefined)
            await notify('deleted', path)
        },
    }
}