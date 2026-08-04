#!/usr/bin/env bash
# One-time setup: points this repository's git hooks at .githooks/.
# Run once after cloning: ./scripts/setup-hooks.sh
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "Git hooks enabled (core.hooksPath = .githooks)."
echo "Pre-commit will run cargo fmt/clippy on Rust changes and eslint/prettier on ui/ changes."
