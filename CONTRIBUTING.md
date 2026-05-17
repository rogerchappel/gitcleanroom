# Contributing

Thanks for working on `gitcleanroom`. Keep changes small, testable, and boring in the best way.

## Local Setup

```bash
npm install
npm test
npm run check
npm run build
npm run smoke
```

## Development Rules

- Prefer clear refusal paths over clever recovery.
- Keep destructive behavior opt-in and documented.
- Add fixture-backed tests for git behavior.
- Use JSON output for command contracts.
- Do not add dependencies unless they remove real complexity.

## Pull Request Checklist

- [ ] Tests cover new behavior or the change is docs-only.
- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] `npm run smoke` passes for CLI workflow changes.
- [ ] README examples still match the CLI.

## Commit Style

Use Conventional Commits, for example:

```text
feat: add branch collision preflight
fix: reject unsafe cleanroom roots
docs: clarify cleanup flow
```
