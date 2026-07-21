#!/usr/bin/env node
// engram-log.mjs — the conversation log of the MAMW logs engram.
//
// One hook, dispatched by hook_event_name, so the same file works in Claude Code and Codex:
//   • UserPromptSubmit → append one CHAT entry (redacted prompt preview, ts, active route/phase)
//     to the per-session append-only log  <logs-kb>/<project-id>/sessions/<session>.conv.jsonl
//   • Stop | SessionEnd → (re)render the derived <session>.summary.json from the jsonl + the
//     .mm-run.json checkpoint (turn count, first/last ts, route and phase statuses).
//
// Design notes:
//   - NEVER blocks. Pure observability: always exit 0.
//   - Writes locally even before the logs repo is linked/cloned; `mamw logs sync` pushes later.
//   - Privacy: stores a 200-char prompt preview only. MAMW_ENGRAM_LOG=off disables entirely;
//     MAMW_ENGRAM_LOG_PROMPT=off keeps only the character count.

import { readFileSync, appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

if (String(process.env.MAMW_ENGRAM_LOG || "on").toLowerCase() === "off") process.exit(0);

function readStdin() { try { return readFileSync(0, "utf8"); } catch { return ""; } }
const input = (() => { try { return JSON.parse(readStdin() || "{}"); } catch { return {}; } })();
const cwd = input.cwd || process.cwd();
const event = String(input.hook_event_name || "").trim();

function readJson(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }
const project = readJson(join(cwd, ".mamw", "project.json"));
if (!project?.project_id) process.exit(0);

const sessionId = String(input.session_id || "unknown").replace(/[^0-9A-Za-z._-]/g, "-");
const sessionsDir = join(cwd, ".mamw", "logs-kb", project.project_id, "sessions");
const convPath = join(sessionsDir, `${sessionId}.conv.jsonl`);

const run = readJson(join(cwd, ".mm-run.json")) || null;
const runRef = run ? { route: run.route || null, run_id: run.run_id || null } : null;

try {
  if (event === "UserPromptSubmit") {
    const raw = String(input.prompt || input.user_prompt || "");
    const mode = String(process.env.MAMW_ENGRAM_LOG_PROMPT || "preview").toLowerCase();
    const entry = {
      ts: new Date().toISOString(),
      type: "chat",
      session: sessionId,
      prompt_chars: raw.length,
      prompt_preview: mode === "off" ? null : raw.slice(0, 200),
      run: runRef
    };
    mkdirSync(sessionsDir, { recursive: true });
    appendFileSync(convPath, `${JSON.stringify(entry)}\n`, "utf8");
  } else if (event === "Stop" || event === "SessionEnd") {
    let turns = 0; let first = null; let last = null;
    try {
      for (const line of readFileSync(convPath, "utf8").split("\n")) {
        if (!line.trim()) continue;
        turns += 1;
        try { const e = JSON.parse(line); first = first || e.ts; last = e.ts; } catch { /* skip */ }
      }
    } catch { /* no conv yet */ }
    // No chat entries → nothing to summarize; don't seed the sessions dir with empty summaries.
    if (turns === 0) process.exit(0);
    const phases = run?.phases
      ? Object.fromEntries(Object.entries(run.phases).map(([k, v]) => [k, v?.status || "unknown"]))
      : null;
    const summary = {
      session: sessionId,
      project_id: project.project_id,
      turns,
      first_ts: first,
      last_ts: last,
      run: runRef,
      phases,
      generated_at: new Date().toISOString()
    };
    mkdirSync(sessionsDir, { recursive: true });
    writeFileSync(join(sessionsDir, `${sessionId}.summary.json`), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }
} catch { /* best-effort observability */ }
process.exit(0);
