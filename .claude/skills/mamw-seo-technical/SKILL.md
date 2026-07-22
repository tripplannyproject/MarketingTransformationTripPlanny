---
name: mamw-seo-technical
description: Auditar y recomendar el SEO técnico de un sitio siguiendo a Neil Patel — crawlabilidad e indexación (robots.txt, sitemap XML, crawl budget), velocidad y Core Web Vitals, mobile-friendliness, HTTPS, canonical y duplicados, structured data/schema y arquitectura del sitio; produce un informe de auditoría con hallazgos priorizados, sin ejecutar cambios de infraestructura.
---

# Auditoría de SEO técnico al estilo Neil Patel

Fuentes (Neil Patel, verificadas): technical SEO `neilpatel.com/blog/technical-seo/`; auditoría
`neilpatel.com/blog/technical-seo-site-audit/`; 5-point checklist for bloggers
`neilpatel.com/blog/the-5-point-technical-seo-checklist-for-bloggers/`; checklist
`neilpatel.com/blog/seo-checklist/`.

## Inputs obligatorios

- URL del sitio/sección y acceso de solo-lectura a datos técnicos (crawl, Search Console/analytics
  si están disponibles) o el reporte que provea el owner. Nada de credenciales por chat.
- Alcance de la auditoría (todo el sitio, el blog, una plantilla) y prioridades del owner.

## Procedimiento

Revisar y priorizar cada área (checklist técnico de Neil Patel):

1. **Crawlabilidad e indexación.** `robots.txt` (el "GPS" del sitio: qué puede rastrear el bot),
   **sitemap XML** presente y enviado, y optimización del **crawl budget** (que el bot no gaste
   rastreo en páginas basura). Confirmar que las páginas clave están indexadas (los buscadores deben
   poder rastrear e indexar; sin eso, nada rankea).
2. **Velocidad y Core Web Vitals.** Medir LCP, INP y CLS + tiempo de carga; señalar bloqueos de
   render, imágenes sin comprimir, JS/CSS pesado.
3. **Mobile-friendliness.** Diseño responsive, viewport, tamaños táctiles, sin contenido cortado.
4. **HTTPS.** Todo el sitio sobre HTTPS, sin mixed content.
5. **Duplicados y canonical.** Detectar contenido duplicado y aplicar **canonical tags** para que el
   buscador no elija la página equivocada; revisar parámetros/paginación.
6. **Structured data / schema.** Marcado schema correcto (Article, FAQ, HowTo, Product/Review según
   la página) — base para rich results y para AEO (`mamw-seo-serp-aeo`).
7. **Arquitectura del sitio.** Navegación y profundidad de clics razonables, enlaces internos sanos,
   sin páginas huérfanas ni cadenas de redirects/404.
8. Priorizar hallazgos por impacto/esfuerzo y proponer correcciones concretas.

## Salida auditable

Un informe `technical-seo-audit` con: estado por área (crawl/index, velocidad+CWV, mobile, HTTPS,
duplicados/canonical, schema, arquitectura), evidencia/medición de cada hallazgo, y una lista
priorizada de correcciones (impacto × esfuerzo) con el owner o equipo dev como responsable de
ejecutarlas.

## Límites y gates

R1: solo audita y recomienda; **no ejecuta cambios de infraestructura, DNS, servidor ni CMS** — eso
lo hace el owner/equipo dev. No pide ni usa credenciales por chat. No inventa métricas: si no hay
datos de velocidad/crawl, decláralo como pendiente. El informe pasa por la ventana de aceptación
antes de marcarse done.
