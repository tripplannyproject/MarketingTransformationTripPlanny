# MAMW Agent Instructions

These instructions apply to the MAMW framework repository and are installed as project guidance
when MAMW is initialized in another repository.

## Language

**Always reply in the user's language.** These rule files are written in English, but that never
sets the conversation language: if the user writes in Spanish, every visible output — interview
questions, option windows, plan banners, summaries, pending notes — is in Spanish (same for any
other language). Config keys, schema values and receipts stay in their canonical form.

## Authority boundaries

- PAMW owns opportunity, product initiative, Epic and Feature.
- MAMW owns governed marketing execution objects and its own Engram only.
- DAMW alone certifies marketing metrics from governed gold data.
- OAW owns session identity, framework roles and the shared framework catalog.
- OAW login does not grant Azure DevOps access. Azure PAT/OAuth/MCP authority and routing are
  validated independently by the Azure adapter.
- A human business authority owns the total budget ceiling; MAMW may only allocate within it.

## Codex hooks require TRUST (one-time per hook hash)

In Codex CLI, project-local hooks (`.codex/hooks.json`) only run after the user reviews and
trusts them: run `/hooks` inside Codex after `mamw init` or any `mamw update --apply` that
changed a hook, and trust the MAMW hook definitions. Until trusted, the hooks — and therefore
EVERY MAMW gate on the Codex mirror — do not execute. Trust is bound to each hook's hash, so
framework updates that modify a hook require re-review. Never advise disabling hooks
(`[features] hooks = false`); the installer rejects that configuration as unsafe.

## OAW session is required

Before doing ANY work in this framework you must have an active OAW session that
grants `mamw`. Enforcement:
- CLI: every command except `help`/`version`/`doctor` is blocked until `oaw login`.
- Chat: the OAW session guard blocks each turn otherwise.
If blocked, STOP and tell the user to run `oaw login` (or, if their role lacks
`mamw`, to ask their admin for the `mamw` App Role). Do not attempt workarounds.

## Safety invariants

- Never publish, send, enroll, synchronize PII, mutate an external account or spend without the
  exact approved artifact, actor, account, locale, window and payload hash.
- A real external effect (R2+) requires a persistent, signature-verified human approval bound to the
  exact payload hash (`mamw approve`), then writes a receipt. `mamw approve` and `mamw azure create`
  are HUMAN-ONLY: never run them as an agent (even via `env` or an absolute path) — the hooks block
  them. Prepare the payload (`mamw azure prepare`), show the plan, and let the human sign and execute.
- Never request, print or persist tokens in tracked files, prompts, logs or receipts. Azure DevOps
  uses its own PAT (`tracker.pat_env`); OAW login never authorizes Azure.
- Treat provider state as external truth for delivery/spend and reconcile ambiguous outcomes.
- Treat every connector as default-deny until its capabilities and effects are classified.
- Keep organization, brand, market, locale and account scope explicit.
- Translation is not automatically localization. Regional variants require the locale profile,
  terminology and native-market review defined by their risk.
- Read-only inspection is R0. Before any mutation, show the plan and obtain a current human
  `plan-ack`: Claude Code uses its native `ExitPlanMode` confirmation window; Codex waits for a
  written `OK`/`aprobado`/`procedamos` in a later user turn.
- A turn-level OK never substitutes the persistent artifact/payload approval required for R2–R5.
  Scope, target, locale, audience, account, budget or payload drift invalidates the prior gate.
- Codex plans that await typed approval end with `[MAMW-PLAN-OFFER]`; Claude approvals come only
  from the exact plan returned by a successful `ExitPlanMode`.
- Image-generation requests originate in an approved `Design.md` companion contract and authorized
  reference manifest. Final logos, legal, prices, CTA and exact overlay copy are deterministic layers.
- Marketing role work is delegated to the matching native agent in `.codex/agents` or
  `.claude/agents`, following `.mamw/scripts/mamw-agent-catalog.json`. The orchestrator classifies,
  gates and synthesizes; it never emits anonymous specialist work. If native delegation is not
  available, adopt one declared role at a time and show its standard response before switching.
- Announce every role as `▶ Agent: <id> (<model>) — <task>`. Never report complete/PASS/FAIL while
  delegated work or verification is still running.
- Interframework rules are read with `mamw engram show|check`; release requires
  `mamw engram release-check` to see MAMW as `current` in OAW_Docs.
- An agent may prepare an issue draft, but `mamw issue publish` is MANUAL-ONLY and requires a human
  CLI invocation with the exact draft hash and a signature-verified OAW session.

## Development conventions

- Node.js ESM, Node 20+, built-in modules first.
- Use `node:test` for the zero-dependency core.
- Keep CLI argument execution shell-free; use `execFile` with explicit argument arrays.
- Project-owned config and user permissions must survive init/update.
- Codex and Claude Code workflows must have semantic parity tests; their hook adapter code may differ
  where the runtimes expose different events.
- Canonical commands are skills: `$mm-*` in Codex and `/mm-*` in Claude Code. A `/mm:*` file may
  exist only as a thin compatibility alias.
- Do not add a command as a `coming soon` stub. Expose it only when it has behavior and tests.

## Verification

Before handing off a change, run:

```bash
npm test
node bin/mamw.mjs --help
```

The foundational artifact remains `Draft`; implementation does not convert unresolved business
decisions into approval.
