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
