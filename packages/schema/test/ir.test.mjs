import assert from "node:assert/strict";
import test from "node:test";

import { STATIC_EVIDENCE_LEVELS, staticIrSchema, validateStaticIR } from "../dist/index.js";

function validIR() {
  return {
    schemaVersion: "agent-interface/ir/v0",
    sources: [
      {
        id: "source_skill",
        repositoryUrl: "https://github.com/cogfoundry-labs/loomloom",
        commitSha: "0c1b97c17ea275aba74dd351c3d0f01dd0a9c863",
        path: "agent-guidance/loomloom/SKILL.md",
        blobSha: "1111111111111111111111111111111111111111",
      },
    ],
    nodes: [
      {
        id: "node_market_intent",
        kind: "intent",
        label: "Execute Market SkillBot",
        evidenceLevel: "declared",
        evidence: [{ sourceId: "source_skill", startLine: 56, endLine: 56 }],
      },
      {
        id: "node_market_reference",
        kind: "instruction",
        label: "market.md",
        evidenceLevel: "declared",
        evidence: [{ sourceId: "source_skill", startLine: 56, endLine: 56 }],
      },
    ],
    edges: [
      {
        id: "edge_prescribed_read",
        kind: "prescribed_read",
        from: "node_market_intent",
        to: "node_market_reference",
        workflowId: "workflow_market_buyer",
        sequenceIndex: 0,
        evidenceLevel: "inferred",
        evidence: [{ sourceId: "source_skill", startLine: 56, endLine: 56 }],
        inferenceRuleId: "intent-required-reference-v1",
        confidence: "high",
        premiseElementIds: ["node_market_intent", "node_market_reference"],
      },
    ],
  };
}

test("exports the static evidence subset and a 2020-12 schema", () => {
  assert.deepEqual(STATIC_EVIDENCE_LEVELS, ["declared", "inferred"]);
  assert.equal(staticIrSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
});

test("accepts declared source facts and inferred prescribed relations", () => {
  const result = validateStaticIR(validIR());
  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("rejects runtime evidence in a static IR", () => {
  const ir = validIR();
  ir.nodes[0].evidenceLevel = "observed";

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((entry) => entry.code === "schema.enum"));
});

test("rejects a declared element with inference-only fields", () => {
  const ir = validIR();
  ir.nodes[0].confidence = "high";

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
});

test("rejects inferred elements without declared premises", () => {
  const ir = validIR();
  ir.edges[0].premiseElementIds = ["edge_prescribed_read"];

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((entry) => entry.code === "inference.premise.not_declared"));
});

test("fails closed on unknown source references and unsafe paths", () => {
  const ir = validIR();
  ir.nodes[0].evidence[0].sourceId = "source_missing";
  ir.sources[0].path = "../private/SKILL.md";

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((entry) => entry.code === "evidence.source.unknown"));
  assert.ok(result.issues.some((entry) => entry.code === "source.path.invalid"));
});

test("rejects edges with unknown endpoints and duplicate workflow positions", () => {
  const ir = validIR();
  ir.edges[0].to = "node_missing";
  ir.edges.push({
    ...ir.edges[0],
    id: "edge_duplicate_position",
    to: "node_market_reference",
  });

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((entry) => entry.code === "edge.to.unknown"));
  assert.ok(result.issues.some((entry) => entry.code === "workflow.sequence.duplicate"));
});

test("rejects inverted source spans", () => {
  const ir = validIR();
  ir.nodes[0].evidence[0].startLine = 57;
  ir.nodes[0].evidence[0].endLine = 56;

  const result = validateStaticIR(ir);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((entry) => entry.code === "evidence.span.invalid"));
});
