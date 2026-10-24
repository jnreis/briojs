import { createApp } from '@jnreis/briojs';

let nextId = 1;
const item = (name, packed = false) => ({ id: nextId++, name, packed });

const app = createApp({
  state: () => ({
    draft: '',
    items: [item('Hiking boots', true), item('Rain jacket'), item('Snacks')],
    get packed() { return this.items.filter(entry => entry.packed).length; },
    add() {
      if (!this.draft) return;
      this.items.push(item(this.draft));
      this.draft = '';
    },
    remove(entry) {
      this.items.splice(this.items.indexOf(entry), 1);
    },
  }),
});

// Brio owns only this element. Mount more widgets anywhere else on the page.
app.mount('#packing-list');
