---
name: mm-start
description: Onboard or reconfigure MAMW for a project. Use after `mamw init` to run a discovery interview — brand DNA and its source, app languages, markets/locales, channels, tracker (Azure) origin, engram/logs repos, ad budget, common workflows and concrete content examples (posts, blogs, media, an ad) — writing the runtime config without connecting credentials or causing external effects.
---

# MAMW onboarding

Onboard or reconfigure the current project. This workflow may write MAMW configuration and draft
artifacts only. It must not connect credentials, publish, send, sync audiences or spend.

## Inputs obligatorios

- `AGENTS.md`, `.mamw/project.json`, the active runtime config and onboarding questionnaire.
- Organization/brand owner and enough business context to run the interview.

If project metadata is absent, stop and ask the user to run `mamw init`. Preserve existing values
unless the user explicitly reconfigures them.

## Procedimiento

1. Confirm the active surface: Codex writes `.codex/mamw.config.json`; Claude Code writes
   `.claude/mamw.config.json`.
2. Inspect existing config, `.mamw/kb.json`, `.mamw/logs-kb.json`, docs and channel/account
   references. In reconfiguration mode, preserve fields the user did not ask to change.
3. Run the FULL discovery interview in `.mamw/templates/onboarding-questionnaire.template.md` — both
   Section 1 (config fields) AND Section 2 (brand & content discovery). Do NOT stop after packs; the
   Section-2 examples are what the content skills and `mamw-brand-dna` inherit. Ask, listen, and
   request concrete samples.

   **Ask through option windows, not a wall of text.** In Claude Code, every discrete-choice
   question MUST be asked with an `AskUserQuestion` window so the user CLICKS instead of typing —
   this is allowed at R0 and is the expected onboarding UX (mirror the way TADW's gate uses a
   click window). Batch related choices into one window (up to 4 questions each). Use windows for,
   at least:

   - mirror surface — `codex`, `claude`, `both`;
   - business model — `b2c`, `b2b`, `b2b2c`, `mixed`;
   - tracker origin — `azure-devops`, `github-issues`, `jira`, `local`;
   - which packs to enable, and which of the 11 routes to run first;
   - every yes/no (enable a provider now? link a KB now? derive DNA from examples?).

   Reserve **plain text** only for genuinely free-text answers (org/brand names, URLs, git repos,
   PAT env-var name, budget amount, pasted DNA/content samples) — never invent these. Track the
   interview with `TodoWrite` so the flow is visible. (Codex has no option window: there, ask the
   same items concisely in text.)

   **Never stall — the flow must always be able to continue.** Missing answers defer with an
   explicit `pending` marker; they never block the write gate:

   - **Tracker**: if the user does not have the Azure DevOps details at hand, offer it as a window
     choice — "Configurar Azure ahora" / "Continuar con tracker local (Azure pendiente)". Deferring
     writes `tracker: { type: "local" }` (valid per schema — only `azure-devops` requires
     `org`/`project`/`pat_env`) plus a visible pending note; a later `/mm-start` reconfiguration
     upgrades it. Never hold the whole onboarding hostage to the tracker.
   - **Confirm-a-default questions** (proposed identity IDs, budget authority, approver roles) are
     window questions with the proposal as the FIRST option — e.g. "organization_id: tripplanny"
     options: `Usar tripplanny` / `Otro (escribir)`. Do not ask the user to re-type values you can
     propose; unanswered approvers/authority record as `pending`.
   - Reply in the user's language throughout: if the user speaks Spanish, questions, windows,
     summaries and the plan banner are in Spanish. English rule files never set the conversation
     language.

   Collect:

   - organization and brand IDs, owner and business model (`b2c`, `b2b`, `b2b2c` or mixed);
   - products/services and the relationship to any PAMW initiative;
   - markets, BCP 47 locales, timezones and native-market reviewers;
   - the app/product's own supported languages (`project.app_locales`), which may differ from the
     marketing locales;
   - active organic, paid, web, email, CRM and community channels, with URLs/accounts, style,
     cadence, health and baseline;
   - **where the Brand DNA comes from** (website, brand guide, deck, DAM, or derive it from examples),
     then the DNA itself — mission, values, tone/voice, archetypes, promise, do/don't, design system,
     approved DAM/library paths and reference-rights owner. Go deep: run `mamw-brand-dna`;
   - **concrete content examples**: 2–3 real posts, 1–2 blog examples, the media types produced (photo,
     short video, carousel, reel, story, infographic) with a sample of each, and one example ad;
   - the common workflows the user actually runs (map them to the 11 routes to run first);
   - existing or desired MCP/API provider/account names, owner and initial mode without tokens;
   - tracker origin — `tracker.type` (`azure-devops`, `github-issues`, `jira` or `local`); for Azure,
     capture `org`, `project`, `area_path`, `iteration_path`, `parent_ref` and the PAT env name
     (`pat_env`, e.g. `AZURE_DEVOPS_PAT`). OAW login never authorizes Azure; the PAT/OAuth is separate;
   - the ad budget — currency, authority reference and amount (`total_ceiling`), without inventing it;
   - privacy/legal/brand/native-market/budget/activation approvers and default effect posture;
   - separate knowledge KB and conversation-log repositories (git URLs + local paths), plus read-only
     PAMW/DAMW/OAW refs;
   - desired packs, starting with no external provider enabled by default.
