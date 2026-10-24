import { plants } from '../plants.js';

export const plantList = {
  template: `
    <h1>Your plants</h1>
    <ul class="cards">
      <li b-for="plant in $data.plants" b-key="$for.plant.id">
        <a class="card" b-bind-href="'/plants/' + $for.plant.id">
          <span class="emoji" b-text="$for.plant.emoji"></span>
          <strong b-text="$for.plant.name"></strong>
          <small b-text="$for.plant.watered ? 'Watered ×' + $for.plant.watered : 'Thirsty'"></small>
        </a>
      </li>
    </ul>
  `,
  setup() {
    return { plants };
  },
};
