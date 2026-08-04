#!/usr/bin/env bash
# Runs cargo-deny against the workspace: license compatibility (ADR-0008),
# duplicate/banned dependencies, and yanked-crate advisories. This is the
# crate-level half of the enforcement described in
# docs/architecture/module-boundaries.md, rule 5.
#
# Requires: cargo install cargo-deny (one-time, per machine).
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v cargo-deny >/dev/null 2>&1; then
  echo "cargo-deny is not installed. Install it with:" >&2
  echo "  cargo install cargo-deny --locked" >&2
  exit 1
fi

cargo deny check
