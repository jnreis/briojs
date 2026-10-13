export type SchedulerTask = () => void;

let scheduledQueue: SchedulerTask[] = [];
let isFlushing = false;

export function queueTask(task: SchedulerTask): void {
    scheduledQueue.push(task);
    if (!isFlushing) {
        isFlushing = true;
        queueMicrotask(flushQueue);
    }
}

function flushQueue(): void {
    try {
        const queue = scheduledQueue;
        scheduledQueue = [];
        for (let i = 0; i < queue.length; i++) {
            queue[i]();
        }
    } finally {
        isFlushing = false;
        if (scheduledQueue.length) {
            queueMicrotask(flushQueue);
        }
    }
}
