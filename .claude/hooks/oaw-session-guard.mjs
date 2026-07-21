#!/usr/bin/env node
// Claude SessionStart + UserPromptSubmit adapter: every session and turn passes the OAW gate.
import { readFileSync } from "node:fs";

readInput();
const policy = await loadPolicy();
const result = policy?.checkOawAccessSync("mamw") ?? {
  ok: false,
  code: "POLICY-001",
  reason: "MAMW policy runtime is unavailable."
};
if (!result.ok) {
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: `[MAMW ${result.code}] ${result.reason}`
  }));
}

function readInput() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
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
