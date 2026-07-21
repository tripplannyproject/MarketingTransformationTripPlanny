---
description: Fast path for one small low-risk organic asset with a single plan gate.
---

# /mm:quick — MAMW quick asset

Read and follow `.claude/skills/mm-quick/SKILL.md` exactly. This command is the canonical Claude
entry point; the `mm-quick` skill (invocable as `/mm-quick` once it loads) is the shared
implementation. Eligibility is a hard boundary — ineligible requests escalate to `/mm:run`. Do not
define a second workflow or weaken any gate.
