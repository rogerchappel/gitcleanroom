# gitcleanroom

Safe disposable git workrooms for risky agent edits.

`gitcleanroom` wraps `git worktree` with preflight checks, a receipt, and non-destructive cleanup plans. It is intentionally local-first: no network calls beyond whatever git already knows about your repo, no force pushes, no surprise deletion.

## Install

```bash
npm install -g gitcleanroom
```

For local development:

```bash
npm install
npm run build
node dist/index.js --help
```

## Quick Start

Make sure your scratch root is ignored and committed:

```bash
printf '.cleanrooms/\n' >> .gitignore
git add .gitignore
git commit -m "chore: ignore cleanrooms"
```

Open a cleanroom:

```bash
gitcleanroom open --repo . --task docs-pass --base main
```

Work in the returned `worktreePath`, then inspect it:

```bash
gitcleanroom status .cleanrooms/docs-pass
```

Plan cleanup:

```bash
gitcleanroom close .cleanrooms/docs-pass --dry-run
```

The receipt lives at `.cleanrooms/docs-pass/.gitcleanroom.json`. It records the
base ref, branch, path, creation command, and cleanup plan so another agent or
reviewer can understand how the disposable workroom was created.

## Refusals

`gitcleanroom open` refuses to proceed when:

- the source checkout is dirty
- the repo has no remote
- the base ref cannot be resolved
- the target branch already exists
- the worktree path already exists
- the task name or path is unsafe
- the cleanroom root is not ignored by git

## Commands

```bash
gitcleanroom open --repo . --task docs-pass --base main
gitcleanroom open --repo . --task spike --base origin/main --root .cleanrooms --dry-run
gitcleanroom status .cleanrooms/docs-pass
gitcleanroom close .cleanrooms/docs-pass --dry-run
gitcleanroom doctor
```

Output is JSON so agents and shell scripts can consume it without scraping prose.

## Limitations and safety

- `gitcleanroom` creates and removes git worktrees; it does not inspect, review,
  or merge the changes made inside them.
- It is a local worktree helper, not a sandbox. Commands run inside the cleanroom
  still have the permissions of the current user and shell.
- Cleanup is intentionally planned before deletion. Use `close --dry-run` first
  and inspect the returned plan before removing a workroom that may contain
  uncommitted changes.
- The tool relies on local git refs. Fetch remote branches before opening a
  cleanroom from a base that must match current remote state.
- The tool refuses dirty or ambiguous starting states, but it cannot guarantee
  that an external process will not edit the source checkout or cleanroom after
  creation.
- Use remote/base refs that your team trusts; `gitcleanroom` does not validate
  branch protection, CI policy, or review requirements.

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## Development

Use the same local checks that back release readiness:

```bash
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

Run the narrower commands while iterating, then finish with the broadest available check before opening a PR.

## License

MIT

## Release readiness

Before opening a release PR, run the same checks that CI runs:

```sh
npm run release:check
npm pack --dry-run
```

The package smoke keeps the published tarball contents visible before tagging or publishing.
