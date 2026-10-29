function script(source, name) {
    const bytes = new TextEncoder().encode(`${source}\n//# sourceURL=${name}`);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return `<script src="data:text/javascript;base64,${btoa(binary)}"></script>`;
}

let brio;

// Brio is embedded as a data: script instead of loaded from this site. The
// sandboxed preview has an opaque origin, so errors thrown through a script from
// another origin reach it only as "Script error." without a message or stack.
export function loadBrio() {
    brio ??= fetch('/dist/brio.min.js').then(response => {
        if (!response.ok) throw new Error(`Brio could not be loaded (HTTP ${response.status})`);
        return response.text();
    }).then(source => source.replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '')).catch(error => {
        brio = undefined;
        throw error;
    });
    return brio;
}

// Runs inside the preview, so it must not reference anything outside itself.
function bridge(token, theme) {
    const send = (type, level, message) => parent.postMessage({ token, type, level, message }, '*');
    document.documentElement.style.colorScheme = theme;
    addEventListener('message', event => {
        if (event.source !== parent || event.data?.token !== token ||
            event.data.type !== 'theme' || !['light', 'dark'].includes(event.data.theme)) return;
        document.documentElement.dataset.theme = event.data.theme;
        document.documentElement.style.colorScheme = event.data.theme;
    });

    const limit = 50;
    const key = name => /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
    const describe = (value, depth = 0, seen = new WeakSet()) => {
        try {
            if (typeof value === 'string') return depth ? JSON.stringify(value) : value;
            if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`;
            if (typeof value === 'bigint') return `${value}n`;
            if (value === null || typeof value !== 'object') return Object.is(value, -0) ? '-0' : String(value);
            if (value instanceof Error) {
                const head = String(value);
                if (depth || !value.stack) return head;
                return value.stack.startsWith(head) ? value.stack : `${head}\n${value.stack}`;
            }
            if (value instanceof Element) {
                const classes = [...value.classList].map(name => `.${name}`).join('');
                return `<${value.localName}${value.id ? `#${value.id}` : ''}${classes}>`;
            }
            if (value instanceof Node) return value.nodeName;
            if (value instanceof Date) return Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
            if (value instanceof RegExp) return String(value);
            if (seen.has(value)) return '[Circular]';
            const items = (entries, format) => {
                const shown = entries.slice(0, limit).map(format);
                if (entries.length > limit) shown.push(`… ${entries.length - limit} more`);
                return shown.join(', ');
            };
            const inner = item => describe(item, depth + 1, seen);
            seen.add(value);
            try {
                if (Array.isArray(value))
                    return depth > 2 ? `Array(${value.length})` : `[${items(value, inner)}]`;
                if (value instanceof Map)
                    return depth > 2 ? `Map(${value.size})` : `Map(${value.size}) {${items([...value], ([k, v]) => `${inner(k)} => ${inner(v)}`)}}`;
                if (value instanceof Set)
                    return depth > 2 ? `Set(${value.size})` : `Set(${value.size}) {${items([...value], inner)}}`;
                const name = value.constructor?.name;
                const prefix = name && name !== 'Object' ? `${name} ` : '';
                if (depth > 2) return `${prefix}{…}`;
                const body = items(Object.keys(value), name => `${key(name)}: ${inner(value[name])}`);
                return `${prefix}{${body}}`;
            } finally {
                seen.delete(value);
            }
        } catch {
            return '[unreadable value]';
        }
    };
    const format = args => {
        if (typeof args[0] === 'string' && args.length > 1 && args[0].includes('%')) {
            const rest = args.slice(1);
            const head = args[0].replace(/%[sdifoOc%]/g, token => {
                if (token === '%%') return '%';
                if (!rest.length) return token;
                const value = rest.shift();
                if (token === '%c') return '';
                if (token === '%s') return describe(value);
                if (token === '%d' || token === '%i') return String(Number.parseInt(value, 10));
                if (token === '%f') return String(Number.parseFloat(value));
                return describe(value, 1);
            });
            args = [head, ...rest];
        }
        return args.map(value => describe(value)).join(' ').slice(0, 8000);
    };
    const report = (level, args) => {
        try {
            send('console', level, format(args));
        } catch {
            // Logging must never break the code being previewed.
        }
    };

    for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
        const original = console[level];
        console[level] = (...args) => {
            original.apply(console, args);
            report(level, args);
        };
    }
    const assert = console.assert;
    console.assert = (condition, ...args) => {
        assert.call(console, condition, ...args);
        if (!condition) report('error', ['Assertion failed:', ...(args.length ? args : ['console.assert'])]);
    };
    const clear = console.clear;
    console.clear = () => {
        clear.call(console);
        send('clear');
    };
    addEventListener('error', event => {
        if (event.target !== window) {
            const source = event.target?.src || event.target?.href || '';
            report('error', [`A preview resource failed to load: <${event.target?.localName || 'resource'}>${source ? ` ${source.slice(0, 120)}` : ''}`]);
            return;
        }
        report('error', event.error != null ? ['Uncaught', event.error] : [event.message || 'Uncaught error']);
    }, true);
    addEventListener('unhandledrejection', event => report('error', ['Uncaught (in promise)', event.reason]));
    addEventListener('DOMContentLoaded', () => send('ready'));
}

export function previewDocument(project, { token, theme, brio }) {
    // An opaque origin and a restrictive CSP isolate the preview from the website,
    // cookies, storage, form navigation, popups, and network APIs. It is not a CPU sandbox.
    const policy = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' data:; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`;
    return `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${policy}">
${script(`(${bridge})(${JSON.stringify(token)}, ${JSON.stringify(theme)});`, 'playground-console.js')}
${script(brio, 'brio.min.js')}
<style>:root { color-scheme: ${theme}; }</style>
<style>${project.css.replace(/<\/style/gi, '<\\/style')}</style>
</head><body>${project.html}
${script(project.js, 'playground.js')}
</body></html>`;
}
