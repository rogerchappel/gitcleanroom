# Release Candidate Checklist

Use this checklist before publishing a GitCleanroom package or tagging a release.

## Verification

- Run `npm run release:check`.
- Confirm `npm run smoke` still exercises a temporary git repository instead of the developer checkout.
- Inspect `npm pack --dry-run` output and confirm it includes `dist`, `README.md`, `LICENSE`, and `SECURITY.md`.

## Evidence

- Record the cleanroom command and status output used during smoke testing.
- Include preflight or refusal behavior changes in release notes.
- Note any changes to receipt output fields.

## Support Notes

- Keep tests isolated from the caller's real git worktree.
- Do not add release examples that mutate remotes or publish branches.
