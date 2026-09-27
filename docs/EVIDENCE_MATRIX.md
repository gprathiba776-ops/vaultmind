# Evaluation Evidence Matrix

| Claim | Executable evidence | Human-visible evidence |
|---|---|---|
| Voice enters governed workflow | VoiceService + `/api/agent/process` | Voice trace shows source and stages |
| Omi integration | `/api/omi/webhook` + transcript normalization tests | Omi integration configuration |
| Lyzr reasoning | Lyzr adapter + structured decision parser | Agent Trace LYZR stage |
| Policy enforcement | Privacy gate + explicit mutation guard | DENY trace and no-write outcome |
| Qdrant semantic memory | server embedding + Qdrant query/upsert/delete adapters | Retrieved evidence + storage status |
| User isolation | signed session identity + Qdrant `user_id` filter | Trace identifies governed session |
| FORGET | user-scoped semantic target resolution + exact point deletion | DELETE MEMORY trace + post-forget retrieval |
| Grounded response | selected retrieval evidence | Context Assembly / Grounding stage |
| Fail-closed mutation | malformed structured-decision test | Execution Guard trace |
| Reproducibility | tests, lint, build, Docker CI | Judge checklist |