4. Validate the proposed result against `.mamw/schemas/runtime-config.schema.json` and show a
   compact diff/summary before writing anything.
5. Obtain the turn gate for that exact proposal:

   - Claude Code: present the full 🧭 banner (writes, effect, rollback) IN THE CHAT, then open
     the SHORT confirmation window — `AskUserQuestion` asking `¿Ejecuto este plan?
     [MAMW-GATE: plan-ack]` with explicit approve/reject options in the user's language; the
     user's click binds the receipt to the current MAMW nonce. Never paste the banner into the
     window. Do not switch the chat into Claude's plan mode (if the user already toggled it, an
     approved `ExitPlanMode` window also counts).
   - Codex: end the proposal with `[MAMW-PLAN-OFFER]`, stop and wait for a later written `OK`,
     `aprobado` or `procedamos`.

6. After approval, write only the proposal shown. Any changed field requires a new gate.
7. **Sync the Engram and finish the Brand DNA — do not defer and forget.** After the config is
   written and the plan approved (hooks now unblock R1 work):
   - Persist the repos as the single source of truth: `mamw kb link --repo <url>` and
     `mamw logs link --repo <url>` (they write `project.json`; the runtime config alone is only a
     fallback). Then run `mamw kb sync` (and `mamw logs sync`) to clone them locally, so they can
     be read and written.
   - Do the Brand DNA pass now: delegate `mamw-brand-dna` (or the `brand-strategist` agent) to read
     the declared DNA source and WRITE the extracted DNA into the cloned knowledge KB
     (`.mamw/kb/brand-dna.md`), then `mamw kb sync` to commit/push it.
   - If the DNA source cannot be read this turn (repo not checked out, no access), DO NOT drop it:
     record `brand_dna: { status: "pending", source: <ref> }` in the config, tell the user exactly
     what is pending and how to provide it (paste the file, or check out the repo), and leave a
     `# pending: brand DNA` note in `.mamw/kb/brand-dna.md`. Never claim the DNA is captured when it isn't.
8. Run `mamw doctor`; report unresolved KB/log links, un-synced KBs, roles and credentials as explicit
   `unknown`/`pending`. Suggest catalog skills, but never install external skills without confirmation.

## Salida auditable

Write a config matching `.mamw/schemas/runtime-config.schema.json`. Every connector remains
`disabled` or `read_only` until a later governed workflow verifies ownership and capability scope.
Report the selected packs, unresolved decisions and doctor result.

## Límites y gates

Never place a PAT, API key, OAuth token or private customer data in the config. Onboarding is R1:
it cannot connect credentials, enable providers, publish, send, sync audiences or spend.
