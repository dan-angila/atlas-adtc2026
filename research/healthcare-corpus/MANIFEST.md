# Healthcare Corpus Manifest

This is the provenance and licensing record for every source in this
corpus, per this project's discipline that content is never ingested
"because it appears online" — every entry below was independently
checked against a primary source (a statute, an official policy page,
or an explicit license grant), not assumed from context.

Verification date for everything in this manifest: **2026-08-08**.

Real code that ingests these files into a real, queryable SQLite
knowledge base (via the existing `atlas_engine::ingestion` and
`atlas_engine::retrieval` bounded contexts — no parallel corpus system)
lives at
[`crates/atlas-engine/examples/build_healthcare_corpus.rs`](../../crates/atlas-engine/examples/build_healthcare_corpus.rs).

## Ingested sources (verified permissive license)

All 8 sources below are U.S. federal government works. Their public-
domain status rests on a specific, checkable statute — **17 U.S.C. §
105**: "Copyright protection under this title is not available for any
work of the United States Government" (verified directly against the
primary source text at
[govinfo.gov](https://www.govinfo.gov/content/pkg/USCODE-2024-title17/html/USCODE-2024-title17-chap1-sec105.htm)).
MedlinePlus (operated by the U.S. National Library of Medicine, part of
NIH) explicitly confirms this applies to its health-topic summary pages
in its own reuse policy at
[medlineplus.gov/about/using/usingcontent](https://medlineplus.gov/about/using/usingcontent/):
health topic summaries may be "reproduce[d], redistribute[d], and
link[ed] freely," with attribution requested (not legally required).

**Important exception, also verified**: that same MedlinePlus policy
page explicitly states that **A.D.A.M. Medical Encyclopedia articles**
and **drug monographs from the American Society of Health-System
Pharmacists (ASHP)** are separately copyrighted and restricted — these
are excluded from every file below, and are exactly the kind of content
that would contain concrete dosage information. See "Known corpus gaps"
below.

| # | Title | Source URL | Organization (per page) | File | SHA-256 |
|---|---|---|---|---|---|
| 1 | Malaria | <https://medlineplus.gov/malaria.html> | CDC | `sources/malaria.md` | `ad1104567c9f3439c880958416b8f1e853598bed113dfb37ff798f26bb04289d` |
| 2 | Tuberculosis | <https://medlineplus.gov/tuberculosis.html> | CDC | `sources/tuberculosis.md` | `50afb7fad2048b90e2f060da1cf9627f2d0d02c8c571d1b690c274fb72cdbe7c` |
| 3 | HIV | <https://medlineplus.gov/hivaids.html> | NIH | `sources/hivaids.md` | `fe311b2d34bf79eaaae5ada0e050480d09574a42437cbbdfabf9a86f2fa29538` |
| 4 | Diabetes | <https://medlineplus.gov/diabetes.html> | NIH/NIDDK | `sources/diabetes.md` | `412718773ecbd4b79ae2bb14f3c6835d1aa6cf7e73f1d1747a958e98ab251605` |
| 5 | High Blood Pressure | <https://medlineplus.gov/highbloodpressure.html> | NIH/NHLBI | `sources/highbloodpressure.md` | `8cd85fa3cc61219c4eb36b39fbc633d9f0796a439b8c19d4f3179f8eac297584` |
| 6 | Diarrhea | <https://medlineplus.gov/diarrhea.html> | NIH/NIDDK | `sources/diarrhea.md` | `6e95beba8f70102ee3f11e86702853c72260a2dff3504089b3a55e877d57cc45` |
| 7 | Prenatal Care | <https://medlineplus.gov/prenatalcare.html> | HHS Office on Women's Health | `sources/prenatalcare.md` | `f99c80c0f995e7b8c07164ccd4ba2b2f57f2bbf5a7960f9bad8a2f29314e6197` |
| 8 | Pneumonia | <https://medlineplus.gov/pneumonia.html> | NIH/NHLBI | `sources/pneumonia.md` | `cfd8d2ac36621bf9daf6a9614958d3480ba68c7654ddc48be3e5a7115172f1a5` |

Per-source metadata (jurisdiction, retrieval date, verification method)
is also recorded in each file's own YAML front matter, so the
provenance travels with the file even if this manifest and the file are
ever separated.

**Content, not appearance, was verified**: each file's body was
extracted from the *actual page HTML* (via direct HTTP fetch + parsing
the real DOM — not an AI-generated paraphrase or summary of the page),
so the stored text is the verbatim source, matching this project's
"every generated claim must be traceable to a specific loaded source"
requirement at the corpus level, not just the retrieval level.

Coverage against the stated corpus priorities: patient education (all
8), common conditions (diabetes, high blood pressure, diarrhea,
pneumonia), infectious disease (malaria, TB, HIV, pneumonia), maternal
health (prenatal care), public-health guidance (prevention sections
throughout). **Not covered**: essential medicines/dosage, drug
interactions, African-national-authority-specific guidance, triage
protocols — see gaps below.

## Known corpus gaps (deliberately not ingested)

Each of these was checked against a real, primary source before being
excluded — not assumed unusable.

### WHO fact sheets (who.int/news-room/fact-sheets)

**Not ingested.** WHO's own Terms of Use
(<https://www.who.int/about/policies/terms-of-use>) state: "Extracts of
the information in the web site may be reviewed, reproduced or
translated for research or private study but not for sale or for use in
conjunction with commercial purposes," and "Reproduction or translation
of substantial portions of the web site... require explicit, prior
authorization in writing." This is materially more restrictive than
WHO's separate formal-publications policy (see below) and does not
clearly permit building a redistributable, chunked knowledge-base
corpus from fact-sheet pages without written permission. **Action for a
future contributor**: request written permission from WHO
(`permissions@who.int` per WHO's standard process) before ingesting
fact-sheet content; do not assume the general publications CC license
extends to these pages.

### WHO formal publications via IRIS (e.g. the Model List of Essential Medicines)

**Not ingested — licensing believed permissive but not independently
confirmed per-document.** WHO's publishing policy
(<https://www.who.int/about/policies/publishing/copyright>) states WHO
applies **CC BY-NC-SA 3.0 IGO** to "all publications published by WHO,"
and the Model List of Essential Medicines (a numbered, formal WHO
publication, reference `WHO-MHP-HPS-EML-2023.02`) is exactly the kind of
document that policy describes. However, `iris.who.int` actively blocks
automated access (HTTP 403/500 on both a standard fetch tool and a
direct `curl` request during this research session), so the specific
per-document rights metadata could not be directly confirmed the way
every ingested source above was. Per this project's standard — record
the gap rather than assume — this is **not** ingested. This is also the
single highest-value gap to close: the WHO EML is the most direct path
to real, authoritative essential-medicines content, and closing it
would meaningfully improve the corpus's ability to answer medication
questions instead of correctly refusing them.

**Action for a future contributor with direct human/browser access to
IRIS**: confirm the `dc.rights` metadata field on the item page directly
(not through an automated fetch), download the PDF, and re-run this
verification.

### Africa CDC (africacdc.org / africacdc.tghn.org)

**Not ingested.** Africa CDC's web presence operates through The Global
Health Network (TGHN) platform, whose Terms & Conditions
state the hosting university "is the owner or the licensee of all
intellectual property rights in the site, and in the content published
on it," and commercial/redistributive use requires a license from the
university or its licensors. No open-license grant was found.

### South African National Department of Health (health.gov.za)

**Checked, not ingested.** At least one health.gov.za publication found
during this research ("The Emerging South African National Health
Information System") is licensed **CC BY-NC-ND 4.0** — the "ND" (No
Derivatives) clause is incompatible with this project's ingestion
pipeline, which chunks, indexes, and serves partial excerpts of source
documents; that is reasonably read as creating derivative/adapted
content, which ND explicitly prohibits. This specific document is also
about health-information-system architecture, not patient-facing
medical content, so it would not have served the corpus priorities even
if licensing permitted it.

### Essential medicines, dosage, and drug-interaction content generally

**This is the gap the existing benchmark named, and it remains open by
design, not by oversight.** The two most direct authoritative sources
for this content — ASHP drug monographs (linked from MedlinePlus) and
the WHO Model List of Essential Medicines (via IRIS) — are both
confirmed-or-likely restricted, per above. No dosage or drug-interaction
information has been fabricated or approximated to fill this gap.

**Important, honestly-reported limitation, found by real testing against
this real corpus (not assumed):** Phase 5's healthcare-safety test suite
(`crates/atlas-engine/src/conversation/rag.rs`) proves the confidence-
gating *mechanism* refuses outright when retrieval finds zero evidence
(`RetrievalConfidence::NoEvidence`) — but running real dosage/drug-
interaction/trauma questions against this real 8-document corpus with
real models (`crates/atlas-engine/examples/validate_healthcare_corpus_safety.rs`)
shows that `NoEvidence` essentially never triggers at this corpus scale:
real semantic embeddings and shared medical vocabulary (e.g. "treatment"
appearing in nearly every document) mean these gap questions get `Weak`
or even `Strong` confidence and a hedged-or-confident generated answer
citing a real but substantively irrelevant document, not a refusal. The
generic-verb class of this problem (a query and unrelated content
sharing only "take") was found and fixed (see
`docs/design/rag-pipeline.md`'s retrieval-confidence section); the
topic-generic-vocabulary class (sharing "treatment") was found and is
**not yet fixed** — it isn't fixable with more stopwords without
breaking genuine treatment/symptom queries, and needs either a real
retrieval-quality benchmark to calibrate a proper relevance signal
against, or a different confidence mechanism entirely. Do not treat this
gap as "safely refused" until that is actually true.

### African national ministries of health, generally

Not systematically surveyed beyond South Africa (above) in this
session — a real, larger effort (per-country licensing review) is
needed here, not a blanket assumption in either direction. Recorded as
an open research task, not a closed gap.

## What this corpus is not

Per `docs/adr/0014-healthcare-vertical-pivot.md`: this is reference
content for an offline knowledge assistant, not a clinical decision
system, EMR, or pharmacy system. Nothing in this corpus is intended to
be used to autonomously prescribe, diagnose, or dose a patient — see
`docs/design/rag-pipeline.md`'s citation/evidence-gating design and
Phase 5's refusal-safety mechanism, which this corpus is built to
exercise honestly, gaps included.
