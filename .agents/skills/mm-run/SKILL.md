---
name: mm-run
description: Drive any catalog route (weekly-content-system, paid-campaign, social-publish, feature-launch, b2c-lifecycle…) through the seven-phase MAMW marketing cycle — Brief, Research, Strategy, Create, QA/Compliance, Package, Handoff — checkpointing every phase in .mm-run.json and proposing the next step so the run survives interruptions.
---

# MAMW route runner

Execute one route end to end through the marketing cycle in the `workflow` rule
(Brief → Research → Strategy → Create → QA/Compliance → Package → Handoff), writing the
`.mm-run.json` checkpoint before every phase transition. All work is R0/R1; Handoff signs R2
payloads through the effect/receipt windows (the human's click signs, the hook runs `mamw
approve`/`mamw channel confirm`) and the agent executes the signed `--confirm` commands itself.

## Inputs obligatorios

- The route name (one of the catalog workflows). If missing or ambiguous, list the routes from
  `mamw agents route --workflow <name> --json` and ask with an option window.
- `.mamw/project.json`, the active runtime config, the `workflow`/`routing`/`agents` rules and the
  installed agent catalog.
- Any existing `.mm-run.json`: if it is `in_progress` for another route, ask before replacing it —
  offer to continue that run (`mm-resume`) instead.

## Procedimiento

1. Resolve the route with `mamw agents route --workflow <route> --json` (deterministic authority).
   Map the route steps onto the seven phases; phases the route does not need are recorded as
   `skipped` with a reason, never silently omitted.
2. Initialize or update `.mm-run.json` exactly as specified in the `workflow` rule: `run_id`,
   `route`, `work_item`, `kb_path` under the knowledge KB, all phases `pending`, and a
   `resume_hint` in the user's language.
3. Drive each phase in order. Per phase: announce `▶ Agent: <id> (<model>) — <task>`, delegate to
   the catalog roles for that phase, and store artifacts under `kb_path` (sync with `mamw kb sync`
   when linked). Ask discrete choices through option windows; reply in the user's language; a
   missing answer defers with a `pending` marker — never stall the run.
4. Gate every mutation batch: Claude presents the full 🧭 banner in the chat, then opens the
   SHORT marked window — `AskUserQuestion` asking `¿Ejecuto este plan? [MAMW-GATE: plan-ack]`
   with explicit approve/reject options; never the banner inside the window (an approved
   `ExitPlanMode` also counts if the user already toggled plan mode) — with the
   exact writes; Codex ends the proposal with `[MAMW-PLAN-OFFER]` and waits for the written `OK`.
   Scope drift reopens the gate.
5. BEFORE moving to the next phase, write the finished phase into `.mm-run.json` (`done` +
   artifact paths) and refresh `resume_hint` with the exact next action.
6. End every turn propositively: state what was produced, which phase follows, the roles and gate
   it needs, and offer the continuation as an option window (continue now / adjust / pause).
7. Handoff (MWF-7) signs by the ONE plan-ack WINDOW: validate the package against the
   `content-package` schema, run the preflight, announce the plan in the chat, then open the
   `[MAMW-GATE: plan-ack]` window — for a signable effect add `Efecto:`/`Draft:` lines (the hook
   signs on the click); for `mamw issue publish` the plain window suffices — and run the signed
   `--confirm sha256:<hash>` command yourself. Channel receipts: add `Bundle:`/`URL:`/`Confirm:`
   lines to the same window after the human pastes the live URL.
   Never hand the human commands to type.
8. On completion set `status: "done"`, record receipts/pending items, and report `mamw doctor`
   deviations if any.

## Salida auditable

`.mm-run.json` with every phase `done`/`skipped` and its artifacts; drafts and packages under the
knowledge KB (`kb_path`), synced when a KB is linked; for Handoff, the prepared payload, its
SHA-256 and the human commands — plus receipts once the human executes.

## Límites y gates

Everything up to Package is R0/R1 behind the plan gate. `mamw approve` and `mamw channel confirm`
run only in the hook on the human's click; execution commands are agent-runnable ONLY with the
full `--confirm sha256:<hash>` after their gate window. Never invent tracker credentials,
budgets or approvers; unanswered fields record as `pending`. The checkpoint is workflow state, not
gate state — it authorizes nothing by itself.
