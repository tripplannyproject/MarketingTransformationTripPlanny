---
name: mamw-accessibility
description: Revisar accesibilidad de contenido y campañas. Usar para alt text, captions, transcripts, contrast, motion, reading order, plain language, keyboard/assistive compatibility y formatos inclusivos.
---

# Validar accesibilidad de marketing

## Inputs obligatorios

- Content package, placements, locales, audience needs y platform capabilities.
- Visual/audio assets, copy, overlays, landing destination y standards aplicables.

## Procedimiento

1. Validar alt text útil, captions/transcripts y speaker/sound cues.
2. Revisar contrast, size, safe zones, text density, flashing/motion y reading order.
3. Verificar lenguaje claro, CTA descriptivo y no dependencia exclusiva de color/sonido.
4. Evaluar keyboard/focus/forms cuando exista destination web.
5. Registrar limitaciones del canal y alternativa equivalente.

## Salida auditable

Producir `accessibility-review` con checks, severity, remediation y status por variant.

## Límites y gates

No marcar pass por tener alt text vacío/genérico. Bloquear barreras críticas antes de M4/M5.
