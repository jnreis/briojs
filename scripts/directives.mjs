// The directive manifest: one machine-readable description of every Brio attribute.
// The build turns it into dist/directives.json and dist/html-custom-data.json;
// tests/directive-manifest.test.js keeps it in step with the runtime and the docs.

const docs = 'https://briojs.com/reference/';

const keyModifier = (name, key) => ({ name, description: `Run only when ${key} is pressed.` });
const systemModifier = name => ({ name, description: `Run only while ${name[0].toUpperCase() + name.slice(1)} is held.` });

const eventModifiers = [
    { name: 'prevent', description: 'Call `event.preventDefault()`.' },
    { name: 'stop', description: 'Call `event.stopPropagation()`.' },
    { name: 'self', description: 'Run only when the event targets this element itself.' },
    { name: 'outside', description: 'Run only for events outside this element (ignores the event that created it).' },
    { name: 'window', description: 'Listen on `window`.' },
    { name: 'document', description: 'Listen on `document`.' },
    { name: 'debounce', description: 'Wait until events pause for 150ms, then run once.' },
    { name: 'throttle', description: 'Run at most once every 150ms.' },
    { name: 'capture', description: 'Use a capturing listener.' },
    { name: 'passive', description: 'Use a passive listener (cannot call `preventDefault()`).' },
    { name: 'once', description: 'Remove the listener after the first event that passes the other filters.' },
    systemModifier('ctrl'),
    systemModifier('alt'),
    systemModifier('shift'),
    systemModifier('meta'),
    keyModifier('enter', 'Enter'),
    keyModifier('esc', 'Escape'),
    keyModifier('space', 'Space'),
    keyModifier('tab', 'Tab'),
    keyModifier('up', 'ArrowUp'),
    keyModifier('down', 'ArrowDown'),
    keyModifier('left', 'ArrowLeft'),
    keyModifier('right', 'ArrowRight'),
    keyModifier('delete', 'Delete or Backspace'),
];

const observerModifiers = [
    { name: 'once', description: 'Stop after the first delivered callback.' },
    { name: 'debounce', description: 'Debounce callbacks (configure the delay with `b-options`).' },
];

/**
 * @typedef {{ name: string, description: string }} Modifier
 * @typedef {{
 *   name: string,
 *   description: string,
 *   value: 'expression' | 'statement' | 'loop' | 'name' | 'pattern' | 'none',
 *   docs: string,
 *   example: string,
 *   modifiers?: Modifier[],
 *   suggestions?: { name: string, description: string }[],
 *   origin?: 'core' | 'component' | 'astro',
 * }} Directive
 */

