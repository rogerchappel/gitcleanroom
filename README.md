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

The receipt lives at `.cleanrooms/docs-pass/.gitcleanroom.json`. It records the base ref, branch, path, creation command, and cleanup plan. It is the little paper tag tied to the cleanroom door.

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

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
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
