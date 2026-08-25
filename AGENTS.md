# AGENTS.md - Agent Interface

## Scope

This file applies to the `visiblestructure/agent-interface` repository and its
task worktrees under:

`/Users/zhouyang/project/github/visiblestructure-workspace`

Read the workspace-level `AGENTS.md` before working in this repository. The
workspace rules remain authoritative for VisibleStructure identity, GitHub
ownership, public dogfood safety, and evidence semantics.

## Checkout and worktree rules

1. Keep `/Users/zhouyang/project/github/visiblestructure-workspace/agent-interface`
   on `main` as a clean baseline checkout.
2. Do not implement tasks directly in the baseline checkout.
3. Create sibling worktrees named `agent-interface-wt-<task-slug>` from the
   current `origin/main`.
4. Use `feature/<task-slug>` for planned feature work and `bugfix/<task-slug>`
   for normal defects.
5. Push feature branches and use pull requests. Do not push task changes
   directly to `main`.
6. Before committing, verify the effective author is
   `LewisZhou <cocobart2026@outlook.com>` and that its config origin is the
   VisibleStructure workspace `.gitconfig`.

## Product boundary

The first milestone is a static compiler and quality gate for agent-facing
interfaces. It includes the versioned IR, deterministic compilation, a pinned
public LoomLoom fixture, AIG001/AIG002, and a standalone HTML report.

The first milestone excludes:

- `apps/web` or any report server;
- GitHub OAuth or GitHub App installation;
- hosted repository scanning, accounts, or persistence;
- MCP/OpenAPI ingestion;
- runtime Agent traces or claims that an action occurred;
- live Agent Eval, team dashboards, billing, or commercial packaging.

Do not add an excluded capability without a reviewed plan update and explicit
user approval.

## Evidence contract

1. Static compilation may emit only `declared` and `inferred` evidence.
2. Use `prescribed_*` semantics for documented reads, calls, confirmations,
   transitions, and recovery routes. These are not runtime events.
3. `observed` and `evaluated` are reserved for future separately sourced layers.
4. Every declared element requires exact source evidence. Every inferred
   element requires declared premises, `inferenceRuleId`, and confidence.
5. Canonical IR must be byte-identical across clean reruns and contain no
   volatile or machine-local metadata.

## Public dogfood safety

1. Resolve the golden LoomLoom fixture only from the manifest-pinned public
   HTTPS repository and full commit SHA.
2. Disable terminal credential prompting and private credential helpers.
3. Read only manifest-permitted regular-file blobs with matching Git blob SHAs.
4. Reject symlinks, path traversal, absolute paths, out-of-tree resolution,
   commit mismatch, blob mismatch, and unlisted blob reads.
5. Do not vendor upstream LoomLoom Markdown in the first milestone.
6. Scan public artifacts for injected environment sentinels, local paths,
   private remotes, credentials, and full DSNs.

## Implementation discipline

1. Keep schema, compiler, rules, and report rendering as separate packages or
   explicit module boundaries; do not collapse evidence semantics into UI code.
2. Implement the smallest approved task. Do not introduce speculative adapters,
   hosted infrastructure, or generic plugin systems.
3. Every rule requires a written specification, deterministic prerequisites,
   exact evidence requirements, ambiguity suppression, and positive/negative
   fixtures before it can be called high-confidence.
4. Snapshots prove stability, not correctness. Verify rule outcomes separately.
5. Rebuild from the current worktree before runtime acceptance, then verify the
   compiler revision and pinned input identities in the produced metadata.

## Validation baseline

Before proposing a merge, run the repository's current equivalents of:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
git diff --check
```

If a command is not introduced yet, state that explicitly; do not report it as
passed.
