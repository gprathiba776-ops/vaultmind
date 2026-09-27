# VaultMind Threat Model

VaultMind treats persistent memory as a security boundary, not a passive database.

## Assets

- Long-term user memories
- User identity namespace
- Lyzr/Qdrant/Gemini credentials
- Memory-deletion requests
- Agent decision trace

## Trust boundaries

1. Browser → VaultMind API
2. Omi webhook → VaultMind API
3. VaultMind server → Lyzr
4. VaultMind server → embedding provider
5. VaultMind server → Qdrant

Provider secrets remain server-side. Browser requests carry a local anonymous user namespace; Qdrant queries are filtered by that namespace.

## Threats and controls

| Threat | Control | Evidence |
|---|---|---|
| Credential accidentally persisted | Deterministic privacy gate before embedding/storage | `server/core/policy.mjs`, DENY trace |
| Lyzr returns malformed mutation decision | Fail-closed mutation boundary | `server/pipeline.mjs` |
| Cross-user memory leakage | Qdrant `user_id` payload + query filter | `server/integrations/qdrant.mjs` |
| Prompt/model tries to override storage policy | Model cannot call Qdrant directly | Server-side execution boundary |
| Stale/forgotten memory returned | Retrieval filters `status=ACTIVE`; FORGET deletes point | Qdrant trace + post-forget query |
| Omi webhook spoofing | Optional `x-omi-webhook-token` | `server/index.mjs` |
| Browser secret exposure | No provider API keys in Vite client | `.env.example`, source audit |

## Security posture

VaultMind demonstrates application-level controls. It does not claim cryptographic erasure of physical storage, perfect prompt-injection resistance, or production identity/authentication unless those controls are separately deployed and configured.
