---
name: mamw-governance
description: Enforce MAMW authority boundaries, scope, human approvals and effect levels whenever marketing work could publish, send, sync PII, mutate accounts or spend.
---

# MAMW governance

## Inputs obligatorios

- HU/programa, actor y scope `organization + brand + market + locale + account`.
- Artefactos, approvals, effect level y capability snapshot aplicables.

## Procedimiento

Aplicar estas reglas a cada unidad de marketing:

1. Resolve `organization_id`, `brand_id`, `market_id`, locale and account before accessing a tool.
2. Keep PAMW initiative artifacts and DAMW Engrams read-only.
3. Treat MAMW measurements as `operational_uncertified` until DAMW supplies a certified outcome.
4. Require a human-approved upstream budget reference; MAMW cannot raise the total ceiling.
5. Classify the action: R0 read, R1 draft, R2 reversible write, R3 sensitive/credit, R4
   publish/send/spend, or R5 destructive/high impact.
6. Default deny unknown capabilities. R2–R5 require the implemented gate for the exact payload.
7. Do not reuse a human OAW session for unattended scheduled effects.
8. For localized content, distinguish translation, localization, transcreation and native creation;
   require terminology, cultural review and per-locale approval as applicable.

If the required deterministic guard or approval mechanism is not implemented, keep the result as a
draft and state that execution is unavailable.

## Salida auditable

Emitir `governance-decision` con effect level, checks, evidencia, bloqueos, approvals requeridas y
fase M0–M8 que debe continuar. Nunca representar una recomendación del modelo como autorización.

## Límites y gates

Esta skill decide y documenta; no firma approvals ni ejecuta efectos. Si falta un guard determinista,
la capability exacta o una aprobación humana vigente ligada al payload, la decisión debe ser `deny`.
