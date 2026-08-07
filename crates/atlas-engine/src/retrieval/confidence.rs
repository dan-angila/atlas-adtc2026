//! Retrieval confidence: a structural trust signal for a search's top
//! result, derived from which retrieval leg(s) independently corroborate
//! it — **not** an absolute score threshold.
//!
//! An absolute cutoff (e.g. "confident if fused score > 0.05") would be
//! an unbenchmarked, essentially arbitrary number: Reciprocal Rank
//! Fusion scores aren't calibrated probabilities, and there is no real
//! document corpus with known-relevant answers yet to tune a threshold
//! against (see `docs/benchmarks/2026-08-07-retrieval-latency.md`'s "Not
//! yet done"). Fabricating one to make this feature look more finished
//! would be exactly the kind of placeholder number this project's
//! standards rule out.
//!
//! What *is* available without any calibration data is structural: hybrid
//! retrieval exists specifically because lexical and semantic search have
//! different, largely independent blind spots
//! (`docs/design/rag-pipeline.md` §6). A result both methods agree on is
//! corroborated by two different failure-independent signals; a result
//! only one method found carries exactly that method's own risk of being
//! a false positive. That distinction is real and available today,
//! regardless of corpus size — it just isn't a number.

use super::ports::RetrievedChunk;

/// How much corroborating evidence a search's top result has.
///
/// This is about the shape of the evidence, not an answer-quality
/// prediction — it says nothing about whether the *content* of the top
/// result actually answers the query, only whether independent retrieval
/// mechanisms agree it's relevant at all.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RetrievalConfidence {
    /// The search returned no results at all — nothing in the knowledge
    /// base matched by either retrieval method.
    NoEvidence,
    /// The top result was found by only one retrieval method (lexical or
    /// semantic), not both.
    Weak,
    /// The top result was found by both the lexical and semantic legs
    /// independently — corroborated by two different matching
    /// mechanisms rather than resting on one method's blind spot.
    Strong,
}

/// Assesses confidence from a set of search results, in ranked order
/// (as returned by [`super::ports::KnowledgeRepository::search`]).
///
/// Looks only at the top result: corroboration on a result further down
/// the ranked list says nothing about whether the *best* candidate
/// answer is trustworthy, which is the question this function answers.
#[must_use]
pub fn assess_confidence(results: &[RetrievedChunk]) -> RetrievalConfidence {
    match results.first() {
        None => RetrievalConfidence::NoEvidence,
        Some(top) if top.matched_lexical && top.matched_semantic => RetrievalConfidence::Strong,
        Some(_) => RetrievalConfidence::Weak,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use atlas_domain::{ChunkRecord, Id};

    fn result(matched_lexical: bool, matched_semantic: bool) -> RetrievedChunk {
        RetrievedChunk {
            chunk: ChunkRecord {
                id: Id::new(),
                document_id: Id::new(),
                text: "irrelevant for this test".to_string(),
                heading_path: vec![],
                start_byte: 0,
                end_byte: 0,
            },
            score: 1.0,
            matched_lexical,
            matched_semantic,
        }
    }

    #[test]
    fn no_results_is_no_evidence() {
        assert_eq!(assess_confidence(&[]), RetrievalConfidence::NoEvidence);
    }

    #[test]
    fn a_top_result_matched_by_both_legs_is_strong() {
        let results = vec![result(true, true)];
        assert_eq!(assess_confidence(&results), RetrievalConfidence::Strong);
    }

    #[test]
    fn a_top_result_matched_by_only_lexical_is_weak() {
        let results = vec![result(true, false)];
        assert_eq!(assess_confidence(&results), RetrievalConfidence::Weak);
    }

    #[test]
    fn a_top_result_matched_by_only_semantic_is_weak() {
        let results = vec![result(false, true)];
        assert_eq!(assess_confidence(&results), RetrievalConfidence::Weak);
    }

    #[test]
    fn only_the_top_result_is_considered_not_lower_ranked_ones() {
        // The second result being Strong must not upgrade a Weak top result.
        let results = vec![result(true, false), result(true, true)];
        assert_eq!(assess_confidence(&results), RetrievalConfidence::Weak);
    }
}
