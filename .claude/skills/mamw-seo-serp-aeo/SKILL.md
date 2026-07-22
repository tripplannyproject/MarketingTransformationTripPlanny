---
name: mamw-seo-serp-aeo
description: Optimizar contenido para featured snippets y para citación por motores de IA (AEO) siguiendo a Neil Patel — formato tipo snippet (definiciones, listas, Key Takeaways, pasos), structured data (Article/FAQ/HowTo/Review) para que la IA entienda y cite, y contenido estructurado para extracción por LLMs; con la regla clave de Neil Patel: para salir en AI Overviews hay que estar ya en el top 10, así que el AEO se apoya en un SEO sólido.
---

# Optimizar para SERP features y AEO (motores de respuesta con IA) al estilo Neil Patel

Fuentes (Neil Patel, verificadas): AEO `neilpatel.com/blog/answer-engine-optimization/`; LLM SEO
`neilpatel.com/blog/llm-seo/`; AI Overviews `neilpatel.com/blog/how-to-win-in-ai-overviews/`; AEO vs
GEO `neilpatel.com/blog/geo-vs-aeo/`.

## Inputs obligatorios

- Borrador/página ya trabajado on-page (de `mamw-seo-blog` + `mamw-seo-onpage`) con su keyword e
  intención, y — si existe — su posición actual en el SERP.
- La pregunta/consulta objetivo (la "answer" que el contenido debe responder) y datos verificables.

## Procedimiento

1. **Requisito previo (regla de Neil Patel).** Para que la IA (Google AI Overviews, ChatGPT,
   Perplexity, Gemini) te CITE, la página debe **ya rankear en el top 10** — los AI Overviews extraen
   de páginas que ya rankean; si no rankeas, la IA no te manda tráfico. Por eso primero se asegura el
   SEO on-page/técnico; el AEO lo amplifica, no lo reemplaza.
2. **Formato tipo featured snippet / AI-parseable.** Estructurar la respuesta para que la IA la
   extraiga fácil: **definición** concisa arriba, **listas** y **pasos numerados** (how-to), una
   sección **Key Takeaways** y un **FAQ** con preguntas reales y respuestas directas. Responder la
   consulta objetivo en las primeras líneas de su sección.
3. **Structured data para AEO.** Aplicar schema según el tipo: **Article**, **FAQPage**, **HowTo**,
   **Product/Review** — ayuda a la IA a entender el contexto y sube la probabilidad de aparecer en
   resúmenes generados. (Coordinar con `mamw-seo-technical` para el marcado correcto.)
4. **Contenido extraíble y citable.** Afirmaciones claras y verificables, con fuentes citadas
   (E-E-A-T), datos y definiciones autónomas que un LLM pueda entresacar y citar sin ambigüedad.
5. **Cobertura de intención completa.** Cubrir las variantes y sub-preguntas de la consulta (People
   Also Ask), para captar más SERP features y más superficies de respuesta.
6. Verificar que el formato snippet no rompe la legibilidad humana ni la marca.

## Salida auditable

El contenido optimizado con: la consulta objetivo y su respuesta directa, el bloque de formato
snippet (definición/lista/pasos/Key Takeaways/FAQ), el schema recomendado por sección, el estado de
ranking (o el aviso de que sin top-10 el AEO no traccionará), y las sub-preguntas cubiertas.

## Límites y gates

R1: optimiza el borrador; no publica ni ejecuta el marcado en el sitio (eso es Handoff/dev). No
promete aparición en AI Overviews (no es garantizable) y es honesto sobre el prerrequisito de
ranking. Nada de datos o citas inventados: la IA cita contenido verificable. El resultado pasa por la
ventana de aceptación antes de marcarse done.
