import fs from 'fs';
import { execSync } from 'child_process';

const packageJsonPath = process.cwd() + '/package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let fileName = `${packageJson.name}@${packageJson.version}`;

let libs = [
    {
        entry: 'src/index.ts',
        fileName: `${fileName}.js`,
        formats: ['es'],
    },
    {
        entry: 'src/cdn.ts',
        fileName: `${fileName}.min.js`,
        formats: ['iife'],
    },
];

for (let lib of libs) {
    try {
        console.log(`\n> Building ${lib.entry} to dist/${lib.fileName} ${lib.formats.includes('es') ? 'as ES module' : 'for CDN'}`);
        // Update package.json
        packageJson.viteBuild = lib;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        // Build
        execSync('tsc && vite build', { stdio: 'inherit' });
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Clear viteBuild
packageJson.viteBuild = {};
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));