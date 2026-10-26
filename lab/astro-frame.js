const section = document.querySelector('#astro-lab');
const frame = document.querySelector('#astro-frame');
const address = document.querySelector('#astro-frame-address');
const offline = document.querySelector('#astro-frame-offline');
const restart = document.querySelector('#astro-frame-restart');
const launch = document.querySelector('#astro-launch-link');

const home = new URL(location.href);
home.port = import.meta.env.VITE_LAB_ASTRO_PORT || '4323';
home.pathname = '/';
home.search = '';
home.hash = '';
const withLab = path => {
    const url = new URL(path, home.origin);
    url.searchParams.set('lab', location.origin);
    return url.href;
};
const show = path => {
    address.textContent = `${home.host}${path}`;
    launch.href = withLab(path);
};
show('/');

const sendTheme = () => {
    if (!frame.getAttribute('src')) return;
    frame.contentWindow?.postMessage(
        { type: 'brio-lab:theme', theme: document.documentElement.dataset.theme },
        home.origin,
    );
};

let retry;
const connect = async () => {
    clearTimeout(retry);
    section.dataset.state = 'connecting';
    try {
        await fetch(home.origin, { mode: 'no-cors', cache: 'no-store' });
    } catch {
        section.dataset.state = 'offline';
        offline.hidden = false;
        retry = setTimeout(connect, 2000);
        return;
    }
    offline.hidden = true;
    frame.hidden = false;
    frame.src = withLab('/');
    show('/');
};

const receive = event => {
    if (event.origin !== home.origin || event.source !== frame.contentWindow) return;
    const { type, path, height } = event.data ?? {};
    if (type !== 'brio-lab:frame') return;
    if (section.dataset.state !== 'live') {
        section.dataset.state = 'live';
        sendTheme();
    }
    if (typeof path === 'string' && path.startsWith('/')) show(path);
    if (Number.isFinite(height)) frame.style.height = `${Math.min(Math.max(height, 360), 6000)}px`;
};
const loaded = () => sendTheme();
const themes = new MutationObserver(sendTheme);

addEventListener('message', receive);
frame.addEventListener('load', loaded);
restart.addEventListener('click', connect);
themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
connect();

addEventListener('pagehide', event => {
    if (event.persisted) return;
    clearTimeout(retry);
    themes.disconnect();
    removeEventListener('message', receive);
    frame.removeEventListener('load', loaded);
    restart.removeEventListener('click', connect);
});
