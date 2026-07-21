#!/usr/bin/env node
// Claude PreToolUse adapter: require an ExitPlanMode approval bound to session + MAMW turn nonce.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const input = readInput();
const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const tool = String(input.tool_name || input.tool || "");
const toolInput = input.tool_input || input.input || {};
const policy = await loadPolicy();
if (!policy) deny("[MAMW POLICY-001] No se pudo cargar la política compartida; se bloquea por seguridad.");
const oaw = policy.checkOawAccessSync("mamw");
if (!oaw.ok) deny(`[MAMW ${oaw.code}] ${oaw.reason}`);

const capability = policy.classifyTool(tool, toolInput);
if (capability.code === "PLAN-ACK-000") {
  deny("[MAMW PLAN-ACK-000] El estado del gate solo puede escribirlo un hook a partir de una decisión humana.");
}
if (capability.code === "MANUAL-ONLY-001") {
  deny(
    "[MAMW MANUAL-ONLY-001] Firmar aprobaciones (`mamw approve`) y atestar receipts " +
    "(`mamw channel confirm`) son humanos. Para un efecto firmable (p. ej. " +
    "azure.create-work-item): abre la ventana de confirmación [MAMW-GATE: plan-ack] añadiendo " +
    "las líneas `Efecto:` y `Draft:` en la pregunta — el hook firma con el click del usuario y " +
    "te entrega el comando `--confirm sha256:<hash>` completo, que SÍ puedes correr tú. " +
    "Nunca pidas al usuario tipear comandos."
  );
}
// BANNER-001 (0.13.0): a gate window must be preceded by the plan announced IN THE CHAT — the
// window itself stays short and clean, but the user only ever SEES the window, so if the agent
// jumped straight to it the user has no idea what they're approving ("¿apruebas el gate?"). We
// read the transcript and refuse to OPEN the window unless the plan was announced this turn.
// Timing-safe: we only enforce once the current window is already flushed to the transcript;
// otherwise we fail open (allow).
if (tool === "AskUserQuestion") {
  const questions = Array.isArray(toolInput.questions) ? toolInput.questions : [];
  const gateQ = questions.map((q) => String(q?.question || "")).find((q) => /\[MAMW-GATE:/i.test(q));
  if (gateQ && input.transcript_path) {
    const announced = bannerAnnouncedInChat(input.transcript_path, gateQ);
    if (announced === false) {
      deny(
        "[MAMW BANNER-001] Antes de abrir la ventana de confirmación, ESCRIBE EN EL CHAT qué vas " +
        "a hacer: un breve 🧭 con la Ruta (LIGHT/FULL) y, en una o dos frases, qué vas a " +
        "escribir/crear, el efecto y el rollback — en el idioma del usuario. El usuario SOLO ve " +
        "la ventana; sin ese anuncio no sabe qué aprueba. Escribe el anuncio y reabre la MISMA " +
        "ventana (corta: pregunta + opciones aprobar/rechazar)."
      );
    }
  }
}

if (capability.decision === "deny") {
  deny(`[MAMW ${capability.code}] Capability no clasificada (${tool || "sin nombre"}); default-deny.`);
}
if (capability.decision === "allow") process.exit(0);
// Plan mode is the harness's own approval sandbox: its writes produce the plan file the
// native window shows, and the harness itself blocks real repo mutations there. Requiring
// a plan-ack for them deadlocked the ExitPlanMode flow it feeds (0.10.3). Tamper
// (PLAN-ACK-000), MANUAL-ONLY and default-deny classes above still apply in plan mode.
if (String(input.permission_mode || "") === "plan") process.exit(0);
if (!input.session_id) deny("[MAMW RUNTIME-001] Claude no entregó session_id; no se puede validar el plan-ack.");

// EFFECT-001 (0.12.3, field session bd37fc30): an agent with stale context opened a PLAN-ACK
// window for an Azure effect (which signs nothing) and then ran `azure create --confirm` —
// dead-ending in the CLI's NO_APPROVAL with no in-context guidance. Intercept HERE: executing
// a signable effect without its signature on disk is refused with the exact window to open.
// The signature's cryptographic validation stays in the CLI; this check only requires that a
// record for the hash EXISTS, so the coaching lands the moment the mistake is made.
if (tool === "Bash") {
  const command = String(toolInput.command || toolInput.cmd || "");
  const execHash = /\bazure\s+create\b/.test(command)
    ? (/--confirm\s+sha256:([a-f0-9]{64})/i.exec(command) || [])[1]
    : null;
  if (execHash && !approvalsInclude(execHash)) {
    deny(
      `[MAMW EFFECT-001] No existe una aprobación firmada para sha256:${execHash}. Una ventana ` +
      "plan-ack NO firma efectos. Abre la VENTANA DE EFECTO: AskUserQuestion con la pregunta " +
      "la ventana de confirmación `[MAMW-GATE: plan-ack]` añadiendo en la pregunta las líneas " +
      "`Efecto: azure.create-work-item` y `Draft: <path del draft>` — el hook firma con el " +
      "click del usuario y te devuelve este mismo comando listo para ejecutar."
    );
  }
}

const turn = readState(join(cwd, ".mamw", ".mm-turn.json"));
const state = readState(join(cwd, ".mamw", ".mm-plan-ack.json"));
const valid = turn?.session_id === input.session_id
  && typeof turn.turn_nonce === "string"
  && state?.approved === true
  && state.source === "window"
  && ["ExitPlanMode", "AskUserQuestion"].includes(String(state.approval_surface))
  && /^sha256:[a-f0-9]{64}$/.test(String(state.plan_hash || ""))
  && Date.parse(state.expires_at) > Date.now()
  && state.session_id === input.session_id
  && state.turn_nonce === turn.turn_nonce;
if (valid) process.exit(0);

deny(
  "[MAMW PLAN-ACK-001] Mutación bloqueada: falta una aprobación humana vigente para esta sesión " +
  "y nonce de turno. (1) Anuncia el plan en el CHAT (🧭 Ruta + qué escribes/creas + efecto + " +
  "rollback). (2) Abre la ventana corta AskUserQuestion `¿Ejecuto este plan? [MAMW-GATE: plan-ack]` " +
  "con opciones aprobar/rechazar. Si el plan crea un efecto firmable (azure.create-work-item), " +
  "añade en la pregunta las líneas `Efecto:` y `Draft:` y el click también firmará."
);

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function readState(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

// BANNER-001 support: was the plan announced in the chat this turn, before this gate window?
// Returns true (announced) / false (demonstrably not) / null (can't tell → caller fails open).
function bannerAnnouncedInChat(transcriptPath, currentQuestion) {
  let entries;
  try {
    entries = readFileSync(transcriptPath, "utf8").trim().split("\n")
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return null; }
  // Enforce only once the CURRENT window is flushed to the transcript — then everything before
  // it is definitely written, so an absent banner is real (not a timing artifact).
  const marker = currentQuestion.slice(0, 40);
  const isCurrent = (entry) => entry.type === "assistant" && Array.isArray(entry.message?.content)
    && entry.message.content.some((b) => b.type === "tool_use" && b.name === "AskUserQuestion"
      && JSON.stringify(b.input?.questions || []).includes(marker));
  if (!entries.some(isCurrent)) return null;
  // Walk back to the last REAL user prompt (not a tool_result), then scan assistant text after it.
  let boundary = -1;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (isRealUserPrompt(entries[i])) { boundary = i; break; }
  }
  const banner = /🧭|\bRuta\s*:/i;
  for (let i = boundary + 1; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry.type !== "assistant" || !Array.isArray(entry.message?.content)) continue;
    for (const block of entry.message.content) {
      if (block.type === "text" && banner.test(String(block.text || ""))) return true;
    }
  }
  return false;
}

function isRealUserPrompt(entry) {
  if (entry?.type !== "user") return false;
  const content = entry.message?.content;
  if (typeof content === "string") return content.trim().length > 0;
  if (Array.isArray(content)) {
    if (content.some((b) => b.type === "tool_result")) return false;
    return content.some((b) => b.type === "text" && String(b.text || "").trim().length > 0);
  }
  return false;
}

function approvalsInclude(hash) {
  try {
    return readFileSync(join(cwd, ".mamw", "approvals", "approvals.jsonl"), "utf8")
      .includes(`"payload_sha256":"${hash}"`);
  } catch {
    return false;
  }
}

async function loadPolicy() {
  for (const url of [
    new URL("../../toolbox/scripts/mamw-policy.mjs", import.meta.url),
    new URL("../../.mamw/scripts/mamw-policy.mjs", import.meta.url)
  ]) {
    try { return await import(url); } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND") return null;
    }
  }
  return null;
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  }));
  process.exit(0);
}
