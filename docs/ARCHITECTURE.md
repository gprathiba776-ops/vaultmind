# VaultMind architecture

## Environment → Agent → Inference separation

### Environment

Credentials and infrastructure live on the server:

- LYZR_API_KEY
- LYZR_AGENT_ID
- QDRANT_URL / QDRANT_API_KEY
- GEMINI_API_KEY
- OMI_WEBHOOK_TOKEN / OMI_API_KEY

They are intentionally not exposed as `VITE_*` browser variables.

### Agent

The Lyzr Agent is responsible for interpreting the request and producing a structured memory decision:

`SAVE | RETRIEVE | DENY | FORGET`

The agent does not receive direct storage credentials and is not the final authority for storage mutation.

### Inference / execution

The VaultMind server receives the request, applies the privacy gate, invokes Lyzr, validates the decision, then executes the appropriate memory adapter.

```text
client
  │
  ├── text
  └── voice transcript
        │
        ▼
VaultMind API
        │
        ├── privacy gate ── BLOCK → no external persistence
        │
        ▼
Lyzr Agent API
        │
        ▼
structured decision
        │
        ├── SAVE ────────► Gemini embedding ─► Qdrant upsert
        ├── RETRIEVE ────► Gemini embedding ─► Qdrant query ─► grounded context
        ├── DENY ─────────► no storage operation
        └── FORGET ───────► Qdrant point deletion
```

## Why not expose Qdrant directly to React?

A browser-side Qdrant API key would turn a private storage credential into a public application secret. VaultMind therefore keeps the storage adapter behind the server trust boundary.

## Why not let the Lyzr agent directly write memory?

The application needs a deterministic policy boundary. Lyzr is responsible for language reasoning; the server validates the resulting intent and performs the actual storage operation. This makes the critical persistence path auditable and testable.

## Identity and mutation boundary

Browser memory mutations require a signed anonymous VaultMind session. The browser does not choose the persistent user namespace by posting an arbitrary `userId`; the server resolves the identity from the signed session token. Omi events must carry a user identity or conversation identity and are authenticated by the Omi webhook token in live deployments.

The public API intentionally exposes no arbitrary Qdrant point-deletion endpoint. Persistent deletion occurs only through the governed `FORGET` action, which first resolves a user-scoped active memory and then deletes the exact corresponding point.

Critical privacy controls are server invariants: browser-supplied policy flags cannot disable credential blocking or explicit mutation requirements.
