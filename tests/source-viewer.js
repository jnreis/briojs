(() => {
    const script = document.currentScript;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('source-viewer.css', script.src).href;
    document.head.append(stylesheet);

    const examples = [...document.querySelectorAll('.card, section, .nested')]
        .filter(element => element.matches('.card') || element.querySelector(':scope > h2, :scope > h3, :scope > h1'));
    const snapshots = examples.map(element => ({ element, source: element.outerHTML }));
    const contexts = [...document.querySelectorAll('body, main, [id]')]
        .filter(element => !examples.includes(element) && examples.some(example => element.contains(example)))
        .map(element => {
            const attributes = [...element.attributes].filter(attribute => attribute.name.startsWith('b-'));
            if (!attributes.length) return '';
            const clone = element.cloneNode(false);
            return clone.outerHTML;
        }).filter(Boolean);
    const styles = [...document.querySelectorAll('head style')].map(element => element.outerHTML);

    function format(source) {
        const lines = source.replace(/^\n|\s+$/g, '').split('\n');
        const indents = lines.slice(1).filter(line => line.trim()).map(line => /^\s*/.exec(line)[0].length);
        const indent = indents.length ? Math.min(...indents) : 0;
        return lines.map((line, index) => index ? line.slice(Math.min(indent, /^\s*/.exec(line)[0].length)) : line).join('\n');
    }

    function panel(title, source) {
        const details = document.createElement('details');
        details.className = 'example-source';
        details.setAttribute('b-ignore', '');
        const summary = document.createElement('summary');
        summary.textContent = title;
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = format(source);
        pre.append(code);
        details.append(summary, pre);
        return details;
    }

    // Capture every example before adding panels or running the page's bootstrap.
    snapshots.forEach(({ element, source }) => element.append(panel('Example HTML (before hydration)', source)));

    document.addEventListener('DOMContentLoaded', () => {
        const setup = document.createElement('aside');
        setup.className = 'example-source-setup';
        setup.setAttribute('b-ignore', '');
        const heading = document.createElement('h2');
        heading.textContent = 'Page setup';
        setup.append(heading);
        if (contexts.length) setup.append(panel('Root context HTML', contexts.join('\n\n')));
        const scripts = [...document.querySelectorAll('script')]
            .filter(element => element !== script && !element.hasAttribute('b-script') &&
                !element.closest('.card, section, .nested'))
            .map(element => element.outerHTML);
        if (scripts.length) setup.append(panel('JavaScript and script imports', scripts.join('\n\n')));
        if (styles.length) setup.append(panel('Page CSS', styles.join('\n\n')));
        document.body.append(setup);
    }, { once: true });
})();
