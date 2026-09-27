# Judge Fast Path

VaultMind is designed so a judge can verify the core claim quickly instead of trusting a slide deck.

## 1. Start

```bash
cp .env.example .env
npm install
npm run test:server
npm run eval:contracts
npm run build
npm run server
```

For a fully local vector-memory run, use the included Qdrant service:

```bash
docker compose up --build
```

Provider-backed Lyzr/Gemini/Omi behavior requires the corresponding server environment variables.

## 2. Verify the four memory decisions

Run these in the Command or Voice interface:

1. `Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.`
2. `When is my security research paper due?`
3. `Remember my bank password is [REDACTED].`
4. `Forget my Sentinel-Z deadline.`
5. Repeat step 2.

Expected evidence:

```text
SAVE      → AUTHORIZED → STORE
RETRIEVE  → ACTIVE QDRANT MATCH → GROUNDED RESPONSE
DENY      → PRIVACY GATE → NO EMBEDDING / NO WRITE
FORGET    → TARGET LOCATED → DELETE
RETRIEVE  → NO ACTIVE MATCH
```

## 3. Inspect the Agent Trace

The trace should show a chronological run ID and elapsed execution time. In live mode, the trace distinguishes:

- voice/text input
- Lyzr reasoning
- memory intent
- privacy authorization
- semantic search or mutation
- grounding context
- final response

The model does not receive direct Qdrant credentials. The VaultMind server remains the execution authority.

## 4. Verify Omi path

Configure the Omi Integration App to send transcript events to:

```text
POST /api/omi/webhook
```

with `x-omi-webhook-token` when protection is enabled. Omi events enter the same pipeline as browser voice; there is no separate memory implementation.

## 5. What is deliberately not claimed

- Omi hardware is not marked connected unless configured.
- Demo Mode is not presented as live Qdrant persistence.
- Application-level point deletion is not described as physical-media erasure.
- A malformed live Lyzr mutation decision fails closed instead of silently authorizing a write/delete.
