#!/usr/bin/env python3
"""Heuristic check for cross-bounded-context boundary violations.

Enforces docs/architecture/module-boundaries.md, rule 3: no
bounded-context module in atlas-engine may reach into another
bounded-context module's internals.

This is a **heuristic**, not a semantic (AST-based) check: it looks for
`crate::<other_module>::` / `super::<other_module>` references that reach
more than one path segment deep, which is a reasonable proxy for "using
another context's internals" rather than its published public API. It
will not catch every violation and may occasionally flag a legitimate
future public re-export — read its output, don't just trust it blindly.
If atlas-engine's real content outgrows what this heuristic can usefully
check, replace it with a proper `syn`-based AST walk or a custom rustc
lint; that is a deliberate, named upgrade path, not a promise this
version keeps.

Exit status: 0 if no violations found, 1 otherwise.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENGINE_SRC = REPO_ROOT / "crates" / "atlas-engine" / "src"

BOUNDED_CONTEXTS = ["ingestion", "retrieval", "inference", "conversation", "reporting"]

# Matches `crate::<module>::<something>::<deeper>` or `super::<module>::<deeper>`
# — i.e. reaching at least one level past the module's own top-level
# namespace, which is where "internals" (as opposed to a re-exported
# public item) tend to live.
CROSS_MODULE_DEEP_ACCESS = re.compile(
    r"\b(?:crate|super)::(?P<module>\w+)::\w+::\w+"
)


def find_violations() -> list[str]:
    violations: list[str] = []

    for context in BOUNDED_CONTEXTS:
        module_file = ENGINE_SRC / f"{context}.rs"
        if not module_file.exists():
            continue

        text = module_file.read_text(encoding="utf-8")
        for line_number, line in enumerate(text.splitlines(), start=1):
            for match in CROSS_MODULE_DEEP_ACCESS.finditer(line):
                referenced_module = match.group("module")
                if referenced_module in BOUNDED_CONTEXTS and referenced_module != context:
                    violations.append(
                        f"{module_file.relative_to(REPO_ROOT)}:{line_number}: "
                        f"'{context}' reaches into '{referenced_module}' internals: "
                        f"{line.strip()}"
                    )

    return violations


def main() -> int:
    if not ENGINE_SRC.exists():
        print(f"note: {ENGINE_SRC} does not exist yet, nothing to check", file=sys.stderr)
        return 0

    violations = find_violations()

    if violations:
        print("Module boundary violations found (docs/architecture/module-boundaries.md, rule 3):")
        for violation in violations:
            print(f"  {violation}")
        print(
            "\nA bounded-context module should depend on another context's "
            "published `pub` application-layer interface, not its internals."
        )
        return 1

    print(f"No module boundary violations found across {len(BOUNDED_CONTEXTS)} bounded contexts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
