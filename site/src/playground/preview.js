function script(source) {
    const bytes = new TextEncoder().encode(source);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return `<script src="data:text/javascript;base64,${btoa(binary)}"></script>`;
}

export function previewDocument(project, { token, origin, theme }) {
    const bridge = `
const send = (type, message) => parent.postMessage({ token: ${JSON.stringify(token)}, type, message }, '*');
document.documentElement.style.colorScheme = ${JSON.stringify(theme)};
addEventListener('message', event => {
  if (event.source !== parent || event.data?.token !== ${JSON.stringify(token)} ||
      event.data.type !== 'theme' || !['light', 'dark'].includes(event.data.theme)) return;
  document.documentElement.dataset.theme = event.data.theme;
  document.documentElement.style.colorScheme = event.data.theme;
});
addEventListener('error', event => send('error', event.message || 'A preview resource failed to load.'), true);
addEventListener('unhandledrejection', event => send('error', String(event.reason?.stack || event.reason)));
const originalError = console.error;
console.error = (...args) => { originalError(...args); send('error', args.map(String).join(' ')); };
addEventListener('DOMContentLoaded', () => send('ready', 'Preview running.'));
`;
    // An opaque origin and a restrictive CSP isolate the preview from the website,
    // cookies, storage, form navigation, popups, and network APIs. It is not a CPU sandbox.
    const policy = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' data: ${origin}/dist/; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`;
    return `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${policy}">
${script(bridge)}
<script src="${origin}/dist/brio.min.js"></script>
<style>:root { color-scheme: ${theme}; }</style>
<style>${project.css.replace(/<\/style/gi, '<\\/style')}</style>
</head><body>${project.html}
${script(project.js)}
</body></html>`;
}
