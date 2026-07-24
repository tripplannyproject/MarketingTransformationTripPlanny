---
name: mm-design
description: Orquestar el diseño gobernado de una pieza o colección de marketing desde brief y DNA hasta Design.md, manifest de referencias y provider requests, antes de generar imágenes, posts, stories, video o anuncios.
---

# Ejecutar el workflow de diseño

## Inputs obligatorios

- HU/ciclo, creative brief, Brand DNA/storytelling, placements, locales y owner.
- Referencias/assets candidatos, rights evidence, ceiling de generación y provider profile.

## Procedimiento

1. Invocar `mamw-visual-design` para preparar `Design.md`, JSON compañero y manifest.
2. Invocar `mamw-brand-rights`, `mamw-claims-compliance`, `mamw-transcreation` y
   `mamw-accessibility` según referencias, claims y locales.
3. Presentar un resumen con archivos, referencias enviables/no enviables, capas deterministas,
   intentos, ceiling y riesgos.
4. Obtener plan-ack para escribir exactamente esos drafts.
5. Validar los tres contratos y compilar un request por locale/placement con
   `mamw-creative-prompting`.
6. Mantener todo en draft hasta que exista el gate persistente de M4.

## Salida auditable

Entregar el bundle de diseño y una matriz de provider requests, QA pendiente, bloqueos de rights,
cost estimate y siguientes gates. No declarar media generada.

## Límites y gates

El comando llega solo a R1. No usar el OK del turno como aprobación de diseño ni como autorización
para generar con Codex, publicar o gastar.
