import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const bundleUrl = new URL('../../dist/brio.min.js', import.meta.url);
const bundle = readFileSync(bundleUrl, 'utf8');

/**
 * Loads tests/apps/<name>/index.html and its scripts like a browser would, and
 * fails the test on any uncaught error reported by the page.
 */
export function openApp(t, name, { before, hash = '' } = {}) {
    const directory = new URL(`./${name}/`, import.meta.url);
    const page = new URL('index.html', directory);
    const dom = new JSDOM(readFileSync(page, 'utf8'), {
        runScripts: 'outside-only',
        url: `https://apps.brio.test/${name}/${hash}`,
    });
    const { window } = dom;
    const { document } = window;
    const errors = [];
    window.addEventListener('error', event => errors.push(event.error ?? event.message));
    window.addEventListener('unhandledrejection', event => errors.push(event.reason));

    before?.(window);
    // Run the page's classic scripts in document order, as a browser would.
    for (const script of document.querySelectorAll('script[src]')) {
        const source = new URL(script.getAttribute('src'), directory);
        window.eval(source.href === bundleUrl.href ? bundle : readFileSync(source, 'utf8'));
    }

    t.after(() => {
        window.close();
        assert.deepEqual(errors.map(String), [], `${name} reported uncaught errors`);
    });

    const $ = id => document.querySelector(`[data-testid="${id}"]`);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const text = target => (typeof target === 'string' ? $(target) : target)?.textContent.replace(/\s+/g, ' ').trim();

    const user = {
        click(element) {
            assert.ok(element, 'click target exists');
            element.click();
        },
        type(element, value) {
            assert.ok(element, 'input exists');
            element.focus();
            element.value = value;
            element.dispatchEvent(new window.Event('input', { bubbles: true }));
        },
        select(element, value) {
            assert.ok(element, 'select exists');
            element.value = value;
            element.dispatchEvent(new window.Event('change', { bubbles: true }));
        },
        leave(element) {
            element.dispatchEvent(new window.FocusEvent('blur'));
            element.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true }));
        },
        dblclick(element) {
            assert.ok(element, 'double-click target exists');
            element.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, cancelable: true }));
        },
        key(key, { target = document.body, ...init } = {}) {
            const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
            target.dispatchEvent(event);
            return event;
        },
    };

    return { window, document, $, $$, text, user, errors };
}

/** Asserts that a page's scripts and stylesheets point at files that exist, so it also works when opened directly. */
export function assertStandaloneAssets(name) {
    const directory = new URL(`./${name}/`, import.meta.url);
    const { document } = new JSDOM(readFileSync(new URL('index.html', directory), 'utf8')).window;
    const assets = [
        ...[...document.querySelectorAll('script[src]')].map(script => script.getAttribute('src')),
        ...[...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.getAttribute('href')),
    ];
    assert.ok(assets.length >= 3, `${name} loads Brio, its app script, and styles`);
    for (const asset of assets) assert.ok(existsSync(new URL(asset, directory)), `${name}: ${asset} exists`);
}

export const settle = () => new Promise(resolve => setTimeout(resolve, 0));

export function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}
