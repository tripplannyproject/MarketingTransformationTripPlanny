# MAMW — Workflow

MAMW runs an eight-phase marketing cycle. the `mm-run` skill drives any catalog route through it;
the `mm-resume` skill continues an interrupted run. The cycle is what makes the orchestrator propositive:
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
| MWF-7 | Handoff | human signs · agent executes | human runs `mamw approve` / `mamw channel confirm` at the CLI; after the typed `OK` the agent runs the signed `--confirm sha256:<hash>` commands |
| MWF-8 | Learn | `performance-analyst`, `marketing-analyst` | learnings + next-iteration brief proposal (the `mm-review` skill) |

Every phase except Handoff is R0/R1: reads, interviews and local drafts behind the plan gate (`[MAMW-PLAN-OFFER]` + written `OK`).
MWF-7 is the only phase that touches R2+: the orchestrator prepares payloads and shows the exact
hash and execution command in the banner; SIGNING stays human (`mamw approve` at the CLI on this
mirror), and after the typed `OK` the agent EXECUTES the signed `--confirm sha256:<hash>` command
itself (the CLI revalidates approval, hash and OAW session). For channels without an API adapter,
`mamw channel prepare` builds the paste-ready bundle and — after the human publishes —
`mamw channel confirm --url <live-url>` (human, it attests an external reality) records the
signed receipt, so every publication leaves a verifiable trail. No route ends in an automatic
publication.

MWF-8 Learn closes the loop: the `mm-review` skill reads the Handoff receipts and the DAMW-certified
metrics (read-only federation — MAMW never invents metrics), writes `learnings.md` into the
campaign's engram folder and proposes the next-iteration brief. Until Learn runs, the checkpoint
keeps `learn: pending` — a finished Handoff is NOT a finished cycle.

## One gate per phase

The plan gate is per PHASE, not per file: entering a phase, present ONE plan ending in `[MAMW-PLAN-OFFER]` that
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
  "deliverables": [
    { "id": "", "name": "", "type": "", "status": "pending", "link": "", "export": "" }
  ],
  "resume_hint": ""
}
```

- `status` per phase: `pending` | `in_progress` | `done` | `skipped` (with a reason in `artifacts`).
- **Deliverables contract (`DELIV-001`).** `deliverables[]` is the run's binding list of what it must
  hand over — the thing the orchestrator must NEVER lose track of between phases. Each entry has an
  `id`, human `name`, `type` (post/story/carousel/doc/export/link…), `status`
  (`pending` | `produced` | `accepted`) and, once produced, an accessible `link` plus its `export`.
  - **Declare it in Brief.** Derive the concrete deliverables from the route + brief and write them
    into `deliverables[]` at MWF-1, all `pending`. A run with no declared deliverables is not briefed.
  - **Reconcile at Package/Handoff.** Every declared deliverable must be `accepted` with a non-empty
    `link` before the run can be reported complete. Add nothing to the package that is not in the
    contract; if scope grew, add the entry — never hand over silently.
  - **Never close with gaps.** The run does not reach a global `done`/Learn while any deliverable is
    `pending`/`produced` or lacks a `link`; the propositive summary enumerates the missing ones.
    The contract is workflow state, not a gate — it authorizes nothing; it just makes forgetting
    impossible.
  - **Link must resolve NOW (`DELIV-LINK-NOW`).** "Accessible" means reachable **at presentation
    time**, not eventually. Resolve the `link` per source: a Canva/design piece uses its live
    `edit_url`; a doc that is **already committed AND pushed** uses its `github.com/<org>/<repo>/blob/<branch>/<path>`
    URL; a doc still **local-only** (engram artifact written during Create, not yet pushed) uses its
    **clickable local file path** (IDE-clickable). NEVER present a GitHub `blob` URL for content that
    is not on the remote yet — it 404s until the push lands. If a GitHub link is required, commit and
    push first, then present it.
- `resume_hint` states the exact next action in the user's language — it is what the `mm-resume` skill
  reads first and what the orchestrator proposes at the end of every turn.
- The checkpoint is workflow state, not gate state: it never substitutes a plan-ack or a signed
  effect approval, and editing it grants nothing. Writes to it are ordinary R1 mutations inside an
  approved plan.
- If `status = in_progress`, continue with the `mm-resume` skill; do not restart phases whose artifacts
  still exist.

## Being propositive

At the end of every phase (and every interrupted turn):

1. Update `.mm-run.json` with the phase result and a fresh `resume_hint`.
2. Tell the user, in their language: what was produced, what phase follows, which roles it needs
   and which gate it will require.
3. Report the deliverables contract: `producidos / aceptados / faltantes`, and list every produced
   deliverable **with its accessible link** (`DELIV-LINK`) — one line per deliverable, never a bare
   filename:

   ```text
   - **<nombre del entregable>** — 🔗 <link editable/accesible> · 📎 <export>
   ```

   A deliverable presented without a link counts as missing, not done. This is also the exact format
   used inside the `ACCEPT-001` window when presenting a finished deliverable for acceptance.
4. Offer the continuation as an option window (a concise numbered option list in text — Codex has no option window): continue now / adjust /
   pause. Never end a run turn with a bare summary and no proposed next step.
