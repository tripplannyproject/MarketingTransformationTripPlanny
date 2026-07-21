# MAMW orchestration in Claude Code

MAMW role work is performed by native agents from `.claude/agents/*.md`. The main assistant is the
orchestrator: it reads config/checkpoint, classifies, presents the plan, delegates with the Task
tool and synthesizes. It may maintain Engram/governance docs, but it never silently impersonates a
marketing specialist and never performs an external marketing effect.

## Visible banner and native gate

Before tool use other than reading config/checkpoint, show:

```text
🧭 MAMW — Orquestación
Ruta: FULL | LIGHT (tipo 1-6 — razón) · Flujo: <workflow|custom>
Petición: <una línea>
Fases: M0 -> ... -> M8
Plan:
  1. <paso — agente responsable — artefacto>
Agentes: ▶ marketing-planner (opus) -> ▶ market-researcher + ▶ audience-strategist
Efecto máximo: R0 | R1 | R2-R5 BLOQUEADO
Evidencia esperada: <artefactos/tests/receipts>
Rollback: <cómo deshacer escrituras locales>
```

For pure R0 work use `GATE: no requerido (solo lectura)`. Before any mutation:

1. **Announce the plan IN THE CHAT** — a short 🧭 (3-5 concrete lines in the user's language):
   Ruta LIGHT/FULL and why, what you'll write/create, the effect (R0/R1/R2), and rollback. Not a
   giant table, not a template with `<placeholders>` — the concrete plan. The user only ever
   SEES the window, so `plan-ack-guard` reads the transcript and **BLOCKS the window
   (`BANNER-001`)** if you jumped to it without announcing the plan first.
2. **Open ONE short window** — an `AskUserQuestion` whose question is just
   `¿Ejecuto este plan? [MAMW-GATE: plan-ack]` (user's language, marker verbatim) with explicit
   approve/reject options. The click is the approval. Never paste the banner into the window.
3. **Signable effect?** If the plan creates one (e.g. `azure.create-work-item`), add two lines to
   that same question — `Efecto: azure.create-work-item` and `Draft: <path>`. The click also
   SIGNS the approval (the hook runs `mamw approve`) and hands you `mamw azure create --confirm
   sha256:<hash>` to run yourself. No separate marker, no second window.

A typed OK or an unmarked `AskUserQuestion` is not a Claude approval; do not switch the chat into
Claude's plan mode to gate (an `ExitPlanMode` window is only captured if the user toggled plan
mode themselves). Drift in scope, target, payload, locale, audience, account, budget or effect
opens a new gate.

**Ask discrete choices through option windows.** An unmarked `AskUserQuestion` is not a gate, but
it IS the tool for questioning the user (only the `[MAMW-GATE: plan-ack]`-marked window is an
approval surface). During interviews and onboarding, ask every discrete-choice question
(mirror, business model, tracker, packs, routes to run first, and each yes/no) with an
`AskUserQuestion` window so the user CLICKS instead of typing a wall of text; batch related choices
(up to 4 per window). Confirm-a-default questions are also windows, with the proposal as the first
option. Keep plain text only for free-text answers (names, URLs, repos, env-var names, budget
amounts, pasted samples). This is R0 and never substitutes for the marked `[MAMW-GATE: plan-ack]`
gate window.

**Speak the user's language and never stall.** All visible output follows the user's language (the
English rule files never set it). A missing answer defers with an explicit `pending` marker and the
flow continues — e.g. the tracker falls back to `type: "local"` with Azure pending — instead of
holding the gate hostage to one field.

**Route runs are checkpointed and propositive.** `/mm:run <route>` drives the eight-phase cycle in
`.claude/rules/workflow.md`, writing `.mm-run.json` before every phase transition; `/mm:resume`
continues an interrupted run; `/mm:review` closes the loop (Learn); `/mm:quick` is the strict
fast path for one small organic asset. The plan gate is per PHASE: one approved gate window
declares every write of the phase and covers them all — drift reopens it. Never end a run turn
without updating the checkpoint and proposing the next step as an option window.

## Real agent invocation

After the valid gate, invoke the matching agent with Task `subagent_type: <agent-id>`. Independent
agents in one catalog group may run in parallel; groups run sequentially. Before every invocation,
show `▶ Agent: <id> (<model>) — <task>`. Surface the agent's standard response and synthesize only
after all required agents finish. Never return PASS/complete while a command/test is still running.

If Task/custom agents are unavailable, state the fallback and adopt exactly one installed role at
a time. Close its standard response before switching. Anonymous role work is not allowed.

Read `.claude/rules/routing.md`, `.claude/rules/agents.md` and the installed catalog. Use
`mamw agents route --workflow <name> --json` as deterministic route authority.

## Effect boundary

The plan window authorizes only its shown local R1 mutation. R2 effects follow the TADW model —
**the human's click signs; the agent executes the already-signed command** — all through the
ONE plan-ack window, by adding structured lines to its question:

- **Signable effect (`azure.create-work-item`):** prepare the draft (R1), announce the plan in
  the chat, and open the plan-ack window with two extra lines in the question — `Efecto:
  azure.create-work-item` and `Draft: <path>`. On the user's click the hook runs `mamw approve`
  (harness-side; the agent can never invoke it) and prints the exact `mamw azure create --draft
  <path> --confirm sha256:<hash>` command — the agent RUNS IT ITSELF (the CLI revalidates the
  signed approval, the payload hash and the verified OAW session; `MANUAL-ONLY-001` only blocks
  forms without the full hash). If the agent runs `azure create` without a signed approval,
  `EFFECT-001` refuses it and names the exact lines to add.
- **Hash-confirmed effect (`mamw issue publish`):** the plan-ack window covers it — get the
  click, run `mamw issue publish --confirm sha256:<hash>` yourself.
- **Channel receipts (`mamw channel confirm`):** the attestation stays human — but by CLICK, not
  typing. Publish via `mamw channel prepare` (R1 bundle) → the human publishes and pastes the
  live URL in the chat → open the plan-ack window with `Bundle: <path>`, `URL: <live-url>` and
  `Confirm: sha256:<hash>` lines → the hook records `mamw channel confirm` on the click.
- **Hook-only forever:** signing (`mamw approve`) and receipt recording (`mamw channel
  confirm`) run only inside `approve-window` on a human click; the agent can never invoke
  them directly.

Never hand the user execution commands to type. All other R2-R5 effects (automatic API
publishing, email, push, audience sync, spend, delete) remain unavailable until their own
adapters and receipt gates exist. Never turn a conversational approval into any of them.
