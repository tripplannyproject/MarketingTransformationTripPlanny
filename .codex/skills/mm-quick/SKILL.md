---
name: mm-quick
description: Fast path for ONE small, low-risk organic asset (a single post draft, caption variant or copy tweak) — collapses Brief+Create+QA into one minimal artifact with a single plan gate. Strict eligibility; anything with paid media, PII, publishing, new channels or missing brand DNA escalates to the full mm-run cycle.
---

# MAMW quick asset (fast path)

Produce ONE small organic asset without the full eight-phase ceremony, keeping the non-negotiable
core: eligibility check, one plan gate, brand-DNA fidelity and an auditable artifact. The
marketing analogue of a code hotfix.

## Inputs obligatorios

- The asset request (what, for which channel/locale) and the captured Brand DNA
  (`.mamw/kb/brand-dna.md` or the campaign engram). No DNA → not eligible.
- The active runtime config (channel must already exist in `channel_profiles`).

## Procedimiento

1. **Eligibility — ALL must hold, checked FIRST and stated visibly:**
   - exactly one asset (one post, one caption set, one copy block) for one existing channel;
   - organic only — no paid media, no budget, no audience sync, no PII, no new provider;
   - no publication and no external effect: the output is a local draft;
   - brand DNA is captured and the target locale is in the configured locales.
   If ANY condition fails, say which one and escalate to the full cycle with the `mm-run` skill —
   do not "quick" your way around governance.
2. Present ONE minimal plan (asset, channel, locale, target paths) and get the single plan gate
   (Claude: marked `[MAMW-GATE: plan-ack]` window, or `ExitPlanMode` if the user toggled plan
   mode; Codex: `[MAMW-PLAN-OFFER]` + written `OK`).
3. Create the draft with the DNA's tone/do-don't applied; one `governance-reviewer` pass inline
   (claims, rights, locale) instead of the full QA phase.
4. Store the asset under the knowledge KB (`quick/` folder of the project engram) and `mamw kb
   sync`; no `.mm-run.json` checkpoint is created for quick assets.
5. Close propositively: show the draft, note that publishing still requires the normal Handoff
   (`mamw channel prepare` → human publishes and pastes the live URL → plan-ack window with `Bundle:`/`URL:`/`Confirm:` lines records `mamw channel confirm` on the click), and offer next steps as
   an option window.

## Salida auditable

The single asset draft in the engram `quick/` folder (synced), the visible eligibility check
result, and the inline QA note. Nothing is published.

## Límites y gates

Fast path is R1 with ONE gate — it never publishes, spends, or touches R2+. Eligibility is a hard
boundary, not a suggestion: violations escalate to the full cycle. The Handoff and its signed
approvals/receipts apply unchanged when the asset is later published.
