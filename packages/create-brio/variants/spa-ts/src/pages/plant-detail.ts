import type { ComponentDefinition } from '@jnreis/briojs';
import { findPlant } from '../plants.js';

export const plantDetail: ComponentDefinition = {
  template: `
    <article b-if="$data.plant" class="detail">
      <span class="emoji big" b-text="$data.plant.emoji"></span>
      <h1 b-text="$data.plant.name"></h1>
      <p>Thirst: <span b-text="'💧'.repeat($data.plant.thirst)"></span></p>
      <button type="button" b-on-click="$data.plant.watered++">
        Water it (<span b-text="$data.plant.watered"></span>)
      </button>
      <p><a href="/">← All plants</a></p>
    </article>
    <p b-else>No plant called <code b-text="$route.params.id"></code>. <a href="/">Back to your plants</a>.</p>
  `,
  setup({ route }) {
    if (!route) throw new Error('The plant detail page needs a router.');
    return { get plant() { return findPlant(route.params.id); } };
  },
};
