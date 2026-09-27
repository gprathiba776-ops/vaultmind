# 3-minute judging demo

## Opening — 15 seconds

"Most AI assistants remember by default. VaultMind makes memory a decision. Every voice or text request passes through reasoning, a privacy gate, and an explicit SAVE, RETRIEVE, DENY, or FORGET action."

## 1. Voice SAVE — 30 seconds

Open Omi Voice / browser voice.

Say:

"Remember that my Sentinel-Z paper submission deadline is September 15th, 2026."

Show the transcript.

Submit it.

Point to:

`VOICE → SAVE → AUTHORIZED → STORE MEMORY`

Open Agent Trace.

## 2. Semantic RETRIEVE — 35 seconds

Ask:

"When is my security research paper due?"

Show that the query does not repeat `Sentinel-Z`.

Show:

`SEMANTIC SEARCH → MATCH → CONTEXT → RESPONSE`

## 3. DENY — 30 seconds

Say:

"Remember my bank password is [REDACTED]."

Show:

`DENY → PERSISTENCE BLOCKED → MEMORY WRITE NOT EXECUTED`

Emphasize that the sensitive content is stopped before persistence.

## 4. FORGET — 35 seconds

Say:

"Forget my Sentinel-Z deadline."

Show:

`FORGET → TARGET LOCATED → DELETE → FORGOTTEN`

Ask the deadline question again and show that the active memory is no longer available.

## Close — 20 seconds

"VaultMind combines Omi-ready voice input, Lyzr reasoning, a server-side privacy boundary, and Qdrant semantic memory. The key difference is not that it remembers more. It gives the user control over what becomes memory."
