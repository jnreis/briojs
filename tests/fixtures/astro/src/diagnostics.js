export function installDiagnostics() {
    const listeners = new AbortController();
    let frame;
    const render = () => {
        const readout = document.querySelector('#lifecycle-readout');
        if (!readout) return;
        readout.textContent = JSON.stringify({
            islands: window.brioLifecycle,
            lazy: window.lazyLifecycle,
        }, null, 2);
        const release = document.querySelector('#release-lazy');
        release.hidden = typeof window.releaseLazy !== 'function';
    };
    const restoreReturnLink = () => {
        const home = new URL(location.origin);
        home.port = '5173';
        const incoming = new URLSearchParams(location.search).get('lab');
        try {
            if (incoming) {
                const origin = new URL(incoming);
                if (origin.hostname === location.hostname && origin.protocol === location.protocol)
                    sessionStorage.setItem('brio-lab-origin', origin.origin);
            }
            const saved = sessionStorage.getItem('brio-lab-origin');
            if (saved) {
                const origin = new URL(saved);
                if (origin.hostname === location.hostname && origin.protocol === location.protocol)
                    home.href = origin.origin;
            }
        } catch (error) {
            console.warn('Unable to restore the Brio Lab return address.', error);
        }
        const link = document.querySelector('#lab-return');
        if (link) link.href = home.href;
    };
    const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
    };
    const click = event => {
        if (event.target.closest('#send-pulse')) {
            window.dispatchEvent(new Event('brio:pulse'));
            schedule();
        }
        if (event.target.closest('#release-lazy') && window.releaseLazy) {
            window.releaseLazy();
            schedule();
        }
    };
    document.addEventListener('click', click, { signal: listeners.signal });
    document.addEventListener('astro:page-load', () => {
        restoreReturnLink();
        schedule();
    }, { signal: listeners.signal });
    window.addEventListener('brio:diagnostics', schedule, { signal: listeners.signal });
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { signal: listeners.signal });
    window.addEventListener('pageshow', schedule, { signal: listeners.signal });
    restoreReturnLink();
    schedule();
    return () => {
        listeners.abort();
        cancelAnimationFrame(frame);
    };
}
