//! PDF `DocumentParser` adapter.
//!
//! Text-layer extraction only, via the pure-Rust `pdf-extract` crate —
//! **no OCR in scope**, per `docs/design/rag-pipeline.md` §2 and the
//! rationale in ADR-0006 (OCR would need its own model and RAM/CPU
//! budget, competing with the 8GB envelope). A scanned/image-only PDF
//! (no extractable text layer at all) is reported via
//! [`ParseError::NoExtractableText`], not silently ingested as an empty
//! document.
//!
//! PDF carries no semantic heading markup the way DOCX paragraph styles
//! or Markdown ATX headings do, so each page becomes its own section
//! with `heading_path: vec!["page N"]` — the same positional-provenance
//! convention [`super::csv::CsvParser`] uses for `"row N"`.

use pdf_extract::OutputError;

use super::ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};

/// Parses PDF source bytes into per-page sections.
#[derive(Debug, Clone, Copy, Default)]
pub struct PdfParser;

impl PdfParser {
    /// Creates a new parser. Stateless — safe to share across threads
    /// or construct fresh per call.
    #[must_use]
    pub fn new() -> Self {
        Self
    }
}

impl DocumentParser for PdfParser {
    fn parse(&self, bytes: &[u8]) -> Result<ParsedDocument, ParseError> {
        // `pdf-extract`'s underlying PDF parser (`lopdf`) is known to
        // panic rather than return `Err` on some malformed inputs
        // (upstream issue, not something this adapter can fix) — this
        // is untrusted file input, so a panic here must not be allowed
        // to take down the whole process.
        let pages = std::panic::catch_unwind(|| pdf_extract::extract_text_from_mem_by_pages(bytes))
            .map_err(|_| {
                ParseError::Malformed(
                    "PDF parser panicked on structurally invalid input".to_string(),
                )
            })?
            .map_err(describe_output_error)?;

        let sections: Vec<ParsedSection> = pages
            .into_iter()
            .enumerate()
            .filter_map(|(index, text)| {
                let trimmed = text.trim();
                if trimmed.is_empty() {
                    return None;
                }
                Some(ParsedSection {
                    heading_path: vec![format!("page {}", index + 1)],
                    text: trimmed.to_string(),
                })
            })
            .collect();

        if sections.is_empty() {
            return Err(ParseError::NoExtractableText(
                "no extractable text layer found (likely a scanned/image-only PDF; OCR is out of scope)"
                    .to_string(),
            ));
        }

        Ok(ParsedDocument { sections })
    }
}

