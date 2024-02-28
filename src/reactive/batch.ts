import { isNull } from "../tools/typeCheck";

let queue: any[] | null = null;
export const __batched = Symbol();

/**
 * Will perform batched computations instantly.
 */
export const batch = () => {
    if (!queue) {
        return;
    }
    // Run all the tasks in the queue and reset the queue
    for (const task of queue) {
        task();
        task[__batched] = false;
    }
    queue = null;
}

export const enqueue = (task: any, _batch: true | number) => {
    if (task[__batched]) {
        return;
    }
    // If the queue is empty, create a new one and schedule a batch
    if (isNull(queue)) {
        queue = [];
        if (_batch === true) {
            queueMicrotask(batch);
        } else {
            setTimeout(batch, _batch);
        }
    }
    (queue as any[]).push(task);
}
