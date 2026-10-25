import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeProject, decodeProject, validateProject } from '../site/src/playground/share.js';
import { minifyProject, formatProject } from '../site/src/playground/code.js';
import { JSDOM } from 'jsdom';

test('playground links round-trip Unicode and arbitrary closing tags', async () => {
    const project = { version: 1, html: '<p>🌿 é 中文 </script></p>', css: 'p::after { content: "💧"; }', js: 'console.log("</script>");' };
    const fragment = await encodeProject(project);
    assert.match(fragment, /^#v1=[A-Za-z0-9_-]+$/);
    assert.deepEqual(await decodeProject(fragment), await minifyProject(project));
});

test('sharing compacts code without mangling names, folding expressions, or collapsing HTML text', async () => {
    const project = {
        version: 1,
        html: '<div   b-text = "$data.name" >  Hello <span> world </span> !</div><pre>  a\n b</pre>',
        css: 'p {\n  color: red;\n  --gap: 1px  2px;\n}',
        js: 'const name = "🌿";\n\nfunction greet() {\n  return name + " hello";\n}\nconsole.log(greet());',
    };
    const minified = await decodeProject(await encodeProject(project));
    assert.equal(minified.html, '<div b-text="$data.name">  Hello <span> world </span> !</div><pre>  a\n b</pre>');
    assert.equal(minified.css, 'p{color:red;--gap: 1px  2px}');
    assert.ok(minified.js.includes('function greet()'));
    assert.ok(JSON.stringify(minified).length < JSON.stringify(project).length);
    const formatted = await formatProject(minified);
    assert.match(formatted.css, /p \{\n  color: red;/);
    assert.match(formatted.js, /function greet\(\) \{\n  return name \+ " hello";\n\}/);
    assert.equal(new JSDOM(formatted.html).window.document.querySelector('pre').textContent, '  a\n b');
});

test('HTML compaction preserves unquoted self-closing values, raw content, and comments', async () => {
    const html = '<img   src=x /><script>const x = "  untouched  ";</script><!-- keep --> <style>p { color: red }</style>';
    const result = await minifyProject({ version: 1, html, css: '', js: '' });
    assert.equal(result.html, '<img src=x /><script>const x = "  untouched  ";</script><!-- keep --> <style>p { color: red }</style>');
});

test('invalid JavaScript cannot produce a success-shaped share and formatting errors are explicit', async () => {
    const project = { version: 1, html: '', css: '', js: 'const = ;' };
    await assert.rejects(() => encodeProject(project));
    await assert.rejects(() => formatProject(project));
});

test('playground links reject invalid formats, unsupported versions and malformed data', async () => {
    for (const fragment of ['', '#v2=abc', '#v1=', '#v1=!!!', '#v1=abc', '#v1=' + 'A'.repeat(65536)])
        await assert.rejects(() => decodeProject(fragment));
    for (const value of [null, [], {}, { version: 2, html: '', css: '', js: '' }, { version: 1, html: 1, css: '', js: '' }])
        assert.throws(() => validateProject(value), /invalid project format/);
});

test('playground links enforce decoded source limits including compressed oversized payloads', async () => {
    const project = { version: 1, html: 'x'.repeat(256 * 1024), css: '', js: '' };
    await assert.rejects(() => encodeProject(project), /256 KB/);
    const bytes = new Uint8Array(await new Response(new Blob([JSON.stringify(project)]).stream()
        .pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
    const fragment = '#v1=' + Buffer.from(bytes).toString('base64url');
    await assert.rejects(() => decodeProject(fragment), /size limit/);
});

test('playground links enforce the actual fragment limit, not just source size', async () => {
    const random = new Uint8Array(70000);
    crypto.getRandomValues(random.subarray(0, 65000));
    crypto.getRandomValues(random.subarray(65000));
    const source = Buffer.from(random).toString('base64');
    await assert.rejects(() => encodeProject({ version: 1, html: source, css: '', js: '' }), /64 KB fragment/);
});