/** @type {Directive[]} */
export const directives = [
    {
        name: 'b-data',
        description: 'Create a nested state scope from an object expression. Read it as `$data`.',
        value: 'expression',
        docs: 'first-app/',
        example: `<section b-data="{ open: false }">…</section>`,
    },
    {
        name: 'b-provide',
        description: 'Provide live named values to this element and its subtree through `$provided`.',
        value: 'expression',
        docs: 'subtree-provided-values/',
        example: `<section b-provide="{ theme: $data.theme }">…</section>`,
    },
    {
        name: 'b-id',
        description: 'Generate named unique values in `$id`; bind them to `id`, `for`, or ARIA attributes explicitly.',
        value: 'expression',
        docs: 'html-directives/',
        example: `<div b-id="['email']"><label b-bind-for="$id.email">Email</label><input b-bind-id="$id.email"></div>`,
    },
    {
        name: 'b-ref',
        description: 'Register this element under a literal name in the local, read-only `$ref` registry.',
        value: 'name',
        docs: 'html-directives/#local-dom-references-with-b-ref',
        example: `<input b-ref="search"> <button b-on-click="$ref.search.focus()">Search</button>`,
    },
    {
        name: 'b-text',
        description: 'Reactively set the element\'s text content. Safe for user-provided text.',
        value: 'expression',
        docs: 'html-directives/',
        example: `<span b-text="$data.name"></span>`,
    },
    {
        name: 'b-html',
        description: 'Insert markup without activating Brio. Does not sanitize: never pass untrusted HTML.',
        value: 'expression',
        docs: 'trusted-html-and-expression-security/',
        example: `<div b-html="$data.trustedMarkup"></div>`,
        modifiers: [{ name: 'hydrate', description: 'Activate Brio directives in templates marked with `trustedHTML()`.' }],
    },
    {
        name: 'b-bind-*',
        description: 'Reactively bind an attribute or DOM property, e.g. `b-bind-href="$data.url"`. `class` and `style` accept strings, arrays, or objects.',
        value: 'expression',
        docs: 'html-directives/#binding-attributes-classes-and-styles',
        example: `<a b-bind-href="$data.url" b-bind-class="{ active: $data.current }">Link</a>`,
        modifiers: [{ name: 'prop', description: 'Set the DOM property instead of the attribute.' }],
        suggestions: [
            { name: 'class', description: 'Classes from a string, array, or `{ name: condition }` object.' },
            { name: 'style', description: 'Styles from a string or `{ property: value }` object.' },
            { name: 'href', description: 'Link target.' },
            { name: 'src', description: 'Image or media source.' },
            { name: 'alt', description: 'Alternative text.' },
            { name: 'title', description: 'Advisory title.' },
            { name: 'id', description: 'Element id (pair with `$id` for unique ids).' },
            { name: 'for', description: 'Associated control id (pair with `$id`).' },
            { name: 'value', description: 'Control value.' },
            { name: 'checked', description: 'Checked state.' },
            { name: 'disabled', description: 'Disabled state; `false`, `null`, and `undefined` remove it.' },
            { name: 'hidden', description: 'Hide while truthy.' },
            { name: 'placeholder', description: 'Input placeholder.' },
            { name: 'aria-expanded', description: 'Expanded state for assistive technology.' },
            { name: 'aria-pressed', description: 'Pressed state for toggle buttons.' },
            { name: 'aria-label', description: 'Accessible name.' },
            { name: 'aria-describedby', description: 'Ids of describing elements.' },
            { name: 'aria-invalid', description: 'Validation state for assistive technology.' },
        ],
    },
    {
        name: 'b-on-*',
        description: 'Listen for a DOM event and run a statement. `$event` is the event, e.g. `b-on-submit.prevent="$data.save($event)"`.',
        value: 'statement',
        docs: 'html-directives/#event-modifiers',
        example: `<button b-on-click="$data.count++">Add</button>`,
        modifiers: eventModifiers,
        suggestions: [
            { name: 'click', description: 'A pointer click or keyboard activation.' },
            { name: 'input', description: 'A control\'s value changed while typing.' },
            { name: 'change', description: 'A control\'s value was committed.' },
            { name: 'submit', description: 'A form was submitted; usually paired with `.prevent`.' },
            { name: 'keydown', description: 'A key was pressed; combine with key modifiers like `.enter`.' },
            { name: 'keyup', description: 'A key was released.' },
            { name: 'focus', description: 'The element received focus.' },
            { name: 'blur', description: 'The element lost focus.' },
            { name: 'focusin', description: 'Focus moved into the element or a descendant.' },
            { name: 'focusout', description: 'Focus moved out of the element or a descendant.' },
            { name: 'pointerdown', description: 'A pointer was pressed.' },
            { name: 'pointerup', description: 'A pointer was released.' },
            { name: 'pointermove', description: 'A pointer moved; consider `.throttle`.' },
            { name: 'mouseenter', description: 'The mouse entered the element.' },
            { name: 'mouseleave', description: 'The mouse left the element.' },
            { name: 'scroll', description: 'The element or window scrolled; consider `.throttle` or `.passive`.' },
            { name: 'toggle', description: 'A `<details>` or popover opened or closed.' },
        ],
    },
    {
        name: 'b-model',
        description: 'Two-way bind a text-like input, textarea, checkbox, radio, or select to state.',
        value: 'expression',
        docs: 'html-directives/#two-way-input-with-b-model',
        example: `<input b-model="$data.name">`,
        modifiers: [
            { name: 'lazy', description: 'Update on `change` instead of every `input`.' },
            { name: 'trim', description: 'Trim whitespace from the written value.' },
            { name: 'number', description: 'Write `parseFloat(value)`, keeping nonnumeric text unchanged.' },
        ],
    },
    {
        name: 'b-if',
        description: 'Render this branch while the expression is truthy. Inactive branches are removed by default.',
        value: 'expression',
        docs: 'html-directives/#conditional-lifecycle',
        example: `<p b-if="$data.items.length === 0">Nothing yet.</p>`,
        modifiers: [
            { name: 'hide', description: 'Keep inactive branches in the DOM, hidden, preserving local state.' },
            { name: 'detach', description: 'Keep inactive branches alive outside the DOM, preserving local state.' },
        ],
    },
    {
        name: 'b-else-if',
        description: 'Render when every previous sibling branch is false and this expression is truthy.',
        value: 'expression',
        docs: 'html-directives/#conditional-lifecycle',
        example: `<p b-else-if="$data.loading">Loading…</p>`,
    },
    {
        name: 'b-else',
        description: 'Render when every previous sibling branch is false.',
        value: 'none',
        docs: 'html-directives/#conditional-lifecycle',
        example: `<p b-else>Done.</p>`,
    },
    {
        name: 'b-for',
        description: 'Repeat the element for an array, iterable, object, or integer. Read the item as `$for.<name>`.',
        value: 'loop',
        docs: 'html-directives/#lists-and-stable-keys',
        example: `<li b-for="todo in $data.todos" b-key="$for.todo.id" b-text="$for.todo.title"></li>`,
    },
    {
        name: 'b-key',
        description: 'Give a repeated item a stable string or number identity. Used with `b-for`.',
        value: 'expression',
        docs: 'html-directives/#lists-and-stable-keys',
        example: `<li b-for="todo in $data.todos" b-key="$for.todo.id"></li>`,
    },
    {
        name: 'b-template',
        description: 'Render this element\'s contents in place without a wrapper. Implied on a `<template>` that carries any `b-` directive.',
        value: 'none',
        docs: 'html-directives/#wrapperless-content-with-b-template',
        example: `<template b-if="$data.ready"><h2>Ready</h2><p>Go.</p></template>`,
    },
    {
        name: 'b-teleport',
        description: 'Move this element or template range next to an Element, ref, or selector. Default placement: `after`.',
        value: 'expression',
        docs: 'html-directives/#teleport-targets-and-placement',
        example: `<div b-teleport="['#modal-root', 'append']">Modal content</div>`,
    },
    {
        name: 'b-transition',
        description: 'Animate enter and leave with named CSS transition classes.',
        value: 'expression',
        docs: 'html-directives/#css-transitions',
        example: `<div b-if="$data.open" b-transition="'fade'">…</div>`,
    },
    {
        name: 'b-effect',
        description: 'Run a reactive expression for side effects; it reruns when what it reads changes.',
        value: 'statement',
        docs: 'html-directives/',
        example: `<div b-effect="document.title = $data.title"></div>`,
    },
    {
        name: 'b-script',
        description: 'Mark a `<script>` whose body is an unassigned arrow function. Brio calls it with `$context`; cleanup belongs to that piece of HTML.',
        value: 'none',
        docs: 'html-directives/#contextual-scripts',
        example: `<script b-script>\n  ($context) => { $context.$data.ready = true; }\n</script>`,
    },
    {
        name: 'b-mask',
        description: 'Format an input with a pattern string or a synchronous formatter function.',
        value: 'pattern',
        docs: 'html-directives/#input-masks',
        example: `<input b-model="$data.phone" b-mask="'(###) ###-####'">`,
    },
    {
        name: 'b-ignore',
        description: 'Skip hydration for this element and its descendants.',
        value: 'none',
        docs: 'html-directives/',
        example: `<div b-ignore><!-- managed by a third-party widget --></div>`,
    },
    {
        name: 'b-cloak',
        description: 'Removed when Brio hydrates the element. Pair with `[b-cloak] { display: none; }`.',
        value: 'none',
        docs: 'recommended-css/',
        example: `<main id="app" b-cloak>…</main>`,
    },
    {
        name: 'b-router-outlet',
        description: 'Render the component matching the current route.',
        value: 'none',
        docs: 'three-ways-to-use-brio/#single-page-app',
        example: `<main b-router-outlet></main>`,
    },
    {
        name: 'b-on-enter',
        description: 'Run when the element enters the viewport (or `root`). `$entry` is the intersection entry.',
        value: 'statement',
        docs: 'observer-options/#visibility-intersection-options',
        example: `<img b-on-enter.once="$data.load()">`,
        modifiers: observerModifiers,
    },
    {
        name: 'b-on-exit',
        description: 'Run when the element leaves the viewport (or `root`). `$entry` is the intersection entry.',
        value: 'statement',
        docs: 'observer-options/#visibility-intersection-options',
        example: `<video b-on-exit="$el.pause()"></video>`,
        modifiers: observerModifiers,
    },
    ...['addednodes', 'removednodes', 'attrs', 'text'].map(kind => ({
        name: `b-on-${kind}`,
        description: {
            addednodes: 'Run when child nodes are added. `$mutations` lists the records.',
            removednodes: 'Run when child nodes are removed. `$mutations` lists the records.',
            attrs: 'Run when attributes change. `$mutations` lists the records.',
            text: 'Run when text (character data) changes. `$mutations` lists the records.',
        }[kind],
        value: /** @type {const} */ ('statement'),
        docs: 'observer-options/#dom-changes-mutation-options',
        example: `<ul b-on-${kind}="console.log($mutations)"></ul>`,
        modifiers: [...observerModifiers, { name: 'subtree', description: 'Observe descendants too (the default unless `b-options` sets `subtree: false`).' }],
    })),
    {
        name: 'b-on-resize',
        description: 'Run when the element (or document with `.document`) changes size. Read `$size.width` and `$size.height`.',
        value: 'statement',
        docs: 'observer-options/#size-changes-resize-options',
        example: `<div b-on-resize="$data.wide = $size.width > 600"></div>`,
        modifiers: [...observerModifiers, { name: 'document', description: 'Observe the document element instead.' }],
    },
    {
        name: 'b-options',
        description: 'Configure observer directives on this element, keyed by attribute name, e.g. `{ \'b-on-enter\': { threshold: 0.5 } }`.',
        value: 'expression',
        docs: 'observer-options/#configure-an-observer',
        example: `<div b-options="{ 'b-on-enter': { rootMargin: '20px' } }" b-on-enter="$data.seen = true"></div>`,
    },
    {
        name: 'b-attr-*',
        description: 'On a component host: bind the host element itself instead of passing a prop.',
        value: 'expression',
        docs: 'components/#directives-on-component-hosts',
        example: `<kpi-card b-attr-class="{ rising: $data.up }"></kpi-card>`,
        origin: 'component',
        suggestions: [
            { name: 'class', description: 'Host classes.' },
            { name: 'style', description: 'Host styles.' },
            { name: 'id', description: 'Host id.' },
            { name: 'hidden', description: 'Hide the host while truthy.' },
        ],
    },
    {
        name: 'b-app',
        description: 'Astro adapter: mark an island root by its registered app name.',
        value: 'name',
        docs: 'app-and-lifecycle-api/#mark-the-island-roots',
        example: `<section b-app="counter">…</section>`,
        origin: 'astro',
    },
    {
        name: 'b-props',
        description: 'Astro adapter: a trusted expression evaluated once and passed to the island\'s app factory.',
        value: 'expression',
        docs: 'app-and-lifecycle-api/#island-metadata-and-props',
        example: `<section b-app="counter" b-props="{ initial: 5 }">…</section>`,
        origin: 'astro',
    },
];

