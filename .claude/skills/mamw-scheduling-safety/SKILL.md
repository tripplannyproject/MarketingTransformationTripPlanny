---
name: mamw-scheduling-safety
description: Diseñar scheduling seguro para contenido y campañas con timezone, DST, ventanas, expiración y sesión de servicio. Usar para calendarios, jobs recurrentes y activaciones futuras.
---

# Validar scheduling

## Inputs obligatorios

- Artefacto aprobado, mercados, timezone IANA, fecha/ventana, recurrencia y expiry.
- Provider/account, blackout dates, owner, service identity y rollback.

## Procedimiento

1. Normalizar tiempo conservando timezone local y UTC; evaluar cambios DST.
2. Detectar colisiones, blackout dates, expiraciones y límites del proveedor.
3. Verificar que aprobación y payload sigan vigentes en execution time.
4. Exigir service identity separada de sesiones humanas y mínimo privilegio.
5. Definir missed-run, retry, deduplicación, cancelación y recibo por ejecución.

## Salida auditable

Producir `schedule-safety-plan` con ocurrencias, timezone, vigencias, guard y failure policy.

## Límites y gates

No crear jobs en la etapa fundacional. Una aprobación no autoriza cambios futuros del payload ni ejecución fuera de su vigencia.
