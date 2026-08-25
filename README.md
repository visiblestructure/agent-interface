# Agent Interface

Compile, analyze, and visualize evidence-backed agent-facing interfaces.

## Status

Agent Interface is in its first implementation milestone. The initial goal is
to compile a pinned public repository revision into a provenance-aware,
deterministic intermediate representation and a standalone local report.

The repository does not yet provide a released CLI, hosted service, GitHub App,
runtime Agent trace, or Agent evaluation platform.

## First milestone

The approved first milestone is limited to:

- a versioned Agent Interface IR schema;
- deterministic Skill and Markdown compilation;
- a non-vendored, pinned public LoomLoom dogfood manifest;
- two evidence-backed static rules, AIG001 and AIG002;
- a CLI-generated standalone HTML report.

Static results distinguish source-declared or deterministically inferred facts
from future runtime-observed or evaluated facts. A prescribed path is not proof
that an Agent executed it.

## Repository layout

```text
packages/       Versioned schema, compiler, analyzer, CLI, and report packages
docs/           Architecture decisions, rule specifications, and project docs
fixtures/       Compiler-owned manifests and expected outputs, not vendored source
```

`apps/web` is reserved for a later reviewed milestone and is intentionally not
part of the current repository layout.

## Development baseline

- Node.js: `24.19.0` LTS
- pnpm: `11.24.0`
- License: Apache-2.0

Install exactly from the committed lockfile after selecting the pinned Node.js
version:

```bash
pnpm install --frozen-lockfile
```

Package implementation and build commands will be introduced through reviewed
feature branches as the approved milestone progresses.

## Security and source boundaries

Public dogfood inputs must be fetched from an explicitly pinned public HTTPS
remote and restricted by path and Git blob SHA. Do not analyze a private or
internal checkout to produce the public golden fixture, and do not commit
credentials, private remotes, local absolute paths, or upstream source copies.

## License

Apache-2.0. See [LICENSE](LICENSE).
