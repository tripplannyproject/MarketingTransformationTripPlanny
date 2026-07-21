#!/usr/bin/env node
// Codex UserPromptSubmit adapter: OAW session check + typed approval bound to a pending plan.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = readInput();
const cwd = projectRoot(input.cwd || process.cwd());
const prompt = String(input.prompt || input.user_message || "").trim();

const policy = await loadPolicy();
if (!policy) block("[MAMW POLICY-001] No se pudo cargar la política compartida; se bloquea por seguridad.");
const oaw = policy.checkOawAccessSync("mamw");
if (!oaw.ok) block(`[MAMW ${oaw.code}] ${oaw.reason}`);
if (!prompt) block("[MAMW PROMPT-001] El runtime no entregó el prompt; se bloquea por seguridad.");
if (!input.session_id || !input.turn_id) {
  block("[MAMW RUNTIME-001] Codex no entregó session_id/turn_id; no se puede ligar la aprobación.");
}

const stateFile = join(cwd, ".mamw", ".mm-plan-ack.json");
const pendingFile = join(cwd, ".mamw", ".mm-plan-pending.json");
if (!isExplicitGoAhead(prompt)) {
  persist(stateFile, rejectedState("new_user_prompt"));
  persist(pendingFile, {
    schema_version: "3.0",
    valid: false,
    session_id: input.session_id ?? null,
    invalidated_at: new Date().toISOString(),
    reason: "new_user_prompt"
  });
  // Inject the orchestrator-first protocol EVERY turn (0.10.3) — the contract must live
  // in-context, not only in rule files.
  process.stdout.write(policy.orchestrationProtocol("codex"));
  process.exit(0);
}

const pending = readState(pendingFile);
const validPending = pending?.valid === true
  && /^sha256:[a-f0-9]{64}$/.test(String(pending.plan_hash || ""))
  && Date.parse(pending.expires_at) > Date.now()
  && pending.session_id === input.session_id;
if (!validPending) {
  persist(stateFile, rejectedState("missing_or_stale_pending_plan"));
  block("[MAMW PLAN-ACK-002] El OK no corresponde a un plan pendiente vigente de esta sesión. Vuelve a mostrar el plan con [MAMW-PLAN-OFFER].");
}

const now = new Date();
const ttlMinutes = boundedTtl(process.env.MAMW_PLAN_ACK_TTL_MINUTES);
persist(stateFile, {
  schema_version: "3.0",
  approved: true,
  source: "typed",
  session_id: input.session_id,
  approval_turn_id: input.turn_id,
  offered_turn_id: pending.offer_turn_id ?? null,
  plan_hash: pending.plan_hash,
  prompt_sha256: hash(prompt),
  recorded_at: now.toISOString(),
  expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString()
});
process.stdout.write(
  `[MAMW] Plan ${pending.plan_hash} aprobado para este turno. Si cambia alcance, target, payload, presupuesto o efecto, solicita un nuevo gate.`
);

function rejectedState(reason) {
  return {
    schema_version: "3.0",
    approved: false,
    source: "typed",
    session_id: input.session_id ?? null,
    approval_turn_id: input.turn_id ?? null,
    reason,
    recorded_at: new Date().toISOString()
  };
}

function persist(file, value) {
  try {
    mkdirSync(join(cwd, ".mamw"), { recursive: true });
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  } catch {
    block("[MAMW PLAN-ACK-003] No se pudo persistir el gate; se bloquea por seguridad.");
  }
}

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function readState(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function isExplicitGoAhead(value) {
  const normalized = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
  return /^(?:ok|si|sip|yes|approved?|aprobado|apruebo|procedamos|procede|adelante|dale|hazlo|go ahead|proceed|do it|ok[, ]+(?:ejecuta|procede|adelante)(?: el plan)?)[\s.!]*$/i.test(normalized);
}

function boundedTtl(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 15) : 15;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function projectRoot(candidate) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: candidate,
      encoding: "utf8",
      timeout: 5_000,
      stdio: ["ignore", "pipe", "ignore"]
    }).trim() || candidate;
  } catch {
    return candidate;
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

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}
