# Orchestration

`gitcleanroom` is designed for agent and human workflows where risky edits should happen outside the main checkout.

## Agent Contract

1. Start from a clean main checkout.
2. Ensure the cleanroom root is ignored, usually `.cleanrooms/`.
3. Run `gitcleanroom open --repo . --task <task> --base main`.
4. Perform edits inside the returned `worktreePath`.
5. Run `gitcleanroom status <worktreePath>` before handing off.
6. Run `gitcleanroom close <worktreePath> --dry-run` to show cleanup commands.

## Safety Defaults

- No worktree is removed unless `close --force` is used.
- Dirty source checkouts are refused.
- Dirty cleanrooms are not cleanup candidates.
- Branch and path collisions are refused.
- The scratch root must already be ignored by git.

## Verification

Local release readiness is:

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```
