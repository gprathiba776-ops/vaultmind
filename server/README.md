# VaultMind server

The server is the trust boundary for production integrations.

- Lyzr credentials stay server-side.
- Qdrant credentials stay server-side.
- Gemini embedding credentials stay server-side.
- Sensitive credential detection runs before external Lyzr/Qdrant calls.
- Omi transcript ingestion is exposed through `/api/omi/webhook`.
- The frontend only calls `/api/*`.

The live Lyzr Agent API uses the documented headless inference endpoint `https://agent-prod.studio.lyzr.ai/v3/inference/chat/` and `x-api-key` authentication.
