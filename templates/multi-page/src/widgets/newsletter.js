import { createApp } from '@jnreis/briojs';

export const newsletter = () => createApp({
  state: () => ({
    email: '',
    sent: false,
    get valid() { return /^\S+@\S+\.\S+$/.test(this.email); },
    submit() {
      if (this.valid) this.sent = true; // Post to your server here.
    },
  }),
});
