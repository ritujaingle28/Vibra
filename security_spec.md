# Security Spec

## Data Invariants
- A track record (recent or liked) must belong to a specific user.
- A user can only read, write, and list their own tracks.
- `timestamp` must be a valid number (e.g. server timestamp or client timestamp).

## Dirty Dozen Payloads
(Assuming these fail appropriately)
- No user ID matching request auth.
- Extra fields injected.
- Missing required fields.
- Type mismatch.
- ID poisoning.
