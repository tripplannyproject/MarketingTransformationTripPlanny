#!/usr/bin/env node
// engram-capture.mjs — PostToolUse hook (Write|Edit|MultiEdit|NotebookEdit|apply_patch).
// Auto-records every project-file change into the active run's engram changes.jsonl inside the
// knowledge KB, so the docs trail stays current even if the agent forgets to write it.
// Pure observability: NEVER blocks, always exits 0.

import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

function readStdin() { try { return readFileSync(0, "utf8"); } catch { return ""; } }
const input = (() => { try { return JSON.parse(readStdin() || "{}"); } catch { return {}; } })();
const cwd = input.cwd || process.cwd();
const tool = String(input.tool_name || input.tool || "");
if (!/^(Write|Edit|MultiEdit|NotebookEdit|apply_patch)$/.test(tool)) process.exit(0);

// Codex edits arrive via apply_patch: changed files live inside the patch text, and one patch can
// touch several files. Claude keeps sending Write/Edit with a single file_path.
function applyPatchFiles(ti) {
  const patch = String((ti && (ti.command || ti.input || ti.patch)) || "");
  const out = []; const re = /^\*\*\*\s+(?:Add|Update|Delete)\s+File:\s+(.+?)\s*$/gm;
  let m; while ((m = re.exec(patch))) out.push(m[1].trim());
  return out;
}
const single = input?.tool_input?.file_path || input?.tool_input?.path || input?.tool_input?.notebook_path || "";
const files = single ? [single] : (tool === "apply_patch" ? applyPatchFiles(input?.tool_input) : []);
if (!files.length) process.exit(0);

// Only capture project-content changes (skip framework/VCS/build dirs and MAMW state).
const SAFE = [".mamw", ".claude", ".codex", ".agents", ".git", ".github", "node_modules", "dist", "build", "out", ".next", "vendor", "tmp", ".cache"];

function readJson(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }

const project = readJson(join(cwd, ".mamw", "project.json"));
if (!project?.project_id) process.exit(0);

// Engram root inside the cloned knowledge KB (default local path; see lib/kb.mjs KB_KINDS).
const engram = join(cwd, ".mamw", "kb", "projects", project.project_id, "engram");

// Active work item from the .mm-run.json checkpoint; fallback bucket when no run is active.
function activeWorkItem() {
  const run = readJson(join(cwd, ".mm-run.json")) || {};
  const id = run?.work_item?.id || run?.run_id || run?.route;
  return id ? String(id).replace(/[^0-9A-Za-z._-]/g, "-") : "_unassigned";
}

const dir = join(engram, "campaigns", activeWorkItem());
const base = resolve(cwd);
for (const file of files) {
  const abs = resolve(cwd, file);
  const rel = (abs.startsWith(base) ? abs.slice(base.length + 1) : abs).split("\\").join("/");
  if (SAFE.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
  // MAMW state files are workflow bookkeeping, never deliverable content.
  if (/^\.mm-[^/]+$/.test(rel)) continue;
  const rec = { ts: new Date().toISOString(), file: rel, tool, session: input.session_id || "unknown" };
  try {
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, "changes.jsonl"), `${JSON.stringify(rec)}\n`, "utf8");
  } catch { /* best-effort */ }
}
process.exit(0);
