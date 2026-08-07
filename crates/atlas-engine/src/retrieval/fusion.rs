//! Reciprocal Rank Fusion (RRF): combines ranked result lists from
//! different retrieval methods (lexical BM25, vector cosine distance)
//! into one fused ranking, without needing their scores to be on
//! comparable scales — a BM25 score and a cosine distance mean nothing
//! next to each other, but *rank position within each list* does.
//!
//! Reference: Cormack, Clarke & Buettcher, "Reciprocal Rank Fusion
//! Outperforms Condorcet and Individual Rank Learning Methods" (SIGIR
//! 2009) — the standard, widely-used technique for this exact problem,
//! not a bespoke invention.

use std::collections::HashMap;
use std::hash::Hash;

/// The conventional RRF damping constant. Higher values flatten the
/// influence of exact rank position (rank 1 vs. rank 2 matters less);
/// `60` is the value the original paper evaluated and the value most
/// production hybrid-search implementations default to. Not yet tuned
/// against this project's own retrieval-quality benchmark (there isn't
/// one to tune against — see the roadmap) — a deliberately-labeled
/// starting point, same spirit as the ingestion chunker's placeholder
/// constants.
pub const DEFAULT_RRF_K: f64 = 60.0;

/// Fuses any number of ranked id lists (best match first, 1-indexed rank
/// internally) into one combined ranking: each id's fused score is the
/// sum of `1 / (k + rank)` across every list it appears in, so an id
/// ranked highly in *multiple* lists outranks one ranked highly in only
/// one. Ids absent from a list contribute nothing from that list — this
/// is why RRF works with lists of different lengths (a lexical search
/// with 3 hits and a vector search with 20 candidates combine cleanly).
///
/// Output is sorted by descending fused score. Ties are not given a
/// deterministic secondary order — callers needing a stable tie-break
/// should apply one themselves (e.g. by id) since none is meaningful at
/// the fusion level itself.
#[must_use]
pub fn reciprocal_rank_fusion<Id: Eq + Hash + Clone>(
    ranked_lists: &[Vec<Id>],
    k: f64,
) -> Vec<(Id, f64)> {
    let mut scores: HashMap<Id, f64> = HashMap::new();
    for list in ranked_lists {
        for (index, id) in list.iter().enumerate() {
            let rank = index + 1;
            #[allow(clippy::cast_precision_loss)]
            let contribution = 1.0 / (k + rank as f64);
            *scores.entry(id.clone()).or_insert(0.0) += contribution;
        }
    }

    let mut fused: Vec<(Id, f64)> = scores.into_iter().collect();
    fused.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    fused
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_lists_produce_an_empty_fusion() {
        let fused: Vec<(String, f64)> = reciprocal_rank_fusion(&[], DEFAULT_RRF_K);
        assert!(fused.is_empty());
    }

    #[test]
    fn a_single_list_preserves_its_relative_order() {
        let list = vec!["a".to_string(), "b".to_string(), "c".to_string()];
        let fused = reciprocal_rank_fusion(&[list], DEFAULT_RRF_K);
        let ids: Vec<&str> = fused.iter().map(|(id, _)| id.as_str()).collect();
        assert_eq!(ids, vec!["a", "b", "c"]);
    }

    #[test]
    fn an_id_present_in_both_lists_outranks_one_present_in_only_one() {
        // "shared" is ranked 2nd in both lists; "lexical_only" is ranked
        // 1st in the lexical list but absent from the vector list.
        // Appearing in both lists should still win out.
        let lexical = vec!["lexical_only".to_string(), "shared".to_string()];
        let vector = vec!["vector_only".to_string(), "shared".to_string()];
        let fused = reciprocal_rank_fusion(&[lexical, vector], DEFAULT_RRF_K);

        let shared_score = fused
            .iter()
            .find(|(id, _)| id == "shared")
            .expect("shared must be present")
            .1;
        let lexical_only_score = fused
            .iter()
            .find(|(id, _)| id == "lexical_only")
            .expect("lexical_only must be present")
            .1;
        assert!(shared_score > lexical_only_score);
    }

    #[test]
    fn a_higher_rank_in_one_list_beats_a_lower_rank_in_the_same_list() {
        let list = vec![
            "first".to_string(),
            "second".to_string(),
            "third".to_string(),
        ];
        let fused = reciprocal_rank_fusion(&[list], DEFAULT_RRF_K);
        let score_of = |id: &str| fused.iter().find(|(i, _)| i == id).unwrap().1;
        assert!(score_of("first") > score_of("second"));
        assert!(score_of("second") > score_of("third"));
    }

    #[test]
    fn a_smaller_k_amplifies_the_gap_between_top_ranks() {
        let list = vec!["first".to_string(), "second".to_string()];
        let fused_small_k = reciprocal_rank_fusion(std::slice::from_ref(&list), 1.0);
        let fused_large_k = reciprocal_rank_fusion(&[list], 1000.0);

        let gap = |fused: &[(String, f64)]| {
            let first = fused.iter().find(|(i, _)| i == "first").unwrap().1;
            let second = fused.iter().find(|(i, _)| i == "second").unwrap().1;
            first - second
        };
        assert!(gap(&fused_small_k) > gap(&fused_large_k));
    }
}
