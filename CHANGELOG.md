# Changelog

## Unreleased

### Engineering hardening

- Added API integration tests covering every public endpoint.
- Added pipeline unit tests for SAVE, RETRIEVE, DENY, FORGET, voice provenance, fail-closed behavior, and Qdrant deletion.
- Added deterministic contract evaluation suite.
- Added ESLint and Prettier configuration.
- Added Node test coverage command with enforceable thresholds.
- Added request IDs and centralized API error handling.
- Added an OpenAPI surface endpoint at `/api/openapi.json`.
- Refactored the pipeline for dependency injection and testability.
- Added CI checks for tests, evaluation contracts, linting, formatting, type-checking, and production builds.
- Added development conventions and pull-request verification checklist.
- Hardened Docker runtime with a production-oriented health check and non-root execution.
