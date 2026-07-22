---
name: mamw-openai-creative
description: Generar con la API oficial de OpenAI (gpt-image-2 / alias chatgpt-image-latest) SOLO la imagen-recurso del TEMA de la campaña — un fondo/escena sin texto, sin logo y sin assets de marca (p. ej. un paisaje de Francia para una campaña sobre Francia), con dirección de arte de calidad (composición, luz, paleta) y espacio negativo reservado para el copy; la marca (logo, tipografía, texto, color) se añade después de forma determinista en Canva.
---

# Generar la imagen-recurso del tema con OpenAI (sin marca, sin texto)

Fuentes oficiales verificadas: `developers.openai.com/api/docs/guides/image-generation`,
`developers.openai.com/api/reference/resources/images/methods/edit`,
`developers.openai.com/api/docs/models/gpt-image-2`.

## Rol exacto (importante)

OpenAI produce **únicamente el recurso visual del tema** para usar como fondo/escena en Canva —
como un stock a medida, mejor que Unsplash. **NUNCA** genera texto, logo ni compone la marca: eso se
hace determinista en Canva. La imagen debe dejar **espacio negativo intencional** donde luego irá el
copy (según las safe areas del `Design.md`).

## Inputs obligatorios

- `creative-provider-request-v1` compilado desde `Design.md` (dirección de arte del `art-director`:
  sujeto/escena, composición, luz/atmósfera, paleta y zona de espacio negativo para el copy). El
  requisito de Design.md aquí lo hacen cumplir el compilador (`compile-creative-prompt.mjs` no
  compila sin un `creative-design-v1` válido) y esta skill; el gate de hook `DESIGN-001` cubre el
  camino de Canva. Sin diseño autorizado, no generar.
- El TEMA/escena de la campaña (p. ej. "costa mediterránea de Francia al atardecer, sin personas
  reconocibles, sin carteles"). Opcional: una **imagen-ejemplo de estilo/mood de la marca** SOLO
  para consistencia de grading entre piezas (color, luz) — nunca el logo ni texto.
- Provider config: `auth.auth_env=OPENAI_API_KEY` (server-side) y el modelo por
  `MAMW_OPENAI_IMAGE_MODEL` (default `gpt-image-2`).

## Procedimiento

1. Comprobar solo la presencia de `OPENAI_API_KEY`; nunca leerla/mostrarla/pedirla por chat.
2. **Modelo (oficial):** `gpt-image-2` (snapshot fijable `gpt-image-2-2026-04-21`) o el alias
   siempre-último `chatgpt-image-latest`; resolver desde config. Registrar el snapshot en la lineage.
3. **Generar el tema:** `POST /v1/images/generations` con el prompt de la escena. Para consistencia
   de estilo entre piezas, opcionalmente `POST /v1/images/edits` adjuntando SOLO la imagen-ejemplo de
   mood de la marca con `input_fidelity: high` (para heredar grading/paleta) — sin logo ni texto.
4. **Dirección de arte de la imagen:** composición con foco claro y **espacio negativo reservado**
   para el copy (arriba o abajo según la safe area del Design.md), luz y paleta coherentes con la
   marca, profundidad/atmósfera; evitar el look "AI genérico" (simetrías rígidas, texturas sucias,
   dedos/artefactos). Sin marcas de agua, sin texto, sin UI, sin logos de terceros.
5. **Tamaño (oficial): no hay 9:16 nativo.** `size` válidos `1024x1024`/`1536x1024`/`1024x1536`/
   `auto`. Generar en `1024x1536` (vertical, 2:3) y **componer el lienzo 9:16 en Canva** (sin
   franjas, sin estirar, sin cover-crop que corte). Otros params oficiales: `quality`
   low/medium/high/auto, `output_format` png/jpeg/webp, `n` 1-10.
6. Verificar que request/design hashes coinciden; no reescribir el prompt en silencio.
7. Definir N variantes, criterios de selección, coste estimado y límites de batch.
8. Validar que la escena no incluye personas identificables sin derechos, marcas de terceros ni
   claims; registrar request hash, snapshot del modelo, usage, receipt y checksum sin secretos.
   Incorporar la imagen aprobable a `content-package-v1` como recurso; no inventar assets si falla.

## Salida auditable

`creative-generation-spec` + la sección `generation` de `content-package-v1`: modelo/snapshot,
endpoint, `size` (1024x1536), la zona de espacio negativo, criterios de selección, coste, receipt y
checksum de la imagen-recurso (sin texto ni logo).

## Límites y gates

Solo R1 mientras el provider esté `disabled` o falten adapter, budget guard y aprobación persistente.
Generar es R2; publicar es R4. La imagen es solo el recurso temático — la marca (logo, tipografía,
texto, color) se compone en Canva (`mamw-canva-instagram`). GPT Image no genera música/audio. Sin
derechos verificables o con personas identificables no autorizadas, `blocked`.
