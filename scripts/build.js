// build.js
import fs, { rmdirSync } from 'fs';
import { build } from 'vite';
import dts from 'vite-plugin-dts';

// Delete dist folder
rmdirSync('dist', { recursive: true });

const packageJsonPath = process.cwd() + '/package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const name = packageJson.name;

let libs = [
    {
        entry: 'src/index.ts',
        name,
        formats: ['es']
    },
    {
        entry: `src/${name}.min.ts`,
        name: `${name}.min`,
        formats: ['iife']
    },
    {
        entry: `src/${name}.core.min.ts`,
        name: `${name}.core.min`,
        formats: ['iife']
    },
];

const queuePlugins = (dirPath, name = '') => {
    fs.readdirSync(dirPath).forEach(moduleName => {

        // Plugins end with .min.ts
        if (moduleName.endsWith('.min.ts')) {
            libs.push({
                entry: dirPath + moduleName,
                name: (name ? name + '.' : '') + moduleName.replace('.ts', ''),
                formats: ['iife']
            });
        }

        // Queue subdirectories recursively
        else if (fs.lstatSync(dirPath + moduleName).isDirectory()) {
            queuePlugins(dirPath + moduleName + '/', (name ? name + '.' : '') + moduleName);
        }
    });
}

queuePlugins('src/plugins/');


// Build with Vite
const buildWithVite = async (lib) => {
    await build({
        publicDir: false,
        // logLevel: 'info',
        build: {
            emptyOutDir: false,
            copyPublicDir: false,
            lib: {
                ...lib,
                fileName: () => lib.name + ".js",
            },
            minify: "esbuild",
            reportCompressedSize: false,
            // sourcemap: true,
        },
        plugins: [
          dts()
        ]
    });
}

for (const lib of libs) {
    try {
        // Build with Vite
        await buildWithVite(lib);
    }
    catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}