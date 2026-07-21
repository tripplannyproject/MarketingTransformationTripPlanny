#!/usr/bin/env node
// Codex PreToolUse adapter: require the approved plan hash for this session and turn.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const input = readInput();
const cwd = projectRoot(input.cwd || process.cwd());
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
  deny("[MAMW MANUAL-ONLY-001] Esta operación R2 debe ejecutarla una persona directamente en el CLI con el hash exacto; el agente no puede invocarla.");
}
if (capability.decision === "deny") {
  deny(`[MAMW ${capability.code}] Capability no clasificada (${tool || "sin nombre"}); default-deny.`);
}
if (capability.decision === "allow") process.exit(0);
if (!input.session_id || !input.turn_id) {
  deny("[MAMW RUNTIME-001] Codex no entregó session_id/turn_id; no se puede validar el plan-ack.");
}

const state = readState(join(cwd, ".mamw", ".mm-plan-ack.json"));
const valid = state?.approved === true
  && state.source === "typed"
  && /^sha256:[a-f0-9]{64}$/.test(String(state.plan_hash || ""))
  && Date.parse(state.expires_at) > Date.now()
  && state.session_id === input.session_id
  && state.approval_turn_id === input.turn_id;
if (valid) process.exit(0);

deny(
  "[MAMW PLAN-ACK-001] Mutación bloqueada: falta un plan-ack vigente para este hash, sesión y turno. " +
  "Presenta el plan con [MAMW-PLAN-OFFER], detente y espera un OK escrito."
);

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function readState(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
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
