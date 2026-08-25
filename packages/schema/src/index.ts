export { staticIrSchema } from "./schema.js";
export {
  CONFIDENCE_LEVELS,
  EDGE_KINDS,
  EVIDENCE_LEVELS,
  NODE_KINDS,
  STATIC_EVIDENCE_LEVELS,
} from "./types.js";
export type {
  ConfidenceLevel,
  DeclaredEvidence,
  EdgeKind,
  EvidenceLevel,
  EvidenceReference,
  IREdge,
  IRNode,
  InferredEvidence,
  NodeKind,
  SourceIdentity,
  StaticEvidence,
  StaticEvidenceLevel,
  StaticIR,
  ValidationIssue,
  ValidationResult,
} from "./types.js";
export { validateStaticIR } from "./validate.js";
