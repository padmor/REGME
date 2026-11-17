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

// Copy the isolated demo portal after unpacking the production application.
const publicDir = path.join(appDir, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, 'demo', 'index.html'), path.join(publicDir, 'demo.html'));

// Add a clearly labelled demo entry point to the existing landing page.
const landingPage = path.join(publicDir, 'index.html');
if (fs.existsSync(landingPage)) {
  let html = fs.readFileSync(landingPage, 'utf8');
  if (!html.includes('href="/demo.html"')) {
    const launcher = '<a href="/demo.html" style="position:fixed;right:18px;bottom:18px;z-index:9999;background:#1769aa;color:#fff;padding:11px 16px;border-radius:10px;text-decoration:none;font:600 13px system-ui;box-shadow:0 5px 18px #10243a33">Open interactive demo ↗</a>';
    html = html.includes('</body>') ? html.replace('</body>', launcher + '</body>') : html + launcher;
    fs.writeFileSync(landingPage, html);
  }
}
console.log('UCC Physics Practical source unpacked; isolated demo portal installed.');
