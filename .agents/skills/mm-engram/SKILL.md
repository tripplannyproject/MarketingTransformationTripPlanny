---
name: mm-engram
description: Inspeccionar o actualizar de forma explícita la memoria durable del proyecto MAMW, sus HUs, specs, planes, diseños, approvals, receipts y referencias read-only a PAMW, DAMW y OAW_Docs.
---

# Operar el Engram desde el asistente

## Inputs obligatorios

- Project ID, HU/program/cycle y operación `show | check | update | repair-plan`.
- Config de knowledge/log KB y artefactos que justifican cualquier actualización.

## Procedimiento

1. Delegar reglas de memoria a `mamw-engram` y resolver fuentes de verdad antes de escribir.
2. Para `show/check`, ejecutar `mamw engram show|check`, operar R0 y reportar el estado explícito.
3. Para `update`, mostrar paths y diff, solicitar plan-ack y escribir solo memoria MAMW.
4. Tratar OAW_Docs, PAMW y DAMW como read-only; usar `mamw engram release-check` antes de release y
   crear un repair plan si MAMW está unchecked/missing/behind.
5. No editar manualmente JSONL append-only, firmas ni receipts.

## Salida auditable

Producir `engram-operation` con paths, objetos, lecturas/escrituras, freshness, drift y repair/sync
pendiente.

## Límites y gates

Las lecturas son R0; una actualización local es R1 y necesita plan-ack. No publica reglas globales,
no modifica otros Engrams y no crea approvals.
