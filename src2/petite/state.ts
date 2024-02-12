export function reactive(initialData?: any) {
    return new Proxy(initialData, {
        get(target, key) {
            return Reflect.get(target, key)
        },
        set(target, key, value) {
            return Reflect.set(target, key, value)
        }
    })
}

export function stop() {
    // noop
}

export function effect(fn: () => void, options?: any) {
    fn()
}

export type ReactiveEffectRunner = ReturnType<typeof effect>