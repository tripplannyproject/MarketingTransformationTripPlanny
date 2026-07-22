#!/usr/bin/env node
// Claude PostToolUse(ExitPlanMode|AskUserQuestion): bind the human-approved plan to the
// current MAMW nonce.
//
// Two capture surfaces, both harness-side events the agent cannot forge:
//   1. AskUserQuestion marked with [MAMW-GATE: plan-ack] (PRIMARY since 0.11.0, TADW-style):
//      the banner is presented IN THE CHAT (where it renders readably) and the window asks a
//      SHORT question in the user's language (`¿Ejecuto este plan? [MAMW-GATE: plan-ack]`);
//      the user's CLICK on an explicit approving option is the receipt (0.11.3 — embedding
//      the full banner in the window produced an unreadable wall of text). Unmarked question
//      windows remain non-approvals.
//   2. ExitPlanMode (accepted when the session is ALREADY in plan mode — a user toggle):
//      current runtimes do NOT pass the plan as a parameter — the tool reads it from the
//      plan FILE. The old inline-only extraction returned "" and silently failed with
//      PLAN-ACK-004, so a human-approved window never produced a receipt (0.10.4 field
//      bug). Extraction tries the inline fields (older runtimes) and then any file path
//      the event exposes.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const input = readInput();
const tool = String(input.tool_name || input.tool || "");
if (tool !== "ExitPlanMode" && tool !== "AskUserQuestion") process.exit(0);

const policy = await loadPolicy();
if (!policy) fail("[MAMW POLICY-001] No se pudo cargar la política compartida; no se registró aprobación.");
const oaw = policy.checkOawAccessSync("mamw");
if (!oaw.ok) fail(`[MAMW ${oaw.code}] ${oaw.reason}`);

// A plain (unmarked) AskUserQuestion is an ordinary interview window, not an approval
// surface — exit silently BEFORE any hard failure so normal questioning never errors here.
const gate = tool === "AskUserQuestion" ? markedPlanAck(input) : null;
if (tool === "AskUserQuestion" && !gate) process.exit(0);

if (!input.session_id) fail("[MAMW RUNTIME-001] Claude no entregó session_id; no se registró aprobación.");

const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const turn = readState(join(cwd, ".mamw", ".mm-turn.json"));
if (!turn?.turn_nonce || turn.session_id !== input.session_id) {
  fail("[MAMW PLAN-ACK-002] La ventana no corresponde al turno MAMW vigente.");
}

