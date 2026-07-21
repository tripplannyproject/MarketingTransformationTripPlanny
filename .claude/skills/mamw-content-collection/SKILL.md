---
name: mamw-content-collection
description: Diseñar colecciones multiformato y grafos de contenido derivado. Usar para combinar artículos, blogs, podcasts, videos, imágenes, stories, posts, newsletters e ideas con niveles de producción claros.
---

# Diseñar colecciones de contenido

## Inputs obligatorios

- Tema/story spine, objetivo, audiencia, canales, calendario y capacidad.
- Assets fuente, rights, locales y formatos admitidos.

## Procedimiento

1. Elegir pieza pillar o conjunto independiente según el propósito.
2. Definir items con `idea_only | outline | draft | publish_ready`.
3. Trazar `derived_from`, message role, channel/placement y reuse constraints.
4. Evitar duplicación semántica y adaptar el valor, no solo el tamaño.
5. Definir DoD, owner, review y métrica por item.

## Salida auditable

Producir `content-collection-v1` con grafo, items, levels, lineage, locale y gates.

## Límites y gates

No marcar `publish_ready` sin content package completo. No generar formatos sin canal, capacidad o finalidad.
