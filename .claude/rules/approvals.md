# MAMW human approvals

Two independent axes apply:

- **Artifact gate:** persistent human approval bound to the exact artifact/payload and appropriate
  role. Required for `spec`, `plan`, `brand`, `privacy`, `legal`, `locale`, `budget`, `activation`,
  `verify`, `release` and `change` as applicable.
- **Turn gate (`plan-ack`):** short-lived permission to execute the already-presented plan now.

Claude Code has two capture surfaces, both harness-side events the agent cannot forge. The plan
is MAMW's **banner artifact**, not Claude's plan mode — the chat stays in its normal mode, and
the banner is always presented IN THE CHAT where it renders readably:

- **Primary — the ONE marked confirmation window.** After the plan is announced in the chat
  (enforced by `BANNER-001`), an `AskUserQuestion` whose question is `¿Ejecuto este plan?
  [MAMW-GATE: plan-ack]` (user's language, marker verbatim) with explicit approve/reject options
  (e.g. «Apruebo el plan» / «No apruebo»). The user's CLICK is the receipt — its hash binds the
  window payload to the OAW session, MAMW turn nonce and expiry; a rejecting option records
  nothing and stops execution. If the plan creates a signable effect, adding `Efecto:` +
  `Draft:` lines to the question makes the same click also SIGN the effect (and `Bundle:`/`URL:`/
  `Confirm:` lines record a channel receipt). One marker, one window — no separate effect/receipt
  markers.
- **Also accepted — native `ExitPlanMode` window,** only when the session is ALREADY in plan
  mode (a user toggle). `approve-window` reads the exact approved plan (inline fields on older
  runtimes; the plan FILE on current runtimes, which pass no plan parameter), requires the
  banner structure in it (`PLAN-ACK-005`) and binds its hash the same way (the `tool_use_id`
  is captured for audit but the turn is scoped by session + nonce + expiry). The agent never
  switches the chat into plan mode to gate a mutation.

Generic (unmarked) `AskUserQuestion` text and typed approval words never create a receipt. The
agent never edits gate state or manufactures approvals; reading the gate state (e.g.
`cat .mamw/.mm-plan-ack.json`) is allowed for diagnosis — mutating it is `PLAN-ACK-000`.

The turn gate (`plan-ack`) authorizes R1 only. A real effect (R2+) needs a **persistent signed
approval** produced by `mamw approve` — bound by a per-machine HMAC key to the exact effect,
payload hash, actor and scope. The signature is produced by the HUMAN'S CLICK on the plan-ack
window when it carries `Efecto:` + `Draft:` lines: the `approve-window` hook signs IN PROCESS
(0.12.1 — never spawning `mamw`, which the harness PATH may lack) — the agent still can never
invoke `mamw approve` — and the agent then EXECUTES the signed command itself (`mamw azure
create` / `mamw issue publish` with the full `--confirm sha256:<hash>`; the CLI revalidates
signature, hash and OAW session). A signed
approval authorizes an effect only where an adapter also exists. Email, push, social publishing
and spend stay blocked because their adapters do
not exist yet — not because approvals are unavailable. The agent must never run `mamw approve`
or `mamw channel confirm` (the effect/receipt windows run them in the hook on the human's
click); execution commands without the full `--confirm sha256:<hash>` stay blocked
(`MANUAL-ONLY-001`). The human never types commands.
