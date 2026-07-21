---
name: mamw-market-research
description: Investigar mercado, categoría, demanda, clientes y canales con evidencia reciente. Usar para sizing orientativo, problemas, lenguaje, comportamiento, barriers, oportunidades y preguntas estratégicas.
---

# Investigar mercado

## Inputs obligatorios

- Pregunta de decisión, mercado/locale, audiencia, categoría y ventana de freshness.
- Fuentes autorizadas y nivel de confianza requerido.

## Procedimiento

1. Separar hechos, estimaciones, interpretación e hipótesis.
2. Priorizar first-party y fuentes primarias fechadas.
3. Triangular señales contradictorias y documentar sesgos/cobertura.
4. Extraer pains, gains, lenguaje real, triggers, barriers y channel behavior.
5. Traducir hallazgos a decisiones comprobables, no a certezas falsas.

## Salida auditable

Producir `market-research-brief` con fuentes, retrieved_at, geografía, método, hallazgos, confianza y gaps.

## Límites y gates

Mantener R0. No recopilar PII innecesaria, scrapear contra términos ni llamar “actual” a evidencia expirada.
