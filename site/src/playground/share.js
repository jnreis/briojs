const maxSourceBytes = 256 * 1024;
const maxFragmentLength = 64 * 1024;
const encoder = new TextEncoder();

export function validateProject(value) {
    if (!value || typeof value !== 'object' || value.version !== 1 ||
        !['html', 'css', 'js'].every(key => typeof value[key] === 'string'))
        throw new Error('This playground link has an unsupported or invalid project format.');
    const project = { version: 1, html: value.html, css: value.css, js: value.js };
    if (encoder.encode(JSON.stringify(project)).length > maxSourceBytes)
        throw new Error('The project exceeds the 256 KB source limit.');
    return project;
}

async function readBounded(stream, limit) {
    const reader = stream.getReader();
    const chunks = [];
    let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.length;
            if (length > limit) throw new Error('This playground link exceeds the supported size limit.');
            chunks.push(value);
        }
    } finally {
        await reader.cancel();
        reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    return bytes;
}

export async function encodeProject(value) {
    const project = validateProject(await minifyProject(validateProject(value)));
    const input = encoder.encode(JSON.stringify(project));
    const bytes = await readBounded(new Blob([input]).stream().pipeThrough(new CompressionStream('deflate')), maxSourceBytes);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    const fragment = `#v1=${encoded}`;
    if (fragment.length > maxFragmentLength)
        throw new Error('This project is too large for a shareable link (64 KB fragment limit). Reduce its code before sharing.');
    return fragment;
}

export async function decodeProject(fragment) {
    if (fragment.length > maxFragmentLength)
        throw new Error('This playground link exceeds the 64 KB fragment limit.');
    if (!/^#v1=[A-Za-z0-9_-]+$/.test(fragment))
        throw new Error('This playground link has an unsupported or invalid format.');
    const binary = atob(fragment.slice(4).replaceAll('-', '+').replaceAll('_', '/'));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const source = await readBounded(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')), maxSourceBytes);
    return validateProject(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(source)));
}
import { minifyProject } from './code.js';
