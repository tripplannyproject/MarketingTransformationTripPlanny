---
name: mamw-activation-preflight
description: Ejecutar el preflight determinista previo a publicar, enviar, sincronizar o gastar. Usar antes de cualquier efecto R2–R5 en social, ads, email, CRM, CMS o generación con costo.
---

# Validar una activación

## Inputs obligatorios

- Intent, target exacto, payload versionado y su hash, actor y sesión OAW.
- Governance decision, connector policy, approvals, presupuesto y capability snapshot.

## Procedimiento

1. Resolver tenant, marca, mercado, locale, provider y account sin defaults implícitos.
2. Recalcular effect level y confirmar que la sesión tiene rol MAMW vigente.
3. Validar scope, derechos —incluida música por territorio—, compliance, presupuesto, schedule,
   variantes locales, idempotencia y policy/capability snapshot del proveedor.
4. Comparar payload hash con el aprobado y bloquear cualquier drift material.
5. Emitir `ready`, `blocked` o `expired`; definir receipt y rollback esperados.

## Salida auditable

Producir `activation-preflight` con decisión determinista, checks, hashes, approvals y expiración.

## Límites y gates

No ejecuta el efecto. Un intent `schedule`/`publish` dentro de `content-package-v1` no es autorización.
Sin guard transaccional, approval verificable y receipt store, la única decisión posible es `blocked`.
