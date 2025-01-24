// build.js
import fs from 'fs';
import { build } from 'vite';
import dts from 'vite-plugin-dts';

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
        entry: 'src/cdn.ts',
        name: name + '.min',
        formats: ['iife']
    },
];

// Build plugins
// Get all the .ts file in the src/plugins folder
fs.readdirSync('src/plugins').forEach(moduleName => {

    // Plugins are in the root of the plugins folder
    if (moduleName.endsWith('.ts')) {
        libs.push({
            entry: `src/plugins/${moduleName}`,
            name: moduleName.replace('.ts', ''),
        });
    }

    // Plugins are in a subfolder of the plugins folder
    else if (fs.lstatSync(`src/plugins/${moduleName}`).isDirectory()) {
        fs.readdirSync(`src/plugins/${moduleName}`).forEach(pluginName => {
            if (pluginName.endsWith('.ts')) {
                libs.push({
                    entry: `src/plugins/${moduleName}/${pluginName}`,
                    name: moduleName + '.' + pluginName.replace('.ts', ''),
                });
            }
        });
    }
});

// Build with Vite
const buildWithVite = async (lib) => {
    await build({
        publicDir: false,
        // logLevel: 'silent',
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