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

// Keep the original production frontend at / and expose the isolated demo
// only at /demo.html. Never replace the production homepage with local-only UI.
const publicDir = path.join(appDir, 'public');
fs.mkdirSync(publicDir, { recursive: true });
const demoPage = path.join(root, 'demo', 'index.html');
fs.copyFileSync(demoPage, path.join(publicDir, 'demo.html'));
console.log('UCC Physics Practical source unpacked; production homepage preserved and isolated demo exposed at /demo.html.');