fn describe_output_error(error: OutputError) -> ParseError {
    ParseError::Malformed(format!("failed to parse PDF: {error}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Renders a single page of `text` into a minimal, well-formed PDF —
    /// a thin wrapper over [`build_pdf_with_pages`] for the common
    /// single-page case.
    fn build_pdf_with_text(text: &str) -> Vec<u8> {
        build_pdf_with_pages(&[text])
    }

    /// Hand-writes a minimal, well-formed multi-page PDF with one text
    /// run per page (empty string produces a page with an empty content
    /// stream, i.e. no text at all) — no external PDF-generation tooling
    /// involved, so this test suite has no dependency on what happens to
    /// be installed in the environment it runs in.
    fn build_pdf_with_pages(page_texts: &[&str]) -> Vec<u8> {
        let mut pdf = Vec::new();
        let mut offsets = Vec::new();

        macro_rules! object {
            ($body:expr) => {{
                offsets.push(pdf.len());
                pdf.extend_from_slice($body.as_bytes());
            }};
        }

        let page_count = page_texts.len();
        // Object numbering: 1 = Catalog, 2 = Pages, 3 = Font, then one
        // Page object and one Contents-stream object per page.
        let page_object_id = |index: usize| 4 + index * 2;
        let contents_object_id = |index: usize| 5 + index * 2;

        pdf.extend_from_slice(b"%PDF-1.4\n");
        object!("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".to_string());
        let kids: Vec<String> = (0..page_count)
            .map(|i| format!("{} 0 R", page_object_id(i)))
            .collect();
        object!(format!(
            "2 0 obj\n<< /Type /Pages /Kids [{}] /Count {} >>\nendobj\n",
            kids.join(" "),
            page_count
        ));
        object!(
            "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n".to_string()
        );

        for (index, text) in page_texts.iter().enumerate() {
            let content = if text.is_empty() {
                String::new()
            } else {
                format!(
                    "BT /F1 12 Tf 72 720 Td ({}) Tj ET",
                    escape_pdf_literal(text)
                )
            };
            assert_eq!(offsets.len() + 1, page_object_id(index));
            object!(format!(
                "{} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R >> >> /MediaBox [0 0 612 792] /Contents {} 0 R >>\nendobj\n",
                page_object_id(index),
                contents_object_id(index),
            ));
            assert_eq!(offsets.len() + 1, contents_object_id(index));
            object!(format!(
                "{} 0 obj\n<< /Length {} >>\nstream\n{}\nendstream\nendobj\n",
                contents_object_id(index),
                content.len(),
                content
            ));
        }

        let xref_offset = pdf.len();
        pdf.extend_from_slice(format!("xref\n0 {}\n", offsets.len() + 1).as_bytes());
        pdf.extend_from_slice(b"0000000000 65535 f \n");
        for offset in &offsets {
            pdf.extend_from_slice(format!("{offset:010} 00000 n \n").as_bytes());
        }
        pdf.extend_from_slice(
            format!(
                "trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{}\n%%EOF",
                offsets.len() + 1,
                xref_offset
            )
            .as_bytes(),
        );

        pdf
    }

    fn build_pdf_with_content_stream(content: &str) -> Vec<u8> {
        build_pdf_with_pages(&[content])
    }

    fn escape_pdf_literal(text: &str) -> String {
        text.replace('\\', "\\\\")
            .replace('(', "\\(")
            .replace(')', "\\)")
    }

    #[test]
    fn empty_input_is_malformed_not_a_panic() {
        let result = PdfParser::new().parse(b"");
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn garbage_bytes_are_malformed_not_a_panic() {
        let result = PdfParser::new().parse(b"this is not a PDF file at all");
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn truncated_pdf_is_malformed_not_a_panic() {
        let full = build_pdf_with_text("Some real content.");
        let truncated = &full[..full.len() / 2];
        let result = PdfParser::new().parse(truncated);
        assert!(matches!(
            result,
            Err(ParseError::Malformed(_)) | Err(ParseError::NoExtractableText(_))
        ));
    }

    #[test]
    fn a_pdf_with_a_real_text_layer_extracts_it() {
        let bytes = build_pdf_with_text("Hello from a real PDF text layer.");
        let parsed = PdfParser::new()
            .parse(&bytes)
            .expect("a well-formed PDF with a text layer must parse");
        assert_eq!(parsed.sections.len(), 1);
        assert_eq!(parsed.sections[0].heading_path, vec!["page 1"]);
        assert!(parsed.sections[0]
            .text
            .contains("Hello from a real PDF text layer."));
    }

    #[test]
    fn a_pdf_with_no_content_stream_text_is_reported_as_no_extractable_text() {
        // A structurally valid PDF whose content stream draws nothing
        // (a blank page) — this is this adapter's stand-in for a
        // scanned/image-only PDF: no OCR is in scope, so the near-zero-
        // text case must be a typed, distinguishable error rather than
        // silently ingesting an empty document.
        let bytes = build_pdf_with_content_stream("");
        let result = PdfParser::new().parse(&bytes);
        assert!(matches!(result, Err(ParseError::NoExtractableText(_))));
    }

    #[test]
    fn messy_real_world_sample_multi_page_with_a_blank_page_and_special_characters() {
        // A real-world "messy" sample: three pages — parens/backslash/
        // ampersand needing PDF string-literal escaping, a genuinely
        // blank page in the middle (common in real scanned-then-printed
        // or cover-sheet documents), and a closing page — verifying the
        // blank page is skipped rather than becoming a spurious empty
        // section, while its neighbors still keep their correct
        // 1-indexed page numbers.
        let bytes = build_pdf_with_pages(&[
            "R&D report (2026) -- see C:\\Reports\\final.pdf",
            "",
            "Closing remarks.",
        ]);

        let parsed = PdfParser::new()
            .parse(&bytes)
            .expect("a real-world messy multi-page sample must not error or panic");
        assert_eq!(parsed.sections.len(), 2);
        assert_eq!(parsed.sections[0].heading_path, vec!["page 1"]);
        assert!(parsed.sections[0]
            .text
            .contains("R&D report (2026) -- see C:\\Reports\\final.pdf"));
        assert_eq!(
            parsed.sections[1].heading_path,
            vec!["page 3"],
            "the blank page 2 must be skipped, not renumbered away"
        );
        assert!(parsed.sections[1].text.contains("Closing remarks."));
    }
}
