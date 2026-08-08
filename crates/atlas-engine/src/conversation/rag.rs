//! [`RagAnswerer`]: the concrete RAG orchestrator.

use std::collections::HashSet;
use std::sync::Arc;

use atlas_domain::{ChunkId, DocumentId, HeadingPath, InferenceParams};

use crate::inference::context::{ContextBudget, ContextManager};
use crate::inference::ports::{EmbedSpec, GenerateSpec, InferenceEngine, InferenceEngineError};
use crate::inference::streaming::TokenStream;
use crate::retrieval::{
    assess_confidence, KnowledgeRepository, RetrievalConfidence, RetrievalError, RetrievedChunk,
};

/// Configurable limits for one [`RagAnswerer::answer`] call — Phase 4's
/// "context overflow protection" and "configurable context limits"
/// requirements made explicit rather than hardcoded.
#[derive(Debug, Clone, Copy)]
pub struct ContextAssemblyConfig {
    /// How many candidates to request from [`KnowledgeRepository::search`].
    pub search_limit: usize,
    /// Hard cap on how many chunks may become evidence, independent of
    /// the token budget below — a defense against a single very generous
    /// budget pulling in an unreasonable number of sources.
    pub max_evidence_chunks: usize,
    /// The context window budget the assembled prompt must fit within,
    /// reusing the existing [`ContextManager`] rather than a second,
    /// bespoke budget mechanism.
    pub context_budget: ContextBudget,
}

impl Default for ContextAssemblyConfig {
    fn default() -> Self {
        Self {
            search_limit: 10,
            max_evidence_chunks: 5,
            context_budget: ContextBudget {
                max_tokens: 4096,
                reserved_for_response: 512,
            },
        }
    }
}

/// One piece of evidence's attribution, preserved separately from the
/// generated answer text. Citations here are built entirely from the
/// retrieval layer's own stored records — never from anything the model
/// generates — so a caller can render "Sources:" without trusting the
/// model to have transcribed them correctly.
#[derive(Debug, Clone, PartialEq)]
pub struct Citation {
    /// The source document's id.
    pub document_id: DocumentId,
    /// The specific chunk's id, for pinpoint provenance beyond "this
    /// document somewhere."
    pub chunk_id: ChunkId,
    /// The document's title, if a lookup via
    /// [`KnowledgeRepository::get_document`] succeeded. `None` rather
    /// than a fabricated placeholder if the document record can't be
    /// found — a missing title must never be silently invented.
    pub document_title: Option<String>,
    /// Heading path within the document (section/subsection) — the
    /// closest thing to a page number this project's formats reliably
    /// offer; see [`atlas_domain::HeadingPath`].
    pub heading_path: HeadingPath,
}

/// Why a query was refused outright instead of generating an answer.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RefusalReason {
    /// Nothing in the knowledge base matched the query by either
    /// retrieval method. No generation call is made at all — this is a
    /// deterministic refusal, not something left to the model's
    /// judgment, per this project's healthcare-safety stance that
    /// refusing is safer than guessing.
    NoEvidence,
}

/// The result of [`RagAnswerer::answer`].
pub enum QueryOutcome {
    /// Evidence was found (Weak or Strong) and a generation call has
    /// started. `citations` are already known before the first token
    /// arrives — they come from retrieval, not from parsing anything the
    /// model generates — so a caller can render them immediately
    /// alongside the streaming answer, keeping retrieved evidence and
    /// generated text visibly separate.
    Answered {
        /// The confidence level that gated which system prompt was used.
        confidence: RetrievalConfidence,
        /// Citations for every chunk that became evidence, in the same
        /// order they were presented to the model.
        citations: Vec<Citation>,
        /// The streaming generation response.
        stream: TokenStream,
    },
    /// No evidence was found; refused before ever calling the generation
    /// model.
    Refused {
        /// Why generation was skipped.
        reason: RefusalReason,
        /// Always [`RetrievalConfidence::NoEvidence`] today — carried
        /// through explicitly so a caller doesn't have to infer it from
        /// `reason` alone if this enum grows more refusal reasons later.
        confidence: RetrievalConfidence,
    },
}

/// Errors from [`RagAnswerer::answer`] itself — a failed embed, search,
/// or generation start. Distinct from "no evidence was found," which is
/// [`QueryOutcome::Refused`], not an `Err`: refusal is an expected,
/// correct outcome, not a failure.
#[derive(Debug, thiserror::Error)]
pub enum RagError {
    /// Embedding the query failed.
    #[error("failed to embed the query: {0}")]
    Embedding(InferenceEngineError),
    /// Searching the knowledge base failed.
    #[error("failed to search the knowledge base: {0}")]
    Retrieval(RetrievalError),
    /// Starting generation failed.
    #[error("failed to start generation: {0}")]
    Generation(InferenceEngineError),
}

