# Contributing to VaultMind

VaultMind is intentionally built as a governed agent system. Contributions must preserve both product behavior and the security boundary around memory.

## Non-negotiable architecture rules

1. Never move Lyzr, Qdrant, Gemini or Omi credentials into `VITE_*` variables.
2. Never bypass the server privacy gate for persistent memory.
3. Never claim a live provider operation when the operation ran in Demo Mode.
4. Keep SAVE / RETRIEVE / DENY / FORGET behavior observable in the Agent Trace.
5. Do not describe Qdrant point deletion as cryptographic physical-media erasure.
6. Text, browser voice and Omi transcript input must enter the same governed pipeline.
7. Persistent memory must remain isolated by `user_id` and restricted to ACTIVE records.
8. Lyzr may recommend an action; the server execution boundary decides whether it is allowed to execute.

## Before a PR

Run the complete quality gate:

```bash
npm install
npm run test
npm run test:coverage
npm run lint
npm run lint:server
npm run format:check
npm run build
```

If changing provider integrations, also update `docs/LIVE_INTEGRATION.md`, `docs/QUALITY.md`, and the evaluation evidence.

## Commit convention

Use Conventional Commits, for example:

```text
feat(memory): add semantic forget workflow
fix(policy): block credential persistence before embedding
refactor(pipeline): inject provider adapters for deterministic tests
test(api): cover Omi webhook and memory endpoints
ci(build): run quality gates and Docker verification
```

Keep commits focused. Pull requests should explain the behavior change, verification performed, and any security or architecture impact.
