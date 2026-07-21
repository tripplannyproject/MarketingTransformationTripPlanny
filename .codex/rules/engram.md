# MAMW — Engram

MAMW's memory lives in TWO git repos, separate from the product repo:

- **Knowledge engram** (docs KB) — cloned at `.mamw/kb/`; `projects/<project-id>/engram/` holds
  brand DNA, campaign briefs, packages, decisions and `changes.jsonl` trails.
- **Logs engram** (conversation log) — its own repo, cloned at `.mamw/logs-kb/`;
  `<project-id>/sessions/` holds per-session chat logs and summaries.

## Read before inventing

Before answering questions about the brand, past campaigns, decisions or examples, READ the
knowledge engram (`.mamw/kb/projects/<project-id>/engram/`, starting with `brand-dna.md` and the
active campaign folder). Never invent brand context that the engram already records; if the KB is
linked but not cloned, run `mamw kb sync` first. If nothing is linked, say so explicitly.

## Write, always

- Route artifacts (briefs, drafts, packages) are written under the run's `kb_path` and pushed with
  `mamw kb sync` at phase ends — this is part of the `workflow` rule, not optional.
- The `engram-capture` hook auto-appends every project-file change to the active campaign's
  `changes.jsonl` — a safety net, not a replacement for writing real docs.
- The `engram-log` hook appends each chat turn to `.mamw/logs-kb/<project-id>/sessions/` and
  renders a session summary on Stop. It writes locally even before the logs repo is linked;
  `mamw logs sync` pushes. Privacy: 200-char prompt previews only; `MAMW_ENGRAM_LOG=off` disables,
  `MAMW_ENGRAM_LOG_PROMPT=off` keeps only character counts. Never log secrets or pasted tokens.

## Source of truth for the repos

`mamw kb link` / `mamw logs link` persist the repo URLs in `.mamw/project.json` (primary). The
runtime config's `engram` block is a fallback only — onboarding must still run the `link` commands.
`mamw doctor` reports link/clone status and whether the logs engram is receiving entries.

## Boundaries

Both hooks are pure observability: they never block, never approve, and their files are workflow
memory, not gate state. Syncing an engram never authorizes any external effect.