/// Orchestrates the full RAG pipeline described in
/// `docs/design/rag-pipeline.md` §§4–8: embed → retrieve → assess
/// confidence → select evidence within budget → assemble a grounded
/// prompt → generate, or refuse outright when there is no evidence.
pub struct RagAnswerer {
    inference: Arc<dyn InferenceEngine>,
    knowledge: Arc<dyn KnowledgeRepository>,
    config: ContextAssemblyConfig,
}

impl RagAnswerer {
    /// Creates an answerer over the given ports and configuration.
    #[must_use]
    pub fn new(
        inference: Arc<dyn InferenceEngine>,
        knowledge: Arc<dyn KnowledgeRepository>,
        config: ContextAssemblyConfig,
    ) -> Self {
        Self {
            inference,
            knowledge,
            config,
        }
    }

    /// Answers `query`, or refuses if no evidence exists for it.
    ///
    /// # Errors
    ///
    /// Returns [`RagError`] if embedding the query, searching the
    /// knowledge base, or starting generation fails outright.
    pub fn answer(
        &self,
        query: &str,
        thread_count: i32,
        params: InferenceParams,
    ) -> Result<QueryOutcome, RagError> {
        let embedding = self
            .inference
            .embed(EmbedSpec {
                texts: vec![query.to_string()],
                thread_count,
            })
            .map_err(RagError::Embedding)?;

        let results = self
            .knowledge
            .search(query, &embedding.vectors[0], self.config.search_limit)
            .map_err(RagError::Retrieval)?;

        let confidence = assess_confidence(&results);

        if matches!(confidence, RetrievalConfidence::NoEvidence) {
            return Ok(QueryOutcome::Refused {
                reason: RefusalReason::NoEvidence,
                confidence,
            });
        }

        let evidence = select_evidence(&results, &self.config);
        let prompt = assemble_prompt(query, &evidence, confidence, &self.config.context_budget);
        let citations = evidence
            .iter()
            .map(|result| self.build_citation(result))
            .collect();

        let stream = self
            .inference
            .generate(GenerateSpec { prompt, params })
            .map_err(RagError::Generation)?;

        Ok(QueryOutcome::Answered {
            confidence,
            citations,
            stream,
        })
    }

    /// Builds a citation for `result`, looking up the parent document's
    /// title. A failed or missing lookup degrades to `document_title:
    /// None` rather than failing the whole answer — losing a title is
    /// far less harmful than losing the answer over a presentation-layer
    /// detail, and the document id/chunk id/heading path (the load-
    /// bearing provenance) are preserved regardless.
    fn build_citation(&self, result: &RetrievedChunk) -> Citation {
        let document_title = self
            .knowledge
            .get_document(result.chunk.document_id)
            .ok()
            .flatten()
            .map(|document| document.title);

        Citation {
            document_id: result.chunk.document_id,
            chunk_id: result.chunk.id,
            document_title,
            heading_path: result.chunk.heading_path.clone(),
        }
    }
}

/// Selects evidence chunks in ranked (already-fused) order,
/// deterministically: stops at `max_evidence_chunks`, and defensively
/// dedupes by chunk id (retrieval should never return the same chunk
/// twice, but this makes that guarantee explicit rather than assumed).
/// Actual token-budget fitting happens in [`assemble_prompt`], which
/// drops — never truncates — a chunk that doesn't fit and tries the
/// next one, per `docs/design/rag-pipeline.md` §7.
fn select_evidence(
    results: &[RetrievedChunk],
    config: &ContextAssemblyConfig,
) -> Vec<RetrievedChunk> {
    let mut seen = HashSet::new();
    results
        .iter()
        .filter(|result| seen.insert(result.chunk.id))
        .take(config.max_evidence_chunks)
        .cloned()
        .collect()
}

const SYSTEM_PREAMBLE_STRONG: &str = "You are a healthcare reference assistant. Answer the question using ONLY the evidence provided below. Cite which piece of evidence supports each claim. Do not add information that is not present in the evidence. If the evidence does not fully answer the question, say so explicitly rather than filling the gap yourself. You are not a substitute for a qualified healthcare professional.";

const SYSTEM_PREAMBLE_WEAK: &str = "You are a healthcare reference assistant. The evidence below is only weakly related to the question — it was found by just one retrieval method, not corroborated by both. Answer cautiously: state clearly that your supporting evidence is limited, cite what is available, and do not present a confident answer if the evidence does not actually support one. Do not add information that is not present in the evidence. You are not a substitute for a qualified healthcare professional.";

