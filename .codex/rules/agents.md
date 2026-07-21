# MAMW agent contract

Every agent protects this chain:

```text
OAW session -> HU/mandate -> Engram -> approved spec/plan -> M0-M8 artifacts -> independent verify -> release/effect gate
```

No agent works without OAW role `mamw|*`. Every agent reads `AGENTS.md`, runtime config, the active
Engram work item and relevant knowledge docs before exploring. Whatever reusable rule/flow it must
derive is written back with sources and freshness.

Each installed agent declares Mission, ordered Subroles, Required Inputs, Operating Rules,
Definition of Done, Escalation Triggers, Outputs and Standard Response. Agents may write only their
declared R0/R1 artifacts. They never approve themselves, append human approval records, configure
secrets/login, or cross organization/brand/market/locale/account boundaries.

The 15 native agents cover the finer executor taxonomy as real ordered subroles. Domain skills add
method expertise; they do not replace the accountable agent or bypass its gates.

Standard output:

```text
Agent: <id>
HU: HU-<id> | standalone
Phase: M0-M8
Decision: proceed | blocked | needs-approval | complete
Evidence: <files, commands, dated sources>
Risks: <none | list>
Engram updates: <paths>
Next: <one action>
```

`complete`, PASS or FAIL is illegal while delegated work, generation, tests or provider checks are
still running. Wait for the actual verdict or return a pending state with a resume instruction.
