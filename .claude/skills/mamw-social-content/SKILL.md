---
name: mamw-social-content
description: Diseñar paquetes completos para posts, stories, carruseles, threads y reels/shorts, con media, captions, música, accesibilidad y variantes por locale. Usar para entregar archivos listos o preparar el payload exacto que otra skill programará/publicará.
---

# Crear contenido social

## Inputs obligatorios

- Channel profile, placement specs, `Design.md`/creative design, locales/mercados y audience.
- Assets/rights, CTA, claims, safe zones, audio permitido, calendario e intent
  `deliver_only | schedule | publish`.

## Procedimiento

1. Elegir formato y número de piezas por comportamiento, objetivo y placement; no reducir la
   entrega a una imagen suelta.
2. Diseñar hook, sequence/frame logic, caption, overlay, CTA, hashtags, alt text y interaction
   prompt por variante.
3. Crear una variante independiente por locale/mercado y aplicar transcreación cuando la cultura,
   jerga o intención no admitan traducción literal.
4. Ajustar dimensions, duration, weight, safe zones, text density, subtitles y UTM.
5. Asociar música como `platform_native`, asset licenciado o instrucción editorial. Si debe quedar
   embebida, producir video/audio compuesto; una imagen estática no contiene audio.
6. Versionar media, copy y QA por placement; conservar lineage de DNA, storytelling, brief,
   design, reference manifest, prompts, provider receipts y derechos.
7. Validar el resultado contra `.mamw/schemas/content-package-v1.schema.json`.

## Salida auditable

Producir `content-package-v1` más sus assets referenciados. Incluir intent, variantes en N locales,
media, caption/overlay/CTA/hashtags, alt text, música/derechos, QA, costes y, si se solicitó
programación/publicación, un target exacto todavía no ejecutado.

## Límites y gates

Mantener draft hasta M4. No publicar desde esta skill: delegar el efecto a
`mamw-social-publishing`. No etiquetar terceros ni usar trends/audio/assets sin permiso verificable.
Un paquete con intent `publish` no equivale a aprobación ni receipt de publicación.
