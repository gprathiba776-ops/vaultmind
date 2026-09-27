# VaultMind evaluation map

The project is deliberately optimized for the stated judging emphasis: working software and observable agentic workflows, especially the end-to-end voice → memory → agent loop, Lyzr/Qdrant/Omi integration, AI quality, innovation, and demo/documentation quality.

## 1. Working software

The four competition paths are deterministic and repeatable in Demo Mode:

1. SAVE a Sentinel-Z deadline.
2. RETRIEVE it using an indirect semantic query.
3. DENY a credential persistence request before memory storage.
4. FORGET the saved memory and verify it is no longer active.

The same UI pipeline accepts text and browser voice transcripts.

## 2. Observable agentic workflow

Every interaction produces a trace with explicit stages. Live traces distinguish Lyzr reasoning from application-side memory execution. Demo traces are explicitly labelled as demo.

The trace answers:

- What did the user say?
- What intent was detected?
- Why was persistence authorized or blocked?
- What memory operation was attempted?
- What retrieval context grounded the response?
- What happened at the storage boundary?

## 3. Lyzr

The server invokes the Lyzr Agent API and parses the structured decision contract. The model is not trusted to directly mutate storage. The server remains the execution authority.

This is intentional governance:

`Lyzr reasons → VaultMind validates → storage adapter executes`

## 4. Qdrant

The live adapter uses server-side embeddings and Qdrant point operations:

- create collection when absent
- upsert memory points
- semantic query
- ACTIVE status filtering
- delete exact point on FORGET

## 5. Omi

The browser voice path demonstrates immediate voice-to-memory behavior.

The server also exposes an Omi transcript webhook adapter so an Omi Integration App can feed transcript events into the same pipeline.

No Omi hardware connection is claimed unless configured.

## 6. AI quality and safety

The privacy gate runs before external persistence. Sensitive credential content is not embedded or written to Qdrant. Structured Lyzr decisions are parsed; malformed Lyzr responses do not become authoritative storage actions.

## 7. Honesty

The application differentiates:

- Demo Memory Store vs Qdrant
- Demo Trace vs Live Trace
- Omi-ready vs actually connected
- application-level point deletion vs physical-media erasure

## 8. Reproducibility

The repo includes Docker Compose for a local VaultMind server + Qdrant deployment, server-side environment configuration, contract tests and architecture documentation.
