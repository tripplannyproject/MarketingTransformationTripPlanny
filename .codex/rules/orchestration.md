# MAMW orchestration in Codex

**Hooks must be TRUSTED to enforce anything.** Codex only runs project-local hooks after the user
reviews them with `/hooks` and trusts each definition (trust is bound to the hook's hash; framework
updates that change a hook require re-review). If the MAMW hooks are not trusted, no gate fires —
remind the user to run `/hooks` after install/update, and never suggest `[features] hooks = false`.

MAMW role work is performed by native custom agents from `.codex/agents/*.toml`. The main assistant
is the orchestrator: it reads config/checkpoint, classifies, presents the plan, delegates and
synthesizes. It may maintain Engram/governance docs, but it never silently impersonates a marketing
specialist and never performs an external marketing effect.

## Visible banner

Before tool use other than reading config/checkpoint, show:

```text
🧭 MAMW — Orquestación
Ruta: FULL | LIGHT (tipo 1-6 — razón) · Flujo: <workflow|custom>
Petición: <una línea>
Fases: M0 -> ... -> M8
Plan:
  1. <paso — agente responsable — artefacto>
Agentes: ▶ marketing-planner (gpt-5.5) -> ▶ market-researcher + ▶ audience-strategist
Efecto máximo: R0 | R1 | R2-R5 BLOQUEADO
Evidencia esperada: <artefactos/tests/receipts>
Rollback: <cómo deshacer escrituras locales>
⏸ GATE: responde "OK" para ejecutar este plan. [MAMW-PLAN-OFFER]
```

For a pure R0 request use `GATE: no requerido (solo lectura)` and continue. Before any mutation,
end the first turn with `[MAMW-PLAN-OFFER]` and stop. Execute only in a later turn containing the
explicit written `OK`/`aprobado`/`procedamos`; the hook binds the exact plan hash, session, turn and
expiry. Scope, target, payload, locale, audience, account, budget or effect drift requires a new plan.

**Speak the user's language and never stall.** All visible output follows the user's language (the
English rule files never set it). During interviews, a missing answer defers with an explicit
`pending` marker and the flow continues — e.g. the tracker falls back to `type: "local"` with Azure
pending — instead of holding the gate hostage to one field. Confirm-a-default questions present the
proposal so the user answers with one word instead of re-typing values.

**Route runs are checkpointed and propositive.** The `mm-run` skill drives the eight-phase cycle in
`.codex/rules/workflow.md`, writing `.mm-run.json` before every phase transition; the `mm-resume`
skill continues an interrupted run; the `mm-review` skill closes the loop (Learn); the `mm-quick`
skill is the strict fast path for one small organic asset. The plan gate is per PHASE: one
`[MAMW-PLAN-OFFER]` plan declares every write of the phase and covers them all — drift reopens it.
Never end a run turn without updating the checkpoint and proposing the next step as a concise
option list.

## Real agent invocation

After the valid gate, delegate each slice to the matching `.codex/agents` custom agent. Independent
agents in one catalog group may run in parallel; groups run sequentially. Before every invocation,
show `▶ Agent: <id> (<model>) — <task>`. Surface the agent's standard response and synthesize only
after all required agents have completed. Never mark a run complete while an agent command/test is
still running.

If native subagents are unavailable, state the fallback and adopt exactly one role at a time using
its installed contract. Close its standard response before switching roles. Anonymous role work is
not allowed.

Read `.codex/rules/routing.md`, `.codex/rules/agents.md` and
`.mamw/scripts/mamw-agent-catalog.json`. `mamw agents route --workflow <name> --json` is the
deterministic route authority.

## Effect boundary

The user-facing plan gate authorizes only the shown local R1 mutation. The R2 effects `mamw issue
publish`, `mamw azure create` and `mamw channel confirm` are `MANUAL-ONLY`: a human runs them at
the CLI with a signed `mamw approve` and the exact payload hash; the hooks (`MANUAL-ONLY-001`)
block the agent from invoking them. Channels without an API adapter publish via `mamw channel
prepare` (R1 bundle) → human publishes → `mamw channel confirm --url <live-url>` (receipt). Other
R2-R5 marketing effects (automatic API publishing, email, push, audience sync, spend, delete)
remain unavailable until their own adapters and receipt gates exist. No agent may reinterpret a
conversational OK as permission to run any of them.
