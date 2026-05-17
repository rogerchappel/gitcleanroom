#!/usr/bin/env bash
set -euo pipefail

node dist/index.js --version >/dev/null
node dist/index.js doctor >/dev/null

tmpdir="$(mktemp -d)"
repo="$tmpdir/repo"
remote="$tmpdir/remote.git"

mkdir -p "$repo"
git -C "$repo" init -b main >/dev/null
git -C "$repo" config user.name "Smoke Test"
git -C "$repo" config user.email "smoke@example.invalid"
printf '# smoke\n' > "$repo/README.md"
printf '.cleanrooms/\n' > "$repo/.gitignore"
git -C "$repo" add .
git -C "$repo" commit -m "init" >/dev/null
git init --bare "$remote" >/dev/null
git -C "$repo" remote add origin "$remote"

node dist/index.js open --repo "$repo" --task smoke --base main >/dev/null
node dist/index.js status "$repo/.cleanrooms/smoke" >/dev/null
node dist/index.js close "$repo/.cleanrooms/smoke" --dry-run >/dev/null
