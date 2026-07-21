import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const GATE_STATE_PATTERN = /\.mm-(?:plan-ack|plan-pending|turn)\.json/i;
const READ_TOOLS = new Set(["Read", "Glob", "Grep", "WebFetch", "WebSearch"]);
// Interaction/planning tools with no repo, network or external effect: they render
// the flow (option windows, plan mode, the step tracker) and never mutate anything.
// TodoWrite must be allowed so the orchestrator can surface the onboarding flow —
// without it the agent cannot even track its own steps and the run reads as
// "no hizo ningún flujo".
// EnterPlanMode and ToolSearch are part of the SAME approval path as ExitPlanMode: in
// harnesses where plan-mode tools are deferred, ExitPlanMode is only reachable via
// ToolSearch (loads the schema) + EnterPlanMode (enters plan mode). Denying either
// makes the ExitPlanMode approval unreachable and PLAN-ACK-001 deadlocks every R1
// mutation — including filing the bug report about the deadlock itself.
// Task/Agent (delegation, both harness names) spawn subagents whose tool calls still
// pass through these PreToolUse guards, so allowing the spawn does not bypass any
// gate — and orchestration.md REQUIRES Task delegation after approval.
const CONTROL_TOOLS = new Set([
  "AskUserQuestion", "ExitPlanMode", "EnterPlanMode", "ToolSearch",
  "Skill", "TodoWrite", "Task", "Agent"
]);
const MUTATION_TOOLS = new Set(["apply_patch", "Write", "Edit", "MultiEdit", "NotebookEdit"]);

// Normalize OAW's `expiresAt` to epoch-ms, or null when absent.
// OAW emits it as a numeric Unix timestamp in SECONDS (per the session contract),
// not an ISO string — so `Date.parse(number)` yields NaN and wrongly reads as
// expired. Handle numbers (s or ms), numeric strings, and ISO strings; a truly
// unparseable value returns 0 (fail closed → treated as expired).
export function oawExpiryMs(raw) {
  if (raw == null) return null;
  let value = raw;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) value = Number(value.trim());
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value < 1e12 ? value * 1000 : value; // seconds → ms (tolerate ms)
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function checkOawAccessSync(
  frameworkKey = "mamw",
  {
    requireVerified = false,
    timeout = 15_000,
    now = Date.now(),
    executable = process.env.MAMW_OAW_EXECUTABLE || "oaw"
  } = {}
) {
  let data;
  try {
    data = JSON.parse(execFileSync(executable, ["whoami", "--json"], {
      encoding: "utf8",
      timeout,
      stdio: ["ignore", "pipe", "pipe"]
    }));
  } catch (error) {
    const missing = error?.code === "ENOENT";
    return {
      ok: false,
      code: missing ? "OAW_MISSING" : "OAW_UNREACHABLE",
      reason: missing
        ? "OAW is not installed or not on PATH. Install/configure OAW and run `oaw login`."
        : "OAW did not return a valid session. Run `oaw login` and retry."
    };
  }

  if (data?.signedIn !== true) {
    return { ok: false, code: "NO_SESSION", reason: "No active OAW session. Run `oaw login`." };
  }

  // NO client-side expiry re-check (0.11.1, TADW parity). The `oaw` CLI is the expiry
  // authority: it verifies the id_token's `exp` (with its clock skew) plus signature and
  // silently refreshes via the refresh token. Re-implementing the policy here desynced the
  // two: inside OAW's skew window `whoami` says signedIn:true with a stale `expiresAt`, and
  // the strict re-check locked the user out for minutes every token lifetime (field bug —
  // "la sesión se resetea a cada rato"). A forged `oaw` on PATH could fake `expiresAt` just
  // as easily as `signedIn`, so the re-check added zero defense. `oawExpiryMs` stays
  // exported for observability/tests.

  const frameworks = Array.isArray(data.frameworks) ? data.frameworks : [];
  if (!frameworks.includes(frameworkKey) && !frameworks.includes("*")) {
    return {
      ok: false,
      code: "NO_ROLE",
      reason: `Your OAW role does not grant "${frameworkKey}".`
    };
  }

  const signatureVerified = data.signatureVerified === true || data.session?.signatureVerified === true;
  if (requireVerified && !signatureVerified) {
    return {
      ok: false,
      code: "UNVERIFIED_SESSION",
      reason: "The OAW session is not signature-verified; log in again before this protected operation."
    };
  }

  return {
    ok: true,
    account: data.account ?? null,
    frameworks,
    signature_verified: signatureVerified,
    session: data.session ?? null
  };
}

