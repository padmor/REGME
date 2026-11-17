const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const bundleDir = path.join(root, '.bundle');
const chunks = fs.readdirSync(bundleDir).filter((name) => name.endsWith('.b64')).sort();
if (!chunks.length) throw new Error('Deployment source bundle is missing.');

const encoded = chunks.map((name) => fs.readFileSync(path.join(bundleDir, name), 'utf8').trim()).join('');
const compressed = Buffer.from(encoded, 'base64');
const tarPath = path.join(root, '.bundle.tar');
fs.writeFileSync(tarPath, zlib.brotliDecompressSync(compressed));

const appDir = path.join(root, 'app');
fs.mkdirSync(appDir, { recursive: true });
execFileSync('tar', ['-xf', tarPath, '-C', appDir, '--strip-components=1'], { stdio: 'inherit' });
fs.unlinkSync(tarPath);
console.log('UCC Physics Practical source unpacked for Vercel.');
