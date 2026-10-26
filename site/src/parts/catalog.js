import disclosureHtml from './recipes/disclosure.html?raw';
import disclosureJs from './recipes/disclosure.js?raw';
import tabsHtml from './recipes/tabs.html?raw';
import tabsJs from './recipes/tabs.js?raw';
import dialogHtml from './recipes/dialog.html?raw';
import dialogJs from './recipes/dialog.js?raw';
import menuHtml from './recipes/menu.html?raw';
import menuJs from './recipes/menu.js?raw';
import { examples } from './examples.js';

export const parts = [
    {
        id: 'disclosure', title: 'Disclosure & accordion', category: 'Show & hide', number: '01',
        description: 'A reusable native disclosure component with expand-all controls and a live count.',
        html: disclosureHtml, js: disclosureJs,
        keyboard: [
            'Tab to a summary; Enter or Space toggles its answer.',
            'Expand all and Collapse all keep focus on the button used.',
            'A polite status region reports the expanded count.',
        ],
        notes: [
            'Multiple answers may stay open, or all may be closed. Native details and summary provide the disclosure semantics.',
            'Use descriptive summary labels without nested interactive controls.',
        ],
        customize: 'Supply content.items as { id, label, body } objects. Set the button labels and use {expanded} and {total} once each in content.countLabel. Counts adapt to the current items.',
        slots: 'Default slot: repeated custom answer markup. Access each item through $slot.item; use b-if for item-specific layouts. Without supplied content, answers use their body text. Summaries stay descriptive text.',
    },
    {
        id: 'tabs', title: 'Tabs', category: 'Organize', number: '02',
        description: 'A horizontal tablist with automatic activation, roving focus, and linked panels.',
        html: tabsHtml, js: tabsJs,
        keyboard: [
            'Tab enters the selected tab; Left and Right wrap through tabs and activate their panels.',
            'Home selects the first tab; End selects the last. Tab moves to the active panel.',
            'Click a tab to activate its panel.',
        ],
        notes: [
            'Panels render locally, so automatic activation does not wait for a network request.',
            'Inactive panels stay mounted and hidden. Their bindings and effects remain active; switching tabs does not reset panel state.',
            'Horizontal, left-to-right only. Adapt keyboard handling and aria-orientation for vertical tabs or RTL layouts.',
        ],
        customize: 'Supply content.items as { id, label, heading, body } objects and content.label for the tablist name. Selection follows item IDs through reordering; the first item is shown when the selected ID is absent.',
        slots: 'panel: repeated custom panel markup with $slot.item. Use b-if for item-specific layouts. Without supplied content, panels use their heading and body text. Tab buttons and ARIA relationships stay component-owned.',
    },
    {
        id: 'dialog', title: 'Dialog', category: 'Focus & decide', number: '03',
        description: 'A controlled native modal with slots for custom content, forms, and actions.',
        html: dialogHtml, js: dialogJs,
        keyboard: [
            'The example trigger opens the dialog and the browser focuses its first input.',
            'Escape requests closing; the parent sets open to false. The browser manages modal focus and returns it to the opener.',
            'In this example, Enter or Save submits the parent-owned form. Cancel discards the draft.',
        ],
        notes: [
            'Requires HTMLDialogElement.showModal(), which makes the rest of its document inert.',
            'The parent owns opening, validation, saving, and closing. For async saves, close only after success and report failures.',
            'The preview modal covers only its iframe. Keyboard focus can leave the frame for the parent page.',
        ],
        customize: 'Bind open and title props. Use the default slot for custom content, title for heading markup, and footer for actions. Set close-label when using the default close button. Slotted forms and handlers use parent state; the example only updates an in-memory display name.',
        slots: 'Default: dialog body. title: heading contents. footer: custom actions (replaces the default close button). Keep a meaningful title and an explicit close control.',
    },
    {
        id: 'menu', title: 'Action menu', category: 'Take action', number: '04',
        description: 'A compact menu for commands, with arrow navigation, typeahead, dismissal, and focus restoration.',
        html: menuHtml, js: menuJs,
        keyboard: [
            'Enter, Space, or click toggles the menu. Down opens at the first item; Up opens at the last.',
            'Up and Down wrap between items. Home and End jump to the first and last. Typing a label prefix moves focus.',
            'Enter or Space activates an item. Escape closes and returns focus to the trigger.',
            'Tab and Shift+Tab close and continue through the page. Clicking or focusing outside closes without stealing focus.',
            'Back to heading focuses and scrolls to the component heading without navigating.',
        ],
        notes: [
            'Use for commands, not site navigation or form selection. The example only updates a status message.',
            'Enabled commands only: no disabled items, submenus, checkable items, or async action handling.',
            'The menu opens downward without collision detection. Adapt positioning near viewport edges.',
        ],
        customize: 'Supply content.items as { id, label } objects, plus trigger and status text. Handle commands by ID in the parent so translated labels do not change their identity. An empty list does not open.',
        slots: 'trigger: custom markup inside the existing trigger button. Include accessible text; do not nest buttons, links, or inputs. Command labels stay data-driven for keyboard typeahead.',
    },
].map(part => {
    const name = `brio-${part.id}`;
    const registration = `app.component('${name}', ${part.id}Component);`;
    const event = part.id === 'menu' ? ' b-on-action="$data.act($event.detail)"' : '';
    const usage = part.id === 'dialog' ? `<h2 b-text="$data.content.title"></h2>
<p b-text="$data.content.description"></p>
<button type="button" b-on-click="$data.edit()" b-text="$data.content.triggerLabel"></button>
<p role="status" b-text="$data.content.message"></p>
<brio-dialog b-prop-open="$data.open" b-prop-title="$data.content.dialogTitle"
  b-prop-close-label="$data.content.cancelLabel" b-on-request-close="$data.open = false">
  <form b-on-submit.prevent="$data.save()">
    <p b-text="$data.content.body"></p>
    <label><span b-text="$data.content.inputLabel"></span>
      <input type="text" b-bind-maxlength="$data.content.maxLength" b-model="$data.draft">
    </label>
    <div class="actions">
      <button type="button" b-on-click="$data.open = false" b-text="$data.content.cancelLabel"></button>
      <button type="submit" class="primary" b-text="$data.content.saveLabel"></button>
    </div>
  </form>
  <template slot="footer" b-template></template>
</brio-dialog>` : `<${name} b-prop-content="$data.content"${event}></${name}>`;
    const handler = part.id === 'dialog' ? `,
  open: false,
  draft: '',
  edit() {
    this.draft = this.content.value;
    this.open = true;
  },
  save() {
    this.content.value = this.draft.trim();
    this.content.message = this.content.value ? \`Hello, \${this.content.value}.\` : 'Display name cleared.';
    this.open = false;
  }` : part.id === 'menu' ? `,
  act({ label }) {
    this.content.message = \`\${label} selected. No data was changed.\`;
  }` : '';
    const data = `const exampleState = () => ({
  content: ${JSON.stringify(examples[part.id], null, 2).replaceAll('\n', '\n  ')}${handler}
});`;
    const bootstrap = `const app = brio.createApp({ state: exampleState });\n${registration}\napp.mount('#parts-demo');`;
    const slotUsage = part.id === 'dialog' ? null : part.id === 'menu'
        ? `<brio-menu b-prop-content="$data.content" b-on-action="$data.act($event.detail)">
  <span slot="trigger"><span aria-hidden="true">+</span> <span b-text="$data.content.triggerLabel"></span></span>
</brio-menu>`
        : `<${name} b-prop-content="$data.content">
  <div${part.id === 'tabs' ? ' slot="panel"' : ''}>
    <strong b-text="$slot.item.${part.id === 'tabs' ? 'heading' : 'label'}"></strong>
    <p b-if="$slot.item.id === '${part.id === 'tabs' ? 'pack' : 'build'}'" style="color: red;" b-text="$slot.item.body"></p>
    <p b-else b-text="$slot.item.body"></p>
    <!-- Add trusted custom markup or other components here. -->
  </div>
</${name}>`;
    const demoCss = part.id === 'dialog' ? `
@scope (#parts-demo) to (brio-dialog) {
  :scope { font: 15px/1.65 system-ui, sans-serif; color: light-dark(#152139, #edf3ff); }
  h2 { margin: 0 0 12px; font-size: 1.5rem; line-height: 1.3; letter-spacing: -.035em; }
  p { margin: 0 0 16px; }
  button { font: inherit; cursor: pointer; padding: 8px 14px; border: 1px solid light-dark(#d5e0ef, #344863); border-radius: 7px; background: light-dark(#245fe2, #9bc1ff); color: light-dark(#fff, #111e32); }
  button:focus-visible { outline: 3px solid light-dark(#245fe2, #9bc1ff); outline-offset: 3px; }
  [role="status"] { margin-top: 16px; }
}`.trim() : '';
    return {
        ...part, name, registration, usage, data, slotUsage, demoCss,
        project: {
            version: 1,
            html: `${part.html.trim()}\n\n<main id="parts-demo">\n  ${usage}\n</main>`,
            css: `body { margin: 0; padding: 24px; background: light-dark(#fff, #111e32); }${demoCss ? `\n\n${demoCss}` : ''}`,
            js: `${part.js.trim()}\n\n// Example content belongs to the parent app, not the component.\n${data}\n\n// Demo bootstrap only. Register on your existing app instead.\n${bootstrap}`,
        },
    };
});
