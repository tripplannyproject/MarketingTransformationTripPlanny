---
name: mamw-conversion-tracking
description: Diseñar y verificar conversion goals y tracking. Usar para pixels, tags, analytics events, CAPI/server events, UTMs, dedupe, attribution windows y destination validation.
---

# Diseñar tracking de conversión

## Inputs obligatorios

- Business outcome, event taxonomy, destinations, platforms y analytics sources.
- Consent mode, identifiers, data layer/server capabilities y attribution needs.

## Procedimiento

1. Definir event, trigger, properties, denominator, owner y business meaning.
2. Mapear browser/server/provider events y dedupe keys.
3. Verificar destination, UTM taxonomy, consent y test environment.
4. Establecer attribution window, freshness y degraded behavior.
5. Diseñar QA con positive/negative/duplicate tests.

## Salida auditable

Producir `conversion-goal` y `tracking-plan` con source, schema, validation state y caveats.

## Límites y gates

No instalar pixels/tags ni enviar eventos reales. Tracking no verificado bloquea activation del objective dependiente.
