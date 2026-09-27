# Engineering Quality Gates

VaultMind treats engineering quality as a release gate rather than a README claim.

## Gate matrix

| Gate | Command | Purpose |
|---|---|---|
| Unit/integration | `npm run test:server` | Verify server behavior and every API endpoint |
| Contract evaluation | `npm run eval:contracts` | Verify governed SAVE/RETRIEVE/DENY/FORGET behavior |
| Coverage | `npm run test:coverage` | Enforce minimum exercised-code thresholds |
| Frontend type safety | `npm run lint` | TypeScript compiler verification |
| Server lint | `npm run lint:server` | ESLint correctness and maintainability rules |
| Formatting | `npm run format:check` | Consistent repository formatting |
| Production build | `npm run build` | Verify deployable frontend artifact |
| Docker | CI Docker build | Verify container packaging |

## Failure policy

A release is not considered verified when one of the required gates fails. Demo Mode is useful for deterministic development, but it is not evidence that a provider-backed integration is healthy.

## Test philosophy

Tests focus on security boundaries and externally observable behavior:

1. Sensitive content is blocked before Lyzr and persistence.
2. Lyzr authorization cannot bypass server policy.
3. Missing structured mutation decisions fail closed.
4. Qdrant retrieval is user-isolated and ACTIVE-only.
5. FORGET deletes the exact resolved persistence point.
6. Voice and Omi transcripts use the same governed pipeline.
7. API validation and error responses remain stable.
