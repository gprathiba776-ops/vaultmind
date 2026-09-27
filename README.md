# VaultMind — Privacy-First Governed Agentic Memory

> **Remember intentionally. Retrieve intelligently. Protect privately.**

VaultMind is a voice-enabled governed AI memory system that adds a governed decision layer between conversation and persistent memory.

Instead of treating everything an assistant hears as memory, VaultMind makes every persistence decision observable:

```text
Voice / Text
     ↓
Transcript / Input
     ↓
Lyzr Agent Reasoning
     ↓
Privacy Gate
     ↓
SAVE / RETRIEVE / DENY / FORGET
     ↓
Qdrant Semantic Memory
     ↓
Grounded Response
     ↓
Inspectable Trace
```

## Judge fast path

If you have only a few minutes, use [`docs/JUDGE_CHECKLIST.md`](docs/JUDGE_CHECKLIST.md). It gives a reproducible sequence for SAVE → RETRIEVE → DENY → FORGET → post-forget retrieval and tells you exactly what to inspect in the Agent Trace.

The competition page emphasizes that working software and observable agentic workflows account for 60%+ of the final score, and requires the real-time voice, vector retrieval, and orchestrated reasoning loop to be connected. VaultMind is therefore optimized around executable proof rather than presentation-only claims.

## Why this repo is built for the evaluation criteria

The project is optimized around the competition's working-software and observable-agentic-workflow emphasis:

| Evaluation area | Evidence in this repo |
|---|---|
| **End-to-end voice → memory → agent** | Browser speech capture, transcript confirmation, shared processing pipeline, voice-specific traces, response speech |
| **Lyzr integration** | Server-side Lyzr Agent API proxy using the documented `/v3/inference/chat/` endpoint; no API key in the browser |
| **Qdrant integration** | Server-side embeddings + Qdrant collection creation, upsert, semantic query, ACTIVE-memory filtering, point deletion |
| **Omi integration path** | `/api/omi/webhook` transcript adapter with protected webhook token and Omi conversation metadata handling |
| **AI quality** | Privacy gate before external calls, structured Lyzr decision parsing, guarded fallback, grounded retrieval, explicit failure states |
| **Innovation** | Memory is a governed action: SAVE, RETRIEVE, DENY, FORGET |
| **Observability** | Per-interaction Agent Trace with input, Lyzr, privacy, memory, retrieval and response stages |
| **Responsible AI** | Sensitive credentials are blocked before persistence; LIVE/DEMO state is explicit; no fabricated integration status |
| **Reproducibility** | Docker Compose, `.env.example`, server/client separation, tests and architecture documentation |

## Core innovation

Most assistants ask:

> How can AI remember more?

VaultMind asks:

> **What should AI remember — and who controls that memory?**

### SAVE

An explicit instruction such as:

> "Remember that my Sentinel-Z paper submission deadline is September 15th, 2026."

passes through the policy gate and can be written to semantic memory.

### RETRIEVE

A later query can use different wording:

> "When is my security research paper due?"

The live Qdrant path embeds the query, searches the vector collection, filters to active memories, and grounds the response in the selected memory.

### DENY

Sensitive credential requests are blocked **before persistence**. The pipeline does not create an embedding or attempt a memory write for blocked content.

### FORGET

An explicit forget request resolves the target memory and, in live Qdrant mode, deletes the corresponding point. The product does not claim that this is cryptographic physical-media erasure; it reports the application-level deletion that was actually requested.

## Security invariants

The following controls are enforced server-side and are not configurable by browser input:

- Credential persistence is always blocked before Lyzr and persistence calls.
- SAVE and FORGET require explicit user-directed memory instructions.
- Browser memory mutations require a signed anonymous VaultMind session; the client cannot choose an arbitrary persistent namespace by posting `userId`.
- Qdrant retrieval is restricted to the current user namespace and `ACTIVE` records.
- Persistent deletion is only reachable through the governed FORGET workflow; there is no public arbitrary point-delete endpoint.
- Live mutation requires a valid structured Lyzr decision; malformed model output fails closed.
- Omi webhook processing requires a trusted webhook token in live deployments and a user or conversation identity for memory isolation.

These are application-level controls. VaultMind does not claim perfect prompt-injection resistance, physical-media erasure, or enterprise identity management unless those controls are separately configured.

## Architecture

### Trust boundaries

