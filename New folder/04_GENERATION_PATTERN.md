# Generation Pattern

Pattern name: Deterministic Generation Pipeline

States:
- queued
- processing
- succeeded
- failed

Rules:
- Credits are deducted BEFORE generation
- On failure, credits are refunded
- Generation status is persisted
- UI reflects generation state only
- No assumptions of success

Providers:
- Gemini (current)
- OpenAI (future, optional)

Provider must be abstracted behind a service interface.
