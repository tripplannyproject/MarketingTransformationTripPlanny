---
name: mamw-push-notification
description: Diseñar notificaciones push y mensajería in-app seguras, consentidas y medibles. Usar para avisos de lifecycle, recordatorios de itinerario, anuncios de blog, deep links, quiet hours, frequency cap, segmentación y borradores de envío.
---

# Diseñar notificaciones push e in-app

## Inputs obligatorios

- Objetivo, segmento, evento disparador, mercado, locale, timezone y app o canal autorizado.
- Estado de opt-in push por usuario, quiet hours, frequency cap, destino del deep link y proveedor disponible.

## Procedimiento

1. Separar push transaccional (recordatorio de itinerario) de marketing o lifecycle, según consentimiento y jurisdicción.
2. Definir disparador, audiencia, título, cuerpo, deep link, ícono e imagen y fallback in-app sin inventar datos del usuario.
3. Respetar opt-in, quiet hours por timezone, frequency cap y suppression; nunca encolar a quien no consintió ese tipo.
4. Revisar deep link, accesibilidad y longitud por plataforma iOS/Android, coherencia de marca y tracking de apertura y baja.
5. Preparar preview por segmento y locale con métricas de entrega, apertura y opt-out y criterios de parada.

## Salida auditable

Producir `push-notification-plan`, piezas versionadas por segmento y locale, matriz de disparadores y checklist de consentimiento y quiet hours.

## Límites y gates

Solo R1. Registrar o programar el envío en un proveedor es R2 y despacharlo a dispositivos es R4; requieren capability, aprobación persistente y recibo implementados. Sin adapter, se detiene en borrador.
