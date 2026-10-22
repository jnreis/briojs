import { createApp, type ComponentDefinition } from '@jnreis/briojs';
import { computed, signal } from '@jnreis/briojs/reactivity';
import { createRouter } from '@jnreis/briojs/router';
import { persist } from '@jnreis/briojs/persistence';
import { http, HttpError } from '@jnreis/briojs/http';
import { validate } from '@jnreis/briojs/forms';
import { createStepEngine } from '@jnreis/briojs/step';
import { moneyMask } from '@jnreis/briojs/money-mask';
import * as astro from '@jnreis/briojs/astro';
import { devtoolsPanel } from '@jnreis/briojs/devtools';

const count = signal(1);
const doubled: number = computed(() => count.value * 2).value;
const component: ComponentDefinition = { template: '<p>Hello</p>' };
const app = createApp({ state: () => ({ count: doubled }) });
app.component('hello-world', component);
const router = createRouter([{ path: '/', component: 'hello-world' }]);
const href: string = router.href('/');
void [persist, http, HttpError, validate, createStepEngine, moneyMask, astro, devtoolsPanel, href];
