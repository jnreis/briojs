import { start, api } from '.';

// Add the Brio API to the window object
(window as any).Brio = api;

// Hydrate elements with a valid `props` directive
start();