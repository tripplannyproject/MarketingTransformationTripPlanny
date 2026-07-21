---
name: mamw-brand-rights
description: Clasificar y verificar derechos de marcas, logos, personajes, testimonios, creators, música, footage, voz y assets. Usar antes de generar, editar, publicar o co-brandear contenido.
---

# Gobernar derechos de marca y assets

## Inputs obligatorios

- Asset/reference, owner, evidence de permiso, usos, canales, países y vigencia.
- Transformaciones previstas, provider destino y campaign context.

## Procedimiento

1. Clasificar `owned | licensed | partner-authorized | editorial-reference | unknown | prohibited`.
2. Verificar territorio, canal/placement, plazo, modificaciones, sublicencia, uso comercial y disclosure.
3. Distinguir referencia factual de uso de logo/style/endorsement.
4. Registrar consent para persona, voz, likeness y testimonial.
5. Para música, diferenciar asset licenciado, catálogo propio y audio nativo de plataforma; registrar
   track exacto, fragmento, territorio, cuenta/tipo de cuenta y evidencia vigente.
6. Señalar expiración y downstream assets/variantes afectados.

## Salida auditable

Producir/actualizar `brand-rights-registry` con evidence ref, scope, owner y expiry.

## Límites y gates

`unknown`/`prohibited` bloquea M4. No inferir permiso por disponibilidad pública, tendencia,
presencia en una biblioteca de otra región o relación comercial.
