//! DOCX `DocumentParser` adapter.
//!
//! DOCX is a zip archive of XML parts (Office Open XML) — this adapter
//! reads `word/document.xml` directly with the `zip` + `quick-xml`
//! crates rather than pulling in a full docx read/write library, per
//! `docs/design/rag-pipeline.md` §2's "XML-based extraction" approach.
//! Paragraph style IDs (`Heading1`..`Heading9`, `Title`) become the
//! heading structure, matching the Markdown adapter's heading-path
//! model; ordinary paragraphs are joined on paragraph boundaries, same
//! as the chunker already assumes for Markdown. A table cell's
//! paragraphs are still walked (so their text isn't lost), but table
//! structure itself is not preserved — table/image handling is
//! `docs/design/rag-pipeline.md` §2's named "key risk" for this format,
//! not solved here.

use std::io::{Cursor, Read};

use quick_xml::events::{BytesStart, Event};
use quick_xml::{Reader, XmlVersion};
use zip::ZipArchive;

use super::ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};

const DOCUMENT_XML_PATH: &str = "word/document.xml";

/// Parses DOCX source bytes into heading-structured sections.
#[derive(Debug, Clone, Copy, Default)]
pub struct DocxParser;

impl DocxParser {
    /// Creates a new parser. Stateless — safe to share across threads
    /// or construct fresh per call.
    #[must_use]
    pub fn new() -> Self {
        Self
    }
}

impl DocumentParser for DocxParser {
    fn parse(&self, bytes: &[u8]) -> Result<ParsedDocument, ParseError> {
        let mut archive = ZipArchive::new(Cursor::new(bytes)).map_err(|error| {
            ParseError::Malformed(format!("not a valid DOCX/zip archive: {error}"))
        })?;

        let mut raw = Vec::new();
        {
            let mut entry = archive.by_name(DOCUMENT_XML_PATH).map_err(|error| {
                ParseError::Malformed(format!("DOCX archive has no {DOCUMENT_XML_PATH}: {error}"))
            })?;
            entry.read_to_end(&mut raw).map_err(|error| {
                ParseError::Malformed(format!("failed to read {DOCUMENT_XML_PATH}: {error}"))
            })?;
        }

        parse_document_xml(&String::from_utf8_lossy(&raw))
    }
}

