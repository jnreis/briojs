import { defineConfig, loadEnv } from 'vite';
import { name } from './package.json';

// @ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    build: {
      emptyOutDir: false,
      lib: {
        name,
        entry: env.VITE_BUILD_ENTRY || 'src/index.ts',
        formats: env.VITE_BUILD_FORMATS?.split(',') || ['es'],
        fileName:() => env.VITE_BUILD_FILE_NAME || name+'.js',
      }
    }
  };
});