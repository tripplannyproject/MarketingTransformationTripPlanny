---
name: mamw-audience-segmentation
description: Diseñar segmentación, personas, ICP y buying committees. Usar para B2C, B2B o B2B2C cuando se necesitan segmentos accionables, JTBD, roles, exclusiones y criterios medibles.
---

# Segmentar audiencias

## Inputs obligatorios

- Objetivo, modelo de marketing, fuentes permitidas y journey.
- Variables disponibles, restricciones de targeting y threshold mínimo.

## Procedimiento

1. Elegir STP/JTBD/ICP según la decisión; no mezclar métodos sin explicar.
2. Definir criterios observables, necesidad, contexto, barrier, trigger y valor esperado.
3. Para B2B incluir account fit, persona y buying role; para B2B2C separar partner/end-user.
4. Incluir exclusiones, tamaño estimado y señal de pertenencia.
5. Evaluar sesgo, proxy sensible, solapamiento y accionabilidad.

## Salida auditable

Producir `audience-definition` con source fields, rules, exclusions, size range y confidence.

## Límites y gates

No activar ni subir audiencias. PII, atributos sensibles y lookalikes requieren `audience-contract`
y privacy approval.
