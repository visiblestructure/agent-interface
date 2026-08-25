export const EVIDENCE_LEVELS = [
  "declared",
  "inferred",
  "observed",
  "evaluated",
] as const;

export const STATIC_EVIDENCE_LEVELS = ["declared", "inferred"] as const;

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export const NODE_KINDS = [
  "intent",
  "capability",
  "instruction",
  "resource",
  "tool",
  "input",
  "output",
  "state",
  "constraint",
  "guardrail",
  "error",
  "recovery",
] as const;

export const EDGE_KINDS = [
  "routes_to",
  "requires",
  "reads",
  "calls",
  "consumes",
  "produces",
  "mutates",
  "confirms_before",
  "retries_with",
  "recovers_via",
  "prescribed_read",
  "prescribed_call",
  "prescribed_transition",
  "prescribed_confirmation",
  "prescribed_recovery",
] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
export type StaticEvidenceLevel = (typeof STATIC_EVIDENCE_LEVELS)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type NodeKind = (typeof NODE_KINDS)[number];
export type EdgeKind = (typeof EDGE_KINDS)[number];

export interface SourceIdentity {
  readonly id: string;
  readonly repositoryUrl: string;
  readonly commitSha: string;
  readonly path: string;
  readonly blobSha: string;
}

export interface EvidenceReference {
  readonly sourceId: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly startColumn?: number;
  readonly endColumn?: number;
}

interface EvidenceBase {
  readonly id: string;
  readonly evidence: readonly EvidenceReference[];
}

export interface DeclaredEvidence extends EvidenceBase {
  readonly evidenceLevel: "declared";
  readonly inferenceRuleId?: never;
  readonly confidence?: never;
  readonly premiseElementIds?: never;
}

export interface InferredEvidence extends EvidenceBase {
  readonly evidenceLevel: "inferred";
  readonly inferenceRuleId: string;
  readonly confidence: ConfidenceLevel;
  readonly premiseElementIds: readonly string[];
}

export type StaticEvidence = DeclaredEvidence | InferredEvidence;

export type IRNode = StaticEvidence & {
  readonly kind: NodeKind;
  readonly label?: string;
};

export type IREdge = StaticEvidence & {
  readonly kind: EdgeKind;
  readonly from: string;
  readonly to: string;
  readonly workflowId?: string;
  readonly sequenceIndex?: number;
};

export interface StaticIR {
  readonly schemaVersion: "agent-interface/ir/v0";
  readonly sources: readonly SourceIdentity[];
  readonly nodes: readonly IRNode[];
  readonly edges: readonly IREdge[];
}

export interface ValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly value?: StaticIR;
}
