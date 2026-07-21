---
name: mamw-tenant-scope
description: Resolver y proteger el scope multitenant de cada operación MAMW. Usar cuando intervienen organizaciones, marcas, mercados, locales, cuentas publicitarias, canales o providers múltiples.
---

# Resolver scope multitenant

## Inputs obligatorios

- Actor, organization, brand, market, locale, provider/account y recurso objetivo.
- Memberships, roles, delegaciones, environment y tenant policy.

## Procedimiento

1. Resolver IDs canónicos sin inferirlos de nombres ambiguos.
2. Verificar membership, rol, marca, mercado y account ownership.
3. Aplicar filtros al lookup y a todo payload; negar wildcards implícitos.
4. Detectar referencias cruzadas entre tenants y bloquear mezcla de datos/assets.
5. Emitir scope token lógico y campos que deben acompañar cada receipt.

## Salida auditable

Producir `tenant-scope-decision` con IDs, permisos, restricciones y razón de deny si aplica.

## Límites y gates

Default-deny ante cualquier scope incompleto. Nunca reutilizar assets, audiencias o credenciales entre tenants por similitud nominal.
