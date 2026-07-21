---
name: mamw-multilingual-media
description: Adaptar layout, imágenes, video y audio a múltiples escrituras/locales. Usar para text expansion, glyphs, RTL/CJK, overlays, subtitles, dubbing, pronunciation, captions y safe zones.
---

# Adaptar media multilingüe

## Inputs obligatorios

- Approved localized copy, asset source, N target locales/markets y placement specs.
- Font/glyph licenses, safe zones, audio tracks con derechos territoriales y accessibility requirements.

## Procedimiento

1. Medir expansion, line breaks, glyph coverage y reading direction.
2. Recomponer overlay/disclaimer determinísticamente; no deformar el source.
3. Sincronizar subtitles/dubbing, pronunciation, timing y speaker labels.
4. Adaptar crops/thumbnails, visual references, música y timing a cada mercado; no asumir que una
   licencia, un trend o una biblioteca de plataforma está disponible en todos los territorios.
5. Mantener copy, media, audio, derechos y QA agrupados bajo el mismo `variant_id`.
6. Ejecutar visual/audio/accessibility QA y native-market review por variante.

## Salida auditable

Producir cada variante de `content-package-v1` con checksum, locale/market, layout/audio specs,
caption/overlay asociado, derechos, QA y source lineage.

## Límites y gates

Bloquear truncation, missing glyphs, wrong RTL order o disclaimer ilegible. No generar voz clonada sin consent.
