//! Chunking: splits a [`ParsedDocument`] into [`ChunkRecord`]s.
//!
//! Structure-aware, per `docs/design/rag-pipeline.md` §3: splits on
//! paragraph boundaries (never mid-sentence when a boundary is
//! available within the target window), carries a small overlap
//! between adjacent chunks, and never silently drops a heading path.
//!
//! **The size constants below are placeholders, not tuned values.**
//! `docs/design/rag-pipeline.md` §3 explicitly scopes the real
//! chunk-size/overlap numbers to a `/research` decision backed by a
//! `/benchmarks` retrieval-quality entry — work that needs a real
//! retrieval pipeline (Phase 3) to even measure against, which does not
//! exist yet. Character-based, not tokenizer-based, for the same
//! reason: precise token counting needs the worker's tokenizer path,
//! which this thin vertical slice does not wire up. Treat this
//! chunker's output as good enough to prove the pipeline composes end
//! to end (the architecture review's stated goal for this slice), not
//! as a retrieval-quality result.

use atlas_domain::{ChunkRecord, DocumentId};

use super::ports::ParsedDocument;

/// Placeholder target chunk size, in bytes of normalized text. Not
/// benchmarked — see the module-level doc comment.
pub const PLACEHOLDER_TARGET_CHUNK_BYTES: usize = 2000;

/// Placeholder overlap budget, in bytes, carried from the end of one
/// chunk into the start of the next. Not benchmarked — see the
/// module-level doc comment.
pub const PLACEHOLDER_OVERLAP_BYTES: usize = 200;

/// Splits every section of `parsed` into [`ChunkRecord`]s belonging to
/// `document_id`.
///
/// Byte offsets are relative to each *section's* normalized text (see
/// [`atlas_domain::ChunkRecord::start_byte`]), not the original source
/// file — sections are chunked independently, since a heading boundary
/// is exactly the kind of natural split point that should never be
/// merged across (`docs/design/rag-pipeline.md` §3).
#[must_use]
pub fn chunk_document(document_id: DocumentId, parsed: &ParsedDocument) -> Vec<ChunkRecord> {
    let mut chunks = Vec::new();
    for section in &parsed.sections {
        chunks.extend(chunk_section_text(
            document_id,
            &section.heading_path,
            &section.text,
        ));
    }
    chunks
}

