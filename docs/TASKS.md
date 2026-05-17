# Tasks

## MVP

- [x] Scaffold an OSS TypeScript CLI package with StackForge.
- [x] Implement `gitcleanroom open` with branch/worktree creation.
- [x] Add preflight checks for dirty checkouts, missing remotes, branch collisions, unsafe task names, unsafe paths, and ignored scratch roots.
- [x] Write `.gitcleanroom.json` receipts with base ref, branch, worktree path, commands, and cleanup plan.
- [x] Implement `gitcleanroom status`.
- [x] Implement `gitcleanroom close --dry-run` and keep cleanup non-destructive by default.
- [x] Add temporary git repo fixture tests.
- [x] Add a real CLI smoke script.
- [x] Document practical local workflows.

## Follow-up Candidates

- [ ] Add `--json=false` human output once the JSON contract has settled.
- [ ] Add configurable receipt filenames for teams that reserve dotfiles.
- [ ] Add optional `--force` cleanup tests against merged branches.
- [ ] Add shell completions.
