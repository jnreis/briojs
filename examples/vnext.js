const devtools = import.meta.env.DEV ? await import('@jnreis/briojs/devtools') : undefined;

import { createApp } from '@jnreis/briojs';
import { createRouter } from '@jnreis/briojs/router';
import { signal } from '@jnreis/briojs/reactivity';

const router = createRouter([
    { path: '/', component: 'home-page' },
    { path: '/about', component: 'about-page' },
]);

const app = createApp({
    state: () => ({
        count: 0,
        message: 'Hello, Brio!',
        visible: true,
        items: [{ id: 1, label: 'Direct DOM' }, { id: 2, label: 'Fine-grained updates' }],
    }),
    router,
});

app.component('click-counter', {
    template: `
      <button data-testid="component-count" b-on-click="$data.count.value++">
        <span b-text="$props.label"></span>:
        <span b-text="$data.count.value"></span>
      </button>
    `,
    setup() {
        return { count: signal(0) };
    },
});

app.component('home-page', { template: '<h3 data-testid="route">Home</h3>' });
app.component('about-page', { template: '<h3 data-testid="route">About</h3>' });

app.mount('#widget');
app.mount('#spa');

if (devtools) {
    const panel = document.createElement('details');
    panel.innerHTML = '<summary>Brio devtools</summary><div></div>';
    document.body.append(panel);
    devtools.devtoolsPanel(panel.querySelector('div'));
}
