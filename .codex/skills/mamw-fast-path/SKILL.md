---
name: mamw-fast-path
description: Aplicar un fast path a cambios de marketing pequeños, reversibles y de bajo riesgo. Usar para correcciones menores sin saltar identidad, marca, derechos, privacidad ni approvals.
---

# Evaluar fast path

## Inputs obligatorios

- Cambio propuesto, artefacto actual, target, reason, owner y ventana.
- Effect level, reversibilidad, alcance, presupuesto y policies aplicables.

## Procedimiento

1. Confirmar que el cambio es acotado, de una sola unidad y no amplía audiencia o spend.
2. Rechazar fast path si toca claims sensibles, PII, derechos, crisis, R3–R5 o múltiples mercados.
3. Producir diff, verificación mínima, rollback y expiry.
4. Obtener una aprobación humana sobre el diff exacto cuando corresponda.
5. Registrar resultado y escalar al flujo normal ante cualquier drift.

## Salida auditable

Producir `fast-path-decision` con elegibilidad, diff, checks, approval y rollback.

## Límites y gates

Fast path reduce ceremonia, no controles esenciales. Nunca habilita publicación, envío o gasto sin el gate de efecto correspondiente.
