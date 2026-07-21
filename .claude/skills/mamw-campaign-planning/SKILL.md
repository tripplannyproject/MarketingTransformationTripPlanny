---
name: mamw-campaign-planning
description: Convertir una HU, iniciativa o programa always-on en campaign plan. Usar para objetivo, audiencia, oferta, funnel, mensajes, channel mix, calendario, KPI, experimentos, presupuesto y stop conditions.
---

# Planear campañas

## Inputs obligatorios

- HU/programa y provenance, DNA/story, audiencia y success contract.
- Mercados/locales, canales disponibles, techo aprobado y restricciones.

## Procedimiento

1. Formular objetivo, baseline, target, window e hipótesis.
2. Definir offer/proposition, funnel, message hierarchy y channel roles.
3. Integrar launch PAMW con always-on sin extender su scope.
4. Asignar entregables, owners, dependencies, KPI y stop conditions.
5. Separar forecast, supuesto y compromiso.

## Salida auditable

Producir `campaign-plan` con HU, hashes, audience, locale, channel mix, measurement y risks.

## Límites y gates

No crear Feature estratégica, aumentar budget ni activar canales. Requerir M1/M3 approvals antes
de presentar el plan como aprobado.