let plan;
let surface;
let effectNote = "";
if (tool === "ExitPlanMode") {
  surface = "ExitPlanMode";
  plan = exactPlan(input);
  if (plan.length < 40) {
    fail(
      "[MAMW PLAN-ACK-004] ExitPlanMode no entregó el plan aprobado (los runtimes actuales no lo " +
      "pasan como parámetro y este evento no expuso el archivo de plan legible). No se registró " +
      "aprobación. Usa la superficie primaria: banner 🧭 en el chat y ventana corta " +
      "`¿Ejecuto este plan? [MAMW-GATE: plan-ack]` con opciones aprobar/rechazar."
    );
  }
  // Structure is only validated where the hook actually SEES the plan (here, the plan
  // file/inline payload). The marked window carries a SHORT question — the banner lives in
  // the chat, where it renders readably (0.11.3, TADW parity: never a wall of text in the
  // window).
  if (!policy.planHasOrchestrationStructure(plan)) {
    fail(
      "[MAMW PLAN-ACK-005] El plan aprobado no contiene la estructura de orquestación (Ruta, " +
      "Agentes, Efecto máximo, Rollback). No se registró aprobación: presenta el banner 🧭 " +
      "completo y reabre el gate con ese plan exacto."
    );
  }
} else if (gate.marker === "accept") {
  // Deliverable ACCEPTANCE (0.15.0): the human reviews a FINISHED deliverable and says whether
  // it is good or needs changes. This does NOT unlock mutations — it records acceptance so the
  // agent may not self-declare a deliverable "done". Approve → write .mm-accept.json; reject →
  // tell the agent to revise. Never writes a plan-ack.
  if (gate.verdict === null) {
    fail(
      "[MAMW ACCEPT-006] No se pudo resolver la opción en la ventana [MAMW-GATE: accept]; no se " +
      "registró nada. Reábrela con opciones inequívocas (p. ej. «Acepto el entregable» / «Falta algo»)."
    );
  }
  if (gate.verdict === false) {
    process.stdout.write(
      "[MAMW] El usuario dice que el entregable NO está bien / falta algo. NO lo marques done ni " +
      "avances de fase: pregunta exactamente qué corregir, rehazlo y vuelve a presentarlo para aceptación."
    );
    process.exit(0);
  }
  const now = new Date();
  const ttlMinutes = boundedTtl(process.env.MAMW_PLAN_ACK_TTL_MINUTES);
  const record = {
    schema_version: "1.0",
    accepted: true,
    session_id: input.session_id,
    turn_nonce: turn.turn_nonce,
    label: gate.question.slice(0, 200),
    recorded_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString()
  };
  try {
    mkdirSync(join(cwd, ".mamw"), { recursive: true });
    writeFileSync(join(cwd, ".mamw", ".mm-accept.json"), `${JSON.stringify(record, null, 2)}\n`, "utf8");
    process.stdout.write("[MAMW] Entregable ACEPTADO por el usuario. Ya puedes marcarlo done y avanzar de fase.");
  } catch {
    fail("[MAMW ACCEPT-003] No se pudo persistir la aceptación; no marques el entregable done.");
  }
  process.exit(0);
} else {
  surface = "AskUserQuestion";
  if (gate.verdict === null) {
    fail(
      "[MAMW PLAN-ACK-006] No se pudo resolver la opción elegida en la ventana marcada " +
      "[MAMW-GATE: plan-ack]; no se registró nada. Reabre la ventana con opciones inequívocas " +
      "(p. ej. «Apruebo el plan» / «No apruebo»)."
    );
  }
  if (gate.verdict === false) {
    process.stdout.write(
      "[MAMW] El usuario RECHAZÓ el plan en la ventana marcada. No procedas: pregunta qué ajustar, " +
      "corrige el plan y reabre el gate."
    );
    process.exit(0);
  }
  plan = gate.plan;
  // Signable effect declared IN the plan (0.13.0): no separate marker to remember. If the
  // window carries `Efecto:` + `Draft:` lines, the human's CLICK also signs the approval —
  // the hook (harness-side, the agent can never invoke `mamw approve`) writes the signed
  // record and hands the agent the exact `--confirm sha256:<hash>` command to run itself.
  if (gate.effect) {
    const signed = signEffectApproval(gate.effect);
    if (!signed.ok) {
      const loginHint = /UNVERIFIED/i.test(String(signed.error))
        ? " Pide al usuario ejecutar `oaw login` con red y reintenta después."
        : "";
      fail(
        `[MAMW PLAN-ACK-007] La ventana fue aprobada pero la FIRMA DEL EFECTO FALLÓ: ${signed.error}. ` +
        "No se registró ni la firma ni el plan-ack. DEBES informar al usuario TEXTUALMENTE de este " +
        `error antes de continuar — nunca lo silencies.${loginHint} Luego corrige y reabre la ventana.`
      );
    }
    effectNote =
      ` Aprobación de efecto FIRMADA por el click: ${gate.effect.key} → sha256:${signed.hash}. ` +
      `Ejecuta ahora tú mismo (no pidas al usuario que lo escriba): ${signed.nextCommand}`;
  }
  // Channel receipt declared IN the plan: `Bundle:` + `URL:` + `Confirm:` lines → the click
  // attests the human's real publication and the hook records `mamw channel confirm`.
  if (gate.receipt) {
    const recorded = confirmChannelReceipt(gate.receipt);
    if (!recorded.ok) {
      fail(`[MAMW PLAN-ACK-008] La ventana fue aprobada pero el registro del receipt falló: ${recorded.error} — corrige y reabre la ventana.`);
    }
    effectNote = ` Receipt de canal REGISTRADO por el click: ${gate.receipt.url} (bundle ${gate.receipt.bundle}).`;
  }
}

const now = new Date();
const ttlMinutes = boundedTtl(process.env.MAMW_PLAN_ACK_TTL_MINUTES);
const state = {
  schema_version: "3.0",
  approved: true,
  source: "window",
  approval_surface: surface,
  session_id: input.session_id,
  turn_nonce: turn.turn_nonce,
  tool_use_id: input.tool_use_id ?? null,
  plan_hash: `sha256:${createHash("sha256").update(plan).digest("hex")}`,
  recorded_at: now.toISOString(),
  expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString()
};

