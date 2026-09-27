# Security notes

VaultMind is a hackathon reference implementation, not a security certification.

## Secret handling

Provider credentials are server-side environment variables. Do not place them in `VITE_*` variables, source code, screenshots, demo transcripts, or the repository.

## Sensitive memory

The server privacy gate blocks known credential classes before Lyzr/Qdrant persistence calls. This is a defense-in-depth control, not a guarantee that every possible sensitive datum can be classified perfectly.

## Deletion

FORGET deletes the application-level Qdrant point in live mode. VaultMind does not claim physical-media erasure or cryptographic destruction by default.

## Omi webhook

Use HTTPS and configure `OMI_WEBHOOK_TOKEN` for the application-side webhook adapter. Rotate the secret if it is exposed.
