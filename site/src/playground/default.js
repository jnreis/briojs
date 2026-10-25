import html from '../demos/creature.html?raw';
import js from '../demos/creature.js?raw';
import siteCss from '../styles/site.css?raw';

// Reuse the homepage's creature rules, not a second independently maintained demo.
const creatureCss = siteCss.slice(siteCss.indexOf('#creature-builder {'), siteCss.indexOf('.mixer-source {'));
if (!creatureCss.includes('.creature-controls'))
    throw new Error('The playground could not find the homepage creature styles.');

export const defaultProject = {
    version: 1,
    html: html.trim(),
    js: js.replace("import { createApp } from '@jnreis/briojs';", 'const { createApp } = brio;')
        .replace('export function createCreature', 'function createCreature').trim() +
        "\n\ncreateCreature().mount('#creature-builder');",
    css: `:root { color-scheme: light dark; --surface: #fff; --ink: #152139; --muted: #63738a; --line: #dce4ef; --blue: #2563eb; --soft: #eef5ff; }
:root[data-theme="dark"] { --surface: #111e32; --ink: #edf3ff; --muted: #a1b2cb; --line: #263751; --blue: #86b6ff; --soft: #132c50; }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px; font: 16px/1.65 system-ui, sans-serif; background: var(--surface); color: var(--ink); }
button { font: inherit; cursor: pointer; }
.button { padding: 10px 16px; border: 0; border-radius: 8px; background: #245fe2; color: white; }
${creatureCss}
@media (max-width: 760px) { #creature-builder { grid-template-columns: 1fr; } .creature-stage { min-height: 300px; } }
@media (prefers-reduced-motion: reduce) { .creature, .creature *, .creature-zzz { animation: none !important; transition: none !important; } }`.trim(),
};
