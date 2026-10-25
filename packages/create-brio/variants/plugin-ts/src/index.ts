import { defineDirective, definePlugin } from '@jnreis/briojs';

export const copyText = (text: unknown) => navigator.clipboard.writeText(String(text));

export const copyDirective = defineDirective({
    name: 'b-copy',
    modifiers: [],
    description: 'Copy the value of an expression to the clipboard on click.',
    example: '<button b-copy="$data.link">Copy link</button>',
    mount(element, binding) {
        let timer: ReturnType<typeof setTimeout> | undefined;
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
        binding.onCleanup(() => clearTimeout(timer));
    },
});

export const copyPlugin = definePlugin({
    name: 'brio-plugin-copy',
    directives: [copyDirective],
    helpers: { $copy: copyText },
});

export default copyPlugin;
