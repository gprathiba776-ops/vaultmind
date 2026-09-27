# Engineering Evaluation Scorecard

This document records the engineering feedback received during repository evaluation and the corresponding remediation plan.

## Baseline evaluation

| Dimension | Baseline | Primary issue identified |
|---|---:|---|
| Code Quality | 42/100 | Inconsistent engineering conventions and repeated logic |
| Documentation | 71/100 | Strong foundation, but operational evidence and developer guidance could be deeper |
| Testing | 24.5/100 | Test coverage was too narrow; API/integration behavior was under-tested |
| DevOps | 40/100 | CI/CD and release-quality automation were incomplete |
| **Overall** | **58.1/100** | Architecture was stronger than the engineering verification around it |

## Remediation implemented

### Code quality

- Refactored the pipeline into smaller helpers.
- Added dependency injection at provider boundaries so behavior can be tested without live services.
- Added ESLint with fail-on-warning configuration for server, test and evaluation code.
- Added Prettier configuration and formatting verification.
- Added EditorConfig for consistent whitespace and line endings.
- Added API request IDs and centralized error handling.
- Added OpenAPI endpoint documentation.

### Testing

The repository now contains tests for:

- intent inference and structured Lyzr parsing
- Omi transcript normalization
- sensitive-data policy enforcement
- SAVE behavior
- voice provenance
- RETRIEVE grounding
- FORGET deletion
- Lyzr BLOCKED authorization
- malformed Lyzr fail-closed behavior
- Qdrant deletion delegation
- every public HTTP endpoint
- request ID propagation
- API validation
- OpenAPI surface availability

The deterministic golden evaluation contains 19 contract cases.

### DevOps

- GitHub Actions quality pipeline
- Node syntax checks
- unit/integration tests
- contract evaluation
- ESLint
- TypeScript checking
- Prettier verification
- production Vite build
- coverage threshold job
- Docker image build job
- CodeQL analysis
- dependency review
- Dependabot configuration
- Docker health checks
- non-root application container
- pinned Qdrant container version
- restart policies and service readiness checks

### Documentation

Added or expanded:

- `docs/QUALITY.md`
- `docs/DEVELOPMENT.md`
- `docs/THREAT_MODEL.md`
- `docs/JUDGE_CHECKLIST.md`
- `docs/LIVE_INTEGRATION.md`
- `docs/EVALUATION.md`
- `docs/EVAL_GOLDEN_SET.md`
- `CHANGELOG.md`
- contribution and pull-request standards

## Verification rule

The repository must not report a quality gate as passed unless the corresponding command has actually completed successfully in the target environment. Demo Mode is not treated as evidence of live provider health.

## Additional hardening after the baseline

- Added signed anonymous server sessions so persistent memory namespaces are not selected by an arbitrary client-supplied `userId`.
- Removed the public arbitrary Qdrant point-deletion API; deletion now occurs only through the governed FORGET path.
- Made credential blocking and explicit SAVE/FORGET requirements server invariants that cannot be disabled by browser policy input.
- Added adversarial tests for prompt-injection attempts and implicit agent-driven persistence.
- Added release checklist and evidence matrix tying claims to executable tests or observable UI evidence.
- Fixed the live retrieval response contract so Qdrant evidence is converted into the frontend's typed retrieval shape.
- Made Docker Compose boot without requiring a pre-created `.env`, using safe local defaults while keeping live provider credentials configurable.
