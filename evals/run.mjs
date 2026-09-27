import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inferIntent } from '../server/core/intent.mjs';
import { privacyGate } from '../server/core/policy.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const cases = fs.readFileSync(path.join(root, 'golden-memory.jsonl'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

const results = cases.map((item) => {
  const privacy = privacyGate(item.input, { sensitiveCredentialStorage: true });
  const predicted = privacy.blocked ? 'DENY' : inferIntent(item.input);
  const pass = predicted === item.expectedIntent && Boolean(item.expectedPrivacyBlocked) === privacy.blocked;
  return {
    id: item.id,
    pass,
    expectedIntent: item.expectedIntent,
    predictedIntent: predicted,
    expectedPrivacyBlocked: Boolean(item.expectedPrivacyBlocked),
    privacyBlocked: privacy.blocked,
  };
});

const passed = results.filter((r) => r.pass).length;
const report = {
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed,
  failed: results.length - passed,
  intentAndPrivacyContractPassRate: results.length ? passed / results.length : 0,
  results,
};

console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
