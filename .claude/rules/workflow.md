# MAMW — Workflow

MAMW runs an eight-phase marketing cycle. `/mm:run <route>` drives any catalog route through it;
`/mm:resume` continues an interrupted run. The cycle is what makes the orchestrator propositive:
after every phase it writes the checkpoint and PROPOSES the next step — it never ends a turn
without naming what comes next.

```text
Brief → Research → Strategy → Create → QA/Compliance → Package → Handoff → Learn
```

Routes come from `mamw agents route --workflow <name> --json` (deterministic authority). A route
may skip phases its plan does not need (e.g. `social-image-with-caption` collapses Research and
Strategy), but a skipped phase is recorded as `skipped`, never silently omitted.

## Phases

| # | Phase | Lead roles | Artifact (R1 draft) |
|---|-------|-----------|---------------------|
| MWF-1 | Brief | `marketing-planner` | campaign/work brief in the knowledge KB |
| MWF-2 | Research | `market-researcher`, `audience-strategist` | insights + audience notes |
| MWF-3 | Strategy | `campaign-strategist`, `media-strategist` | channel/budget/message plan |
| MWF-4 | Create | `creative-director`, `editorial-strategist`, `multimodal-producer` | content drafts |
| MWF-5 | QA/Compliance | `governance-reviewer`, `localization-strategist` | QA + claims/rights/locale review |
| MWF-6 | Package | `channel-operator` | content package valid per `content-package` schema, preflight ready |
| MWF-7 | Handoff | human click signs · agent executes | effect/receipt windows sign (`mamw approve` / `mamw channel confirm` run in the hook); the agent runs the signed `--confirm sha256:<hash>` commands |
| MWF-8 | Learn | `performance-analyst`, `marketing-analyst` | learnings + next-iteration brief proposal (`/mm:review`) |

Every phase except Handoff is R0/R1: reads, interviews and local drafts behind the plan gate.
MWF-7 is the only phase that touches R2+, and it follows the ONE-window model: the orchestrator
prepares payloads, announces the plan in the chat, and opens the `[MAMW-GATE: plan-ack]` window —
for a signable effect adding `Efecto:`/`Draft:` lines (the hook signs `mamw approve` on the
click), for `mamw issue publish` the plain window; the agent then EXECUTES the signed
`--confirm sha256:<hash>` command itself. For channels without an API adapter,
`mamw channel prepare` builds the paste-ready bundle; after the human publishes and pastes the
live URL in the chat, adding `Bundle:`/`URL:`/`Confirm:` lines to the same window records
`mamw channel confirm` on the click. The human never types commands; every publication leaves a
verifiable trail. No route ends in an automatic publication.

MWF-8 Learn closes the loop: `/mm:review` reads the Handoff receipts and the DAMW-certified
metrics (read-only federation — MAMW never invents metrics), writes `learnings.md` into the
campaign's engram folder and proposes the next-iteration brief. Until Learn runs, the checkpoint
keeps `learn: pending` — a finished Handoff is NOT a finished cycle.

## One gate per phase

The plan gate is per PHASE, not per file: entering a phase, present ONE `ExitPlanMode` plan that
declares every write the phase will make (paths, artifacts, KB syncs) and execute the whole phase
under that approval. Any write outside the declared set — or any scope drift — reopens the gate.
This keeps a full run at ~8 meaningful approvals instead of one per file, without weakening what
each approval covers.

## Checkpoint — `.mm-run.json`

`.mm-run.json` at the project root is the source of truth between sessions. Write it BEFORE moving
to the next phase, not after.

```json
{
  "run_id": "<route>-<serial>",
  "route": "weekly-content-system",
  "status": "in_progress",
  "work_item": { "type": "campaign", "id": "", "title": "" },
  "kb_path": ".mamw/kb/projects/<project-id>/engram/campaigns/<id>/",
  "phases": {
    "brief": { "status": "pending", "artifacts": [] },
    "research": { "status": "pending", "artifacts": [] },
    "strategy": { "status": "pending", "artifacts": [] },
    "create": { "status": "pending", "artifacts": [] },
    "qa_compliance": { "status": "pending", "artifacts": [] },
    "package": { "status": "pending", "artifacts": [] },
    "handoff": { "status": "pending", "artifacts": [] },
    "learn": { "status": "pending", "artifacts": [] }
  },
  "resume_hint": ""
}
```

- `status` per phase: `pending` | `in_progress` | `done` | `skipped` (with a reason in `artifacts`).
- `resume_hint` states the exact next action in the user's language — it is what `/mm:resume`
  reads first and what the orchestrator proposes at the end of every turn.
- The checkpoint is workflow state, not gate state: it never substitutes a plan-ack or a signed
  effect approval, and editing it grants nothing. Writes to it are ordinary R1 mutations inside an
  approved plan.
- If `status = in_progress`, continue with `/mm:resume`; do not restart phases whose artifacts
  still exist.

## Being propositive

At the end of every phase (and every interrupted turn):

1. Update `.mm-run.json` with the phase result and a fresh `resume_hint`.
2. Tell the user, in their language: what was produced, what phase follows, which roles it needs
   and which gate it will require.
3. Offer the continuation as an option window (`AskUserQuestion`): continue now / adjust /
   pause. Never end a run turn with a bare summary and no proposed next step.
