import { parts } from './catalog.js';
import { previewDocument } from '../playground/preview.js';

export function installParts() {
    const tabs = [...document.querySelectorAll('.part-view-tabs [role="tab"]')];
    function select(tab) {
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
        }
    }
    if (tabs.length) {
        document.querySelector('.part-view-tabs').hidden = false;
        const syncHash = () => select(location.hash === '#source' ? tabs[1] : tabs[0]);
        syncHash();
        addEventListener('hashchange', syncHash);
        document.querySelector('a[href="#source"]').addEventListener('click', () => select(tabs[1]));
        for (const [index, tab] of tabs.entries()) {
            tab.addEventListener('click', () => select(tab));
            tab.addEventListener('keydown', event => {
                let next;
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = (index + 1) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                if (next === undefined) return;
                event.preventDefault();
                select(tabs[next]);
                tabs[next].focus();
            });
        }
    }
    const previews = [];
    const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    for (const frame of document.querySelectorAll('iframe[data-part]')) {
        const part = parts.find(part => part.id === frame.dataset.part);
        if (!part) throw new Error(`Unknown Brio Part: ${frame.dataset.part}`);
        const token = crypto.randomUUID();
        frame.srcdoc = previewDocument(part.project, { token, origin: location.origin, theme: theme() });
        previews.push({ frame, token });
    }
    addEventListener('message', event => {
        const match = previews.find(({ frame, token }) => frame.contentWindow === event.source && token === event.data?.token);
        if (match && event.data.type === 'error' && typeof event.data.message === 'string') {
            const status = match.frame.parentElement.querySelector('[role="status"]');
            status.textContent = `Preview error: ${event.data.message.slice(0, 4000)}`;
        }
    });
    new MutationObserver(() => {
        for (const { frame, token } of previews)
            frame.contentWindow?.postMessage({ token, type: 'theme', theme: theme() }, '*');
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    for (const button of document.querySelectorAll('[data-copy-source]')) {
        let reset;
        const label = button.querySelector('[data-copy-label]');
        button.addEventListener('click', async () => {
            button.disabled = true;
            clearTimeout(reset);
            label.textContent = 'Copy';
            const code = button.dataset.copySource;
            const status = button.closest('.part-source').querySelector('[role="status"]');
            status.textContent = '';
            try {
                await navigator.clipboard.writeText(code);
                label.textContent = 'Copied!';
                reset = setTimeout(() => { label.textContent = 'Copy'; }, 2000);
            } catch (error) {
                status.textContent = `Unable to copy: ${error.message}. Select the source below and copy it manually.`;
            } finally {
                button.disabled = false;
            }
        });
    }
}
