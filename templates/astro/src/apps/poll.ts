import { createApp } from '@jnreis/briojs';
import type { AstroAppFactory } from '@jnreis/briojs/astro';

// Loaded on demand by lazyApp() only when a poll island is on the page.
const createPoll: AstroAppFactory = () => createApp({
  state: () => ({
    options: [
      { label: 'Islands', votes: 0 },
      { label: 'Full SPA', votes: 0 },
      { label: 'No JavaScript', votes: 0 },
    ],
    get total() { return this.options.reduce((sum: number, option: { votes: number }) => sum + option.votes, 0); },
    share(votes: number) { return this.total ? Math.round((votes / this.total) * 100) : 0; },
  }),
});

export default createPoll;