/// Assembles the final prompt: a confidence-appropriate system preamble
/// (Phase 5's evidence-gated generation — Strong evidence gets a direct-
/// answer instruction, Weak evidence gets an explicit uncertainty
/// instruction), then evidence chunks added in ranked order until the
/// token budget (via the existing [`ContextManager`]) is exhausted, then
/// the user's question. A chunk that doesn't fit is skipped — never
/// truncated mid-sentence — and the next, smaller candidate is tried.
fn assemble_prompt(
    query: &str,
    evidence: &[RetrievedChunk],
    confidence: RetrievalConfidence,
    budget: &ContextBudget,
) -> String {
    let manager = ContextManager::new(*budget);
    let preamble = match confidence {
        RetrievalConfidence::Strong => SYSTEM_PREAMBLE_STRONG,
        RetrievalConfidence::Weak | RetrievalConfidence::NoEvidence => SYSTEM_PREAMBLE_WEAK,
    };

    let mut evidence_section = String::new();
    for (index, result) in evidence.iter().enumerate() {
        let heading = if result.chunk.heading_path.is_empty() {
            "(no heading)".to_string()
        } else {
            result.chunk.heading_path.join(" > ")
        };
        let candidate_addition = format!(
            "\n\n[Evidence {}] ({heading})\n{}",
            index + 1,
            result.chunk.text
        );
        let candidate_prompt = format!(
            "{preamble}\n\nEvidence:{evidence_section}{candidate_addition}\n\nQuestion: {query}\nAnswer:"
        );
        if manager.fits_within_budget(&candidate_prompt) {
            evidence_section.push_str(&candidate_addition);
        }
    }

    format!("{preamble}\n\nEvidence:{evidence_section}\n\nQuestion: {query}\nAnswer:")
}

#[cfg(test)]
mod tests {
    use super::*;
    use atlas_domain::{ChunkRecord, DocumentFormat, DocumentRecord, Id};

    use crate::inference::ports::testing::FakeInferenceEngine;
    use crate::inference::ports::{LoadModelSpec, ModelRole};
    use crate::retrieval::ports::testing::InMemoryKnowledgeRepository;

    // Must match `FakeInferenceEngine::embed`'s hardcoded output width.
    const DIMENSION: usize = 8;

    fn chunk(document_id: DocumentId, text: &str, heading: &str) -> ChunkRecord {
        ChunkRecord {
            id: Id::new(),
            document_id,
            text: text.to_string(),
            heading_path: vec![heading.to_string()],
            start_byte: 0,
            end_byte: text.len(),
        }
    }

    fn loaded_answerer(
        response_tokens: Vec<String>,
        load_generation: bool,
        load_embedding: bool,
    ) -> (
        Arc<FakeInferenceEngine>,
        Arc<InMemoryKnowledgeRepository>,
        RagAnswerer,
    ) {
        let inference = Arc::new(FakeInferenceEngine::new(response_tokens));
        if load_generation {
            inference
                .load_model(LoadModelSpec {
                    role: ModelRole::Generation,
                    path: "/fake/generation.gguf".into(),
                    context_length: 4096,
                    thread_count: 4,
                })
                .unwrap();
        }
        if load_embedding {
            inference
                .load_model(LoadModelSpec {
                    role: ModelRole::Embedding,
                    path: "/fake/embedding.gguf".into(),
                    context_length: 2048,
                    thread_count: 4,
                })
                .unwrap();
        }
        let knowledge = Arc::new(InMemoryKnowledgeRepository::new(DIMENSION));
        let answerer = RagAnswerer::new(
            inference.clone(),
            knowledge.clone(),
            ContextAssemblyConfig::default(),
        );
        (inference, knowledge, answerer)
    }

    #[test]
    fn no_evidence_refuses_without_ever_calling_generate() {
        // Only the embedding model is loaded, not generation — if
        // `answer` incorrectly called `generate` despite finding no
        // evidence, that call would fail with NotLoaded and surface as
        // an `Err`, not a clean `Refused`. This test's real assertion is
        // that ordering, not just the final variant.
        let (_inference, _knowledge, answerer) =
            loaded_answerer(vec!["should never be produced".to_string()], false, true);

        let outcome = answerer
            .answer(
                "a question with no matching evidence",
                4,
                InferenceParams::default(),
            )
            .expect("answer must not error when there's simply no evidence");

        match outcome {
            QueryOutcome::Refused { reason, confidence } => {
                assert_eq!(reason, RefusalReason::NoEvidence);
                assert_eq!(confidence, RetrievalConfidence::NoEvidence);
            }
            QueryOutcome::Answered { .. } => panic!("expected a refusal, got an answer"),
        }
    }

