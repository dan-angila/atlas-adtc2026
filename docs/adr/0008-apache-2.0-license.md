# ADR-0008: Apache License 2.0 as the project license

Status: Accepted
Date: 2026-08-04

## Context

BRIX Atlas is explicitly positioned as long-term open-source
infrastructure meant to become "the AI engine powering the wider BRIX
ecosystem" — meaning both community open-source adoption *and* a plausible
future commercial/product layer built on top need to be viable under the
same license, without a relicensing fight later. The license also needs to
be one that enterprise adopters' legal departments will actually clear —
a real adoption barrier for anything license-ambiguous or copyleft-heavy in
corporate environments, which is exactly this project's target user.

## Decision

BRIX Atlas is licensed under the **Apache License 2.0**.

Apache 2.0 gives an explicit, well-understood **patent grant** from
contributors to users — important for an AI/ML codebase where patent risk
around techniques is a live enterprise legal concern in a way it often
isn't for ordinary application code. It is permissive (no copyleft
obligation on downstream users), which keeps the door open for the BRIX
ecosystem to build commercial products on top without a licensing
conflict, while still requiring attribution and a NOTICE file that
preserves the project's provenance as it spreads. It is also simply the
standard choice for major open-source infrastructure projects (Kubernetes,
TensorFlow, and most of the current open-weights-model ecosystem BRIX
Atlas depends on), which reduces friction for contributors and downstream
users who already have institutional familiarity with it.

## Alternatives Considered

**MIT License.** Simpler and even more widely recognized. Loses to Apache
2.0 specifically on the missing explicit patent grant — a real gap for an
AI infrastructure project where model/technique patent exposure is a
credible concern, and one enterprise legal review is likely to flag.

**GPLv3 / AGPLv3.** Strong copyleft protects against a fork being closed-
sourced by a third party. Rejected: AGPL in particular is a well-known
enterprise-adoption deterrent (the "network use" clause makes legal
departments nervous even where it wouldn't actually bite for an offline
desktop product), and copyleft in general conflicts with the stated vision
of BRIX Atlas becoming the engine "powering the wider BRIX ecosystem,"
which plausibly includes closed-source or dual-licensed products built on
top. That future is foreclosed, or at minimum severely complicated, by
GPL/AGPL at the core.

**Business Source License (BUSL) or other source-available-but-not-OSI
licenses.** Attractive for capturing commercial value directly.
Rejected: the competition and stated vision explicitly call for "Open
Source" as a requirement/value, and BUSL-class licenses are widely
(correctly) perceived as not truly open source, which would undermine
community trust and contribution at exactly the stage the project needs to
build both.

**Dual-licensing (Apache 2.0 + a commercial license) from day one.**
Premature. Nothing in Apache 2.0 forecloses layering a commercial offering
on top later (e.g. hosted services, enterprise support, proprietary BRIX-
ecosystem extensions distributed separately); introducing dual-licensing
machinery now would add legal and contribution-process overhead with no
present benefit.

## Consequences

**Positive:** low-friction enterprise adoption; explicit patent grant
protects both the project and its users; compatible with essentially every
dependency license this project is likely to pull in (Rust ecosystem
crates are overwhelmingly MIT/Apache-2.0 dual-licensed already); leaves
every future commercial-model option open.

**Negative:** does not prevent a third party from taking the code closed-
source in a competing product — the copyleft protection GPL would have
offered is deliberately given up. Accepted as the right trade given the
ecosystem vision explicitly wants permissive downstream use.

**Neutral:** requires maintaining a NOTICE file and per-file license
headers per Apache 2.0's terms — a minor, automatable process cost (see
`CONTRIBUTING.md`).

## Revisit Trigger

Revisit only if the project's governance formally decides to pursue a
dual-licensing commercial model that specifically requires a copyleft (or
source-available) core to function — e.g. a "open core with paid
extensions must never be forked into a competing closed product" strategy.
Absent that explicit strategic decision, this ADR should not be revisited.
