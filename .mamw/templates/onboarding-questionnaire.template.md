# MAMW onboarding questionnaire

Run this interview in `/mm:start` (`$mm-start` in Codex). It is a **discovery interview**, not a form:
ask, listen, ask for **concrete examples**, confirm, and only then write the runtime config. Leave
anything the user cannot answer as an explicit `unknown` / `null` — never invent. Do not ask for or
store secrets — tokens live in `.env.local` or a secret store and are referenced by env-var name only.

Do not stop after packs. Walk **all** sections below; the examples (posts, blogs, media, an ad) are
what later content skills and `mamw-brand-dna` inherit — without them MAMW can only guess.

## Section 1 — Config fields (written to `mamw.config.json`)

| # | Decisión | Campo/artefacto | Detalle a preguntar |
|---|---|---|---|
| 1 | Organización, marca, owner, propósito y modelos B2C/B2B/B2B2C | `project`, `marketing_models` | `organization_id`, `brand_id`, owner, propósito de negocio |
| 2 | Productos/ofertas e iniciativas PAMW relacionadas | federation refs | qué se vende y con qué Epic/Feature de PAMW se relaciona |
| 3 | Mercados, locales BCP 47, timezones y native reviewers | locale profiles | `markets`, `locales`, `timezone`, revisores nativos por mercado |
| 4 | **Idiomas que soporta la app / producto** | `project.app_locales` | los idiomas de tu app (p.ej. es/en/pt) — pueden diferir de los locales de marketing |
| 5 | Canales propios (uno por línea) | `channel_profiles[]` | red, handle/URL, estado, estilo, cadencia, baseline |
| 6 | Disciplinas a activar (organic, paid, web, SEO, email, CRM, community, partners, sales) | packs/capabilities | qué packs encender |
| 7 | Providers MCP/API deseados, owner, ambiente y modo inicial | `providers[]` | nombre, tipo, owner, `mode` (empieza `disabled`/`read_only`), sin tokens |
| 8 | Presupuesto de anuncios | `budget` | `currency`, `authority_ref` (quién posee el techo) y monto (`total_ceiling`) — nunca inventarlo |
| 9 | Origen del tracker (Azure DevOps) | `tracker` | `type`; si Azure: `org`, `project`, `area_path`, `iteration_path`, `parent_ref` y `pat_env` (el PAT nunca se guarda) |
| 10 | Aprobadores por gate | `approval_gates` | brand, privacy, legal, locale, budget, activation, verify — nombre/rol o `unknown` |
| 11 | Knowledge KB del proyecto (repo git separado) | `engram.knowledge` | URL del repo + `local_path`; `null` si aún no existe |
| 12 | Repositorio separado de conversation logs (repo git) | `engram.logs` | URL del repo + `local_path`; `null` si aún no existe |
| 13 | Federación read-only OAW/PAMW/DAMW | `engram.federation` | confirmar acceso read-only |
| 14 | Riesgos, PII, claims, derechos, crisis y restricciones regionales | governance profile | postura de efecto por defecto y límites |
| 15 | Workflows a correr primero | catalog selection | de los 11 (feature-launch, weekly-content-system, multilingual-campaign, paid-campaign, social-publish, crisis-response, b2c-lifecycle, b2b-demand-abm, b2b2c-partner…) |

## Section 2 — Descubrimiento de marca y contenido (elicita, con ejemplos)

Esto NO son campos de config; se guardan como notas de fundación creativa (feeding `mamw-brand-dna`
y las skills de contenido). Pregunta explícitamente y pide muestras reales:

| # | Pregunta | Para qué |
|---|---|---|
| 16 | **¿De dónde sacamos el ADN de marca?** ¿Hay web, brand guide, deck, DAM o lo derivamos de ejemplos? Dame el enlace/ruta o pégame el texto. | fuente del `mamw-brand-dna` |
| 17 | **Misión, valores, tono/voz, arquetipo(s), promesa y do/don't** — en tus palabras. | Brand DNA |
| 18 | **¿Cuáles son tus flujos comunes?** (p.ej. "publicar itinerarios", "blog de consejos", "notificar por push", "campaña de correo semanal", "post diario"). | mapear a los 11 workflows |
| 19 | **Dame 2–3 ejemplos de publicaciones** que ya hayas hecho o que te gusten (pega el texto o el link). | tono real para social-content |
| 20 | **Dame 1–2 ejemplos de blog/artículo** (link o título + intro). | longform/atomization |
| 21 | **¿Qué contenido/media creas?** (foto, video corto, carrusel, reel, story, infografía…). Dame un ejemplo de cada tipo que uses. | multimodal-producer / creative |
| 22 | **Dame un ejemplo de anuncio** (copy + imagen o link) y para qué objetivo. | creative + ad-operations |
| 23 | **¿Cuál es tu presupuesto de anuncios** y quién lo aprueba? (moneda + monto, o `unknown`). | `budget.total_ceiling` + activation |
| 24 | Design system / DAM / biblioteca de assets aprobados y owner de derechos. | creative foundations |

## Cierre

Valida el resultado contra `.mamw/schemas/runtime-config.schema.json`, muestra un diff compacto y
**solo escribe tras la ventana de aprobación de plan**. Tras escribir, corre `mamw doctor` y reporta
lo que quede `unknown` (KB/logs sin enlazar, envs sin definir, aprobadores TBD).

No pedir secretos. Los providers comienzan `disabled` o `read_only`. Las aprobaciones persistentes
firmadas ya existen (`mamw approve`); los efectos de provider (R2–R5 de conectores) permanecen
inactivos hasta que exista el adapter y el receipt store de cada capability.
