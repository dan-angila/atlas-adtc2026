//! CSV `DocumentParser` adapter.
//!
//! Uses the `csv` crate (RFC 4180 parsing: quoted fields, embedded
//! commas/newlines, escaped quotes) rather than hand-rolling a
//! delimiter split — CSV's quoting rules are exactly the kind of
//! "looks simple, is a known correctness trap on real-world messy
//! files" format this project's own standards call out
//! (`docs/engineering-standards.md`'s malformed-input testing
//! requirement exists precisely because of formats like this one).
//!
//! Per `docs/design/rag-pipeline.md` §2/§3: each row becomes its own
//! [`ParsedSection`], one per [`super::chunking::chunk_document`] call
//! becoming (ordinarily) exactly one chunk — satisfying "each row...
//! becomes a chunk" without needing CSV-specific chunking logic. Column
//! headers are attached to each cell as `"header: value"` pairs in the
//! rendered text (rather than emitted as their own raw header row) so
//! the chunk stays self-describing on its own, without a separate
//! metadata side-channel the embedding model would never see; the
//! `heading_path` instead carries positional provenance (`"row N"`),
//! which is what `docs/design/rag-pipeline.md` §3's citation-provenance
//! requirement actually needs.
//!
//! A row wider than the chunker's target size is deliberately *not*
//! split — `docs/design/rag-pipeline.md` §2 names this as CSV's key
//! risk, and the chunker's existing "never split a single oversized
//! unit" rule (`chunking::chunk_section_text`) already produces the
//! correct outcome (one big chunk) with no CSV-specific handling
//! needed.

use super::ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};

/// Parses CSV source bytes into one [`ParsedSection`] per data row.
#[derive(Debug, Clone, Copy, Default)]
pub struct CsvParser;

impl CsvParser {
    /// Creates a new parser. Stateless — safe to share across threads
    /// or construct fresh per call.
    #[must_use]
    pub fn new() -> Self {
        Self
    }
}

impl DocumentParser for CsvParser {
    fn parse(&self, bytes: &[u8]) -> Result<ParsedDocument, ParseError> {
        let mut reader = csv::ReaderBuilder::new()
            .has_headers(true)
            .flexible(true) // rows with a different field count than the header don't hard-fail
            .from_reader(bytes);

        let headers = reader
            .headers()
            .map_err(|error| ParseError::Malformed(format!("failed to read CSV headers: {error}")))?
            .clone();

        let mut sections = Vec::new();
        for (row_index, record) in reader.records().enumerate() {
            let record = record.map_err(|error| {
                ParseError::Malformed(format!("malformed CSV row {row_index}: {error}"))
            })?;

            let mut text = String::new();
            for (field_index, value) in record.iter().enumerate() {
                if value.trim().is_empty() {
                    continue;
                }
                let header = headers.get(field_index).unwrap_or("column");
                if !text.is_empty() {
                    text.push('\n');
                }
                text.push_str(header);
                text.push_str(": ");
                text.push_str(value.trim());
            }

            if text.is_empty() {
                continue;
            }

            sections.push(ParsedSection {
                heading_path: vec![format!("row {}", row_index + 1)],
                text,
            });
        }

        Ok(ParsedDocument { sections })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_file_parses_to_zero_sections() {
        let parsed = CsvParser::new()
            .parse(b"")
            .expect("an empty file has no headers to fail on");
        assert!(parsed.sections.is_empty());
    }

    #[test]
    fn header_only_file_parses_to_zero_sections() {
        let parsed = CsvParser::new()
            .parse(b"name,age,city\n")
            .expect("headers with no data rows is not an error");
        assert!(parsed.sections.is_empty());
    }

    #[test]
    fn each_row_becomes_its_own_section_with_headers_attached() {
        let input = "name,age,city\nJohn Doe,34,Nairobi\nJane Smith,29,Kampala\n";
        let parsed = CsvParser::new().parse(input.as_bytes()).expect("valid CSV");
        assert_eq!(parsed.sections.len(), 2);
        assert_eq!(parsed.sections[0].heading_path, vec!["row 1"]);
        assert_eq!(
            parsed.sections[0].text,
            "name: John Doe\nage: 34\ncity: Nairobi"
        );
        assert_eq!(parsed.sections[1].heading_path, vec!["row 2"]);
        assert!(parsed.sections[1].text.contains("name: Jane Smith"));
    }

    #[test]
    fn quoted_fields_with_embedded_commas_and_newlines_parse_correctly() {
        let input = "name,notes\n\"Doe, John\",\"Line one\nLine two\"\n";
        let parsed = CsvParser::new()
            .parse(input.as_bytes())
            .expect("RFC 4180 quoting must be handled, not hand-split on commas");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].text.contains("name: Doe, John"));
        assert!(parsed.sections[0].text.contains("Line one\nLine two"));
    }

    #[test]
    fn truncated_unterminated_quoted_field_is_handled_gracefully_not_a_panic() {
        // The `csv` crate treats end-of-input as an implicit close for
        // an open quote rather than erroring — verified here rather
        // than assumed, since the more naive assumption (this must be
        // an error) turned out to be wrong the first time this test was
        // written. Graceful degradation over a hard failure on a
        // truncated file matches this project's stated preference
        // (`ParseError`'s own doc comment).
        let input = "name,notes\n\"unterminated quote never closes";
        let parsed = CsvParser::new()
            .parse(input.as_bytes())
            .expect("an unterminated quote at EOF must not be a hard parse error");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0]
            .text
            .contains("unterminated quote never closes"));
    }

    #[test]
    fn invalid_utf8_in_a_field_is_a_typed_error_not_a_panic() {
        let mut input = b"name,notes\n".to_vec();
        input.extend_from_slice(b"John,");
        input.extend_from_slice(&[0xff, 0xfe]); // invalid UTF-8 sequence
        input.push(b'\n');

        let result = CsvParser::new().parse(&input);
        assert!(matches!(result, Err(ParseError::Malformed(_))));
    }

    #[test]
    fn ragged_rows_do_not_hard_fail_the_whole_file() {
        // A real-world "messy" sample: one row short a field, one row
        // with an extra field, blank cells mixed in.
        let input = "name,age,city\nJohn,34,Nairobi\nJane,,\nKofi,41,Accra,extra\n";
        let parsed = CsvParser::new()
            .parse(input.as_bytes())
            .expect("ragged rows must not hard-fail the whole ingest");
        assert_eq!(parsed.sections.len(), 3);
        assert_eq!(
            parsed.sections[1].text, "name: Jane",
            "blank cells are omitted, not rendered as empty pairs"
        );
    }

    #[test]
    fn empty_values_are_omitted_rather_than_rendered_blank() {
        let input = "name,age,city\nJohn,,\n";
        let parsed = CsvParser::new().parse(input.as_bytes()).expect("valid CSV");
        assert_eq!(parsed.sections.len(), 1);
        assert_eq!(parsed.sections[0].text, "name: John");
    }
}
