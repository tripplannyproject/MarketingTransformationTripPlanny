---
name: mm-resume
description: Resume an interrupted MAMW route run — read the .mm-run.json checkpoint, verify which phase artifacts still exist, show run status (route, work item, phases, KB path) and continue from resume_hint without repeating completed phases.
---

# MAMW run resume

Reconstruct the minimal context of an interrupted route run from `.mm-run.json` and continue from
`resume_hint`. Do not rerun phases whose artifacts still exist.

## Inputs obligatorios

- `.mm-run.json` at the project root. If absent, say there is no active run and propose starting
  one with the `mm-run` skill (`/mm:run` in Claude), listing the catalog routes.
- `.mamw/project.json`, the active runtime config and the `workflow` rule.

## Procedimiento

1. Read `.mm-run.json`. If `status` is `done`, report the finished run and propose the next route
   as an option window instead of resuming.
2. Verify each phase marked `done`: do its recorded artifacts still exist (locally or in the
   knowledge KB)? A missing artifact demotes the phase to `pending` with a note — say so
   explicitly; never assume work that is no longer there.
3. Show the run status in the user's language: route, work item, `kb_path`, per-phase status with
   artifacts, and the current `resume_hint`.
4. If a knowledge/logs KB is linked, `mamw kb sync` first so resumed phases read the latest
   documents.
5. Load only the artifacts the next incomplete phase needs — not the whole history.
6. Propose the continuation as an option window: continue with the next phase now / adjust the
   plan / abandon the run (sets `status: "abandoned"`, keeps artifacts). On continue, hand control
   to the `mm-run` procedure at that phase — same gates, same checkpoint discipline.

## Salida auditable

The reconciled `.mm-run.json` (demotions noted, refreshed `resume_hint`) and a visible status
report of phases, artifacts and the proposed next action.

## Límites y gates

Resuming grants nothing: every mutation still passes the plan gate and R2+ still requires its
effect/receipt window (signing stays on the human's click). The
checkpoint is workflow state, not gate state. Reads and the status report are R0; checkpoint
reconciliation is an R1 write behind the gate.
