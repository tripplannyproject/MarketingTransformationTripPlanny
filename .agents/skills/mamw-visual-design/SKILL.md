---
name: mamw-visual-design
description: Crear la dirección visual gobernada y los artefactos Design.md, creative-design-v1 y reference-assets-v1 para posts, stories, carruseles, anuncios, video o cualquier pieza multimodal antes de compilar prompts o generar media.
---

# Diseñar la pieza visual

## Inputs obligatorios

- Brand DNA, storytelling, creative brief, audiencia, campaign/cycle ref y claims.
- Placements, mercados/locales, assets disponibles, derechos y restricciones de producción.
- Template `.mamw/templates/Design.template.md` y schemas de diseño/referencias.

## Procedimiento

1. Resolver scope completo `organization + brand + market + locale + account` y hashes de linaje.
2. Definir objetivo, insight, idea central, story spine y elementos distintivos; declarar clichés y
   códigos de terceros que deben evitarse.
3. Especificar sujeto, escena, composición, paleta, estilo, luz, continuidad, safe zones y
   adaptación visual por locale.
4. Separar capas generativas de capas deterministas. Mantener logo, legal, precios, CTA, subtítulos
   y copy exacto fuera de los píxeles generados.
5. Crear un `reference-assets-v1` con checksum, source ref, rol de prompt, transformación permitida,
   territorios, canales, vigencia y evidencia de derechos por asset.
6. Completar `Design.md` y su compañero `creative-design-v1.json`; validar que placement, locale y
   reference manifest sean coherentes.
7. Mostrar hashes, decisiones, referencias y rúbrica antes de solicitar aprobación de diseño.

## Salida auditable

Producir, en la ruta canónica `.mamw/creative/<piece-id>/`, los archivos `Design.md`,
`creative-design-v1.json` y `reference-assets-v1.json` (con `schema_version: "creative-design-v1"`),
con scope, linaje, capas deterministas, política de generación, referencias autorizadas y QA por
mercado/locale. Ahí los encuentra el gate `DESIGN-001` y allí exporta Canva
(`.mamw/creative/<piece-id>/canva/`).

## Límites y gates

Mantener R1. No llamar modelos ni enviar referencias desde esta skill. `status: approved` exige una
aprobación persistente ligada al `design_hash`; un plan-ack del turno solo permite escribir el draft.
