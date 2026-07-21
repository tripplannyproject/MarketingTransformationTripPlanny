---
name: mamw-lead-operations
description: Diseñar lead capture, enrichment, scoring, routing, nurture y outbound operations. Usar con CRM, Apollo-like tools, forms, sequences y sales handoffs bajo consentimiento y credit controls.
---

# Diseñar operaciones de leads

## Inputs obligatorios

- Purpose, ICP/segment, lead sources, fields, consent, suppression y CRM stages.
- Provider capabilities/cost, routing owners, SLA, retention y regions.

## Procedimiento

1. Definir minimum fields, validation, dedupe y identity strategy.
2. Separar fit, behavior/intent y human qualification en scoring.
3. Diseñar enrichment solo para gaps necesarios y con credit estimate.
4. Mapear routing, rejection, recycle, nurture y sales feedback.
5. Aplicar suppression/opt-out just-in-time y monitor deliverability.

## Salida auditable

Producir `lead-flow-contract` con fields, rules, providers, cost caps, SLA y failure paths.

## Límites y gates

Mantener diseño/preflight. No buscar personas, enriquecer, crear contactos ni enrollar sequences sin R3/R4 gates.
