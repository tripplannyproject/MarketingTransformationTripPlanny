---
name: mamw-ad-operations
description: Diseñar y validar estructuras de anuncios y drafts remotos reversibles. Usar para campaign/ad group/ad, placements, creative mapping, naming, trafficking, QA y provider-specific preflight.
---

# Preparar operaciones de anuncios

## Inputs obligatorios

- Approved ad/media briefs, account scope, objective, audience, creative y destination.
- Budget envelope, conversion goal, schedule, platform manifest y naming policy.

## Procedimiento

1. Resolver account/business owner, currency, timezone y permissions.
2. Diseñar hierarchy, naming, placements, audience exclusions y creative mapping.
3. Validar objective/event/destination/landing consistency y policy requirements.
4. Generar payload preview/dry-run e idempotency key.
5. Registrar provider differences y rollback/pause plan.

## Salida auditable

Producir `ad-operations-plan` y draft payload redactado con account, hashes y QA results.

## Límites y gates

Solo R1; un draft remoto R2 exige gate disponible. Nunca activar delivery/spend hasta M5/M6 implementados.
