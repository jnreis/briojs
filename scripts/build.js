import fs from 'fs';
import { execSync } from 'child_process';

const packageJsonPath = process.cwd() + '/package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let libs = [
    {
        entry: 'src/index.ts',
        fileName: `${packageJson.name}.js`,
        formats: ['es'],
    },
    {
        entry: 'src/cdn.ts',
        fileName: `${packageJson.name}.min.js`,
        formats: ['iife'],
    }
];

for (let lib of libs) {
    try {
        // Log build
        console.log(`\n> Building ${lib.entry} to dist/${lib.fileName} ${lib.formats.includes('es') ? 'as ES module' : 'for CDN'}`);

        // Update package.json
        packageJson.viteBuild = lib;

        // Write package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Build
        execSync('tsc && vite build', { stdio: 'inherit' });
    }
    catch (error) {
        // Log error
        console.error('Build failed:', error);

        // Exit process
        process.exit(1);
    }
}

// Clear viteBuild
packageJson.viteBuild = {};

// Write package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));