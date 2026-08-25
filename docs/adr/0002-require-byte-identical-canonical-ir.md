# ADR-0002: Require Byte-Identical Canonical IR

## Status

Accepted

## Context

Semantically identical output leaves ordering, volatile fields, paths,
timestamps, and comparison behavior ambiguous.

## Decision

`interface.ir.json` must be byte-identical for the same compiler revision and
pinned manifest. Serialize object keys lexicographically, sort unordered arrays
by stable ID, preserve workflow order through `sequenceIndex`, derive stable IDs
from pinned semantic inputs, and exclude volatile or runtime-local fields.
Store volatile run data separately.

Acceptance runs twice from clean temporary directories and requires `cmp`
success plus equal SHA-256 digests.

## Consequences

### Positive

- Git diffs, golden fixtures, caches, and report provenance are reproducible.

### Negative

- Schema and serializers must define ordering and identity rules explicitly.

## Alternatives Considered

- Semantic comparator with ignored fields: rejected because it adds a second correctness surface.
- Snapshot-only testing: rejected because it can preserve nondeterministic output.

## References

- [ADR-0001](0001-separate-static-and-runtime-evidence.md)
- [IR v0 schema package](../../packages/schema/README.md)