/// Walks `word/document.xml`'s paragraph stream, building
/// heading-structured [`ParsedSection`]s exactly as
/// [`super::markdown::section_by_heading`] does for Markdown.
fn parse_document_xml(xml: &str) -> Result<ParsedDocument, ParseError> {
    let mut reader = Reader::from_str(xml);

    let mut sections = Vec::new();
    let mut heading_stack: Vec<(usize, String)> = Vec::new();
    let mut section_buffer = String::new();

    let mut paragraph_text = String::new();
    let mut paragraph_style: Option<String> = None;
    let mut in_paragraph = false;
    let mut in_text_run = false;

    loop {
        let event = reader
            .read_event()
            .map_err(|error| ParseError::Malformed(format!("malformed DOCX XML: {error}")))?;

        match event {
            Event::Eof => break,
            Event::Start(e) => match e.local_name().as_ref() {
                b"p" => {
                    in_paragraph = true;
                    paragraph_text.clear();
                    paragraph_style = None;
                }
                b"pStyle" if in_paragraph => {
                    paragraph_style = read_val_attr(&e)?;
                }
                b"t" if in_paragraph => {
                    in_text_run = true;
                }
                _ => {}
            },
            Event::Empty(e) => {
                // Self-closing tags (typically `<w:pStyle w:val="..."/>`)
                // fire no matching `End`, so only attribute-bearing
                // cases need handling here — a self-closing `<w:t/>` or
                // `<w:br/>` carries no text and needs no bookkeeping.
                if in_paragraph && e.local_name().as_ref() == b"pStyle" {
                    paragraph_style = read_val_attr(&e)?;
                }
            }
            Event::Text(text) => {
                if in_text_run {
                    let decoded = text.decode().map_err(|error| {
                        ParseError::Malformed(format!("malformed DOCX text encoding: {error}"))
                    })?;
                    paragraph_text.push_str(&decoded);
                }
            }
            Event::GeneralRef(reference) => {
                // quick-xml 0.41 splits `&entity;`/`&#NN;` out of the
                // surrounding `Text` event into its own event, so this
                // must be handled separately or DOCX text containing an
                // XML entity (e.g. "Research &amp; Development") silently
                // loses the entity.
                if in_text_run {
                    let resolved = reference.resolve_char_ref().map_err(|error| {
                        ParseError::Malformed(format!(
                            "malformed DOCX character reference: {error}"
                        ))
                    })?;
                    match resolved {
                        Some(character) => paragraph_text.push(character),
                        None => {
                            let name = reference.decode().map_err(|error| {
                                ParseError::Malformed(format!(
                                    "malformed DOCX entity reference encoding: {error}"
                                ))
                            })?;
                            let entity = quick_xml::escape::resolve_predefined_entity(&name)
                                .ok_or_else(|| {
                                    ParseError::Malformed(format!(
                                        "unknown DOCX XML entity: &{name};"
                                    ))
                                })?;
                            paragraph_text.push_str(entity);
                        }
                    }
                }
            }
            Event::End(e) => match e.local_name().as_ref() {
                b"t" => in_text_run = false,
                b"p" => {
                    in_paragraph = false;
                    in_text_run = false;
                    flush_paragraph(
                        &paragraph_text,
                        paragraph_style.take(),
                        &mut heading_stack,
                        &mut section_buffer,
                        &mut sections,
                    );
                    paragraph_text.clear();
                }
                _ => {}
            },
            _ => {}
        }
    }

    flush_section(&heading_stack, &mut section_buffer, &mut sections);

    Ok(ParsedDocument { sections })
}

/// Reads the `w:val` attribute off a `<w:pStyle>` tag (`Start` or
/// `Empty` form — Word emits the self-closing `Empty` form, but a
/// `Start`/`End` pair is handled identically since both carry the same
/// attributes).
fn read_val_attr(e: &BytesStart) -> Result<Option<String>, ParseError> {
    for attr in e.attributes() {
        let attr = attr
            .map_err(|error| ParseError::Malformed(format!("malformed DOCX attribute: {error}")))?;
        if attr.key.local_name().as_ref() == b"val" {
            // DOCX's `word/document.xml` always declares `version="1.0"`.
            let value = attr
                .normalized_value(XmlVersion::Implicit1_0)
                .map_err(|error| {
                    ParseError::Malformed(format!("malformed DOCX attribute value: {error}"))
                })?;
            return Ok(Some(value.into_owned()));
        }
    }
    Ok(None)
}

/// Either starts a new heading (flushing the section under
/// construction) or appends `paragraph_text` to it, mirroring
/// [`super::markdown::section_by_heading`]'s heading-stack handling.
fn flush_paragraph(
    paragraph_text: &str,
    paragraph_style: Option<String>,
    heading_stack: &mut Vec<(usize, String)>,
    section_buffer: &mut String,
    sections: &mut Vec<ParsedSection>,
) {
    let trimmed = paragraph_text.trim();

    if let Some(level) = paragraph_style.as_deref().and_then(heading_level) {
        flush_section(heading_stack, section_buffer, sections);
        heading_stack.retain(|(existing_level, _)| *existing_level < level);
        heading_stack.push((level, trimmed.to_string()));
        return;
    }

    if trimmed.is_empty() {
        return;
    }
    if !section_buffer.is_empty() {
        section_buffer.push_str("\n\n");
    }
    section_buffer.push_str(trimmed);
}

