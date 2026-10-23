import { createApp, onCleanup, resource } from '../../../../../dist/index.js';

export function createCounter(_root, props) {
    return createApp({
        state: () => ({ count: props.count ?? 0, pulses: 0 }),
        plugins: [app => {
            const stats = window.brioLifecycle;
            stats.mounted++;
            stats.live++;
            window.dispatchEvent(new Event('brio:diagnostics'));
            const pulse = () => { app.state.pulses++; stats.pulses++; };
            window.addEventListener('brio:pulse', pulse);
            onCleanup(() => {
                window.removeEventListener('brio:pulse', pulse);
                stats.disposed++;
                stats.live--;
                window.dispatchEvent(new Event('brio:diagnostics'));
            });
            resource(signal => new Promise((resolve, reject) => {
                const timer = setTimeout(() => resolve('loaded'), 60_000);
                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    stats.aborted++;
                    window.dispatchEvent(new Event('brio:diagnostics'));
                    reject(new DOMException('Navigation cancelled request', 'AbortError'));
                }, { once: true });
            }));
        }],
    });
}
