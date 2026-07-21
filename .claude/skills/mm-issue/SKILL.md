---
name: mm-issue
description: Preparar desde Codex o Claude un bug o improvement reproducible del framework MAMW, con evidencia redactada, severidad y destino, delegando el contrato especializado a mamw-issue-report.
---

# Preparar un issue del framework

## Inputs obligatorios

- Tipo, título, impacto, reproducción/evidencia, esperado, actual y severidad.
- Versión/surface afectada y confirmación de que pertenece al framework MAMW.

## Procedimiento

1. Invocar `mamw-issue-report` para reproducir, redactar y autoevaluar el reporte.
2. Eliminar secretos, PII y payloads de campañas reales de logs y ejemplos.
3. Mostrar el body completo, archivos de evidencia y destino previsto.
4. Guardar el draft local con `mamw issue bug|request` y mostrar su hash exacto.
5. Presentar el banner con el comando exacto, abrir la ventana `[MAMW-GATE: plan-ack]` y, tras el
   click, ejecutar TÚ MISMO `mamw issue publish --draft <path> --confirm sha256:<hash>` (solo la
   forma con hash completo es ejecutable). Verificar receipt y URL/registro remoto; nunca pedir
   al humano que tipee el comando.

## Salida auditable

Producir `mamw-issue-draft` listo para revisión, con severidad, reproducción, evidencia redactada y
estado remoto explícito.

## Límites y gates

Preparar es R1. Publicar en `MAMW_Issues` es R2, exige sesión OAW firmada y CLI humano separado;
un OK de turno no desbloquea la operación para el agente.