// The orchestration banner is enforced two ways (0.10.3): the protocol below is INJECTED
// into every turn by plan-gate (rule files alone get lost after compaction — the model must
// see the protocol in-context, TADW-style), and the approval surfaces reject any plan that
// lacks the banner's load-bearing fields. Lax ES/EN matching: the labels come from the
// banner template, but a hand-written plan in either language must also pass.
export function planHasOrchestrationStructure(plan) {
  const text = String(plan || "");
  return /\b(?:ruta|route)\s*:/i.test(text)
    && /\b(?:agentes?|agents?)\s*:/i.test(text)
    && /\b(?:efecto|effect)\b/i.test(text)
    && /\b(?:rollback|reversi[oó]n)\b/i.test(text);
}

// A CONCRETE, filled-in example (0.13.0) — models imitate an example far better than an
// abstract template full of <placeholders>, which was noise. Kept short on purpose.
const BANNER_EXAMPLE = [
  "🧭 Ruta: LIGHT — crear la HU de la campaña de verano en Azure DevOps",
  "Voy a: preparar el draft de la HU (R1) y, con tu aprobación, crearla en Azure (R2).",
  "Efecto: azure.create-work-item · Rollback: Azure crea 1 work item, sin escrituras locales.",
  "Agentes: ▶ marketing-planner (opus)"
].join("\n");

export function orchestrationProtocol(mirror = "claude") {
  const gate = mirror === "codex"
    ? "2) Termina ese mismo mensaje con [MAMW-PLAN-OFFER] y DETENTE; solo un OK escrito en el " +
      "siguiente turno aprueba. Efectos firmables: el humano corre `mamw approve` en su terminal " +
      "y, tras el OK, TÚ ejecutas `mamw azure create --confirm sha256:<hash>`."
    : "2) Abre UNA ventana corta y limpia: AskUserQuestion con la pregunta " +
      "`¿Ejecuto este plan? [MAMW-GATE: plan-ack]` (idioma del usuario, marcador literal) y " +
      "opciones «Apruebo» / «No apruebo». El CLICK del usuario es la aprobación. NO metas el " +
      "banner en la ventana; el banner va en el chat (paso 1) y el hook BLOQUEA la ventana si no " +
      "lo anunciaste (BANNER-001). " +
      "3) Si el plan crea un efecto firmable (azure.create-work-item), AÑADE a esa misma pregunta " +
      "dos líneas: `Efecto: azure.create-work-item` y `Draft: <path>`. El click FIRMA solo y te " +
      "devuelve `mamw azure create --confirm sha256:<hash>` para que TÚ lo ejecutes — sin otro " +
      "marcador ni otra ventana. Receipts de canal: añade `Bundle:`/`URL:`/`Confirm:` y el click " +
      "registra `mamw channel confirm`. Reportar un bug de MAMW: `mamw issue bug` (draft) → ventana " +
      "→ ejecuta tú `mamw issue publish --confirm sha256:<hash>`.";
  return "[MAMW] Orquestación (obligatorio, cada turno). Antes de CUALQUIER escritura o efecto:\n" +
    "1) ANUNCIA EL PLAN EN EL CHAT — un 🧭 breve (3-5 líneas concretas, en el idioma del usuario): " +
    "Ruta LIGHT/FULL y por qué, qué vas a escribir/crear, el efecto (R0/R1/R2) y el rollback. " +
    "Nada de tablas gigantes ni plantillas con <placeholders>. Ejemplo:\n" +
    BANNER_EXAMPLE + "\n" +
    gate + "\n" +
    "Reglas: nunca pidas al usuario que escriba comandos (el click firma, tú ejecutas). Trabajo " +
    "solo-lectura: muestra el 🧭 con `GATE: no requerido (solo lectura)` y responde directo, sin " +
    "ventana. Delega roles con Task anunciando `▶ Agent: <id> (<modelo>)`. Todo lo visible en el " +
    "idioma del usuario. Ver orchestration.md y approvals.md.";
}