/// Chunks one section's text: greedily accumulates paragraphs (split on
/// blank lines) until the next paragraph would push the buffer past
/// [`PLACEHOLDER_TARGET_CHUNK_BYTES`], then flushes and seeds the next
/// chunk with the immediately preceding paragraph as an overlap tail.
/// A single paragraph longer than the target size is kept whole as its
/// own over-budget chunk rather than split mid-sentence.
fn chunk_section_text(
    document_id: DocumentId,
    heading_path: &[String],
    text: &str,
) -> Vec<ChunkRecord> {
    let paragraphs: Vec<&str> = text
        .split("\n\n")
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .collect();

    if paragraphs.is_empty() {
        return Vec::new();
    }

    let mut chunks = Vec::new();
    let mut buffer: Vec<&str> = Vec::new();
    let mut buffer_len = 0usize;
    let mut chunk_start = 0usize;
    let mut cursor = 0usize;

    for (index, paragraph) in paragraphs.iter().enumerate() {
        let paragraph_len = paragraph.len();
        let would_exceed = buffer_len + paragraph_len > PLACEHOLDER_TARGET_CHUNK_BYTES;

        if would_exceed && !buffer.is_empty() {
            chunks.push(ChunkRecord {
                id: atlas_domain::Id::new(),
                document_id,
                text: buffer.join("\n\n"),
                heading_path: heading_path.to_vec(),
                start_byte: chunk_start,
                end_byte: cursor,
            });

            // Seed the next chunk with the immediately preceding
            // paragraph as an overlap tail, if it fits the overlap
            // budget whole — otherwise start clean rather than let one
            // huge paragraph blow the overlap budget.
            let overlap_paragraph = paragraphs[index - 1];
            if overlap_paragraph.len() <= PLACEHOLDER_OVERLAP_BYTES {
                buffer = vec![overlap_paragraph];
                buffer_len = overlap_paragraph.len();
                chunk_start = cursor.saturating_sub(overlap_paragraph.len());
            } else {
                buffer = Vec::new();
                buffer_len = 0;
                chunk_start = cursor;
            }
        }

        buffer.push(paragraph);
        buffer_len += paragraph_len;
        cursor += paragraph_len;
    }

    if !buffer.is_empty() {
        chunks.push(ChunkRecord {
            id: atlas_domain::Id::new(),
            document_id,
            text: buffer.join("\n\n"),
            heading_path: heading_path.to_vec(),
            start_byte: chunk_start,
            end_byte: cursor,
        });
    }

    chunks
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ingestion::ports::ParsedSection;

    fn document(sections: Vec<ParsedSection>) -> ParsedDocument {
        ParsedDocument { sections }
    }

    #[test]
    fn empty_document_produces_zero_chunks() {
        let doc_id = atlas_domain::Id::new();
        let chunks = chunk_document(doc_id, &document(vec![]));
        assert!(chunks.is_empty());
    }

    #[test]
    fn section_with_only_blank_paragraphs_produces_zero_chunks() {
        let doc_id = atlas_domain::Id::new();
        let parsed = document(vec![ParsedSection {
            heading_path: vec!["Empty".to_string()],
            text: "\n\n   \n\n".to_string(),
        }]);
        let chunks = chunk_document(doc_id, &parsed);
        assert!(chunks.is_empty());
    }

    #[test]
    fn small_section_becomes_a_single_chunk() {
        let doc_id = atlas_domain::Id::new();
        let parsed = document(vec![ParsedSection {
            heading_path: vec!["Intro".to_string()],
            text: "One short paragraph.".to_string(),
        }]);
        let chunks = chunk_document(doc_id, &parsed);
        assert_eq!(chunks.len(), 1);
        assert_eq!(chunks[0].text, "One short paragraph.");
        assert_eq!(chunks[0].heading_path, vec!["Intro"]);
        assert_eq!(chunks[0].document_id, doc_id);
    }

    #[test]
    fn oversized_single_paragraph_is_kept_whole_not_split_mid_sentence() {
        let doc_id = atlas_domain::Id::new();
        let huge_paragraph = "word ".repeat(1000); // well over the placeholder budget
        let parsed = document(vec![ParsedSection {
            heading_path: vec![],
            text: huge_paragraph.clone(),
        }]);
        let chunks = chunk_document(doc_id, &parsed);
        assert_eq!(chunks.len(), 1, "must not split a single paragraph");
        assert_eq!(chunks[0].text, huge_paragraph.trim());
    }

    #[test]
    fn many_small_paragraphs_split_into_multiple_chunks_under_the_target_size() {
        let doc_id = atlas_domain::Id::new();
        let paragraph = "x".repeat(500);
        let text = vec![paragraph.clone(); 10].join("\n\n"); // 5000 bytes total
        let parsed = document(vec![ParsedSection {
            heading_path: vec!["Section".to_string()],
            text,
        }]);
        let chunks = chunk_document(doc_id, &parsed);
        assert!(
            chunks.len() > 1,
            "5000 bytes must split under a 2000-byte target"
        );
        for chunk in &chunks {
            assert_eq!(chunk.heading_path, vec!["Section"]);
        }
    }

    #[test]
    fn adjacent_chunks_share_an_overlapping_paragraph() {
        let doc_id = atlas_domain::Id::new();
        let paragraph = "y".repeat(500);
        let text = vec![paragraph.clone(); 10].join("\n\n");
        let parsed = document(vec![ParsedSection {
            heading_path: vec![],
            text,
        }]);
        let chunks = chunk_document(doc_id, &parsed);
        assert!(chunks.len() >= 2);
        // The paragraph that ends chunk N should also open chunk N+1.
        let first_chunk_paragraphs: Vec<&str> = chunks[0].text.split("\n\n").collect();
        let last_of_first = *first_chunk_paragraphs.last().expect("non-empty chunk");
        assert!(
            chunks[1].text.starts_with(last_of_first),
            "chunk 1 must open with chunk 0's last paragraph as overlap"
        );
    }

    #[test]
    fn chunks_from_different_sections_keep_their_own_heading_paths() {
        let doc_id = atlas_domain::Id::new();
        let parsed = document(vec![
            ParsedSection {
                heading_path: vec!["A".to_string()],
                text: "Section A content.".to_string(),
            },
            ParsedSection {
                heading_path: vec!["B".to_string()],
                text: "Section B content.".to_string(),
            },
        ]);
        let chunks = chunk_document(doc_id, &parsed);
        assert_eq!(chunks.len(), 2);
        assert_eq!(chunks[0].heading_path, vec!["A"]);
        assert_eq!(chunks[1].heading_path, vec!["B"]);
    }
}
