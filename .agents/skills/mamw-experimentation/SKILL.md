---
name: mamw-experimentation
description: Diseñar experimentos de marketing y creative tests. Usar para hipótesis, variants, unit/randomization, sample, guardrails, stopping, analysis y aprendizaje sin confundir correlación con causalidad.
---

# Diseñar experimentos

## Inputs obligatorios

- Decision, hypothesis, baseline, target population, intervention y primary metric.
- Channels, sample/traffic, duration, risks, constraints y analysis capability.

## Procedimiento

1. Definir causal question, estimand y minimum detectable effect cuando aplique.
2. Elegir A/B, holdout, geo, incrementality test u observational analysis justificadamente.
3. Fijar unit, allocation, eligibility, contamination y guardrails.
4. Pre-registrar metrics, duration, stop rules y analysis.
5. Planear rollout/rollback y learning capture.

## Salida auditable

Producir `experiment-plan` con hypothesis, design, variants, metrics, risks y validity checks.

## Límites y gates

No declarar causalidad desde lift descriptivo ni detener por conveniencia. Activation sigue M5.
