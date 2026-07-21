---
name: mamw-calendar-scheduling
description: Programar el calendario editorial en Google Calendar de forma gobernada — proponer fecha y hora de publicación por canal, crear los eventos y los recordatorios de notificación tras la ventana de aprobación, y verificar leyendo lo creado; nunca borra eventos ni envía invitaciones a terceros.
---

# Programar posts y notificaciones en Google Calendar

## Inputs obligatorios

- Plan editorial o content package con las piezas listas y sus canales destino.
- Timezone de la marca y ventanas horarias preferidas por canal (o pedirlas como option window;
  sin dato, proponer best-times estándar del canal y marcarlos como propuesta).
- Antelación deseada de los recordatorios de notificación (p. ej. 30 min antes del envío).
- MCP de Google Calendar autenticado (si no responde, emitir `blocked` con la razón y parar).

## Procedimiento

1. Leer en R0: calendarios disponibles y eventos existentes del rango para detectar choques;
   proponer la parrilla evento→fecha/hora por pieza y canal respetando timezone y ventanas.
2. Presentar el banner 🧭 con la tabla completa (pieza, canal, fecha/hora de publicación, hora del
   recordatorio de notificación) y abrir la ventana `[MAMW-GATE: plan-ack]`.
3. Tras el click, crear en R1 un evento por pieza: título `[<canal>] <asset>`, descripción con el
   link al draft/bundle local y el estado del Handoff, y recordatorios configurados a la hora en
   que debe salir la notificación al equipo.
4. Verificar leyendo los eventos recién creados y reportar sus ids/links; registrar la parrilla
   final en el checkpoint `.mm-run.json` y el engram del ciclo.
5. Reprogramaciones: proponer el cambio, reabrir la ventana y actualizar el evento; si una pieza
   se cancela, pedir al humano borrarla desde su calendario (el borrado está denegado al agente).

## Salida auditable

Lista de event ids/links creados o actualizados con su fecha/hora y recordatorios, la parrilla
final registrada en checkpoint/engram, y el log de tools del conector por fase (R0 vs R1).

## Límites y gates

Leer calendarios y disponibilidad es R0. Crear y actualizar eventos exige el plan-ack del turno
(la política solo permite esos verbos del conector). Borrar eventos, invitar terceros o enviar
mensajes está denegado (`CONNECTOR-001`). Los recordatorios notifican al equipo interno; ninguna
notificación publica contenido: la publicación real sigue el Handoff con su ventana de receipt.
