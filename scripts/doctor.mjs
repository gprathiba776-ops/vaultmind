import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!packageJson.scripts?.test || !packageJson.scripts?.build) errors.push('package.json is missing required test/build scripts');

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(mjs|ts|tsx|json|yml|yaml|md)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(root);

for (const file of sourceFiles) {
  if (file.endsWith('scripts/doctor.mjs')) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/VITE_(?:LYZR|QDRANT|GEMINI|OMI)_/i.test(text)) errors.push(`Provider secret-like VITE variable found in ${path.relative(root, file)}`);
  const credentialMarker = ['VaultSecret99', 'lyzr' + '_sk_', 'qdrant' + '_key_'];
  if (credentialMarker.some((marker) => text.toLowerCase().includes(marker.toLowerCase()))) errors.push(`Credential-looking fixture found in ${path.relative(root, file)}`);
}

const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
if (!envExample.includes('VAULTMIND_SESSION_SECRET')) errors.push('.env.example is missing VAULTMIND_SESSION_SECRET');
if (!fs.existsSync(path.join(root, 'docs', 'THREAT_MODEL.md'))) errors.push('Threat model documentation is missing');
if (!fs.existsSync(path.join(root, 'docs', 'EVIDENCE_MATRIX.md'))) errors.push('Evaluation evidence matrix is missing');
if (!fs.existsSync(path.join(root, 'tests', 'server', 'identity.test.mjs'))) errors.push('Identity security tests are missing');
if (!fs.existsSync(path.join(root, 'evals', 'golden-memory.jsonl'))) errors.push('Golden evaluation fixture is missing');
if (!fs.existsSync(path.join(root, 'Dockerfile'))) errors.push('Dockerfile is missing');

if (!fs.existsSync(path.join(root, 'package-lock.json'))) warnings.push('package-lock.json is absent; run npm install once on a network-enabled machine before final submission.');

console.log(JSON.stringify({ ok: errors.length === 0, errors, warnings }, null, 2));
if (errors.length) process.exitCode = 1;
