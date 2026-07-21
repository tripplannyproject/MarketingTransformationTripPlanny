---
name: mamw-openai-creative
description: Preparar generación y edición de imágenes con la API de OpenAI de forma portable y server-side. Usar para imágenes de posts/stories, variantes visuales en N locales, prompts, captions asociados, costes, configuración por variables de entorno y evaluación de outputs.
---

# Preparar creatividad con OpenAI

## Inputs obligatorios

- `creative-provider-request-v1` compilado desde `Design.md`, DNA, placement y locale.
- `reference-assets-v1` vigente, derechos, provider capability y presupuesto de generación.
- Provider config con `auth.auth_env=OPENAI_API_KEY` y referencias no secretas a modelo, calidad,
  tamaño, máximo de imágenes y coste por ejecución.

## Procedimiento

1. Comprobar solo la presencia de la variable indicada por `auth_env`; nunca leerla para mostrarla,
   pedirla por chat ni copiar su valor a config, prompts, logs o receipts.
2. Resolver modelo y parámetros desde config. El template propone `gpt-image-2`, pero el contrato de
   dominio conserva un `model_ref` reemplazable.
3. Elegir Image API para generación/edición directa o Responses API para una experiencia iterativa;
   registrar la superficie y capability usadas.
4. Verificar que request/design/reference hashes coinciden; no reescribir silenciosamente el prompt.
5. Separar imagen, copy y composición exacta: rasterizar overlays/logos/legal lines después cuando
   deban coincidir carácter por carácter.
6. Definir N variantes, parámetros, criterios de selección, coste estimado y límites de batch.
7. Validar derechos, personas, claims, locale, accesibilidad y consistencia marca-imagen-caption.
8. Registrar request hash, provider/model snapshot, usage, receipt y checksum sin persistir secretos.
9. Incorporar los assets aprobables a `content-package-v1`; no inventar un asset si el provider
   rechaza o falla.

## Salida auditable

Producir `creative-generation-spec` y la sección `generation` de `content-package-v1`, con el
provider request aprobado, parámetros, captions/alt text asociados, costes, receipts y rúbrica.

## Límites y gates

Solo R1 mientras el provider esté `disabled` o falten adapter, budget guard y aprobación persistente.
Generar consume recursos y se clasifica R2; publicar es R4. GPT Image no genera música/audio: usar
un provider o biblioteca autorizada separada y aplicar `mamw-brand-rights`.