    #[test]
    fn strong_evidence_answers_with_citations_and_a_direct_preamble() {
        let (_inference, knowledge, answerer) =
            loaded_answerer(vec!["Adults should take 500mg.".to_string()], true, true);

        let document = DocumentRecord {
            id: Id::new(),
            title: "Amoxicillin Reference".to_string(),
            source_path: "/docs/amoxicillin.md".into(),
            format: DocumentFormat::Markdown,
            checksum: "a".repeat(64),
        };
        knowledge.store_document(&document).unwrap();
        let evidence_chunk = chunk(document.id, "amoxicillin dosage guidance", "Adult Dosage");
        knowledge
            .store_chunk(&evidence_chunk, &[1.0; DIMENSION])
            .unwrap();

        let outcome = answerer
            .answer("amoxicillin dosage", 4, InferenceParams::default())
            .expect("answer must succeed with matching evidence");

        match outcome {
            QueryOutcome::Answered {
                confidence,
                citations,
                stream,
            } => {
                assert_eq!(confidence, RetrievalConfidence::Strong);
                assert_eq!(citations.len(), 1);
                assert_eq!(citations[0].document_id, document.id);
                assert_eq!(citations[0].chunk_id, evidence_chunk.id);
                assert_eq!(
                    citations[0].document_title.as_deref(),
                    Some("Amoxicillin Reference")
                );
                assert_eq!(citations[0].heading_path, vec!["Adult Dosage".to_string()]);

                let events: Vec<_> = stream.collect();
                assert!(
                    !events.is_empty(),
                    "generation must actually run for Strong evidence"
                );
            }
            QueryOutcome::Refused { .. } => panic!("expected an answer, got a refusal"),
        }
    }

    #[test]
    fn select_evidence_deduplicates_and_respects_the_chunk_cap() {
        let document_id: DocumentId = Id::new();
        let repeated = chunk(document_id, "same chunk", "Section");
        let results: Vec<RetrievedChunk> = (0..10)
            .map(|i| RetrievedChunk {
                chunk: if i == 0 || i == 1 {
                    repeated.clone()
                } else {
                    chunk(document_id, &format!("chunk {i}"), "Section")
                },
                score: 1.0 - f64::from(i) * 0.01,
                matched_lexical: true,
                matched_semantic: true,
            })
            .collect();

        let config = ContextAssemblyConfig {
            max_evidence_chunks: 3,
            ..ContextAssemblyConfig::default()
        };
        let selected = select_evidence(&results, &config);

        assert_eq!(selected.len(), 3, "must respect max_evidence_chunks");
        let unique_ids: HashSet<ChunkId> = selected.iter().map(|r| r.chunk.id).collect();
        assert_eq!(
            unique_ids.len(),
            3,
            "must not include the same chunk id twice"
        );
    }

    #[test]
    fn assemble_prompt_picks_the_strong_preamble_for_strong_confidence() {
        let document_id: DocumentId = Id::new();
        let evidence = vec![RetrievedChunk {
            chunk: chunk(document_id, "some evidence text", "Section"),
            score: 1.0,
            matched_lexical: true,
            matched_semantic: true,
        }];
        let budget = ContextAssemblyConfig::default().context_budget;

        let strong_prompt = assemble_prompt(
            "a question",
            &evidence,
            RetrievalConfidence::Strong,
            &budget,
        );
        assert!(strong_prompt.contains("Answer the question using ONLY the evidence"));
        assert!(strong_prompt.contains("some evidence text"));

        let weak_prompt =
            assemble_prompt("a question", &evidence, RetrievalConfidence::Weak, &budget);
        assert!(weak_prompt.contains("Answer cautiously"));
    }

    #[test]
    fn assemble_prompt_drops_a_chunk_that_does_not_fit_the_budget_rather_than_truncating() {
        let document_id: DocumentId = Id::new();
        let huge_text = "word ".repeat(10_000); // far larger than a tiny budget allows
        let evidence = vec![
            RetrievedChunk {
                chunk: chunk(document_id, &huge_text, "Huge Section"),
                score: 1.0,
                matched_lexical: true,
                matched_semantic: true,
            },
            RetrievedChunk {
                chunk: chunk(document_id, "small fitting chunk", "Small Section"),
                score: 0.9,
                matched_lexical: true,
                matched_semantic: true,
            },
        ];
        let tiny_budget = ContextBudget {
            max_tokens: 200,
            reserved_for_response: 50,
        };

        let prompt = assemble_prompt(
            "a question",
            &evidence,
            RetrievalConfidence::Strong,
            &tiny_budget,
        );

        assert!(
            !prompt.contains("Huge Section"),
            "an oversized chunk must be dropped whole, not truncated into the prompt"
        );
        assert!(
            prompt.contains("small fitting chunk"),
            "a smaller chunk after a dropped one must still be tried and included"
        );
    }
}
