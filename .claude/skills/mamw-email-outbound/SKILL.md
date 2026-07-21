---
name: mamw-email-outbound
description: Diseñar email marketing y outbound seguro, consentido y medible. Usar para newsletters, nurturing, secuencias B2B, personalización, entregabilidad, bajas y borradores de envío.
---

# Diseñar email y outbound

## Inputs obligatorios

- Objetivo, segmento, etapa del journey, mercado, locale y remitente autorizado.
- Base legal o consentimiento, suppression list, frecuencia, CTA y proveedor disponible.

## Procedimiento

1. Separar email consentido, transaccional y prospección legítima según jurisdicción.
2. Diseñar secuencia, asunto, preheader, cuerpo, personalización y fallback sin inventar datos.
3. Validar identidad del remitente, preferencias, baja, frequency cap y suppression list.
4. Revisar enlaces, tracking, accesibilidad, entregabilidad y coherencia con marca.
5. Preparar preview por segmento y locale con métricas y criterios de parada.

## Salida auditable

Producir `email-outbound-plan`, piezas versionadas, matriz de segmentos y checklist de cumplimiento.

## Límites y gates

Solo R1. Crear una secuencia remota es R2 y enviarla es R4; el mecanismo de aprobación firmada ya
existe (`mamw approve`), pero ambos siguen bloqueados hasta que exista el adapter/capability y el
receipt store del canal. Sin adapter, se detiene en borrador.
