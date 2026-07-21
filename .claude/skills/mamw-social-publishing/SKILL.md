---
name: mamw-social-publishing
description: Programar, publicar y reconciliar paquetes sociales aprobados mediante MCP, API o adaptador. Usar cuando un post, story, carrusel, thread o reel debe salir en una cuenta concreta, ahora o en una fecha, conservando aprobación, idempotencia y receipt.
---

# Publicar contenido social

## Inputs obligatorios

- `content-package-v1` válido y aprobado, con intent `schedule` o `publish`.
- Provider/account/tenant exactos, locales/variantes, timezone, schedule y capability snapshot.
- Payload hash, aprobación persistente vigente, preflight `ready`, idempotency key y receipt store.

## Procedimiento

1. Resolver tenant, marca, cuenta y provider sin defaults; comprobar que cada variante pertenece al
   mercado y placement declarados.
2. Revalidar specs actuales del canal, permisos de cuenta, derechos de media/música, claims,
   accesibilidad, links y ventana de publicación.
3. Recalcular el payload normalizado y exigir coincidencia exacta con el hash aprobado. Ante drift,
   expirar el preflight y volver a revisión.
4. Ejecutar `mamw-activation-preflight`; detenerse salvo decisión `ready` y effect ceiling R4.
5. Invocar el adapter una vez con idempotency key. No reintentar un timeout ambiguo hasta consultar
   el estado del provider.
6. Normalizar `scheduled | published | failed | unknown`, guardar receipt redactado y reconciliar el
   ID/URL remoto con el paquete.
7. Si la plataforma adjunta música nativa, verificar el track/derechos en la misma cuenta y región
   inmediatamente antes del efecto; no sustituirlo silenciosamente.

## Salida auditable

Producir `social-publication-receipt` con package/payload hash, provider/account, variantes,
schedule, idempotency key, estado remoto, provider post refs, timestamps y evidencia redactada.

## Límites y gates

Es R4 y no puede autoaprobarse. Aunque existan approvals persistentes (`mamw approve`), la
publicación en redes sigue **bloqueada por falta de adapter y receipt store del canal**: emitir
`blocked` y no llamar al provider. Un `OK` de plan solo permite preparar archivos locales; nunca
autoriza la publicación externa.
