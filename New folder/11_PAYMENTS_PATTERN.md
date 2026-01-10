# Payments Pattern

Provider:
- LemonSqueezy

Rules:
- Frontend never grants credits
- Credits are added only via webhook
- Each purchase creates a ledger entry
- Webhook events must be idempotent
