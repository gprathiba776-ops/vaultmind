# VaultMind Release Checklist

A submission is considered release-ready only when every applicable item below is verified in the target environment.

## Functional proof

- [ ] Fresh install succeeds.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run lint:server` passes.
- [ ] `npm run format:check` passes.
- [ ] `npm run build` passes.
- [ ] `docker build` passes.
- [ ] `/api/health` is healthy.
- [ ] `/api/session` issues a signed anonymous session.
- [ ] Voice SAVE is demonstrated.
- [ ] Semantic RETRIEVE is demonstrated.
- [ ] Sensitive DENY is demonstrated.
- [ ] FORGET is demonstrated against the actual configured persistence layer.
- [ ] Post-FORGET retrieval returns no active match.
- [ ] Agent Trace is visible for every demonstrated action.

## Security proof

- [ ] No provider secret appears in a `VITE_*` variable.
- [ ] Credential persistence cannot be disabled by browser policy input.
- [ ] Mutating API requests require a signed VaultMind session.
- [ ] Omi webhook is protected by `OMI_WEBHOOK_TOKEN` in live deployments.
- [ ] Omi events contain a user or conversation identity before memory processing.
- [ ] Persistent memory retrieval is user-scoped and ACTIVE-only.
- [ ] Direct arbitrary Qdrant point deletion is not exposed as a public API action; deletion occurs through the governed FORGET workflow.
- [ ] Lyzr mutation decisions fail closed when the structured contract is missing or invalid.

## Evidence

- [ ] README judge fast path is accurate.
- [ ] Live vs Demo behavior is clearly labeled.
- [ ] Architecture and threat model match the implementation.
- [ ] Evaluation results are generated from the current commit.
- [ ] No unsupported claim of Omi hardware connectivity is made.
- [ ] No claim of cryptographic physical-media erasure is made for application-level FORGET.
