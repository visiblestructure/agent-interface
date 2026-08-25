# ADR-0001: Separate Static and Runtime Evidence

## Status

Accepted

## Context

The first compiler reads pinned Skills, Markdown, and a documented CLI
inventory. It has no runtime trace and cannot prove that an Agent read a file,
called a command, changed state, or recovered from an error.

## Decision

Use the evidence namespace `declared | inferred | observed | evaluated`. The
static v0 compiler may emit only `declared | inferred`. Runtime-capable layers
may later append linked `observed | evaluated` elements, but cannot mutate or
upgrade a static element.

Use `prescribed_read`, `prescribed_call`, `prescribed_transition`,
`prescribed_confirmation`, and `prescribed_recovery` for static workflow
semantics. Every inferred element cites declared premises, a deterministic
inference rule, and confidence.

## Consequences

### Positive

- Static reports cannot masquerade as execution traces.
- Future trace and Eval layers can reuse source identities without erasing provenance.

### Negative

- Reports require explicit labels and layered graph handling.
- Runtime-sounding metrics remain deferred.

## Alternatives Considered

- A single generic evidence level: rejected because it hides the source/runtime boundary.
- Treat documentation paths as observed behavior: rejected because no execution evidence exists.

## References

- [IR v0 schema package](../../packages/schema/README.md)
- [ADR-0002](0002-require-byte-identical-canonical-ir.md)
