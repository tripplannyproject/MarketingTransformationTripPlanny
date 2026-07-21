---
name: mamw-channel-audit
description: Auditar presencia orgánica y paid media en modo read-only. Usar para inventariar redes, cuentas publicitarias, bios, permisos, formatos, cadencia, tracking, owners y baseline antes de planear marketing.
---

# Auditar canales y cuentas

## Inputs obligatorios

- Organización, marca, mercados/locales y canales candidatos.
- Ventana histórica, cuentas observables y fuentes autorizadas.

## Procedimiento

1. Descubrir handles, URLs, account IDs, bios, owners, roles, moneda, timezone y estado.
2. Perfilar formatos, cadencia, estilo, CTA, interacción, tracking y baseline con fecha/fuente.
3. Separar observado, declarado, inferido y desconocido.
4. Marcar ownership, permisos o billing no confirmados como `unverified`.
5. Comparar presencia con DNA y channel purpose sin modificar nada.

## Salida auditable

Producir `marketing-presence-inventory`, `channel-profile` y gaps priorizados con freshness.

## Límites y gates

Mantener R0 read-only. No cambiar bios, permisos, pixels, publicaciones ni ads; bloquear cualquier
write sobre cuentas sin `presence-ownership-guard` y scope humano verificado.
