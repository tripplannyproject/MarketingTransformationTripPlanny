#!/usr/bin/env node
// Codex Stop: capture the exact assistant plan that a later typed OK may approve.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = readInput();
const message = String(input.last_assistant_message || input.response || "");
if (!message.includes("[MAMW-PLAN-OFFER]")) process.exit(0);
const policy = await loadPolicy();
const oaw = policy?.checkOawAccessSync("mamw");
if (!oaw?.ok || !input.session_id || !input.turn_id) {
  process.stdout.write("[MAMW] No se creó plan pendiente: OAW, session_id o turn_id no son verificables.");
  process.exit(0);
}
const cwd = projectRoot(input.cwd || process.cwd());
const plan = message.replaceAll("[MAMW-PLAN-OFFER]", "").trim();
if (plan.length < 40) process.exit(0);
// Same structural bar as the Claude window (0.10.3): an offer without the banner's
// load-bearing fields never becomes a pending plan, so a typed OK has nothing to approve.
if (!policy.planHasOrchestrationStructure(plan)) {
  process.stdout.write(
    "[MAMW PLAN-ACK-005] La oferta no contiene la estructura de orquestación (Ruta, Agentes, " +
    "Efecto máximo, Rollback); no se creó plan pendiente. Presenta el banner 🧭 completo y " +
    "vuelve a terminar con [MAMW-PLAN-OFFER]."
  );
  process.exit(0);
}
const now = new Date();
const ttlMinutes = boundedTtl(process.env.MAMW_PLAN_ACK_TTL_MINUTES);
const state = {
  schema_version: "3.0",
  valid: true,
  session_id: input.session_id,
  offer_turn_id: input.turn_id,
  plan_hash: `sha256:${createHash("sha256").update(plan).digest("hex")}`,
  recorded_at: now.toISOString(),
  expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString()
};
try {
  mkdirSync(join(cwd, ".mamw"), { recursive: true });
  writeFileSync(join(cwd, ".mamw", ".mm-plan-pending.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
} catch {
  process.stderr.write("[MAMW] No se pudo registrar el plan pendiente; un OK posterior fallará cerrado.\n");
}

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
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
