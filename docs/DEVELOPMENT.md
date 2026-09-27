# VaultMind Development Standard

VaultMind is evaluated as working software, so repository quality is treated as part of the product.

## Required local verification

```bash
npm install
npm run test
npm run test:coverage
npm run lint
npm run lint:server
npm run format:check
npm run build
```

## Test layers

- **Unit:** policy, intent, Omi normalization, pipeline decision paths.
- **Integration:** every HTTP API endpoint through the real Express application.
- **Contract:** deterministic SAVE / RETRIEVE / DENY / FORGET golden set.
- **Coverage:** Node's built-in test coverage with minimum thresholds.
- **Build:** TypeScript/Vite production build in CI.

## Coding standards

- TypeScript compiler checks frontend code.
- ESLint enforces server/test JavaScript quality rules.
- Prettier defines formatting.
- Prefer small pure functions and dependency injection at integration boundaries.
- Keep external providers behind adapters.
- Never put provider secrets in browser-exposed environment variables.

## Commit convention

Use Conventional Commits:

```text
feat(memory): add semantic forget workflow
fix(policy): block credential persistence before embedding
refactor(pipeline): inject provider adapters for deterministic tests
test(api): cover Omi webhook and memory endpoints
ci(build): run lint, tests, evaluation and production build
```

Keep commits focused and explain behavior changes rather than implementation trivia.
