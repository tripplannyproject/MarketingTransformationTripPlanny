# MAMW routing

Classify before acting. The route is visible in the orchestration banner.

| Type | Signal | Route |
|---|---|---|
| 1 | factual/read-only query | LIGHT |
| 2 | one bounded local draft edit | LIGHT |
| 3 | detailed defect with known cause/artifact | LIGHT |
| 4 | behavioral defect or uncertain diagnosis | LIGHT, escalate on scope growth |
| 5 | HU, feature launch, campaign, content cycle or provider onboarding | FULL |
| 6 | open-ended/multi-channel/multi-market transformation | FULL |

FULL is mandatory for PAMW handoffs, multiple phases, audiences/PII, multilingual campaigns,
third-party rights/claims, providers/MCP capabilities, paid media/budget, tracking, publication,
email/outbound, crisis, or external effects.

Resolve named workflows from `.mamw/scripts/mamw-agent-catalog.json`. Its `groups` are dependency
ordered; agents inside one group may fan out in parallel. A custom route must name phases, roles,
artifacts, effect ceiling and why no registered workflow fits.

Typical phase owners: M0 channel-auditor + brand/localization/research; M1 marketing-planner; M2
audience-strategist + market-researcher; M3 campaign/media/editorial; M4 creative/localization/
multimodal; M5-M6 channel-operator + governance-reviewer; M7 performance-analyst; M8
marketing-analyst. `governance-reviewer` independently gates every phase where risk applies.

## Model-tier orchestration — GPT 5.6 Sol / Terra / Luna (Codex only)

Codex agents run on the three-tier GPT-5.6 family; pick the tier by the COST/QUALITY the task needs,
not by habit. (Claude mirror keeps its own models — this policy is Codex-only.)

| Tier | Model id | Use for |
|---|---|---|
| **Sol** | `gpt-5.6-sol` | Strategy, audience analysis, positioning, research, planning, governance review, high-impact creative concept and messaging. Max reasoning. |
| **Terra** | `gpt-5.6-terra` | Standard content and production: art-direction craft, editorial, localization/transcreation, media production, channel execution, routine analysis. Balanced. |
| **Luna** | `gpt-5.6-luna` | Fast/mechanical sub-tasks: quick copy and variations, format/lint/rights spot-checks, light audits, status summaries. Cheapest, latency-optimized. |

Default tier per agent lives in `.mamw/scripts/mamw-agent-catalog.json` (`codex_model`) and each agent
`.toml`. That default is the STARTING point, not a cap — orchestrate per task:

- **Escalate to Sol** when a sub-task is genuinely hard (novel strategy, causal audience reasoning,
  a high-stakes rights/claims call) even if the agent's default is Terra/Luna.
- **Drop to Luna** for the cheap parts of an otherwise heavy agent's work (generating N copy variants,
  reformatting, a quick consistency check) — do not burn Sol on variations.
- **Fallback (never silently upgrade):** if the chosen tier is unavailable or over its usage limit,
  fall back to the next CHEAPER available tier (Sol → Terra → Luna) and record it. Never auto-escalate
  to a more expensive tier without a human gate.
- **Auditable record:** every agent states the tier actually used (and why, if it deviated from its
  default or fell back) in its Standard Response — add a line `Model tier: sol|terra|luna (reason)` —
  and mirrors it to the engram. The tier used is part of the audit trail, like the effect ceiling.
