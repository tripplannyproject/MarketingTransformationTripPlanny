---
name: mm-review
description: Close the loop on a route run (MWF-8 Learn) — read the Handoff receipts and DAMW-certified metrics, compare outcomes against the brief's objective, write learnings.md into the campaign engram and propose the next-iteration brief. Never invents metrics; uncertified numbers are reported as unavailable.
---

# MAMW learn & review

Run the Learn phase for a completed (or partially completed) route run: receipts + certified
metrics → learnings → the proposal for the next iteration. This is what turns the pipeline into a
marketing system.

## Inputs obligatorios

- `.mm-run.json` with a `handoff` phase that is `done` or has at least one receipt under
  `.mamw/receipts/` (azure, channel). If there are no receipts at all, say so and propose finishing
  Handoff first — Learn without outcomes is speculation.
- The campaign brief and artifacts under the run's `kb_path`.
- DAMW-certified metrics if the federation exposes them (read-only). MAMW NEVER computes or invents
  performance numbers: anything uncertified is reported as `unavailable`, with the exact source it
  would need.

## Procedimiento

1. Read the checkpoint, the brief's objective and every receipt (what was actually published or
   created, where, when, by whom).
2. Collect certified metrics per receipt where DAMW provides them; mark the rest `unavailable`.
   Distinguish clearly: receipt facts (it was published) vs performance facts (how it did).
3. Compare outcomes against the brief's stated objective and the strategy's plan. Delegate analysis
   to `performance-analyst` / `marketing-analyst`; announce each agent visibly.
4. Behind one phase gate, write `learnings.md` into the campaign's engram folder — what worked,
   what did not, what is unknown and why, and the concrete recommendation — then `mamw kb sync`.
5. Update `.mm-run.json`: `learn: done` with the learnings artifact, and set the run `status` to
   `done` if every other phase is `done`/`skipped`.
6. Close propositively: present the next-iteration brief proposal (objective, audience, channel and
   budget adjustments grounded in the learnings) and offer as an option window to start it now with
   the `mm-run` skill, adjust it, or stop.

## Salida auditable

`learnings.md` in the campaign engram (synced), the updated `.mm-run.json`, and a visible summary
separating receipt facts, certified metrics, unavailable data and the proposed next brief.

## Límites y gates

Learn is R0/R1: it reads receipts/metrics and writes local docs behind the phase gate. It never
re-publishes, never spends and never edits receipts — receipts are immutable evidence. Uncertified
metrics are never presented as facts.