export const docsUrl = directive => docs + directive.docs;

const valueHints = {
    expression: 'Value: a JavaScript expression.',
    statement: 'Value: a JavaScript statement.',
    loop: 'Value: `item in source` or `item, index in source`.',
    name: 'Value: a literal name.',
    pattern: 'Value: a pattern string expression (`#` digit, `a` letter, `*` any) or a formatter function.',
    none: 'No value needed.',
};

const markdown = (description, directive, extra = '') => [
    description + extra,
    valueHints[directive.value],
    directive.modifiers?.length
        ? `Modifiers: ${directive.modifiers.map(modifier => `\`.${modifier.name}\``).join(', ')}.`
        : '',
    '```html\n' + directive.example + '\n```',
].filter(Boolean).join('\n\n');

/** Build a VS Code HTML custom data file. Wildcards expand to their common names and single modifiers. */
export function customData() {
    const globalAttributes = [];
    const add = (name, directive, description, extra) => globalAttributes.push({
        name,
        description: { kind: 'markdown', value: markdown(description, directive, extra) },
        ...(directive.value === 'none' ? { valueSet: 'v' } : {}),
        references: [{ name: 'Brio docs', url: docsUrl(directive) }],
    });
    for (const directive of directives) {
        if (directive.name.endsWith('*')) {
            const prefix = directive.name.slice(0, -1);
            for (const suggestion of directive.suggestions ?? [])
                add(prefix + suggestion.name, directive, `${directive.description}\n\n**${suggestion.name}**: ${suggestion.description}`);
            continue;
        }
        add(directive.name, directive, directive.description);
        for (const modifier of directive.modifiers ?? [])
            add(`${directive.name}.${modifier.name}`, directive, directive.description, `\n\n**.${modifier.name}**: ${modifier.description}`);
    }
    // The most common event and modifier pairings.
    const on = directives.find(directive => directive.name === 'b-on-*');
    const modifier = name => on.modifiers.find(entry => entry.name === name);
    for (const [event, ...names] of [
        ['submit', 'prevent'], ['click', 'prevent'], ['click', 'stop'], ['click', 'outside'], ['click', 'self'],
        ['keydown', 'enter'], ['keydown', 'esc'], ['keydown', 'enter', 'prevent'], ['input', 'debounce'],
        ['keydown', 'esc', 'window'], ['scroll', 'throttle'], ['scroll', 'passive'],
    ]) add(`b-on-${event}.${names.join('.')}`, on, on.description,
        names.map(name => `\n\n**.${name}**: ${modifier(name).description}`).join(''));
    return { version: 1.1, globalAttributes };
}