try {
  mkdirSync(join(cwd, ".mamw"), { recursive: true });
  writeFileSync(join(cwd, ".mamw", ".mm-plan-ack.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  process.stdout.write(`[MAMW] Plan ${state.plan_hash} aprobado por ${surface} para el nonce actual.${effectNote}`);
} catch {
  fail("[MAMW PLAN-ACK-003] No se pudo persistir el plan-ack; las mutaciones permanecen bloqueadas.");
}

function exactPlan(value) {
  const inline = value.tool_response?.plan ?? value.tool_result?.plan ?? value.tool_input?.plan ?? value.input?.plan;
  if (typeof inline === "string" && inline.trim().length) return inline.trim();
  // Current runtimes: the plan lives in the plan FILE; the event may expose its path under
  // different keys across versions. Read the first candidate that resolves.
  const sources = [value.tool_response, value.tool_result, value.tool_input, value.input];
  const keys = ["filePath", "file_path", "planFilePath", "plan_file_path", "planFile", "plan_file"];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      const candidate = source[key];
      if (typeof candidate !== "string" || !candidate.trim()) continue;
      try { return readFileSync(candidate, "utf8").trim(); } catch { /* try next candidate */ }
    }
  }
  return "";
}

// Marked-window resolution mirrors TADW's approve-window: structured answers first, then a
// longest-label substring fallback ONLY when a single gated question rode the window; never
// guess an approval. The question stays SHORT (`¿Ejecuto este plan? [MAMW-GATE: plan-ack]`) —
// the banner lives in the chat; the receipt hash binds to the full window payload the user
// saw and clicked (question + options).
function markedPlanAck(value) {
  const questions = Array.isArray(value.tool_input?.questions) ? value.tool_input.questions : [];
  const marked = questions
    .map((q) => ({ q, m: /\[MAMW-GATE:\s*(plan-ack|effect|receipt|accept)\s*\]/i.exec(String(q?.question || "")) }))
    .filter((entry) => entry.m);
  if (!marked.length) return null;
  const question = marked[0].q;
  const marker = marked[0].m[1].toLowerCase();
  const label = selectedLabel(value, question, marked.length);
  const qtext = String(question.question || "").trim();
  const windowPayload = JSON.stringify({
    question: qtext,
    options: (question.options || []).map((option) => String(option?.label || ""))
  });
  // Effect/receipt are detected from the CONTENT lines, regardless of the marker (0.13.0):
  // the agent only has to remember ONE marker, [MAMW-GATE: plan-ack]. If the window carries
  //   Efecto: azure.create-work-item      → the click also SIGNS the effect
  //   Draft:  .mamw/azure/drafts/<file>.json
  // or  Bundle:/URL:/Confirm:            → the click also records the channel receipt.
  // These two/three short technical lines are the only plan detail that must ride the window
  // (the hook can't read the chat); the full plan is announced in the chat before the window.
  const key = (/\bEfecto:\s*([\w.$-]+)/i.exec(qtext) || [])[1];
  const draft = (/\bDraft:\s*(\S+)/i.exec(qtext) || [])[1];
  const effect = key && draft ? { key, draft } : null;
  const bundle = (/\bBundle:\s*(\S+)/i.exec(qtext) || [])[1];
  const url = (/\bURL:\s*(\S+)/i.exec(qtext) || [])[1];
  const confirm = (/\bConfirm:\s*(sha256:[a-f0-9]{64})\b/i.exec(qtext) || [])[1];
  const receipt = bundle && url && confirm ? { bundle, url, confirm } : null;
  return { plan: windowPayload, question: qtext, verdict: isApproval(label), marker, effect, receipt };
}

