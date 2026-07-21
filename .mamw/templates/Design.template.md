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
- Fidelidad de referencias:
- Derechos y marcas de terceros:
- Locale, cultura y claims:
- Accesibilidad y formato de plataforma:

## Gate de aprobación humana

Mientras el JSON compañero no valide y el hash exacto no tenga aprobación persistente disponible,
el diseño permanece draft. Un plan-ack de turno no lo convierte en diseño aprobado ni autoriza R2.
`approved_design_hash` se calcula sobre el payload canónico excluyendo `status`, `approval_ref` y el
propio `approved_design_hash`; así la aprobación no crea un hash autorreferencial.
