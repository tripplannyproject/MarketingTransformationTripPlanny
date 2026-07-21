---
name: mamw-provider-onboarding
description: Incorporar herramientas de marketing por MCP, API o adaptador con mínimo privilegio. Usar para CRM, social, ads, analytics, DAM, CMS, Apollo-like y nuevos proveedores.
---

# Incorporar un proveedor

## Inputs obligatorios

- Proveedor, tenant/account objetivo, caso de uso, owner y ambientes.
- Documentación oficial, método de autenticación, scopes, datos y operaciones requeridas.

## Procedimiento

1. Inventariar herramientas, recursos, transports, límites, webhooks y residencia de datos.
2. Mapear cada capability a R0–R5 y eliminar permisos no necesarios.
3. Definir secret references, rotación y separación dev/staging/prod sin capturar secretos. Para
   OpenAI usar por defecto `OPENAI_API_KEY` server-side; para OAuth conservar tokens fuera del repo.
4. Ejecutar conectividad read-only o dry-run y guardar evidencia redactada.
5. Publicar manifest, health check, failure modes, rollback y owner de renovación.

## Salida auditable

Producir `provider-manifest` con capabilities, scopes, effect levels, credenciales referenciadas y resultado de prueba.

## Límites y gates

No solicitar secretos en chat ni persistir tokens. La conexión se mantiene `disabled` si faltan
allowlist, guard, presupuesto, owner o aprobación; declarar un provider no lo habilita.
