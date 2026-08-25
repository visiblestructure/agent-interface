import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";

import { staticIrSchema } from "./schema.js";
import type {
  IREdge,
  IRNode,
  StaticIR,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateShape = ajv.compile(staticIrSchema);

const localPathPrefixes = ["/", "\\\\", "file://", "/Users/", "/private/"];
const stableIdentifierPattern = /^[a-z][a-z0-9_]*$/;
const repositoryPathSegmentPattern = /(^|\/)\.\.?(\/|$)/;

function issue(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message };
}

function shapeIssues(errors: ErrorObject[] | null | undefined): ValidationIssue[] {
  return (errors ?? []).map((error) =>
    issue(
      `schema.${error.keyword}`,
      error.instancePath || "/",
      error.message ?? "does not satisfy the static IR schema",
    ),
  );
}

function hasLocalIdentifier(value: string): boolean {
  return localPathPrefixes.some((prefix) => value.startsWith(prefix));
}

function isRepositoryRelativePath(value: string): boolean {
  return !hasLocalIdentifier(value) && !repositoryPathSegmentPattern.test(value);
}

function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function hasStableIdentifier(value: string): boolean {
  return stableIdentifierPattern.test(value);
}

function validateSourceIdentities(ir: StaticIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sourceIds = new Set<string>();

  ir.sources.forEach((source, index) => {
    const path = `/sources/${index}`;
    if (sourceIds.has(source.id)) {
      issues.push(issue("source.id.duplicate", `${path}/id`, "source id must be unique"));
    }
    sourceIds.add(source.id);

    if (!hasStableIdentifier(source.id)) {
      issues.push(issue("source.id.unstable", `${path}/id`, "source id must be stable and canonical"));
    }
    if (!isPublicHttpsUrl(source.repositoryUrl)) {
      issues.push(issue("source.repository.invalid", `${path}/repositoryUrl`, "source repository must be a credential-free HTTPS URL without query or fragment"));
    }
    if (!isRepositoryRelativePath(source.path)) {
      issues.push(issue("source.path.invalid", `${path}/path`, "source path must be repository-relative and must not escape the pinned tree"));
    }
  });

  return issues;
}

function validateElements(ir: StaticIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sources = new Set(ir.sources.map((source) => source.id));
  const elementById = new Map<string, IRNode | IREdge>();

  for (const [collectionName, elements] of [
    ["nodes", ir.nodes],
    ["edges", ir.edges],
  ] as const) {
    elements.forEach((element, index) => {
      const path = `/${collectionName}/${index}`;
      if (elementById.has(element.id)) {
        issues.push(issue("element.id.duplicate", `${path}/id`, "node and edge ids share one unique namespace"));
      }
      elementById.set(element.id, element);

      element.evidence.forEach((reference, evidenceIndex) => {
        const evidencePath = `${path}/evidence/${evidenceIndex}`;
        if (!sources.has(reference.sourceId)) {
          issues.push(issue("evidence.source.unknown", `${evidencePath}/sourceId`, "evidence must reference a declared source"));
        }
        if (reference.endLine < reference.startLine) {
          issues.push(issue("evidence.span.invalid", evidencePath, "endLine must be greater than or equal to startLine"));
        }
      });
    });
  }

  const nodes = new Set(ir.nodes.map((node) => node.id));
  const workflowSequence = new Set<string>();

  ir.edges.forEach((edge, index) => {
    const path = `/edges/${index}`;
    if (!nodes.has(edge.from)) {
      issues.push(issue("edge.from.unknown", `${path}/from`, "edge source must reference a declared node"));
    }
    if (!nodes.has(edge.to)) {
      issues.push(issue("edge.to.unknown", `${path}/to`, "edge target must reference a declared node"));
    }
    if (edge.workflowId !== undefined && edge.sequenceIndex !== undefined) {
      const sequenceKey = `${edge.workflowId}:${edge.sequenceIndex}`;
      if (workflowSequence.has(sequenceKey)) {
        issues.push(issue("workflow.sequence.duplicate", `${path}/sequenceIndex`, "workflow sequence indexes must be unique within a workflow"));
      }
      workflowSequence.add(sequenceKey);
    }
  });

  for (const [collectionName, elements] of [
    ["nodes", ir.nodes],
    ["edges", ir.edges],
  ] as const) {
    elements.forEach((element, index) => {
      if (element.evidenceLevel !== "inferred") {
        return;
      }

      const path = `/${collectionName}/${index}`;
      for (const premiseId of element.premiseElementIds) {
        const premise = elementById.get(premiseId);
        if (premise === undefined) {
          issues.push(issue("inference.premise.unknown", `${path}/premiseElementIds`, "inferred elements must cite declared premise elements"));
        } else if (premise.evidenceLevel !== "declared") {
          issues.push(issue("inference.premise.not_declared", `${path}/premiseElementIds`, "inferred elements may only cite declared premises in v0"));
        }
      }
    });
  }

  return issues;
}

export function validateStaticIR(value: unknown): ValidationResult {
  if (!validateShape(value)) {
    return {
      valid: false,
      issues: shapeIssues(validateShape.errors).sort(compareIssues),
    };
  }

  const ir = value as StaticIR;
  const issues = [...validateSourceIdentities(ir), ...validateElements(ir)].sort(compareIssues);
  return issues.length === 0 ? { valid: true, issues: [], value: ir } : { valid: false, issues };
}

function compareIssues(left: ValidationIssue, right: ValidationIssue): number {
  return left.path.localeCompare(right.path) || left.code.localeCompare(right.code) || left.message.localeCompare(right.message);
}