```text
┌────────────────────────────── Browser ──────────────────────────────┐
│ React UI                                                           │
│  VoiceService → transcript                                         │
│  Command / Recall / Memory / Privacy                               │
│  NO provider API keys                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ /api/*
                                ▼
┌──────────────────────────── VaultMind Server ──────────────────────┐
│ Privacy Gate → Lyzr Adapter → Action Policy → Memory Adapter       │
│        │                 │                    │                    │
│        │                 │                    ├── Gemini Embeddings │
│        │                 │                    └── Qdrant            │
│        │                 └── Lyzr Agent API                         │
│        └── blocks sensitive content before external persistence    │
│                                                                     │
│ Omi Webhook Adapter → same pipeline as browser voice               │
└─────────────────────────────────────────────────────────────────────┘
```

### Why the server boundary matters

Lyzr, Qdrant, Gemini and Omi credentials are **server-side only**. The frontend receives integration status and calls `/api/*`; it never needs provider secrets.

Lyzr's current Agent API documentation describes the headless inference endpoint at `https://agent-prod.studio.lyzr.ai/v3/inference/chat/` with `x-api-key` authentication. [Lyzr Agent API documentation](https://docs.lyzr.ai/agent-apis/agents/Introduction)

Qdrant exposes point upsert, query and deletion APIs used by the live memory adapter. [Qdrant API reference](https://api.qdrant.tech/v-1-18-x/api-reference/points/upsert-points)

Gemini embeddings are generated server-side so the browser never receives the embedding credential. [Gemini Embeddings documentation](https://ai.google.dev/gemini-api/docs/embeddings)

Omi provides developer APIs and integration/webhook mechanisms for transcript and memory workflows; VaultMind's `/api/omi/webhook` is the application-side ingestion boundary. [Omi developer documentation](https://docs.omi.me/)

## Voice-first workflow

VaultMind supports browser speech recognition through `VoiceService` and keeps the processing pipeline shared between text and voice:

```text
Browser microphone
      ↓
SpeechRecognition
      ↓
Transcript confirmation
      ↓
processVaultMindInput
      ↓
Lyzr / privacy gate
      ↓
Memory action
      ↓
Response
```

The architecture is also Omi-ready:

```text
Omi transcript event
      ↓
/api/omi/webhook
      ↓
same VaultMind pipeline
      ↓
SAVE / RETRIEVE / DENY / FORGET
```

The repository does **not** claim that Omi hardware is connected unless the Omi integration is actually configured.

## Deterministic competition demo

### 01 — SAVE

Say or enter:

```text
Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.
```

Expected observable path:

```text
VOICE/TEXT
 → SAVE
 → AUTHORIZED
 → STORE MEMORY
 → ACTIVE
```

### 02 — RETRIEVE

Then ask:

```text
When is my security research paper due?
```

The query does not need to repeat `Sentinel-Z`. In live mode, Qdrant semantic retrieval grounds the answer in the stored memory.

### 03 — DENY

Try:

```text
Remember my bank password is [REDACTED].
```

Expected:

```text
DENY
 → PERSISTENCE BLOCKED
 → MEMORY WRITE NOT EXECUTED
```

The actual secret is never displayed or persisted by the demo scenario.

### 04 — FORGET

Say:

```text
Forget my Sentinel-Z deadline.
```

Expected:

```text
FORGET
 → TARGET LOCATED
 → DELETE
 → FORGOTTEN
```

Then repeat the retrieval query. The active memory should no longer be returned.

## Live mode vs Demo mode

### Demo mode

Works without provider credentials.

- deterministic memory scenarios
- local browser persistence
- deterministic semantic demo matching
- honest `DEMO MODE` indicators
- full agent trace simulation

### Live mode

Configure the server with:

```text
LYZR_API_KEY
LYZR_AGENT_ID
QDRANT_URL
QDRANT_API_KEY (optional for local Qdrant)
GEMINI_API_KEY
```

The browser then talks to the VaultMind server rather than directly to providers.

The UI must only show LIVE provider status when the server confirms the integration is configured/reachable.

## Lyzr agent contract

For the strongest Lyzr integration, configure the VaultMind Lyzr agent to return a compact structured decision in its response:

```json
{
  "intent": "SAVE | RETRIEVE | DENY | FORGET",
  "authorization": "AUTHORIZED | BLOCKED",
  "evidence": "short evidence statement",
  "reason": "short explanation"
}
```

Recommended agent instruction boundary:

```text
You are VaultMind's memory-governance reasoning agent.

Determine whether the user's request is SAVE, RETRIEVE, DENY, or FORGET.
Never invent a memory.
Never claim a storage operation occurred.
Never expose sensitive credentials.
Return only the structured decision requested by the application contract.
The application server, not the model, is authoritative for persistence operations.
```

This preserves a critical boundary:

> **Lyzr reasons about intent; the application server executes the guarded memory operation.**

## Qdrant memory contract

Live memory records contain payload metadata such as:

```text
memory_id
status
category
source
privacy_decision
created_at
```

Only `status=ACTIVE` memories are eligible for retrieval.

The live adapter:

1. Generates a server-side embedding.
2. Creates the Qdrant collection when necessary.
3. Upserts a memory point.
4. Queries semantic memory for retrieval.
5. Filters out forgotten records.
6. Deletes the exact Qdrant point for a forget request.

## Omi webhook contract

Endpoint:

```text
POST /api/omi/webhook
```

The adapter accepts common transcript shapes including:

- `text`
- `transcript`
- `transcript_text`
- `transcript_segments[]`
- nested `data.text`
- nested `data.transcript`

Protect the endpoint with `OMI_WEBHOOK_TOKEN` when exposing it publicly. Do not put the token in the frontend.

## API surface

```text
GET  /api/health
GET  /api/status
POST /api/agent/process
FORGET via POST /api/agent/process
POST /api/omi/webhook
GET  /api/omi/health
```

## Local setup

### Option A — Demo UI

```bash
npm install
npm run dev
```

The frontend runs on Vite and uses deterministic Demo Mode when the server is unavailable.

### Option B — Full server

```bash
npm install
cp .env.example .env
npm run build
npm run server
```

The server listens on port `8787` by default.

### Option C — Docker Compose

```bash
docker compose up --build
```

This starts VaultMind and a local Qdrant instance. Lyzr and Gemini remain external services and require their server-side credentials.

## Verification

```bash
npm run test:server
npm run lint
npm run build
```

Do not commit a synthetic lockfile. Generate a real `package-lock.json` on a network-enabled machine before final submission and use `npm ci` in CI after that lockfile has been verified.

## Repository structure

```text
VaultMind/
├── src/
│   ├── components/        # Product UI and observable trace surfaces
│   ├── context/           # Shared application state
│   ├── demo/              # Deterministic offline competition scenario
│   ├── services/          # Browser adapters + backend boundary
│   ├── types/             # Shared memory/trace contracts
│   └── views/             # Command, Chat, Memory, Recall, Privacy, Activity
├── server/
│   ├── core/              # Privacy and intent policy
│   ├── integrations/      # Lyzr, Qdrant, Gemini, Omi adapters
│   ├── pipeline.mjs       # Governed end-to-end server pipeline
│   └── index.mjs          # HTTP trust boundary
├── tests/server/           # Security and contract tests
├── docs/                   # Architecture, evaluation and demo evidence
├── .env.example
├── docker-compose.yml
└── README.md
```

## Security principles

- Provider secrets never use `VITE_*` variables.
- Sensitive credential detection occurs before external persistence calls.
- Omi webhook authentication is server-side.
- Demo mode is explicitly labelled.
- Live integrations are only labelled live after server-side configuration/reachability checks.
- Application-level deletion is reported accurately; physical storage-media erasure is not claimed.
- No real credential is included in demo data.

## Evaluation evidence

See:

- `docs/EVALUATION.md`
- `docs/ARCHITECTURE.md`
- `docs/DEMO_SCRIPT.md`
- `docs/LIVE_INTEGRATION.md`
- `tests/server/`

The project is designed to make the important claims **observable in the software**, rather than relying on README prose alone.


## Evaluation harness

VaultMind ships a deterministic contract-level golden set at `evals/golden-memory.jsonl`. Run:

```bash
npm run eval:contracts
```

The harness checks intent routing and the pre-persistence privacy gate without requiring provider credentials. Live integration quality should then be demonstrated with the full voice → Lyzr → Qdrant sequence described in `docs/DEMO_SCRIPT.md`. Lyzr's current evaluation documentation explicitly covers task completion, hallucination, faithfulness, tool-call accuracy, and knowledge-base retrieval precision; VaultMind therefore treats deterministic guardrails and retrieval traces as first-class evidence rather than relying on screenshots alone.

## Engineering quality

VaultMind is intentionally evaluated as software, not only as a prototype interface.

The repository includes:

- 28+ server unit/integration tests across policy, intent, Omi, pipeline and HTTP APIs
- 19 deterministic golden memory contracts
- dependency-injected provider boundaries for deterministic testing
- ESLint + Prettier + TypeScript quality gates
- Node coverage thresholds
- GitHub Actions for tests, evaluation, linting, formatting, build, coverage and Docker
- CodeQL and dependency-review workflows
- Dependabot configuration
- Docker health checks and non-root runtime
- OpenAPI API surface documentation

See [`docs/EVALUATION_SCORECARD.md`](docs/EVALUATION_SCORECARD.md) for the engineering remediation map and [`docs/QUALITY.md`](docs/QUALITY.md) for release gates.

## Local verification

```bash
npm install
npm run test
npm run test:coverage
npm run lint
npm run lint:server
npm run format:check
npm run build
```

A complete verification run should finish with zero test failures, zero lint errors, formatting compliance, and a successful production build.
