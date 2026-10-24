import { createApp } from '@jnreis/briojs';
import { createRouter } from '@jnreis/briojs/router';
import { plantList } from './pages/plant-list.js';
import { plantDetail } from './pages/plant-detail.js';
import { aboutPage, notFoundPage } from './pages/static.js';

const router = createRouter([
  { path: '/', component: 'plant-list' },
  { path: '/plants/:id', component: 'plant-detail' },
  { path: '/about', component: 'about-page' },
  { path: '*', component: 'not-found-page' },
]);

createApp({ router })
  .component('plant-list', plantList)
  .component('plant-detail', plantDetail)
  .component('about-page', aboutPage)
  .component('not-found-page', notFoundPage)
  .mount('#app');
