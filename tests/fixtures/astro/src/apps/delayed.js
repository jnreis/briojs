import { createCounter } from './counter.js';

export default function createDelayed(root, props) {
    window.lazyLifecycle.calls.push(root.id);
    return createCounter(root, props);
}
