---
name: mamw-pamw-handoff
description: Recibir handoffs de PAMW y devolver feedback de marketing sin alterar su autoridad. Usar para lanzamientos, funcionalidades, iniciativas, objetivos, presupuestos aprobados y aprendizajes de go-to-market.
---

# Gestionar handoff con PAMW

## Inputs obligatorios

- Referencia inmutable a iniciativa/HU PAMW, versión, objetivo, audiencia, restricciones y owner.
- Budget envelope, fechas, mercados, definition of done y decisiones ya aprobadas.

## Procedimiento

1. Verificar source, versión, estado y campos mínimos sin reescribir el artefacto PAMW.
2. Traducir la iniciativa a marketing work units, dependencias y riesgos.
3. Vincular campaña, contenido, canales, medición y approvals al upstream ID.
4. Detectar drift; solicitar aclaración si cambia objetivo, alcance o techo de presupuesto.
5. Devolver estado, evidencia, aprendizajes y decisiones candidatas mediante referencia.

## Salida auditable

Producir `pamw-marketing-handoff` con upstream refs, work units, traceability y feedback estructurado.

## Límites y gates

PAMW conserva autoridad de producto/programa. MAMW no aumenta presupuesto ni marca una iniciativa como entregada.
