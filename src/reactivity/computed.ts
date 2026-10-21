import { createError } from '../core/native';
import { effect } from './effect';
import { track, trigger } from './state';

export function computed<T>(getter: () => T) {
    let dirty = true;
    let computing = false;
    let cachedValue: T;
    const holder = {};
    const runner = effect(getter, {
        lazy: true,
        scheduler: () => {
            if (!dirty) {
                dirty = true;
                trigger(holder, 'value', 'set');
            }
        },
    });
    const dispose = () => {
        if (!runner.active) return;
        runner();
    };
    return {
        get value(): T {
            if (!runner.active) throw createError('Cannot read a disposed Brio computed value.');
            track(holder, 'value');
            if (dirty) {
                // A read during its own evaluation would otherwise return a stale value and mark it clean.
                if (computing) throw createError('Circular Brio computed dependency.');
                computing = true;
                try {
                    cachedValue = runner.run() as T;
                    dirty = false;
                } finally {
                    computing = false;
                }
            }
            return cachedValue;
        },
        dispose,
    };
}
