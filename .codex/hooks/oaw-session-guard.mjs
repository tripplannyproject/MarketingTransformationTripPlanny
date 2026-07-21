#!/usr/bin/env node
// Codex SessionStart adapter: stop MAMW context when the managed OAW prerequisite is absent.
import { readFileSync } from "node:fs";

const input = readInput();
const policy = await loadPolicy();
const result = policy?.checkOawAccessSync("mamw") ?? {
  ok: false,
  code: "POLICY-001",
  reason: "MAMW policy runtime is unavailable."
};

if (!result.ok) {
  process.stdout.write(JSON.stringify({
    continue: false,
    stopReason: `[MAMW ${result.code}] ${result.reason}`,
    systemMessage: "MAMW is locked. Run `oaw login` and restart the session."
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
