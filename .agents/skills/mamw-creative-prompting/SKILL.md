---
name: mamw-creative-prompting
description: Compilar un creative-design-v1 y referencias autorizadas en prompts y creative-provider-request-v1 trazables para generación o edición visual, por placement y locale, sin llamar todavía al proveedor.
---

# Compilar prompts creativos

## Inputs obligatorios

- `creative-design-v1.json`, `reference-assets-v1.json`, locale y placement objetivo.
- Provider profile permitido y límites de intentos/assets/coste definidos en el diseño.

## Procedimiento

1. Validar schemas, design ref, scope, locale, placement y vigencia de derechos.
2. Excluir del request logos y capas marcadas para composición determinista.
3. Convertir objetivo, concepto, dirección visual, continuidad y adaptación local en instrucciones
   concretas; conservar las referencias como IDs/checksums y nunca como secretos.
4. Añadir restricciones negativas para claims, terceros, texto exacto, clichés e invenciones.
5. Ejecutar el compilador determinista:
   `node .mamw/scripts/compile-creative-prompt.mjs --design <json> --references <json> --locale <BCP47>`.
6. Revisar el `request_hash`, el conjunto de referencias y los límites antes de proponer generación.
7. Recompilar ante cualquier cambio de DNA, diseño, locale, placement, referencia o parámetros.

## Salida auditable

Producir `creative-provider-request-v1` con design/reference hashes, prompt, restricciones,
parámetros, referencias resueltas por ID y request hash reproducible.

## Límites y gates

Esta skill es R1 y no resuelve credenciales, sube archivos ni llama APIs. Generar/editar es R2 y
requiere provider adapter, ceiling, aprobación persistente del request hash y receipt.
