# MAMW human approvals

Two independent axes apply:

- **Artifact gate:** persistent human approval bound to the exact artifact/payload and appropriate
  role. Required for `spec`, `plan`, `brand`, `privacy`, `legal`, `locale`, `budget`, `activation`,
  `verify`, `release` and `change` as applicable.
- **Turn gate (`plan-ack`):** short-lived permission to execute the already-presented plan now.

In Codex, the turn gate is the user's written OK for the exact prior `[MAMW-PLAN-OFFER]`. The agent
never edits `.mamw/.mm-plan-ack.json` or `.mamw/.mm-plan-pending.json`, never manufactures approval
records, and never treats an OK as authorization for publication, messaging, PII synchronization or
spend.

The turn gate authorizes R1 only. A real effect (R2+) needs a **persistent signed approval** from
`mamw approve` — HUMAN-ONLY, bound by a per-machine HMAC key to the exact effect, payload hash, actor
and scope. A signed approval authorizes an effect only where an adapter also exists: today that is
`mamw issue publish` and `mamw azure create` (both MANUAL-ONLY, hash-bound, receipt-writing). Email,
push, social publishing and spend stay blocked because their adapters do not exist yet — not because
approvals are unavailable. The agent must never run `mamw approve` or `mamw azure create`; the hooks
(`MANUAL-ONLY-001`) block them.