fn flush_section(
    heading_stack: &[(usize, String)],
    section_buffer: &mut String,
    sections: &mut Vec<ParsedSection>,
) {
    let trimmed = section_buffer.trim();
    if !trimmed.is_empty() {
        sections.push(ParsedSection {
            heading_path: heading_stack
                .iter()
                .map(|(_, title)| title.clone())
                .collect(),
            text: trimmed.to_string(),
        });
    }
    section_buffer.clear();
}

/// Maps a Word paragraph style ID (`"Heading1"`..`"Heading9"`,
/// `"Title"`) to a heading level, or `None` for a non-heading style
/// (`"Normal"`, `"ListParagraph"`, etc.) — matched case-insensitively
/// since style IDs are not guaranteed to be consistently cased across
/// producers.
fn heading_level(style: &str) -> Option<usize> {
    let lower = style.to_ascii_lowercase();
    if lower == "title" {
        return Some(1);
    }
    let digits: String = lower
        .strip_prefix("heading")?
        .chars()
        .filter(char::is_ascii_digit)
        .collect();
    digits.parse::<usize>().ok().filter(|level| *level >= 1)
}

#[cfg(test)]
mod tests {
    use std::io::{Cursor, Write};

    use zip::write::SimpleFileOptions;
    use zip::{CompressionMethod, ZipWriter};

    use super::*;

    /// Builds minimal, well-formed DOCX bytes containing just
    /// `word/document.xml` with the given body content — enough for
    /// this adapter, which reads nothing else from the archive.
    fn build_docx(document_xml: &str) -> Vec<u8> {
        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        let options = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
        writer
            .start_file("word/document.xml", options)
            .expect("start_file must succeed for a well-formed test fixture");
        writer
            .write_all(document_xml.as_bytes())
            .expect("write_all must succeed for a well-formed test fixture");
        writer
            .finish()
            .expect("finish must succeed for a well-formed test fixture")
            .into_inner()
    }

