---
name: mamw-codex-creative
description: Generar con la SUSCRIPCIÓN de Codex (tool nativo image_gen / gpt-image-2, SIN OPENAI_API_KEY) SOLO la imagen-recurso del TEMA de la campaña — un fondo/escena sin texto, sin logo y sin assets de marca (p. ej. un paisaje de Francia para una campaña sobre Francia), con dirección de arte de calidad (composición, luz, paleta) y espacio negativo reservado para el copy; la marca (logo, tipografía, texto, color) se añade después de forma determinista en Canva.
---

# Generar la imagen-recurso del tema con la suscripción Codex (sin marca, sin texto)

Fuentes verificadas (jul-2026): OpenAI Help Center *Using Codex with your ChatGPT plan*;
Codex CLI image generation (`image_gen` / skill `$imagegen`, modelo `gpt-image-2`). La generación
consume la **cuota de la suscripción** (Plus/Pro/Business/Enterprise) vía la sesión OAuth de Codex,
**no una API key**.

## Rol exacto (importante)

Codex produce **únicamente el recurso visual del tema** para usar como fondo/escena en Canva —
como un stock a medida, mejor que Unsplash. **NUNCA** genera texto, logo ni compone la marca: eso se
hace determinista en Canva. La imagen debe dejar **espacio negativo intencional** donde luego irá el
copy (según las safe areas del `Design.md`).

## Runtime dual (autoseleccionado por entorno)

- **native** — el agente que ejecuta esta skill ES Codex (p. ej. VS Code): llamar el tool nativo
  `image_gen` (skill built-in `imagegen`) en el propio entorno. El PNG cae en
  `$CODEX_HOME/generated_images/<uuid>/call_<id>.png` (por defecto `~/.codex/generated_images/...`).
- **bridge** — el orquestador es Claude Code: invocar `codex exec` como subproceso. Codex genera con
  la suscripción (auth `chatgpt`, sin API key) y MAMW **adopta** el PNG reportado.
- Selección por `provider.config.runtime` (`auto|native|bridge`). `auto` sin poder decidir → error
  explícito pidiendo `native|bridge`.

### Invocación EXACTA del bridge (verificada end-to-end)

```bash
codex exec \
  -s workspace-write \
  -c approval_policy=never \
  "$PROMPT" \
  < /dev/null
```

Cada flag resuelve un cuelgue/bloqueo real (sin ellos NO se genera nada):

- **`< /dev/null`** — CIERRA stdin. Sin esto `codex exec` se cuelga en *"Reading additional input from
  stdin"* esperando EOF.
- **`-c approval_policy=never`** — sin esto se cuelga esperando aprobación del tool.
- **`-s workspace-write`** — el sandbox por defecto (read-only) BLOQUEA que `image_gen` escriba el PNG.
- **NO** uses `--dangerously-bypass-approvals-and-sandbox`: el **clasificador de comandos de Claude
  Code lo BLOQUEA**. Usa los overrides granulares de arriba.
- Requiere `image_gen` disponible → auth `chatgpt` (suscripción). Con auth por API key el tool built-in
  puede no exponerse (`openai/codex#19133`).
- En `$PROMPT` pide explícitamente: usar la skill `imagegen`, generar `1024x1536` sin texto/logo con
  espacio negativo, y terminar imprimiendo **una** línea `MAMW_IMAGE_PATH=<ruta absoluta del PNG>`. El
  orquestador parsea esa línea (o el token `…/generated_images/…\.png`) y adopta ese fichero.

## Inputs obligatorios

- `creative-provider-request-v1` **compilado** (lleva `design_hash` + `request_hash`). No se compila sin
  un `creative-design-v1` válido (`compile-creative-prompt.mjs`).
- **Aprobación firmada `creative.generate`** ligada al hash exacto de ese request (ver *Autorización
  previa*). Sin ella el ejecutor bloquea con `no_generation_approval` y, en bridge, Codex se niega.
- El TEMA/escena de la campaña. Opcional: una **imagen-ejemplo de mood de la marca** SOLO para
  consistencia de grading — nunca el logo ni texto.
- Provider config `codex-images`: `auth.type=none`, `secret_location=codex_session` (sin `auth_env`);
  modelo por `MAMW_OPENAI_IMAGE_MODEL` (default `gpt-image-2`), tamaño por `MAMW_OPENAI_IMAGE_SIZE`.
- **Ausencia de `OPENAI_API_KEY`** en el entorno: si está presente, Codex factura por API → `blocked`.

## Autorización previa a generar (design_hash) — OBLIGATORIA

Generar es un efecto **R2** y exige una **aprobación firmada** ligada al request compilado exacto, igual
que `channel.publish`. En un proyecto gobernado, Codex REVISA `.mamw/approvals/approvals.jsonl` y **se
niega** si no la encuentra (termina en `collab: Wait` sin generar — comportamiento correcto). Ruta
completa, ANTES de generar / de llamar a `codex exec`:

