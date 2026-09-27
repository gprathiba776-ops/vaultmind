# Golden evaluation set

`evals/golden-memory.jsonl` defines the minimal acceptance suite for the core memory-governance behavior.

The suite deliberately tests both positive and negative behavior:

- explicit save
- indirect semantic recall
- sensitive-data denial before persistence
- explicit deletion
- post-deletion non-retrieval
- voice input entering the same pipeline

A stronger future evaluation harness should run each case against Demo Mode and the configured live stack and compare:

1. intent
2. authorization
3. memory side effect
4. retrieval grounding
5. trace completeness
6. latency

The expected outputs are behavioral contracts, not model preferences.
