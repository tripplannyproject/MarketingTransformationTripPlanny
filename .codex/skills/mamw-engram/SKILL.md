---
name: mamw-engram
description: Leer, crear y mantener la memoria durable de MAMW. Usar para HUs, specs, planes, approvals, campañas, contenido, decisiones, verificación, knowledge docs, logs y referencias federadas PAMW/DAMW/OAW.
---

# Operar el Engram MAMW

## Inputs obligatorios

- `project_id`, HU/programa/ciclo activo, fase M0–M8 y tracker reference.
- `.mamw/kb.json`, `.mamw/logs-kb.json` y referencias federadas disponibles.

## Procedimiento

1. Resolver la memoria de proyecto en
   `.mamw/kb/projects/<project-id>/engram/work-items/HU-<id>/`.
2. Leer antes de explorar: `hu.md`, `spec.md`, `plan.md`, `approvals.jsonl`, artefactos de campaña,
   `verify.md` y `release.md`; buscar también decisiones, contratos, flows y patterns.
3. Mantener `.md` como documentos vivos y `approvals.jsonl`, `changes.jsonl` y receipts como
   append-only. `index.json` es derivado; nunca editarlo como fuente de verdad.
4. Escribir conocimiento reusable con `type`, `id`, `title`, `tags`, `sources`, `verified_at` y
   `related_hus`; anclar a archivos/símbolos, no a números de línea.
5. Tratar PAMW/DAMW como referencias federadas read-only. Consumir reglas interframework mediante
   `mamw engram show` y comprobar frescura con `mamw engram check`; ambos delegan en OAW. Antes de
   release, exigir `mamw engram release-check`: `unchecked`, `missing` o `behind` bloquean MAMW.
6. Mantener el conversation log en el repositorio separado `.mamw/logs-kb/<project-id>/sessions/`;
   no editar manualmente sus JSONL ni mezclarlo con el knowledge KB.
7. Ante drift, actualizar spec/plan, registrar change request y detenerse hasta nueva aprobación.

## Salida auditable

Producir `engram-update` con HU, paths, artefactos leídos/escritos, refs federadas, freshness,
append-only checks, drift y sync pendiente.

## Límites y gates

Nunca inventar approvals, certificar resultados DAMW ni escribir en Engrams federados/OAW. Si
OAW_Docs aún no registra `mamw`, reportar el gate global bloqueado; no tratar `unknown-framework`
como frescura. Si KB/logs no están enlazados, conservar un draft local explícito.
