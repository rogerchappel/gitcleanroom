# Security Policy

`gitcleanroom` is a local git helper. Its main security promise is boring, reviewable behavior: no hidden network calls, no automatic deletion, and no credential handling.

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.x | Yes |

## Reporting a Vulnerability

Please report vulnerabilities through GitHub Security Advisories when available, or open a minimal public issue that requests a private contact path without disclosing exploit details.

Useful reports include:

- unsafe path traversal
- unexpected deletion or branch mutation
- command injection through task, branch, repo, or root arguments
- receipt contents that expose secrets unexpectedly
- CI or release configuration that could publish unintended artifacts

## Local Safety Notes

- Review JSON output before scripting destructive follow-up commands.
- `close` is dry-run by default; `--force` removes the worktree and deletes the branch only after status checks pass.
- Do not run this tool inside repositories whose git hooks you do not trust.
- Receipts include local filesystem paths and branch names; treat them as local operational metadata.
