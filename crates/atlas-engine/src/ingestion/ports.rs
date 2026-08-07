//! The `DocumentParser` port: turns raw source bytes for one document
//! format into normalized, heading-structured text, ahead of chunking
//! ([`super::chunking`]).

/// One heading-delimited section of a parsed document.
///
/// `heading_path` is empty for a section with no enclosing heading
/// (e.g. text before the first heading in a Markdown file, or every
/// "section" in a format with no heading concept at all).
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ParsedSection {
    /// Heading structure leading to this section (see
    /// [`atlas_domain::HeadingPath`]).
    pub heading_path: Vec<String>,
    /// The section's normalized text content.
    pub text: String,
}

/// A parsed, normalized document: an ordered list of sections, ready
/// for chunking.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ParsedDocument {
    /// The document's sections, in source order.
    pub sections: Vec<ParsedSection>,
}

/// Errors a [`DocumentParser`] adapter can return.
///
/// Per `docs/engineering-standards.md`'s malformed-input requirement:
/// an adapter should prefer recovering gracefully (lossy decoding,
/// skipping an unparseable sub-element) over returning
/// [`ParseError::Malformed`] wherever the format allows it — this
/// variant exists for genuine structural failures, not routine mess.
#[derive(Debug, thiserror::Error)]
pub enum ParseError {
    /// The input could not be interpreted as this format at all.
    #[error("failed to parse document: {0}")]
    Malformed(String),
    /// The input is structurally valid but carries no extractable text
    /// content — e.g. a scanned/image-only PDF with no text layer and
    /// no OCR in scope (`docs/design/rag-pipeline.md` §2). Distinct from
    /// [`ParseError::Malformed`] so a caller can give the user an
    /// accurate message instead of "this file is corrupted."
    #[error("document has no extractable text: {0}")]
    NoExtractableText(String),
}

/// Parses raw source bytes for one document format into a
/// [`ParsedDocument`].
///
/// One adapter per [`atlas_domain::DocumentFormat`]
/// (`docs/design/rag-pipeline.md` §2) — [`super::markdown::MarkdownParser`]
/// today; CSV, DOCX, and PDF are the named second/third/fourth adapters
/// this port's existence requires per `module-boundaries.md` rule 4,
/// on the Phase 2 roadmap.
pub trait DocumentParser {
    /// Parses `bytes` into a [`ParsedDocument`].
    ///
    /// # Errors
    ///
    /// Returns [`ParseError::Malformed`] if the input cannot be
    /// interpreted as this adapter's format at all.
    fn parse(&self, bytes: &[u8]) -> Result<ParsedDocument, ParseError>;
}
