import { createApp, type ComponentDefinition } from 'briojs';
import { computed, signal } from 'briojs/reactivity';
import { createRouter } from 'briojs/router';
import { persist } from 'briojs/persistence';
import { http, HttpError } from 'briojs/http';
import { validate } from 'briojs/forms';
import { createStepEngine } from 'briojs/step';
import { moneyMask } from 'briojs/money-mask';
import * as astro from 'briojs/astro';
import { devtoolsPanel } from 'briojs/devtools';

const count = signal(1);
const doubled: number = computed(() => count.value * 2).value;
const component: ComponentDefinition = { template: '<p>Hello</p>' };
const app = createApp({ state: () => ({ count: doubled }) });
app.component('hello-world', component);
const router = createRouter([{ path: '/', component: 'hello-world' }]);
const href: string = router.href('/');
void [persist, http, HttpError, validate, createStepEngine, moneyMask, astro, devtoolsPanel, href];
