let queue: any[] | null = null;
export const __batched = Symbol();

/**
 * Will perform batched computations instantly.
 */
export function batch() {
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

export function enqueue(task: any, _batch: true | number) {
    if (task[__batched]) {
        return;
    }
    // If the queue is empty, create a new one and schedule a batch
    if (queue === null) {
        queue = [];
        if (_batch === true) {
            queueMicrotask(batch);
        } else {
            setTimeout(batch, _batch);
        }
    }
    queue.push(task);
}
