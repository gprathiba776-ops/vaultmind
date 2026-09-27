# Verification Record

## Verified in the repository build environment

- `node --check` passes for all server and evaluation `.mjs` files.
- JSON configuration files parse successfully.
- `npm run doctor` reports no structural/security errors.
- `npm run eval:contracts` passes **19/19** deterministic intent/privacy contract cases.
- Non-HTTP server tests pass **28/28**, including policy, intent, Omi normalization, signed identity, pipeline behavior, fail-closed mutation, prompt-injection privacy, and explicit-memory requirements.
- Archive integrity was verified with `unzip -tq`.
- Provider-secret scan found no `VITE_LYZR`, `VITE_QDRANT`, `VITE_GEMINI`, or `VITE_OMI` variables and no credential-looking fixture strings.

## Not claimed as locally verified here

The execution environment does not contain the repository's npm dependencies and network installation timed out. Therefore the full HTTP integration suite, TypeScript check, ESLint, Prettier, Vite production build, and Docker build were **not** represented as passed in this environment.

Run the following on a network-enabled machine before submission:

```bash
npm install
npm run doctor
npm test
npm run test:coverage
npm run lint
npm run lint:server
npm run format:check
npm run build
docker build -t vaultmind:local .
```

After the first successful `npm install`, commit the generated `package-lock.json` so CI and judges have deterministic dependency resolution.
