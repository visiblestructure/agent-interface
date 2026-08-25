# ADR-0004: Defer Web and Generate a Standalone Report

## Status

Accepted

## Context

The first milestone must validate the compiler abstraction. A Web application
adds routing, serving, deployment, storage, and product-design work that does
not prove IR correctness.

## Decision

Generate standalone HTML from canonical IR in the CLI/report package. Do not
create `apps/web`, a report server, accounts, persistence, or deployment in the
first milestone. Reserve `apps/web` as the future monorepo location only after
a later reviewed decision.

## Consequences

### Positive

- The first visible artifact remains shareable without expanding runtime scope.
- Compiler and evidence correctness remain on the critical path.

### Negative

- The initial report is not interactive or hosted.

## Alternatives Considered

- Build `apps/web` immediately: rejected as premature product/runtime scope.
- Publish only JSON: rejected because a standalone report helps validate whether the IR is understandable.

## References

- [ADR-0002](0002-require-byte-identical-canonical-ir.md)
- [Repository boundary](../../AGENTS.md)