1. **Autorar el diseño** — el `art-director` produce un `creative-design-v1.json` bajo `.mamw/` a partir
   de la dirección de arte real (`bg-art-direction.md` / specs IMG). Si la dirección de arte NO se llama
   `Design.md`, derívala igualmente a un `creative-design-v1`: lo que el compilador exige es el
   **contrato**, no el nombre del fichero.
2. **Compilar** — `node .mamw/scripts/compile-creative-prompt.mjs --design <design.json> --references
   <refs.json> --locale <BCP47> [--placement <id>] > request.json`.
3. **Firmar la aprobación** (humano en terminal; los agentes NO pueden) —
   `mamw approve --effect creative.generate --payload request.json`. Escribe un registro firmado (HMAC)
   ligado al hash exacto del request en `.mamw/approvals/approvals.jsonl`.
4. **Generar** — recién ahora el ejecutor procede: `runCreativeGeneration` valida la firma
   (`checkEffectApproval`, efecto `creative.generate`); si falta, `blocked (no_generation_approval)` con
   el remedio exacto.

## Procedimiento

1. **Preflight de facturación:** si `OPENAI_API_KEY` está en el entorno → `blocked`; nunca leer/mostrar/
   pedir la key por chat.
2. **Idempotencia:** si `request_hash` ya tiene receipt en `.mamw/creative/index.json`, devolver los
   assets existentes (`reused=true`) SIN regenerar (cero cuota) — sin re-pedir aprobación.
3. **Gate de aprobación:** verificar la aprobación firmada `creative.generate` del request; si falta →
   `blocked (no_generation_approval)` con el remedio `mamw approve --effect creative.generate --payload …`.
4. **Aviso de cuota:** en el gate `plan-ack` mostrar el libro semanal propio (`.mamw/creative/usage.json`:
   "imágenes MAMW esta semana: X"), "este run: +N (4 carrusel + 1 story)" y el **link al panel real** de
   Codex — marcando que es contabilidad de MAMW, no la cuota real (no consultable por CLI).
5. **Generar** — native: tool `image_gen`; bridge: la *Invocación EXACTA* de arriba. Modelo `gpt-image-2`
   (snapshot fijable `gpt-image-2-2026-04-21`; registrarlo en la lineage). Tamaño `1024x1536` (no hay
   9:16 nativo) y componer el lienzo 9:16 en Canva (sin franjas/estirar/cover-crop).
6. **Adopción atómica:** parsear `MAMW_IMAGE_PATH=` (o el token `…/generated_images/…\.png`), validar
   ruta + checksum y mover el PNG al store de MAMW con escritura atómica (temp+rename). Sin ruta
   reportada → ese ítem `failed`, no adivinar "el último".
7. **Batch resiliente:** por variante, try/catch + reintentos con backoff hasta `max_attempts`; si agota,
   marcar `failed` y **continuar** — un fallo de red NO aborta el batch.
8. **Guard por tamaño/volumen:** rechazar assets sobre `MAMW_CREATIVE_MAX_BYTES_PER_ASSET`; detener el
   run en `MAMW_OPENAI_MAX_IMAGES_PER_RUN` (5 = 4 carrusel + 1 story). Registrar el motivo.
9. Verificar que request/design hashes coinciden; no reescribir el prompt en silencio. Validar que la
   escena no incluye personas identificables sin derechos, marcas de terceros ni claims. Emitir el
   receipt (`creative-generation-receipt-v1`, inmutable, sin secretos) e incrementar el libro semanal
   solo tras run exitoso. No inventar assets si falla.

## Salida auditable

`creative-generation-receipt-v1` + la sección `generation` de `content-package-v1`: runtime
(native/bridge), modelo/snapshot, `size` (1024x1536), la zona de espacio negativo, criterios de
selección, estado por ítem, receipt parcial si aplica, checksum de cada imagen-recurso (sin texto ni
logo) y actualización del libro semanal. Sin secretos, tokens ni rutas de sesión OAuth.

## Límites y gates

Solo R1 mientras el provider `codex-images` esté `disabled`. Generar es R2 y **exige la aprobación
firmada `creative.generate`** ligada al request compilado (ver *Autorización previa*); publicar es R4. La imagen es solo el recurso temático — la marca (logo,
tipografía, texto, color) se compone en Canva (`mamw-canva-instagram`).
GPT Image no genera música/audio. Consume tu cuota de suscripción Codex (los turnos con imagen gastan 3–5× más rápido que
texto); respetar el uso asistido/interactivo de los términos de Codex, cap 5 img/run, sin batches
masivos desatendidos. Si `OPENAI_API_KEY` está presente (facturaría por API), `blocked`. Sin derechos
verificables o con personas identificables no autorizadas, `blocked`.
