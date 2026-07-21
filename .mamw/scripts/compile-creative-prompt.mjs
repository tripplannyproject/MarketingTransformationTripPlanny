#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const options = parseOptions(process.argv.slice(2));
if (!options.design || !options.references || !options.locale) {
  fail("Usage: compile-creative-prompt --design <creative-design.json> --references <reference-assets.json> --locale <BCP47> [--placement <id>]");
}

const design = await readJson(options.design, "creative design");
const manifest = await readJson(options.references, "reference manifest");
assert(design.schema_version === "creative-design-v1", "design must use creative-design-v1");
assert(manifest.schema_version === "reference-assets-v1", "references must use reference-assets-v1");
assert(manifest.design_ref === designRef(design), "reference manifest design_ref does not match the design");
const immutableDesignHash = hashJson(designPayload(design));
if (design.status === "approved") {
  assert(design.approved_design_hash === immutableDesignHash, "approved_design_hash does not match the immutable design payload");
}

const locale = design.locales?.find((item) => item.locale === options.locale);
assert(locale, `locale ${options.locale} is not declared by the design`);
const placement = options.placement
  ? design.placements?.find((item) => item.placement_id === options.placement)
  : design.placements?.[0];
assert(placement, options.placement ? `placement ${options.placement} is not declared by the design` : "design has no placement");

const now = Date.now();
const references = (manifest.assets || [])
  .filter((asset) => asset.locale_scope?.includes("*") || asset.locale_scope?.includes(locale.locale))
  .filter((asset) => asset.prompt_role !== "logo_for_composition_only")
  .map((asset) => {
    if (asset.rights?.expires_at && Date.parse(asset.rights.expires_at) <= now) {
      fail(`reference ${asset.asset_id} has expired rights`);
    }
    if (asset.rights?.third_party_brand && !["licensed", "partner_authorized"].includes(asset.rights.status)) {
      fail(`reference ${asset.asset_id} contains a third-party brand without licensed or partner-authorized rights`);
    }
    if (asset.rights?.commercial_use !== true) {
      fail(`reference ${asset.asset_id} is not authorized for commercial use`);
    }
    if (!asset.rights?.territories?.includes("*") && !asset.rights?.territories?.includes(locale.market)) {
      fail(`reference ${asset.asset_id} is not authorized for market ${locale.market}`);
    }
    if (!asset.rights?.channels?.includes("*")
      && !asset.rights?.channels?.includes(placement.placement_id)
      && !asset.rights?.channels?.includes(placement.platform)) {
      fail(`reference ${asset.asset_id} is not authorized for placement ${placement.placement_id}`);
    }
    return {
      asset_id: asset.asset_id,
      checksum: asset.checksum,
      source_kind: asset.source.kind,
      source_ref: asset.source.ref,
      transport_policy: asset.source.transport_policy,
      prompt_role: asset.prompt_role,
      instruction: asset.instruction
    };
  });
assert(references.length <= design.generation_policy.max_assets, "provider-visible references exceed generation_policy.max_assets");

const negativeConstraints = [
  ...(design.concept?.avoid || []),
  "Do not render final logos, legal lines, prices, captions, CTA text or exact overlay copy inside the generated pixels.",
  "Do not imitate a living artist, competitor campaign or third-party brand style.",
  "Do not introduce products, people, claims or trademarks that are absent from the approved design and references."
];

const prompt = [
  `OBJECTIVE: ${design.objective.desired_change}`,
  `AUDIENCE: ${design.objective.audience}`,
  `PROPOSITION: ${design.objective.single_minded_proposition}`,
  `CONCEPT: ${design.concept.central_idea}`,
  `STORY: ${design.concept.story_spine}`,
  `SUBJECT: ${design.visual_system.subject}`,
  `SCENE: ${design.visual_system.scene}`,
  `COMPOSITION: ${design.visual_system.composition}`,
  `PALETTE: ${design.visual_system.palette.join(", ")}`,
  `STYLE: ${design.visual_system.style}`,
  `LIGHTING: ${design.visual_system.lighting}`,
  `CONTINUITY: ${design.visual_system.continuity.join("; ")}`,
  `LOCALE: ${locale.locale} / market ${locale.market}; adaptation mode ${locale.adaptation_mode}. ${locale.visual_adaptation || "No extra visual adaptation."}`,
  `PLACEMENT: ${placement.platform} ${placement.surface}, ${placement.width}x${placement.height}; preserve safe zones from ${placement.safe_zones_ref}.`,
  `DISTINCTIVE ELEMENTS: ${design.concept.distinctive_elements.join("; ")}`,
  `REFERENCE INSTRUCTIONS: ${references.length ? references.map((item) => `${item.asset_id} (${item.prompt_role}): ${item.instruction}`).join("; ") : "No provider-visible references."}`,
  `DETERMINISTIC POST-COMPOSITION: ${design.visual_system.deterministic_layers.join(", ")}. Leave intentional negative space for those layers.`
].join("\n");

const request = {
  schema_version: "creative-provider-request-v1",
  request_id: `${design.design_id}.${locale.locale.toLowerCase()}.${placement.placement_id}.v${design.design_version}`,
  design_ref: designRef(design),
  design_hash: immutableDesignHash,
  reference_manifest_hash: hashJson(manifest),
  locale: locale.locale,
  provider_profile: design.generation_policy.provider_profile,
  capability: design.generation_policy.capability,
  budget: {
    currency: design.generation_policy.currency,
    run_ceiling: design.generation_policy.run_ceiling,
    authority_ref: design.generation_policy.authority_ref
  },
  prompt,
  negative_constraints: [...new Set(negativeConstraints)],
  parameters: {
    placement_id: placement.placement_id,
    width: placement.width,
    height: placement.height,
    quality_ref: "config:creative.image.quality",
    output_format: "png",
    max_attempts: design.generation_policy.max_attempts,
    max_assets: design.generation_policy.max_assets
  },
  references
};
request.request_hash = hashJson(request);
process.stdout.write(`${JSON.stringify(request, null, 2)}\n`);

function parseOptions(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) continue;
    const [key, inline] = value.slice(2).split("=", 2);
    result[key] = inline ?? args[++index];
  }
  return result;
}

async function readJson(file, label) {
  try {
    return JSON.parse(await readFile(path.resolve(file), "utf8"));
  } catch (error) {
    fail(`cannot read ${label}: ${error.message}`);
  }
}

function designRef(value) {
  return `design:${value.design_id}:v${value.design_version}`;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function hashJson(value) {
  return `sha256:${createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex")}`;
}

function designPayload(value) {
  const {
    status: _status,
    approval_ref: _approvalRef,
    approved_design_hash: _approvedDesignHash,
    ...payload
  } = value;
  return payload;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  process.stderr.write(`compile-creative-prompt: ${message}\n`);
  process.exit(1);
}