// TADW-parity (their 2.23.3): READING gate state is legitimate — audits, self-tests, a user
// asking "why am I blocked?" — only MUTATING it is self-approval. Field impact of the old
// blanket deny: even `cat .mamw/.mm-plan-ack.json` returned a spurious PLAN-ACK-000, so a
// broken gate could not even be diagnosed. Fail closed: a Bash command touching the state
// is read-only ONLY when the WHOLE command already classifies as read-only (no pipes,
// redirects or interpreters); anything else touching it is still tamper.
function isGateStateReadOnly(name, toolInput) {
  if (READ_TOOLS.has(name)) return true;
  if (name === "Bash") return isReadOnlyCommand(String(toolInput.command || toolInput.cmd || ""));
  return false;
}

export function classifyTool(toolName, toolInput = {}) {
  const name = String(toolName || "");
  if (referencesGateState(toolInput) && !isGateStateReadOnly(name, toolInput)) {
    return { decision: "deny", code: "PLAN-ACK-000", reason: "gate_state_tampering" };
  }
  if (/^mcp__/i.test(name)) {
    return classifyConnector(name);
  }
  if (READ_TOOLS.has(name) || CONTROL_TOOLS.has(name)) {
    return { decision: "allow", effect: "R0" };
  }
  if (MUTATION_TOOLS.has(name)) {
    return { decision: "require_plan_ack", effect: "R1_MUTATION" };
  }
  if (name === "Bash") {
    const command = String(toolInput.command || toolInput.cmd || "").trim();
    if (isManualOnlyCommand(command)) {
      return { decision: "deny", code: "MANUAL-ONLY-001", reason: "human_cli_invocation_required" };
    }
    return isReadOnlyCommand(command)
      ? { decision: "allow", effect: "R0" }
      : { decision: "require_plan_ack", effect: "R1_MUTATION" };
  }
  return { decision: "deny", code: "CAPABILITY-001", reason: "unclassified_tool" };
}

// Governed connectors (0.12.0): Canva (creative drafting for IG posts/stories) and Google
// Calendar (editorial scheduling + notification reminders). Tiering: READS are R0 (browsing
// examples, listing calendars); WORKSPACE DRAFTING/SCHEDULING is R1 behind the plan-ack
// window (designs in the user's own Canva workspace, events in the user's own calendar —
// reversible, nothing public); anything that SHARES, PUBLISHES, invites third parties or
// DELETES stays denied, exactly like every unclassified connector (fail closed).
export function classifyConnector(name) {
  const server = String(name || "").toLowerCase();
  const tool = server.split("__").pop() || "";
  if (server.includes("canva")) {
    if (/^(?:help$|get-|list-|search-|resolve-)/.test(tool)) {
      return { decision: "allow", effect: "R0" };
    }
    if (/^(?:generate-design|create-design|perform-editing|start-editing|commit-editing|cancel-editing|resize-design|copy-design|merge-designs|import-design|upload-asset|export-design|create-folder|move-item)/.test(tool)) {
      return { decision: "require_plan_ack", effect: "R1_MUTATION" };
    }
    return { decision: "deny", code: "CONNECTOR-001", reason: "canva_sharing_or_unclassified" };
  }
  if (server.includes("calendar")) {
    if (/^(?:get|list|search|find|read|freebusy)[-_]/.test(tool) || /[-_](?:search|list|availability)$/.test(tool)) {
      return { decision: "allow", effect: "R0" };
    }
    if (/^(?:create|update|patch|move|quick[-_]?add)[-_]/.test(tool)) {
      return { decision: "require_plan_ack", effect: "R1_MUTATION" };
    }
    return { decision: "deny", code: "CONNECTOR-001", reason: "calendar_delete_or_unclassified" };
  }
  return { decision: "deny", code: "CONNECTOR-001", reason: "unclassified_mcp_capability" };
}

