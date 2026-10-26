(() => {
    if (window.parent === window) return;
    const root = document.documentElement;
    const sameHost = value => {
        try {
            const url = new URL(value);
            return url.hostname === location.hostname && url.protocol === location.protocol ? url.origin : null;
        } catch {
            return null;
        }
    };
    let labOrigin = sameHost(new URLSearchParams(location.search).get('lab'));
    try {
        if (labOrigin) sessionStorage.setItem('brio-lab-origin', labOrigin);
        else labOrigin = sameHost(sessionStorage.getItem('brio-lab-origin'));
    } catch (error) {
        console.warn('Unable to remember the Brio Lab origin.', error);
    }
    if (!labOrigin) return;

    const mark = () => { root.dataset.labEmbedded = ''; };
    mark();
    document.addEventListener('astro:after-swap', mark);

    let pending;
    const currentPath = () => {
        const params = new URLSearchParams(location.search);
        params.delete('lab');
        return location.pathname + (params.size ? `?${params}` : '');
    };
    // Timers, unlike animation frames, keep running while the frame is scrolled out of view.
    const report = () => {
        clearTimeout(pending);
        pending = setTimeout(() => window.parent.postMessage({
            type: 'brio-lab:frame',
            path: currentPath(),
            height: Math.ceil(root.getBoundingClientRect().height),
        }, labOrigin), 30);
    };
    new ResizeObserver(report).observe(root);
    document.addEventListener('DOMContentLoaded', report);
    document.addEventListener('astro:page-load', report);
    addEventListener('pageshow', report);

    addEventListener('message', event => {
        if (event.source !== window.parent || event.origin !== labOrigin) return;
        const theme = event.data?.type === 'brio-lab:theme' ? event.data.theme : null;
        if (theme !== 'light' && theme !== 'dark') return;
        try { localStorage.setItem('starlight-theme', theme); }
        catch (error) { console.warn('Unable to save color theme.', error); }
        root.dataset.theme = theme;
    });
})();
