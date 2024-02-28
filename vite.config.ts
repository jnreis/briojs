import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
        entry: 'src/index.ts',
        name: 'briojs',
        formats: ['es', 'umd', 'iife', 'cjs'],
        fileName: 'briojs'
    },
  }
})