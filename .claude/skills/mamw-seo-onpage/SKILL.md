---
name: mamw-seo-onpage
description: Optimizar on-page un borrador de blog siguiendo las recomendaciones de Neil Patel — title tag 30-60 caracteres con el keyword al frente, meta description propia bajo 160 caracteres, un solo H1 con jerarquía H2/H3, keyword en title/H1/primer párrafo con densidad natural + semánticos, enlaces internos con anchor descriptivo (sin over-optimizar), alt text y nombres de archivo en imágenes, y slug limpio; evita el keyword stuffing y la over-optimización.
---

# Optimización on-page de un blog al estilo Neil Patel

Fuentes (Neil Patel, verificadas): title tags `neilpatel.com/blog/title-tags-seo/`; meta description
`neilpatel.com/blog/meta-description-magic/`; H1 `neilpatel.com/blog/h1-tag/` y
`neilpatel.com/blog/headings-impact-seo/`; internal linking
`neilpatel.com/blog/the-complete-guide-to-internal-linking/`; over-optimización
`neilpatel.com/blog/avoid-over-optimizing/`; on-page `neilpatel.com/blog/on-page-seo-recipe/`.

## Inputs obligatorios

- Borrador del blog (de `mamw-seo-blog`) con su keyword principal, intención y keywords semánticos.
- Inventario de páginas del sitio para elegir destinos de enlaces internos (y evitar canibalización).
- Imágenes de la pieza con sus derechos (para alt text / nombres de archivo).

## Procedimiento

Aplicar y verificar cada punto (checklist Neil Patel):

1. **Title tag:** 30–60 caracteres (óptimo 30–40; el CTR cae al acercarse a 50–60), con el **keyword
   al frente**. Title tag + H1 son de las señales on-page más fuertes.
2. **Meta description:** escribirla uno mismo, **bajo 160 caracteres**, con el keyword donde encaje;
   asumir que Google reescribe ~70% pero controlar la propia.
3. **Encabezados:** exactamente **un H1** (usar dos es over-optimización); varios H2/H3/H4 para
   jerarquía. El keyword en el H1 de forma natural.
4. **Colocación del keyword:** en el title, el H1 y el **primer párrafo (primeras ~100 palabras)**, con
   densidad natural (sin stuffing), reforzado con los keywords **semánticos/LSI** para ampliar alcance.
5. **URL/slug:** corto, legible, con el keyword; sin parámetros ni fechas innecesarias.
6. **Enlaces internos:** añadir varios a páginas relacionadas del sitio con **anchor text descriptivo**
   (optimizado pero **no** over-optimizado); las páginas prestan autoridad a las internas. Verificar
   que no se canibaliza otro contenido por el mismo keyword.
7. **Enlaces externos:** a fuentes autoritativas cuando aporten (refuerza E-E-A-T).
8. **Imágenes:** **alt text** descriptivo (accesibilidad + comprensión del buscador), **nombre de
   archivo** con keyword cuando aplique, y compresión para velocidad.
9. **Anti over-optimización:** revisar que no haya keyword stuffing, exceso de anchors exactos ni
   múltiples H1 — Neil Patel advierte que sobre-optimizar penaliza.

## Salida auditable

El borrador con el checklist on-page resuelto: title tag y su longitud, meta description (<160) propia,
mapa de H1/H2/H3, ubicaciones del keyword (title/H1/primer párrafo) + semánticos, slug, lista de
enlaces internos (destino + anchor) y externos, tabla de imágenes (alt text + nombre de archivo), y el
veredicto anti-over-optimización.

## Límites y gates

R1: optimiza el borrador local; no publica. No inventa enlaces internos a páginas inexistentes ni alt
text de imágenes sin derechos. No fuerza el keyword (la naturalidad y el valor mandan sobre la
densidad). El resultado pasa por la ventana de aceptación antes de marcarse done.
