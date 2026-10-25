import { createApp } from '@jnreis/briojs';

/** @type {import('@jnreis/briojs/astro').AstroAppFactory} */
const createPoll = () => createApp({
  state: () => ({
    options: [
      { label: 'Islands', votes: 0 },
      { label: 'Full SPA', votes: 0 },
      { label: 'No JavaScript', votes: 0 },
    ],
    get total() { return this.options.reduce((sum, option) => sum + option.votes, 0); },
    share(votes) { return this.total ? Math.round((votes / this.total) * 100) : 0; },
  }),
});

export default createPoll;
