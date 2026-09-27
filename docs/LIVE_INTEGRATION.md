# Live integration checklist

## Lyzr

1. Create/configure the VaultMind agent in Lyzr Studio.
2. Publish/deploy the agent.
3. Put the agent ID in `LYZR_AGENT_ID`.
4. Put the Lyzr API key in `LYZR_API_KEY` on the server only.
5. Configure the agent to return the structured decision contract in `README.md`.
6. Verify `/api/status` reports `lyzr.configured=true`.
7. Run the four demo scenarios and inspect the trace.

Lyzr's documented Agent API uses `https://agent-prod.studio.lyzr.ai/v3/inference/chat/` for headless invocation.

## Qdrant

1. Start local Qdrant with Docker Compose or use a Qdrant Cloud URL.
2. Set `QDRANT_URL` and, for cloud deployments, `QDRANT_API_KEY`.
3. Set `GEMINI_API_KEY` for server-side embeddings.
4. Keep `QDRANT_VECTOR_SIZE=768` aligned with the configured embedding output dimension.
5. Start the server.
6. Run SAVE and verify a point appears in the collection.
7. Run RETRIEVE with different wording.
8. Run FORGET and verify the point is deleted.

## Omi

1. Create/configure an Omi Integration App or transcript integration.
2. Point its transcript/memory event delivery at the public HTTPS endpoint:
   `/api/omi/webhook`
3. Set `OMI_WEBHOOK_TOKEN` on the server and configure the same shared secret in the integration layer if your chosen Omi integration supports that mechanism.
4. Send a transcript event.
5. Verify it enters the same VaultMind pipeline as browser voice.
6. Inspect the trace for `VOICE INPUT` and subsequent memory stages.

Do not claim Omi hardware is connected until an actual Omi event has reached the endpoint.
