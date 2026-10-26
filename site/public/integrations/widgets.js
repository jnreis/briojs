export function createWidgetManager(createApp) {
    const apps = new Map();
    const within = (scope, root) => scope === root || scope.contains(root);
    return {
        mountWithin(scope = document) {
            const roots = [...scope.querySelectorAll('[data-brio-counter]')];
            if (scope.matches?.('[data-brio-counter]')) roots.unshift(scope);
            for (const root of roots) {
                if (apps.has(root)) continue;
                const initial = root.getAttribute('data-start') ?? '0';
                const count = Number(initial);
                if (!initial.trim() || !Number.isSafeInteger(count))
                    throw new Error('Counter data-start must be a safe integer.');
                const app = createApp({ state: () => ({ count }) });
                try {
                    app.mount(root);
                } catch (error) {
                    app.dispose();
                    throw error;
                }
                apps.set(root, app);
            }
        },
        disposeWithin(scope = document) {
            for (const [root, app] of apps) {
                if (!within(scope, root)) continue;
                app.dispose();
                apps.delete(root);
            }
        },
    };
}
