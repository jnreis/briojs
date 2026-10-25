import { createApp } from '@jnreis/briojs';

let nextId = 1;
const item = (name: string, packed = false) => ({ id: nextId++, name, packed });
type Item = ReturnType<typeof item>;

const app = createApp({
  state: () => ({
    draft: '',
    items: [item('Hiking boots', true), item('Rain jacket'), item('Snacks')],
    get packed(): number { return this.items.filter(entry => entry.packed).length; },
    add() {
      if (!this.draft) return;
      this.items.push(item(this.draft));
      this.draft = '';
    },
    remove(entry: Item) {
      this.items.splice(this.items.indexOf(entry), 1);
    },
  }),
});

app.mount('#packing-list');
