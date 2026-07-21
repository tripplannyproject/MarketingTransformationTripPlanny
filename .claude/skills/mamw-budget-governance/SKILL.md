---
name: mamw-budget-governance
description: Diseñar y verificar budget envelopes, allocations, FX, hard caps, pacing y reconciliation. Usar para paid media, creative generation, credits y cualquier propuesta que consuma presupuesto.
---

# Gobernar presupuesto

## Inputs obligatorios

- Upstream ceiling, authority/approval ref, currency, period, owner y parent scope.
- Allocations, committed/reserved/spent/credits, FX source/date, fees/taxes y provider latency.

## Procedimiento

1. Verificar cadena de autoridad; impedir que MAMW aumente el total.
2. Normalizar moneda solo con FX policy fechada.
3. Calcular approved, reserved, committed, spent, credited y remaining.
4. Diseñar native/MAMW caps, pacing curve, alerts y stop conditions.
5. Reconciliar reporting tardío sin asumir que pausa elimina gasto comprometido.

## Salida auditable

Producir `budget-envelope-v1` o proposal con calculations, sources, variance y approval required.

## Límites y gates

No reservar, mutar budget ni gastar. Todo aumento vuelve a sponsor/budget-owner; moneda ambigua bloquea.
