import fs from 'fs';
import path from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Paths
const inputPath = path.join(process.cwd(), 'dist', 'brio.min.js');
const bootstrapPath = path.join(process.cwd(), 'dist', 'brio.temp.js');

// Read the content of the file
const fileContent = fs.readFileSync(inputPath, 'utf8');

// Compress the content using Gzip
gzipAsync(Buffer.from(fileContent))
  .then(buffer => {
    // Convert buffer to base64
    const compressedContentBase64 = buffer.toString('base64');

    // Create the bootstrap script content
    const bootstrapContent = `
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decompressGzip(base64) {
  const compressed = base64ToUint8Array(base64);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressed);
      controller.close();
    }
  }).pipeThrough(new DecompressionStream('gzip'));

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let done, value;
  while ({ done, value } = await reader.read(), !done) {
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();
  return result;
}

(async () => {
  const compressedContent = '${compressedContentBase64}';
  const decompressedContent = await decompressGzip(compressedContent);

  // Create a new script element and set its content to the decompressed code
  const script = document.createElement('script');
  script.textContent = decompressedContent;
  document.head.appendChild(script);
})();
`;

    fs.writeFileSync(bootstrapPath, bootstrapContent);

    console.log(`Bootstrap file with compressed library saved to ${bootstrapPath}`);
  })
  .catch(err => {
    console.error('Error compressing file:', err);
  });
