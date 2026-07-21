---
name: mamw-connector-policy
description: Definir y evaluar políticas de conectores MCP/API para marketing. Usar para allowlists, scopes, capabilities, effect levels, datos sensibles, rate limits y default-deny.
---

# Evaluar política de conectores

## Inputs obligatorios

- Provider manifest, operación solicitada, payload redactado, actor, tenant y cuenta.
- Capability snapshot, clasificación de datos, approvals y policy vigente.

## Procedimiento

1. Resolver proveedor y cuenta exactos; rechazar targets ambiguos.
2. Verificar allowlist, auth mode, scopes, datos salientes y effect level.
3. Validar rate limit, idempotencia, timeout, retries y circuit breaker.
4. Calcular decisión `allow`, `allow_with_gate` o `deny` con reglas deterministas.
5. Registrar policy version, hashes y razón sin exponer credenciales o PII.

## Salida auditable

Producir `connector-policy-decision` reproducible con checks, decisión, restricciones y evidencia.

## Límites y gates

Default-deny. Esta skill no ejecuta la herramienta; una policy favorable tampoco sustituye aprobación humana.
