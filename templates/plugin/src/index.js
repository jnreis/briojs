import { defineDirective, definePlugin } from '@jnreis/briojs';

/** Copies text to the clipboard. Also available in expressions as `$copy(text)`. */
export const copyText = text => navigator.clipboard.writeText(String(text));

/** `<button b-copy="$data.link">`: copies the value on click and sets `data-copied` for a moment. */
export const copyDirective = defineDirective({
    name: 'b-copy',
    modifiers: [],
    description: 'Copy the value of an expression to the clipboard on click.',
    example: '<button b-copy="$data.link">Copy link</button>',
    mount(element, binding) {
        let timer;
        binding.on(element, 'click', async () => {
            try {
                await copyText(binding.value());
                element.setAttribute('data-copied', '');
                clearTimeout(timer);
                timer = setTimeout(() => element.removeAttribute('data-copied'), 1500);
            } catch (error) {
                element.dispatchEvent(new CustomEvent('copy-error', { detail: error, bubbles: true }));
            }
        });
        // Runs when the element leaves the page (b-if, b-for, or unmount).
        binding.onCleanup(() => clearTimeout(timer));
    },
});

export const copyPlugin = definePlugin({
    name: 'brio-plugin-copy',
    directives: [copyDirective],
    helpers: { $copy: copyText },
});

export default copyPlugin;
