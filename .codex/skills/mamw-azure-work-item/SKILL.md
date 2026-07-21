---
name: mamw-azure-work-item
description: Proyectar unidades de trabajo MAMW en Azure DevOps sin duplicar autoridad. Usar para Epic, Feature, HU, Task, estados, enlaces PAMW/DAMW, acceptance criteria y evidencia de marketing.
---

# Sincronizar trabajo con Azure DevOps

## Inputs obligatorios

- Organization, project, area/iteration, work item type, parent/upstream refs y owner.
- Título, outcome, acceptance criteria, estado MAMW y política de campos/enlaces.

## Procedimiento

1. Buscar coincidencias por external ID y enlaces antes de proponer creación.
2. Mapear estado MAMW al workflow configurado sin asumir nombres universales.
3. Preparar patch mínimo con parent, tags, AC, riesgos y artefactos enlazados.
4. Comparar versión/revision para evitar overwrite y presentar diff.
5. Registrar remote ID, revision y URL tras una sincronización autorizada.

## Salida auditable

Producir `azure-work-item-sync-plan` con lookup, mapping, patch preview y conflictos.

## Límites y gates

Solo R1 en la librería fundacional. Crear o editar Azure es R2 y requiere aprobación, idempotencia y adaptador implementado.
