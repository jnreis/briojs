import { LibraryOptions, defineConfig } from 'vite';
import { name, viteBuild } from './package.json';

export default defineConfig({
  build: {
    // Disable default Vite build
    emptyOutDir: false,

    lib: {
        name,
        ...(viteBuild || {}) as LibraryOptions,
        fileName: (format) => (viteBuild as any).fileName || `${name}.${format}.js`,
    }
  }
})