import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Every HTML page is an entry. Add new pages here.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        pricing: resolve(import.meta.dirname, 'pricing.html'),
      },
    },
  },
});
