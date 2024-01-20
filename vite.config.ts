import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
        entry: 'src/index.ts',
        name: 'frame',
        formats: ['es', 'umd', 'iife', 'cjs'],
        fileName: 'frame'
    },
  }
})