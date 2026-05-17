#!/usr/bin/env bash
set -euo pipefail

node dist/index.js --version >/dev/null
node dist/index.js doctor >/dev/null
