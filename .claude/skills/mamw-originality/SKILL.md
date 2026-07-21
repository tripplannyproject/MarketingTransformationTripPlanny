---
name: mamw-originality
description: Evaluar y mejorar originalidad, especificidad y valor humano. Usar para detectar cliché de IA, copy intercambiable, repetición histórica, similitud excesiva, hype y contenido sin insight.
---

# Evaluar originalidad

## Inputs obligatorios

- Draft, DNA/story brief, evidence y corpus de contenido propio comparable.
- Thresholds de similitud y lista versionada de anti-patterns.

## Procedimiento

1. Evaluar specificity, distinctiveness, proof, channel nativeness, novelty y voice fidelity.
2. Identificar fórmulas, generalidades, ritmo sintético y claims vacíos.
3. Comparar contra historial propio y piezas del ciclo.
4. Prescribir insight, experiencia, data o point of view faltante.
5. Re-evaluar después de una reescritura estructural.

## Salida auditable

Producir `originality-eval` con scores, evidence snippets, blockers y revision brief.

## Límites y gates

No “resolver” con sinónimos. Un score bajo bloquea `publish_ready` y reabre research/story.
