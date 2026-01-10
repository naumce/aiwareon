# Credits Pattern

Pattern name: Ledger-Based Credits

Rules:
- Credits are tracked via a ledger (event-based)
- No single mutable "credits" field is authoritative
- Balance is calculated as SUM(ledger.delta)
- Every credit change must have a reason

Generation cost:
- Standard image: 1 credit
- High quality image: 2 credits
