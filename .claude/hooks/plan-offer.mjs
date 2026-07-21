#!/usr/bin/env node
// Claude Stop adapter: record marked plans for audit; execution approval comes from ExitPlanMode.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = readInput();
const message = String(input.last_assistant_message || input.response || "");
if (!message.includes("[MAMW-PLAN-OFFER]")) process.exit(0);
const policy = await loadPolicy();
const oaw = policy?.checkOawAccessSync("mamw");
if (!oaw?.ok || !input.session_id) {
  process.stdout.write("[MAMW] No se registró recordatorio de plan: OAW/session_id no verificables.");
  process.exit(0);
}
const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const plan = message.replaceAll("[MAMW-PLAN-OFFER]", "").trim();
if (plan.length < 40) process.exit(0);
const now = new Date();
const ttlMinutes = boundedTtl(process.env.MAMW_PLAN_ACK_TTL_MINUTES);
const state = {
  schema_version: "3.0",
  valid: true,
  session_id: input.session_id,
  offer_turn_id: input.turn_id ?? null,
  plan_hash: `sha256:${createHash("sha256").update(plan).digest("hex")}`,
  recorded_at: now.toISOString(),
  expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString()
};
try {
  mkdirSync(join(cwd, ".mamw"), { recursive: true });
  writeFileSync(join(cwd, ".mamw", ".mm-plan-pending.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
} catch {
  process.stderr.write("[MAMW] No se pudo registrar el plan ofrecido para auditoría.\n");
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
