---
name: mamw-attribution-incrementality
description: Evaluar atribución y diseñar evidencia de incrementalidad. Usar para MTA, MMM, lift tests, holdouts, geo experiments, ventanas de conversión y decisiones de reasignación.
---

# Evaluar atribución e incrementalidad

## Inputs obligatorios

- Pregunta de decisión, touchpoints, conversiones, ventanas, spend y modelo de identidad.
- Baseline, sesgos conocidos, unidades experimentales y datos certificados disponibles.

## Procedimiento

1. Distinguir atribución descriptiva de impacto causal incremental.
2. Auditar tracking, missingness, deduplicación, self-selection y cambios concurrentes.
3. Seleccionar enfoque proporcional: reglas, MTA, MMM o experimento controlado.
4. Definir estimand, población, power, guardrails y criterio de parada cuando sea causal.
5. Reportar rango, sensibilidad, supuestos y decisión; solicitar DAMW para análisis certificado.

## Salida auditable

Producir `attribution-incrementality-brief` con método, supuestos, resultados provisionales y plan de evidencia.

## Límites y gates

No convertir correlación en causalidad. Cambios de presupuesto permanecen como recomendación hasta aprobación y datos certificados.