// Resolve the mamw executable for the RECEIPT path (channel confirm is real CLI work — no
// in-process replica). Hooks run in the harness environment, whose PATH may lack the npm
// global bin (the field failure of MAMW_Issues #1): fall back to a LOGIN shell lookup, which
// loads the user's real PATH.
function resolveMamwCli() {
  if (process.env.MAMW_CLI) return process.env.MAMW_CLI;
  try {
    execFileSync("mamw", ["--version"], { timeout: 10_000, stdio: ["ignore", "ignore", "ignore"] });
    return "mamw";
  } catch { /* not on the hook's PATH — try the user's login shell */ }
  try {
    const shell = process.env.SHELL || "/bin/zsh";
    const found = execFileSync(shell, ["-lc", "command -v mamw"], {
      timeout: 10_000, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (found) return found;
  } catch { /* fall through */ }
  return null;
}

// Record the channel receipt the human just attested by clicking (they published at the URL
// shown in the window). Runs `mamw channel confirm` in the HOOK — still never the agent.
function confirmChannelReceipt(receipt) {
  const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const bundlePath = resolve(cwd, receipt.bundle);
  if (!existsSync(bundlePath)) {
    return { ok: false, error: `el bundle ${receipt.bundle} no existe` };
  }
  const cli = resolveMamwCli();
  if (!cli) {
    return { ok: false, error: "no se encontró el ejecutable mamw (ni en PATH ni vía login shell); define MAMW_CLI" };
  }
  try {
    const stdout = execFileSync(cli,
      ["channel", "confirm", "--bundle", bundlePath, "--confirm", receipt.confirm, "--url", receipt.url, "--json"],
      { cwd, encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });
    JSON.parse(stdout);
    return { ok: true };
  } catch (error) {
    const detail = String(error?.stderr || error?.message || error).trim().slice(0, 200);
    return { ok: false, error: detail || "mamw channel confirm falló" };
  }
}

// Sign the effect the human just approved by clicking — IN PROCESS (0.12.1, TADW model).
// Field bug (MAMW_Issues #1): spawning `mamw approve` failed in the harness environment
// (`mamw` not on the hook's PATH), no approval was recorded, and `azure create` returned
// NO_APPROVAL. The hook now writes the same signed record the CLI would, via the shared
// policy module — no external executable involved. Same bar as the CLI: the OAW session
// must be signature-verified to sign.
function signEffectApproval(effect) {
  const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const draftPath = resolve(cwd, effect.draft);
  if (!existsSync(draftPath)) {
    return { ok: false, error: `el draft ${effect.draft} no existe` };
  }
  const verified = policy.checkOawAccessSync("mamw", { requireVerified: true });
  if (!verified.ok) {
    return { ok: false, error: `${verified.code}: ${verified.reason}` };
  }
  let payload;
  try {
    payload = JSON.parse(readFileSync(draftPath, "utf8"));
  } catch {
    return { ok: false, error: `el draft ${effect.draft} no es JSON válido` };
  }
  try {
    const record = policy.signEffectApprovalRecord({
      cwd,
      effect: effect.key,
      payload,
      actor: actorName(verified.account)
    });
    const hash = String(record?.payload_sha256 || "");
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return { ok: false, error: "la firma no produjo un payload_sha256 válido" };
    }
    const nextCommand = effect.key === "azure.create-work-item"
      ? `mamw azure create --draft ${effect.draft} --confirm sha256:${hash}`
      : `el comando de ejecución del efecto con --confirm sha256:${hash}`;
    return { ok: true, hash, nextCommand };
  } catch (error) {
    return { ok: false, error: String(error?.message || error).trim().slice(0, 200) };
  }
}

// OAW's whoami account may be a string or an object — the signed `actor` must be a STRING
// (an object stringifies into the signature base as "[object Object]").
function actorName(account) {
  if (!account) return null;
  if (typeof account === "string") return account;
  return account.username || account.name || account.oid || null;
}

function selectedLabel(value, question, markedCount) {
  const response = value.tool_response ?? value.tool_output ?? null;
  if (response && typeof response === "object" && response.answers && typeof response.answers === "object") {
    const direct = response.answers[String(question.question || "")];
    if (typeof direct === "string" && direct.trim()) return direct;
  }
  if (markedCount > 1) return null;
  const serialized = typeof response === "string" ? response : JSON.stringify(response ?? "");
  let best = null;
  for (const option of question.options || []) {
    const optionLabel = String(option?.label || "");
    if (optionLabel && serialized.includes(optionLabel) && (!best || optionLabel.length > best.length)) {
      best = optionLabel;
    }
  }
  return best;
}

function isApproval(label) {
  if (!label) return null;
  if (/(?:^\s*no\b)|(?:\bno\s+apruebo\b)|(?:\brechaz)|(?:\bnot\s+approved?\b)|(?:\breject)/i.test(label)) return false;
  return /\b(?:apruebo|aprobad[oa]s?|approved?|confirmo|acepto|ok)\b/i.test(label) ? true : null;
}

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function readState(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function boundedTtl(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 15) : 15;
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

function fail(reason) {
  process.stdout.write(reason);
  process.exit(0);
}
