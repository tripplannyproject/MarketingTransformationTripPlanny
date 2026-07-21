# MAMW — MarketingTransformationTripPlanny

This project uses Marketing Agent Manager WorkFlow (MAMW).

**Always reply in the user's language.** The rule files are in English, but that never sets the
conversation language: if the user writes in Spanish, every visible output — interview questions,
option windows, plan banners, summaries — is in Spanish. Config keys and schema values stay
canonical.

Read the root `AGENTS.md` before working. Start or reconfigure onboarding with `/mm:start` (the
`mm-start` skill, also invocable as `/mm-start` once it loads). Run any catalog route with
`/mm:run <route>`, resume with `/mm:resume`, close the loop with `/mm:review` (Learn) and use
`/mm:quick` for one small organic asset — the eight-phase cycle and the `.mm-run.json` checkpoint
are defined in `.claude/rules/workflow.md`. If a command is not listed,
reload the Claude Code window so it picks up the installed skills. The base branch is
`main`.
Read `.claude/rules/engram.md` and READ the knowledge engram (`.mamw/kb/`) before inventing brand
context. Read `.claude/rules/orchestration.md` and `.claude/rules/approvals.md` before a mutation. Gate
every mutation TADW-style: present the full 🧭 banner IN THE CHAT, then open the SHORT marked
window — an `AskUserQuestion` asking `¿Ejecuto este plan? [MAMW-GATE: plan-ack]` with explicit
approve/reject options in the user's language; never the banner inside the window. Never switch
the chat into Claude's plan mode for the gate (if the user already toggled plan mode, an
approved `ExitPlanMode` window also counts). A typed OK or an unmarked question does not unlock
Claude writes.

Read `.claude/rules/agents.md`, `.claude/rules/routing.md` and the installed agent catalog. Delegate
role work to `.claude/agents/<role>.md` with Task after approval, announce the role/model visibly,
and surface its standard response. Independent agents may fan out only within the same catalog
group; the orchestrator synthesizes after all required results finish.

**OAW session is required.** Before doing ANY work you must have an active OAW session that grants
`mamw`. The CLI blocks every command except `help`/`version`/`doctor` until `oaw login`, and the
session guard blocks each chat turn. If blocked, STOP and tell the user to run `oaw login` (or ask
their admin for the `mamw` App Role); do not attempt workarounds.

No workflow command authorizes publication, messaging, audience synchronization, PII processing or
spend unless the corresponding MAMW artifact and human gate are implemented and valid.
