---
name: mamw-damw-feedback
description: Intercambiar contratos de medición y aprendizajes con DAMW respetando certificación y lineage. Usar para KPIs, eventos, calidad, resultados certificados, análisis causal y feedback de campañas.
---

# Coordinar medición con DAMW

## Inputs obligatorios

- IDs de campaña/experimento, metric contract, eventos, dimensiones, ventanas y fuentes.
- Resultado operativo MAMW o certified outcome DAMW con versión, lineage y freshness.

## Procedimiento

1. Emitir requerimiento de datos con definiciones, grain, SLA y criterios de calidad.
2. Separar telemetría operativa de métricas empresariales certificadas.
3. Vincular resultados DAMW por referencia inmutable y verificar versión/freshness.
4. Comparar hipótesis y resultados; registrar discrepancias sin sobrescribir ninguna fuente.
5. Traducir evidencia certificada a aprendizaje y recomendación de marketing.

## Salida auditable

Producir `damw-feedback-contract` con refs, estado de certificación, discrepancias y decisiones soportadas.

## Límites y gates

MAMW no certifica datos ni edita Engrams DAMW. La ausencia de resultado certificado debe quedar explícita.
