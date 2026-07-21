---
name: mamw-audience-privacy
description: Definir contratos de privacidad, consentimiento y supresión para audiencias. Usar antes de enrichment, audience sync, email/SMS, outbound, retargeting o cualquier tratamiento de PII.
---

# Gobernar audiencia y consentimiento

## Inputs obligatorios

- Finalidad, jurisdicción, fuente, campos, base legal/consent y canales.
- Retención, residencia, suppression sources y owner de privacidad.

## Procedimiento

1. Minimizar campos y clasificar sensibilidad/PII.
2. Verificar finalidad compatible, consentimiento, provenance y expiración.
3. Definir exclusiones, opt-out, retention/deletion y tamaño mínimo.
4. Diseñar suppression just-in-time antes de cada ejecución.
5. Identificar transferencias, providers y regiones no autorizadas.

## Salida auditable

Producir `audience-contract` con campos permitidos, purpose, channels, expiry, suppression y approver.

## Límites y gates

No consultar personas, enriquecer, exportar ni sincronizar sin privacy gate. Nunca persistir PII
cruda en prompts, logs, Engram o receipts.
