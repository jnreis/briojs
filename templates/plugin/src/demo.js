import { createApp } from '@jnreis/briojs';
import copyPlugin from './index.js';

createApp({
    plugins: [copyPlugin],
    state: () => ({ link: 'https://briojs.com' }),
}).mount('#demo');
