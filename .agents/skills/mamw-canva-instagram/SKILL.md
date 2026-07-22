---
name: mamw-canva-instagram
description: Diseñar posts, stories y carruseles de Instagram en Canva de forma DETERMINISTA y brand-faithful con el MCP oficial — verificar la cuenta/Team del owner antes de construir, partir SIEMPRE de la brand template del owner (autofill-design con dataset, o create-design-from-brand-template + transacción de edición con find_and_replace_text/replace_text/update_fill/format_text), componer el texto exacto con la tipografía de marca (que debe vivir en la plantilla), y entregar enlace editable + PNG exportado; nunca generate-design para piezas de marca.
---

# Diseñar en Canva con el MCP oficial (determinista, no genérico)

Fuentes oficiales (verificadas): Autofill API `canva.dev/docs/connect/api-reference/autofills/` y
guía `canva.dev/docs/connect/autofill-guide/`; Brand Templates
`canva.dev/docs/connect/api-reference/brand-templates/`; y los schemas reales de las tools del MCP
de Canva (`get-brand-template-dataset`, `create-design-from-brand-template`,
`perform-editing-operations`, `start/commit-editing-transaction`, `export-design`,
`upload-asset-from-url`, `get-design`, `search-brand-templates`).

## Inputs obligatorios

- `Design.md` + `creative-design-v1` APROBADOS (design system del `art-director`: paleta hex, escala
  tipográfica, spacing, grid, contraste objetivo, sombras, safe areas). Sin Design.md, `DESIGN-001`
  bloquea la construcción.
- Copy final por locale con **ortografía y acentos correctos**; legal/claims/precios como texto
  exacto (nunca generados).
- Brand template del owner (id que empieza por `BTM`) con la **tipografía de marca YA incrustada**
  (crítico: el MCP `format_text` cambia color/tamaño/peso/estilo pero **NO la familia tipográfica**;
  la fuente Outfit/Poppins debe existir en la plantilla). Logo y paleta del manual.
- MCP de Canva conectado; si no responde, `blocked`.

## Procedimiento

1. **Verificar cuenta/Team del owner ANTES de construir (R0).** `get-design` o
   `search-brand-templates` sobre una plantilla conocida del owner. Si devuelve "Not allowed to
   access design" o no aparecen sus brand templates, el conector está en otra cuenta: `blocked`
   avisando del mismatch; NO construir (evita diseños que el owner no ve).
2. **Anunciar el plan en el chat** (🧭 breve) y abrir la ventana `[MAMW-GATE: plan-ack]`.
3. **Camino A — Autofill (determinista, requiere Canva Enterprise).** `get-brand-template-dataset`
   para ver los campos autofillables y sus tipos (oficial: `text` y `image`). Subir cada asset con
   `upload-asset-from-url` para obtener su `asset_id`. Lanzar `autofill-design` con
   `data: { CAMPO: { type:"text", text:"…" } | { type:"image", asset_id:"…" } }`. Es el patrón
   plantilla+datos oficial; conserva estilos y tipografía de la plantilla.
4. **Camino B — Copiar plantilla + editar (planes de pago sin autofill).** `create-design-from-
   brand-template` (id `BTM…`) y luego una transacción: `start-editing-transaction` →
   `perform-editing-operations` (ops REALES: `find_and_replace_text`/`replace_text` para el copy
   exacto con acentos, `update_fill` para poner la foto con licencia o la imagen generada por OpenAI,
   `format_text` para color/tamaño/peso según los tokens) → **`commit-editing-transaction`
   (obligatorio; sin commit los cambios se pierden)**. En páginas `is_responsive` solo se permiten
   `update_title/replace_text/update_fill/delete_element/find_and_replace_text`.
5. **Aplicar el craft del design system** (art-director): jerarquía (un foco), contraste WCAG
   (cuerpo ≥ 4.5:1; sobre foto, scrim/gradiente hasta cumplir), safe areas de story (contenido en la
   columna central, ~250px arriba/~340px abajo), logo con clear-space, sombras suaves con una sola
   fuente de luz, spacing en 8px. Referencia externa = principio, no copia.
6. **Exportar y entregar estable.** `export-design` a PNG en `.mamw/creative/canva/` (los edit/view
   URLs de Canva caducan) y registrar cada asset (checksum, design id, formato, locale) en el
   `reference-assets-v1`/content package. Entregar **enlace editable + PNG** y confirmar que el
   diseño quedó en la cuenta del owner.
7. Iterar como option windows; cada tanda de ediciones reabre el gate.

## Salida auditable

Diseño en la cuenta del OWNER (design id verificado) + PNG con checksum ligado al content package,
enlace editable, el camino usado (autofill vs copiar+editar), las ops del MCP por fase (R0
verificar/leer vs R1 construir) y el resumen de la referencia usada como principio.

## Límites y gates

Verificar/leer (`get-design`, `get-brand-template-dataset`, `search-*`) es R0.
`autofill-design`/`create-design-from-brand-template`/`perform-editing-operations`/`export-design`
exigen el plan-ack. Compartir/comentar/invitar/publicar desde Canva está denegado (`CONNECTOR-001`):
la publicación en Instagram sigue el Handoff (`mamw channel prepare` → el humano publica → ventana con
`Bundle:`/`URL:`/`Confirm:`). Sin `Design.md`, `DESIGN-001` bloquea. Autofill exige Canva Enterprise
(dev y usuarios); sin él, usar el Camino B. La tipografía de marca debe estar en la plantilla (el MCP
no cambia la familia). Todo texto se compone en Canva, exacto y con acentos; nada de claims/legal/
precios dibujados por un modelo. Cuenta/Team distinta a la del owner → `blocked`.
