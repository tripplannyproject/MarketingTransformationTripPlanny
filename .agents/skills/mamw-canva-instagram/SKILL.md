---
name: mamw-canva-instagram
description: Generar posts, stories y carruseles de Instagram con el MCP de Canva de forma gobernada — explorar ejemplos y plantillas primero, crear borradores en el workspace tras la ventana de aprobación y exportarlos como assets locales del content package, sin compartir ni publicar nada desde Canva.
---

# Diseñar posts y stories de Instagram con Canva

## Inputs obligatorios

- Brand DNA, `Design.md` y `creative-design-v1` de la pieza (o el brief para producirlos con
  `mamw-visual-design` antes de tocar Canva).
- Placement specs por formato: feed 1080x1350, story 1080x1920, carrusel 1080x1350 por slide,
  con safe zones y conteo de slides.
- Copy final aprobado por locale (caption, overlays, CTA) — el texto legal/claims/precios entra
  como capa determinista exacta, nunca se deja a la generación.
- MCP de Canva conectado en el proyecto (si no responde, emitir `blocked` con la razón y parar).

## Procedimiento

1. Explorar en R0: `help`, `search-designs`, `search-brand-templates` y `get-design-content` para
   levantar ejemplos, plantillas de marca y patrones del formato pedido; resumir 2-3 referencias
   con lo que se toma de cada una (composición, jerarquía, ritmo de slides).
2. Presentar el banner 🧭 con la lista exacta de diseños a crear (formato, dimensiones, plantilla
   base o generación, textos deterministas por slide) y abrir la ventana `[MAMW-GATE: plan-ack]`.
3. Tras el click, crear en R1 dentro del workspace: `generate-design`/`create-design-from-candidate`
   o `create-design-from-brand-template`, y ajustar con `perform-editing-operations` dentro de una
   transacción de edición (start → operaciones → commit); escribir los overlays con el copy exacto.
4. Exportar cada diseño con `export-design` a archivos locales bajo `.mamw/creative/canva/` y
   registrar cada asset (checksum, design id, formato, locale) en el `reference-assets-v1` /
   content package correspondiente.
5. Mostrar previews y design ids, y ofrecer la iteración como option windows (ajustar slide N /
   regenerar / aprobar el paquete); cada nueva tanda de ediciones reabre el gate.

## Salida auditable

Diseños en el workspace de Canva (ids listados) + exports locales con checksum ligados al content
package, el resumen de referencias usadas y el log de tools invocados por fase (R0 vs R1).

## Límites y gates

Explorar/leer es R0 libre. Crear, editar y exportar diseños exige el plan-ack del turno (la
política solo permite esos verbos del conector). Compartir, comentar, invitar o publicar desde
Canva está denegado (`CONNECTOR-001`): la publicación en Instagram sigue el Handoff normal
(`mamw channel prepare` → el humano publica → la ventana plan-ack con líneas Bundle:/URL:/Confirm:). Nada de claims,
legal o precios en píxeles generados; van como capas de texto exactas per `mamw-visual-design`.
