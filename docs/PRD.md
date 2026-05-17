# PRD: gitcleanroom

Status: in-progress
Decision: build now
Factory run: 2026-05-17 PM

## Pitch

`gitcleanroom` creates disposable, policy-checked git workrooms for risky agent edits: branch, worktree, ignored scratch space, preflight checks, and cleanup instructions. It keeps experiments tidy without touching your main checkout. 🧼

## Why It Matters

High-throughput agent work gets messy when edits land in shared checkouts, scratch files are mixed with source, and cleanup is ad hoc. Developers need a deterministic local helper that sets up isolated worktrees and records the safety policy before work starts.

## Qualification

### Pub Test

"Create a clean worktree for an agent task with one command, then get a receipt proving where work happened and how to remove it."

### Source / Inspiration

Inspired by `git worktree`, local sandbox workflows, repo hygiene tools, and Roger's rule that existing repos should be changed through isolated worktrees. This wraps standard git behavior with guardrails rather than replacing git.

### V1 Scope

- TypeScript CLI package.
- `gitcleanroom open` creates a named branch and worktree under a configurable root.
- Preflight checks for dirty main checkout, missing remote, branch collisions, unsafe paths, and ignored scratch directories.
- Write a cleanroom receipt with base ref, branch, worktree path, commands run, and cleanup plan.
- `gitcleanroom status` and `gitcleanroom close --dry-run`.
- Fixture-backed tests using temporary git repos.

## Out of Scope

- Deleting worktrees by default.
- Force-pushing or rewriting history.
- Container isolation.
- Replacing git or GitHub workflows.

## CLI Sketch

```bash
gitcleanroom open --repo . --task docs-pass --base main
gitcleanroom status .cleanrooms/docs-pass
gitcleanroom close .cleanrooms/docs-pass --dry-run
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `bash scripts/validate.sh`, and one smoke that opens/statuses a cleanroom in a fixture git repo.

## Agent Prompt

Build `gitcleanroom` as a safe local git worktree helper for agent tasks. Prioritize dry runs, clear receipts, and refusal to perform destructive cleanup by default.

