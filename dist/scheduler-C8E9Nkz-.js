import { g as getLength } from "./native-BneND9DN.js";
let scheduledQueue = [];
let isFlushing = false;
function queueTask(task) {
  scheduledQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(flushQueue);
  }
}
function flushQueue() {
  try {
    const queue = scheduledQueue;
    scheduledQueue = [];
    for (let i = 0; i < getLength(queue); i++) {
      queue[i]();
    }
  } finally {
    isFlushing = false;
    if (getLength(scheduledQueue)) {
      queueMicrotask(flushQueue);
    }
  }
}
export {
  queueTask as q
};
//# sourceMappingURL=scheduler-C8E9Nkz-.js.map
