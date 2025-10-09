// build.js
import { rmdirSync, readFileSync, readdirSync, lstatSync } from 'fs';
import { build } from 'vite';
import dts from 'vite-plugin-dts';

// Delete dist folder
rmdirSync('dist', { recursive: true });

const packageJsonPath = process.cwd() + '/package.json';
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const version = '.' + packageJson.version;
const name = packageJson.name;

let libs = [
    {
        entry: 'src/index.ts',
        name: name + version,
        formats: ['es']
    }
];

const queueMinTs = (dirPath, name = '') => {
    readdirSync(dirPath).forEach(moduleName => {

        // Plugins end with .min.ts
        if (moduleName.endsWith('.min.ts')) {
            libs.push({
                entry: dirPath + moduleName,
                name: (name ? name + '.' : '') + moduleName.replace('.min.ts', version + '.min'),
                formats: ['iife']
            });
        }

        // Queue subdirectories recursively
        else if (lstatSync(dirPath + moduleName).isDirectory()) {
            queueMinTs(dirPath + moduleName + '/', (name ? name + '.' : '') + moduleName);
        }
    });
}

queueMinTs('src/');


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
            sourcemap: true,
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