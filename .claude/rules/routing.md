# MAMW routing

Classify before acting and show the route in the banner.

| Type | Signal | Route |
|---|---|---|
| 1 | factual/read-only query | LIGHT |
| 2 | one bounded local draft edit | LIGHT |
| 3 | detailed defect with known cause/artifact | LIGHT |
| 4 | behavioral defect or uncertain diagnosis | LIGHT, escalate on growth |
| 5 | HU, feature launch, campaign, content cycle or provider onboarding | FULL |
| 6 | open-ended/multi-channel/multi-market transformation | FULL |

FULL is mandatory for PAMW handoffs, multiple phases, audiences/PII, multilingual work,
rights/claims, providers/MCPs, paid media/budget, tracking, publication, outbound, crisis or effects.

Resolve workflows from `.mamw/scripts/mamw-agent-catalog.json`. Groups are dependency ordered;
agents inside one group may fan out in parallel. Custom routes name phases, roles, artifacts,
effect ceiling and why no catalog route fits.

Phase owners: M0 channel/brand/localization/research; M1 planner; M2 audience/research; M3
campaign/media/editorial; M4 creative/localization/multimodal; M5-M6 channel operator + governance;
M7 performance; M8 marketing analyst. Governance independently gates risk-bearing transitions.