    fn wrap_body(body: &str) -> String {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>{body}<w:sectPr/></w:body>
</w:document>"#
        )
    }

    fn paragraph(text: &str) -> String {
        format!(r#"<w:p><w:r><w:t>{text}</w:t></w:r></w:p>"#)
    }

    fn heading(style: &str, text: &str) -> String {
        format!(
            r#"<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr><w:r><w:t>{text}</w:t></w:r></w:p>"#
        )
    }

    #[test]
    fn empty_input_is_malformed_not_a_panic() {
        let result = DocxParser::new().parse(b"");
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn garbage_bytes_are_malformed_not_a_panic() {
        let result = DocxParser::new().parse(b"this is not a zip file at all");
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn truncated_docx_is_malformed_not_a_panic() {
        let full = build_docx(&wrap_body(&paragraph("Some content.")));
        let truncated = &full[..full.len() / 2];
        let result = DocxParser::new().parse(truncated);
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn zip_without_document_xml_is_malformed() {
        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        let options = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
        writer
            .start_file("word/other.xml", options)
            .expect("test fixture");
        writer.write_all(b"<irrelevant/>").expect("test fixture");
        let bytes = writer.finish().expect("test fixture").into_inner();

        let result = DocxParser::new().parse(&bytes);
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn malformed_xml_inside_a_valid_zip_is_malformed_not_a_panic() {
        let bytes = build_docx("<w:document><w:body><w:p unclosed");
        let result = DocxParser::new().parse(&bytes);
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn empty_body_parses_to_zero_sections() {
        let bytes = build_docx(&wrap_body(""));
        let parsed = DocxParser::new().parse(&bytes).expect("valid empty docx");
        assert!(parsed.sections.is_empty());
    }

    #[test]
    fn heading_stack_tracks_nested_sections() {
        let body = [
            heading("Heading1", "Introduction"),
            paragraph("Top-level intro text."),
            heading("Heading2", "Background"),
            paragraph("Some background."),
            heading("Heading2", "Scope"),
            paragraph("Back to a sibling of Background."),
        ]
        .concat();
        let bytes = build_docx(&wrap_body(&body));

        let parsed = DocxParser::new().parse(&bytes).expect("valid docx");
        assert_eq!(parsed.sections.len(), 3);
        assert_eq!(parsed.sections[0].heading_path, vec!["Introduction"]);
        assert_eq!(
            parsed.sections[1].heading_path,
            vec!["Introduction", "Background"]
        );
        assert_eq!(
            parsed.sections[2].heading_path,
            vec!["Introduction", "Scope"],
            "a sibling heading must pop the deeper nested level, not stack under it"
        );
    }

    #[test]
    fn title_style_is_treated_as_a_top_level_heading() {
        let body = [heading("Title", "Board Deck"), paragraph("Body text.")].concat();
        let bytes = build_docx(&wrap_body(&body));

        let parsed = DocxParser::new().parse(&bytes).expect("valid docx");
        assert_eq!(parsed.sections.len(), 1);
        assert_eq!(parsed.sections[0].heading_path, vec!["Board Deck"]);
    }

    #[test]
    fn multiple_runs_within_a_paragraph_are_concatenated() {
        let body = r#"<w:p><w:r><w:t>Revenue grew </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>12%</w:t></w:r><w:r><w:t> quarter over quarter.</w:t></w:r></w:p>"#;
        let bytes = build_docx(&wrap_body(body));

        let parsed = DocxParser::new().parse(&bytes).expect("valid docx");
        assert_eq!(parsed.sections.len(), 1);
        assert_eq!(
            parsed.sections[0].text,
            "Revenue grew 12% quarter over quarter."
        );
    }

    #[test]
    fn paragraph_with_no_style_is_ordinary_text() {
        let bytes = build_docx(&wrap_body(&paragraph("Just a normal paragraph.")));
        let parsed = DocxParser::new().parse(&bytes).expect("valid docx");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].heading_path.is_empty());
        assert_eq!(parsed.sections[0].text, "Just a normal paragraph.");
    }

    #[test]
    fn non_heading_style_is_ordinary_text() {
        let body = heading("ListParagraph", "A bullet, not a heading.");
        let bytes = build_docx(&wrap_body(&body));
        let parsed = DocxParser::new().parse(&bytes).expect("valid docx");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].heading_path.is_empty());
    }

    #[test]
    fn messy_real_world_sample_with_table_and_xml_entities_does_not_panic() {
        // A real-world "messy" sample: heading, a table (paragraphs
        // nested inside <w:tbl>/<w:tr>/<w:tc>, structure not preserved
        // but text must survive per this module's doc comment), and an
        // XML-escaped ampersand in body text.
        let body = format!(
            r#"{heading}<w:tbl><w:tr><w:tc>{cell}</w:tc></w:tr></w:tbl>{tail}"#,
            heading = heading("Heading1", "Overview"),
            cell = paragraph("Research &amp; Development &#38; caf&#233;"),
            tail = paragraph("Closing remarks."),
        );
        let bytes = build_docx(&wrap_body(&body));

        let parsed = DocxParser::new()
            .parse(&bytes)
            .expect("a real-world messy sample must not error or panic");
        assert_eq!(parsed.sections.len(), 1);
        assert_eq!(parsed.sections[0].heading_path, vec!["Overview"]);
        assert!(parsed.sections[0]
            .text
            .contains("Research & Development & café"));
        assert!(parsed.sections[0].text.contains("Closing remarks."));
    }

    #[test]
    fn heading_level_recognizes_word_style_ids() {
        assert_eq!(heading_level("Heading1"), Some(1));
        assert_eq!(heading_level("heading9"), Some(9));
        assert_eq!(heading_level("Title"), Some(1));
        assert_eq!(heading_level("Normal"), None);
        assert_eq!(heading_level("ListParagraph"), None);
    }
}
