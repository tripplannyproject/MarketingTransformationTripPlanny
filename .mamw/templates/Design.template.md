# Design — <design_id>

> Estado: draft  
> Compañero canónico: ./creative-design-v1.json  
> Manifest de referencias: ./reference-assets-v1.json

## Scope y linaje

- Organización / marca / mercado / locale:
- Campaña, HU o ciclo:
- Brand DNA hash:
- Storytelling hash:
- Brief hash:
- Owner y revisores:

## Sistema de diseño (tokens — reusados por TODA pieza para consistencia)

Autoría del `art-director`. Cada post, story y carrusel de la marca reutiliza estos tokens para que
el set lea como un solo estudio.

- **Color y roles (60/30/10):** dominante / secundario / acento, con hex exactos + tints/shades.
  Colores de texto elegidos por contraste (nunca #000 puro sobre color de marca).
- **Escala tipográfica:** ratio modular (p. ej. 1.25) — display / H1 / H2 / body / caption; máximo
  dos familias con roles de peso; line-height y tracking por tamaño; mínimo body ≥ 32px en 1080×1920.
- **Escala de spacing:** sistema de 8px (8/16/24/32/48/64…); márgenes y gutters consistentes.
- **Grid:** columnas + márgenes por formato; ritmo base para alinear.
- **Elevación/sombra:** 2–3 niveles de sombra suave con UNA sola fuente de luz; capa de legibilidad
  (scrim/gradiente) para copy sobre foto. Radio y grosor de trazo acordes al carácter de marca.

## Objetivo y audiencia

- Cambio de percepción o acción buscada:
- Audiencia y contexto:
- Single-minded proposition:
- Proof y claims permitidos:
- Claims prohibidos o condicionados:

## Concepto creativo

- Tensión / insight:
- Idea central:
- Story spine:
- Qué debe sentirse propio de la marca:
- Qué debe evitarse para no producir contenido genérico:

## Dirección visual

- Sujeto y acción:
- Escena y entorno:
- Composición y jerarquía:
- Paleta y contraste:
- Fotografía / ilustración / materialidad:
- Iluminación y atmósfera:
- Continuidad de producto, personaje o serie:
- Safe zones y espacio reservado para copy:

## Sistema de copy

- Voice/tone:
- Hook:
- Caption y CTA por locale:
- Overlay exacto por locale:
- Texto que no debe dibujar el modelo:
- Alt text y requisitos de accesibilidad:

## Placements y composición determinista

Definir dimensiones, duración, safe zones y capas. Logos, legal, precios, CTA y cualquier texto que
deba coincidir carácter por carácter se componen después de la generación y no se delegan al modelo.

### Capas deterministas

Registrar el asset original, orden, posición y reglas de cada capa. No se envía al generador ningún
logo destinado a composición final; se aplica después con checksum y clear-space verificables.

## Referencias autorizadas

Listar únicamente IDs presentes en el manifest. Explicar para cada uno qué conservar, qué puede
transformarse y qué no debe copiarse. No incluir tokens, URLs firmadas ni credenciales.

## Variantes por mercado y locale

Definir qué permanece global y qué cambia por cultura, jerga, regulación, composición, tipografía,
RTL/CJK o expansión del texto. Cada variante publicable conserva QA y aprobación independientes.

## Política de generación

- Provider/capability permitidos:
- Máximo de intentos y assets:
- Ceiling y authority ref:
- Reglas de fallback:
- Criterios de stop/refusal:

## Rúbrica de QA

- Marca y storytelling:
- Originalidad y anti-cliché:
- Fidelidad de referencias (principio, no copia — qué se tomó y qué NO se copió):
- Derechos y marcas de terceros:
- Locale, cultura y claims (ortografía y acentos verificados):
- **Contraste MEDIDO (WCAG):** body ≥ 4.5:1, display/UI ≥ 3:1 — anotar ratios reales.
- **Jerarquía:** un solo foco; ranking hero → subhead → body → CTA → legal.
- **Safe areas y legibilidad móvil:** contenido dentro de la columna segura; texto fuera de zonas de
  UI; sin franjas, sin estiramiento, sin corte.
- Accesibilidad y formato de plataforma:

## Gate de aprobación humana

Mientras el JSON compañero no valide y el hash exacto no tenga aprobación persistente disponible,
el diseño permanece draft. Un plan-ack de turno no lo convierte en diseño aprobado ni autoriza R2.
`approved_design_hash` se calcula sobre el payload canónico excluyendo `status`, `approval_ref` y el
propio `approved_design_hash`; así la aprobación no crea un hash autorreferencial.
