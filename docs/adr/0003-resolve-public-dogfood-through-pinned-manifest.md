# ADR-0003: Resolve Public Dogfood Through a Pinned Manifest

## Status

Accepted

## Context

The public golden fixture must not accidentally analyze an internal checkout,
escape the allowed tree, leak local data, or copy upstream source without a
clear attribution policy.

## Decision

Store a manifest containing the public HTTPS repository, full commit, permitted
regular-file paths and blob SHAs, and License attribution. Fetch with terminal
prompting disabled and without a token or credential helper into an isolated
temporary checkout. Tree-entry metadata may distinguish missing from
out-of-scope targets, but only permitted blobs may be read. Reject symlinks,
path escape, unlisted reads, commit/blob mismatch, and local/private identifiers
in public output. Inject environment sentinels during acceptance and fail if
they appear in a public artifact.

Do not vendor upstream LoomLoom Markdown in v0. A later vendoring decision must
separately review Apache-2.0 section 4 obligations.

## Consequences

### Positive

- Public provenance is reproducible and independently auditable.
- The first repository avoids copied-source ownership ambiguity.

### Negative

- Acceptance depends on the pinned public Git object remaining fetchable.
- Offline fixture execution is not provided in v0.

## Alternatives Considered

- Analyze an existing local LoomLoom checkout: rejected because internal and public trees can differ.
- Vendor the Markdown fixture: deferred because it introduces attribution, update, and modification obligations.

## References

- [ADR-0001](0001-separate-static-and-runtime-evidence.md)
- [Workspace source boundary](../../AGENTS.md)
