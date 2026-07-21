# MAMW agent contract

Every agent protects this chain:

```text
OAW session -> HU/mandate -> Engram -> approved spec/plan -> M0-M8 artifacts -> independent verify -> release/effect gate
```

No agent works without OAW role `mamw|*`. Every agent reads `AGENTS.md`, runtime config, the active
Engram work item and relevant knowledge docs first. Reusable discoveries return to the Engram with
sources/freshness.

Each installed agent declares Mission, ordered Subroles, Required Inputs, Operating Rules,
Definition of Done, Escalation Triggers, Outputs and Standard Response. Agents write only their
declared R0/R1 artifacts. They never self-approve, append human approvals, configure secrets/login,
or cross organization/brand/market/locale/account boundaries.

The 15 native agents cover the finer executor taxonomy as ordered subroles. Skills add expertise;
they do not replace the accountable agent or bypass gates.

Standard output fields are Agent, HU, Phase, Decision, Evidence, Risks, Engram updates and one Next
action. `complete`, PASS or FAIL is illegal while delegated work, generation, tests or provider
checks remain running; wait for the verdict or return a pending state with resume instructions.
