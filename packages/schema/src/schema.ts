import {
  CONFIDENCE_LEVELS,
  EDGE_KINDS,
  NODE_KINDS,
  STATIC_EVIDENCE_LEVELS,
} from "./types.js";

const stableIdentifier = {
  type: "string",
  pattern: "^[a-z][a-z0-9_]*$",
} as const;

const gitSha = {
  type: "string",
  pattern: "^[a-f0-9]{40}$",
} as const;

const evidenceReference = {
  type: "object",
  additionalProperties: false,
  required: ["sourceId", "startLine", "endLine"],
  properties: {
    sourceId: stableIdentifier,
    startLine: { type: "integer", minimum: 1 },
    endLine: { type: "integer", minimum: 1 },
    startColumn: { type: "integer", minimum: 1 },
    endColumn: { type: "integer", minimum: 1 },
  },
} as const;

const evidenceElementProperties = {
  id: stableIdentifier,
  evidenceLevel: { enum: STATIC_EVIDENCE_LEVELS },
  evidence: {
    type: "array",
    minItems: 1,
    items: evidenceReference,
  },
  inferenceRuleId: { type: "string", minLength: 1 },
  confidence: { enum: CONFIDENCE_LEVELS },
  premiseElementIds: {
    type: "array",
    minItems: 1,
    items: stableIdentifier,
    uniqueItems: true,
  },
} as const;

const evidenceElementConditions = [
  {
    if: {
      properties: { evidenceLevel: { const: "declared" } },
      required: ["evidenceLevel"],
    },
    then: {
      properties: {
        inferenceRuleId: false,
        confidence: false,
        premiseElementIds: false,
      },
    },
  },
  {
    if: {
      properties: { evidenceLevel: { const: "inferred" } },
      required: ["evidenceLevel"],
    },
    then: {
      required: ["inferenceRuleId", "confidence", "premiseElementIds"],
      properties: {
        inferenceRuleId: { type: "string", minLength: 1 },
        confidence: { enum: CONFIDENCE_LEVELS },
        premiseElementIds: {
          type: "array",
          minItems: 1,
          items: stableIdentifier,
          uniqueItems: true,
        },
      },
    },
  },
] as const;

export const staticIrSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://visiblestructure.github.io/schemas/agent-interface/ir/v0.json",
  title: "Agent Interface Static IR v0",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "sources", "nodes", "edges"],
  properties: {
    schemaVersion: { const: "agent-interface/ir/v0" },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "repositoryUrl", "commitSha", "path", "blobSha"],
        properties: {
          id: stableIdentifier,
          repositoryUrl: {
            type: "string",
            pattern: "^https://[^\\s]+$",
          },
          commitSha: gitSha,
          path: { type: "string", minLength: 1 },
          blobSha: gitSha,
        },
      },
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "evidenceLevel", "evidence"],
        properties: {
          ...evidenceElementProperties,
          kind: { enum: NODE_KINDS },
          label: { type: "string", minLength: 1 },
        },
        allOf: evidenceElementConditions,
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "from", "to", "evidenceLevel", "evidence"],
        properties: {
          ...evidenceElementProperties,
          kind: { enum: EDGE_KINDS },
          from: stableIdentifier,
          to: stableIdentifier,
          workflowId: stableIdentifier,
          sequenceIndex: { type: "integer", minimum: 0 },
        },
        allOf: [
          ...evidenceElementConditions,
          {
            if: {
              required: ["workflowId"],
              properties: {
                workflowId: stableIdentifier,
              },
            },
            then: {
              required: ["sequenceIndex"],
              properties: {
                sequenceIndex: { type: "integer", minimum: 0 },
              },
            },
          },
          {
            if: {
              required: ["sequenceIndex"],
              properties: {
                sequenceIndex: { type: "integer", minimum: 0 },
              },
            },
            then: {
              required: ["workflowId"],
              properties: {
                workflowId: stableIdentifier,
              },
            },
          },
        ],
      },
    },
  },
} as const;
