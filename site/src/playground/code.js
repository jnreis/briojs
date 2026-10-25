import { htmlLanguage } from '@codemirror/lang-html';
import parse from 'css-tree/parser';
import generate from 'css-tree/generator';
import { minify } from 'terser';
import { format } from 'prettier/standalone';
import * as htmlPlugin from 'prettier/plugins/html';
import * as cssPlugin from 'prettier/plugins/postcss';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

function minifyHtml(source) {
    const replacements = [];
    htmlLanguage.parser.parse(source).iterate({
        enter(node) {
            if (!['OpenTag', 'CloseTag', 'SelfClosingTag'].includes(node.name)) return;
            // Only compact tag syntax. Text, comments, raw scripts, and attribute values stay intact.
            const tokens = [];
            node.node.cursor().iterate(child => {
                if (!child.node.firstChild) tokens.push({ name: child.name, from: child.from, to: child.to });
            });
            for (let index = 1; index < tokens.length; index++) {
                const previous = tokens[index - 1];
                const next = tokens[index];
                const gap = source.slice(previous.to, next.from);
                if (!/^\s+$/.test(gap)) continue;
                const space = next.name === 'Is' || previous.name === 'Is' ||
                    (next.name === 'EndTag' && source[next.from] !== '/') ? '' : ' ';
                replacements.push({ from: previous.to, to: next.from, text: space });
            }
            return false;
        },
    });
    for (const change of replacements.reverse())
        source = source.slice(0, change.from) + change.text + source.slice(change.to);
    return source;
}

export async function minifyProject(project) {
    const js = await minify(project.js, {
        compress: false,
        mangle: false,
        format: { comments: /^!|@preserve|@license|@cc_on/i },
    });
    const css = generate(parse(project.css, {
        onParseError(error) { throw error; },
    }));
    return { version: 1, html: minifyHtml(project.html), css, js: js.code };
}

export async function formatProject(project) {
    const options = { tabWidth: 2, printWidth: 100, embeddedLanguageFormatting: 'off' };
    const [html, css, js] = await Promise.all([
        format(project.html, { ...options, parser: 'html', plugins: [htmlPlugin], htmlWhitespaceSensitivity: 'strict' }),
        format(project.css, { ...options, parser: 'css', plugins: [cssPlugin] }),
        format(project.js, { ...options, parser: 'babel', plugins: [babelPlugin, estreePlugin] }),
    ]);
    return { version: 1, html, css, js };
}