// ---------------------------------------------------------------------------
// In-process effect signing (0.12.1). Field bug (MAMW_Issues #1): the effect window spawned
// the `mamw` CLI to sign, but hooks run in the HARNESS environment where `mamw` may not be on
// PATH — the spawn failed, no approval was recorded, and `azure create` returned NO_APPROVAL.
// TADW's approve-window solves this by writing the SAME signed record the CLI would, in
// process. This block replicates lib/approvals.mjs EXACTLY (same key file, same stable
// serialization, same signature base, same approvals path) — the parity is pinned by a
// cross-validation test that signs here and verifies with the CLI's checkEffectApproval.
// ---------------------------------------------------------------------------
const APPROVAL_TTL_DAYS = 30;

function approvalKeySync() {
  const home = process.env.MAMW_HOME || join(homedir(), ".mamw");
  const file = join(home, "approval.key");
  try {
    const key = readFileSync(file);
    if (key.length >= 32) return key;
    throw new Error(`MAMW approval key at ${file} is truncated/corrupt (${key.length} bytes). Restore it from backup.`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  mkdirSync(dirname(file), { recursive: true });
  try {
    const key = randomBytes(32);
    writeFileSync(file, key, { mode: 0o600, flag: "wx" });
    return key;
  } catch (error) {
    if (error.code === "EEXIST") return readFileSync(file);
    throw error;
  }
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function scopeShaSync(scope) {
  return createHash("sha256").update(stableStringify(scope || {})).digest("hex").slice(0, 16);
}

function effectSigSync(key, { effect, payload_sha256, actor, scope, ts, expires_at }) {
  const record = `${effect}:${payload_sha256}:${actor || ""}:${scopeShaSync(scope)}:${ts}:${expires_at || ""}`;
  // .slice(0, 32) is part of the CLI's signature format (effectSig in lib/approvals.mjs) —
  // verifyEffectSig length-checks first, so an untruncated sig is rejected outright.
  return createHmac("sha256", key).update(record).digest("hex").slice(0, 32);
}

// Sign an effect approval from the HUMAN'S CLICK (approve-window is the only caller). Writes
// the same schema-1.1 record `mamw approve` writes, to the same .mamw/approvals/approvals.jsonl.
export function signEffectApprovalRecord({ cwd, effect, payload, actor = null, scope = {} }) {
  const payload_sha256 = createHash("sha256").update(stableStringify(payload), "utf8").digest("hex");
  const ts = new Date().toISOString();
  const expires_at = new Date(Date.parse(ts) + APPROVAL_TTL_DAYS * 86_400_000).toISOString();
  const key = approvalKeySync();
  const base = { schema_version: "1.1", effect, payload_sha256, actor, scope, note: "window approval (AskUserQuestion click)", ts, expires_at };
  const record = { ...base, sig: effectSigSync(key, base) };
  const file = join(cwd, ".mamw", "approvals", "approvals.jsonl");
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

export function referencesGateState(value) {
  return stringsFrom(value).some((item) => GATE_STATE_PATTERN.test(item));
}

export function isReadOnlyCommand(command) {
  if (!command || /[;&|><`\n]/.test(command) || /\$\(/.test(command)) return false;
  if (/(?:^|\s)(?:-delete|-exec|-execdir|-ok|-okdir|-fprint|-fls|--output|--pre|--pre-glob)(?:\s|=|$)/.test(command)) return false;
  return [
    /^(?:pwd|ls|find|rg|grep|head|tail|wc|tree|cat)(?:\s|$)/,
    /^sed\s+-n(?:\s|$)/,
    /^git\s+(?:status|diff|log|show|rev-parse|branch)(?:\s|$)/,
    /^(?:node\s+bin\/mamw\.mjs|mamw)\s+(?:doctor|version|help|--help|--version|agents\s+(?:list|route)|engram\s+(?:show|check|release-check)|update\s+--(?:check|dry-run))(?:\s|$)/
  ].some((pattern) => pattern.test(command));
}

// Payloads handed to an interpreter/eval (`sh -c '…'`, `bash -c "…"`, `node -e '…'`, `eval '…'`)
// are re-scanned, so quoting/wrapping cannot hide a manual-only subcommand from the guard.
function interpreterPayloads(command) {
  const out = [];
  const re = /\b(?:bash|sh|zsh|ksh|dash|node|deno|bun|python[\d.]*|ruby|perl)\b[^\n]*?-\S*[ce]\S*\s+(['"])([\s\S]*?)\1|\beval\s+(['"])([\s\S]*?)\3/gi;
  let match;
  while ((match = re.exec(command)) !== null) out.push(match[2] ?? match[4] ?? "");
  return out;
}

function scansManualOnly(text) {
  if (!text) return false;
  // "mamw" may be preceded by start, whitespace, a quote, a paren or a shell operator — NOT only
  // whitespace (the old bug: `sh -c 'mamw approve'` put a quote before mamw and slipped through).
  const boundary = /(?:^|[\s'"(;&|])/.source;
  const mamwCli = new RegExp(`${boundary}(?:(?:\\S*/)?mamw|node\\s+\\S*mamw\\.mjs)\\s+`, "i");
  const cli = (tail) => new RegExp(mamwCli.source + tail, "i").test(text);
  const approveSign = cli(/approve\b/i.source) && !cli(/approve\s+(?:--)?list\b/i.source);
  // EXECUTING an already-signed effect is delegable (0.12.0, TADW model): the CLI revalidates
  // the signed approval, the exact payload hash and the verified OAW session before acting,
  // and the Bash call itself still needs the per-turn plan-ack window. Only the FULL-hash
  // `--confirm sha256:<64hex>` form is exempt; SIGNING (`mamw approve`, done by the
  // effect-window hook on the human's click) and receipt attestation (`mamw channel confirm`)
  // remain human/hook-only.
  const signedConfirm = /--confirm\s+sha256:[a-f0-9]{64}\b/i.test(text);
  return (cli(/issue\s+publish\b/i.source) && !signedConfirm)
    || approveSign
    || (cli(/azure\s+create\b/i.source) && !signedConfirm)
    // Recording a publication receipt attests a real-world effect — human-only, like the effect.
    || cli(/channel\s+confirm\b/i.source)
    // A `mamw` whose FIRST token is a variable or subshell hides its subcommand — it cannot be
    // cleared as safe, so it is treated as manual-only (deny). Catches `mamw $X`, `mamw $(…)`.
    || new RegExp(`${boundary}(?:\\S*/)?mamw\\s+[$\`]`, "i").test(text)
    || /\bgh\s+issue\s+(?:create|edit|close)\b[^\n]*\bMAMW_Issues\b/i.test(text)
    || /\bgit\b[^\n]*\bMAMW_Issues\b[^\n]*\bpush\b/i.test(text);
}

export function isManualOnlyCommand(command) {
  if (!command) return false;
  // Signing an approval and executing a persistent effect are HUMAN-ONLY, even via env, an absolute
  // path, a quote, a shell wrapper (`sh -c`), `eval`, or variable indirection. A turn-level plan-ack
  // can never stand in for a signed effect approval. Scan the raw command AND any interpreter payload.
  return [command, ...interpreterPayloads(command)].some(scansManualOnly);
}

function stringsFrom(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => stringsFrom(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => stringsFrom(item, output));
  return output;
}
