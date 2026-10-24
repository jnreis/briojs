import { state } from '@jnreis/briojs/reactivity';

// Shared, reactive data. Every page that reads it updates when it changes.
export const plants = state([
  { id: 'fern', name: 'Boston fern', emoji: '🌿', thirst: 3, watered: 0 },
  { id: 'cactus', name: 'Barrel cactus', emoji: '🌵', thirst: 1, watered: 0 },
  { id: 'monstera', name: 'Monstera', emoji: '🪴', thirst: 2, watered: 0 },
]);

export const findPlant = id => plants.find(plant => plant.id === id);
