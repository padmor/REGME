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

// Adapt the original long-running Express server to Vercel's serverless Express entrypoint.
const serverFile = path.join(appDir, 'server', 'index.js');
let serverSource = fs.readFileSync(serverFile, 'utf8');
if (!serverSource.includes('module.exports = app;')) {
  const adapted = serverSource.replace(/\nstart\(\);\s*$/, "\nmodule.exports = app;\nif (require.main === module && process.env.VERCEL !== '1') {\n  start();\n}\n");
  if (adapted === serverSource) throw new Error('Could not adapt Express server entrypoint.');
  fs.writeFileSync(serverFile, adapted);
}

// Do not allow the source's development JWT fallback to be used in production.
const authFile = path.join(appDir, 'server', 'auth.js');
let authSource = fs.readFileSync(authFile, 'utf8');
if (authSource.includes("const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';")) {
  authSource = authSource.replace(
    "const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';",
    "function getJwtSecret() {\n  const secret = String(process.env.JWT_SECRET || '').trim();\n  if (!secret || secret.length < 32) {\n    const err = new Error('JWT_SECRET must be configured with at least 32 characters');\n    err.status = 503;\n    throw err;\n  }\n  return secret;\n}"
  ).replace('jwt.sign(payload, JWT_SECRET,', 'jwt.sign(payload, getJwtSecret(),').replace('jwt.verify(token, JWT_SECRET)', 'jwt.verify(token, getJwtSecret())');
  fs.writeFileSync(authFile, authSource);
}

console.log('UCC Physics Practical source unpacked and adapted for Vercel.');
