---
name: mamw-canva-instagram
description: Diseñar posts, stories y carruseles de Instagram en Canva de forma DETERMINISTA y brand-faithful con el MCP oficial — verificar la cuenta/Team del owner antes de construir, partir SIEMPRE de la brand template del owner (autofill-design con dataset, o create-design-from-brand-template + edición read-design/edit-design con find_and_replace_text/replace_text/update_fill/format_text), componer el texto exacto con la tipografía de marca (que debe vivir en la plantilla), y entregar enlace editable + PNG exportado; nunca generate-design para piezas de marca.
---

# Diseñar en Canva con el MCP oficial (determinista, no genérico)

Fuentes oficiales (verificadas): Autofill API `canva.dev/docs/connect/api-reference/autofills/` y
guía `canva.dev/docs/connect/autofill-guide/`; Brand Templates
`canva.dev/docs/connect/api-reference/brand-templates/`; y los schemas reales de las tools del MCP
de Canva (`get-brand-template-dataset`, `create-design-from-brand-template`, `read-design`,
`edit-design`, `export-design`, `upload-asset-from-url`, `search-brand-templates`).

> **Rename del conector (2026, framework 0.19):** el modelo transaccional viejo
> (`start-editing-transaction` → `perform-editing-operations` → `commit-editing-transaction`) se
> reemplazó por **`read-design`** (con `open_transaction: true` devuelve `transaction_id` y el
> `design_content` con `[locator_id]` por elemento) + **`edit-design`** (aplica `operations` en una
> página con `finalize: "keep_open"`, y luego COMMITEA/CANCELA en una llamada aparte con `operations`
> vacío y `finalize: "commit"|"cancel"`). Las operaciones son las mismas; cambia el transporte.

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

1. **Verificar cuenta/Team del owner ANTES de construir (R0).** `read-design` (metadatos) o
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
   brand-template` (o `copy-design`) para partir de la plantilla del owner (id `BTM…`). Luego:
   **(a)** `read-design` con `open_transaction: true` y `filter.fields: ["design_content","thumbnails"]`
   para obtener el `transaction_id`, los `[locator_id]` de cada elemento (se usan como `element_id`) y
   el thumbnail ANTES. **(b)** `edit-design` con ese `transaction_id`, el `page_index` y `operations`
   REALES (`find_and_replace_text`/`replace_text` para el copy exacto con acentos, `update_fill` para la
   foto con licencia o la imagen generada por Codex, `format_text` para color/tamaño/peso según los
   tokens), con `finalize: "keep_open"` (no combinar operaciones con commit). Devuelve
   `status: "edits_unverified"`. **(c)** COMMIT en llamada aparte: `edit-design` con `operations` vacío
   y `finalize: "commit"` (IRREVERSIBLE; sin commit los cambios se pierden). Echa `is_responsive`/
   `is_empty`/`is_editable` leídos del `read-design`; en páginas responsive solo el allowlist
   (`replace_text`/`update_fill`/etc.).
5. **Aplicar el craft del design system** (art-director): jerarquía (un foco), contraste WCAG
   (cuerpo ≥ 4.5:1; sobre foto, scrim/gradiente hasta cumplir), safe areas de story (contenido en la
   columna central, ~250px arriba/~340px abajo), logo con clear-space, sombras suaves con una sola
   fuente de luz, spacing en 8px. Referencia externa = principio, no copia.
6. **Verificar por RELECTURA antes de commitear (`CANVA-STRICT`, obligatorio).** `status:
   "edits_unverified"` de `edit-design` NO prueba que la edición quedó bien. ANTES del commit, releer
   la transacción abierta con `read-design` pasando el `transaction_id` (renderiza las ediciones sin
   commitear) y comprobar, **operación por operación**, que el resultado coincide con lo pedido: cada
   `find_and_replace_text`/`replace_text` dejó el copy EXACTO **con los acentos correctos del locale**
   (no el placeholder ni un texto viejo); cada `update_fill` puso la imagen/color correcto; cada
   `format_text` dejó color/tamaño/peso según los tokens de `Design.md`; y ningún campo de plantilla
   quedó sin rellenar. Solo si todo cuadra → `edit-design finalize: "commit"`; si algo no se refleja,
   reintentar la op o `edit-design finalize: "cancel"` — nunca commitear ni exportar sobre un diseño
   no verificado.
7. **Exportar y entregar estable.** Solo tras la relectura OK: `export-design` a PNG en
   `.mamw/creative/canva/` (los edit/view URLs de Canva caducan) y registrar cada asset (checksum,
   design id, formato, locale) en el `reference-assets-v1`/content package. Entregar **enlace editable
   + PNG** y confirmar que el diseño quedó en la cuenta del owner. Presentar el entregable en el
   formato `DELIV-LINK` (**nombre — 🔗 enlace editable · 📎 PNG exportado**), nunca solo el nombre de
   archivo, y actualizar la entrada del contrato `deliverables[]` con su `link` y `export`.
8. Iterar como option windows; cada tanda de ediciones reabre el gate.

## Checklist estricto (todo o `blocked`)

Antes de presentar un diseño de Canva como entregable, TODOS deben cumplirse:

1. Cuenta/Team del owner verificado (R0) — el diseño vive donde el owner lo ve.
2. Cada op de la transacción **verificada en la relectura** (`read-design` con el `transaction_id`), no asumida.
3. Copy exacto **con acentos por locale**; nada de placeholders ni claims/legal/precios dibujados.
4. Color/tamaño/peso, fills, spacing y safe areas = tokens de `Design.md` (contraste WCAG medido).
5. Export PNG producido con checksum, ligado al content package.
6. Entregado en formato `DELIV-LINK` (enlace editable + export), con la entrada `deliverables[]` al día.

## Salida auditable

Diseño en la cuenta del OWNER (design id verificado) + PNG con checksum ligado al content package,
enlace editable, el camino usado (autofill vs copiar+editar), las ops del MCP por fase (R0
verificar/leer vs R1 construir) y el resumen de la referencia usada como principio.

## Límites y gates

Verificar/leer (`read-design`, `get-brand-template-dataset`, `search-*`) es R0 — incl. `read-design`
con `open_transaction` (solo abre una transacción de edición LOCAL). `autofill-design`/
`create-design-from-brand-template`/`copy-design`/`edit-design`/`export-design` exigen el plan-ack. Compartir/comentar/invitar/publicar desde Canva está denegado (`CONNECTOR-001`):
la publicación en Instagram sigue el Handoff (`mamw channel prepare` → el humano publica → ventana con
`Bundle:`/`URL:`/`Confirm:`). Sin `Design.md`, `DESIGN-001` bloquea. Autofill exige Canva Enterprise
(dev y usuarios); sin él, usar el Camino B. La tipografía de marca debe estar en la plantilla (el MCP
no cambia la familia). Todo texto se compone en Canva, exacto y con acentos; nada de claims/legal/
precios dibujados por un modelo. Cuenta/Team distinta a la del owner → `blocked`.
