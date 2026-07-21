#!/usr/bin/env node
// Claude UserPromptSubmit adapter: verify OAW and create a runtime-independent turn nonce.
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = readInput();
const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const prompt = String(input.prompt || input.user_message || "").trim();

const policy = await loadPolicy();
if (!policy) block("[MAMW POLICY-001] No se pudo cargar la política compartida; se bloquea por seguridad.");
const oaw = policy.checkOawAccessSync("mamw");
if (!oaw.ok) block(`[MAMW ${oaw.code}] ${oaw.reason}`);
if (!prompt) block("[MAMW PROMPT-001] El runtime no entregó el prompt; se bloquea por seguridad.");
if (!input.session_id) block("[MAMW RUNTIME-001] Claude no entregó session_id; no se puede ligar la aprobación.");

const turnNonce = randomUUID();
persist(".mm-turn.json", {
  schema_version: "3.0",
  session_id: input.session_id,
  turn_nonce: turnNonce,
  prompt_sha256: hash(prompt),
  created_at: new Date().toISOString()
});
persist({
  schema_version: "3.0",
  approved: false,
  source: "window",
  session_id: input.session_id,
  turn_nonce: turnNonce,
  reason: "new_user_prompt",
  recorded_at: new Date().toISOString()
});
// Inject the full orchestrator-first protocol EVERY turn (0.10.3): rule files alone are
// not enough — after compaction or a long session the model loses them and routes/mutates
// silently. UserPromptSubmit stdout lands in the turn's context, so the banner contract,
// the gate rule and the language rule are always in front of the model.
process.stdout.write(policy.orchestrationProtocol("claude"));

function persist(fileOrValue, maybeValue) {
  const file = typeof fileOrValue === "string" ? fileOrValue : ".mm-plan-ack.json";
  const value = typeof fileOrValue === "string" ? maybeValue : fileOrValue;
  try {
    mkdirSync(join(cwd, ".mamw"), { recursive: true });
    writeFileSync(join(cwd, ".mamw", file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  } catch {
    block("[MAMW PLAN-ACK-003] No se pudo persistir el gate; se bloquea por seguridad.");
  }
}

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
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
