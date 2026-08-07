//! Markdown `DocumentParser` adapter.
//!
//! Deliberately simple, matching the "deliberately ugly" thin-vertical-
//! slice scope named in the independent architecture review
//! (`docs/execution/architecture-review-2026-08-04.md`): strips YAML
//! front matter, decodes as UTF-8 (falling back to lossy conversion
//! rather than failing the whole ingest, per
//! `docs/design/rag-pipeline.md` §2), and splits on ATX headings
//! (`#`, `##`, ...) into [`ParsedSection`]s. It does not render
//! Markdown, strip inline formatting, or handle embedded HTML specially
//! — those are named as real future risks in
//! `docs/design/rag-pipeline.md` §2's "Key risk" column, not solved
//! here.

use super::ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};

/// Parses Markdown source bytes into heading-structured sections.
#[derive(Debug, Clone, Copy, Default)]
pub struct MarkdownParser;

impl MarkdownParser {
    /// Creates a new parser. Stateless — safe to share across threads
    /// or construct fresh per call.
    #[must_use]
    pub fn new() -> Self {
        Self
    }
}

impl DocumentParser for MarkdownParser {
    fn parse(&self, bytes: &[u8]) -> Result<ParsedDocument, ParseError> {
        let text = String::from_utf8_lossy(bytes);
        let without_front_matter = strip_front_matter(&text);
        Ok(section_by_heading(without_front_matter))
    }
}

/// Strips a leading YAML front-matter block (`---` ... `---`) if one is
/// present and properly closed. An unterminated `---` at the start of a
/// truncated file is left alone rather than guessed at — losing the
/// start of a truncated document is worse than occasionally treating an
/// unterminated front-matter fence as ordinary content.
fn strip_front_matter(text: &str) -> &str {
    const FENCE: &str = "---";

    let Some(after_open) = text.strip_prefix(FENCE) else {
        return text;
    };
    let Some(newline_after_open) = after_open.find('\n') else {
        return text;
    };
    // Everything on the opening fence's own line must be blank for this
    // to count as a front-matter fence, not e.g. a Markdown thematic
    // break followed immediately by text.
    if !after_open[..newline_after_open].trim().is_empty() {
        return text;
    }

    let body = &after_open[newline_after_open + 1..];
    let Some(close_pos) = body.find("\n---") else {
        return text;
    };
    let after_close = &body[close_pos + "\n---".len()..];
    let rest_start = after_close.find('\n').map_or(after_close.len(), |i| i + 1);
    &after_close[rest_start..]
}

/// Splits `text` into [`ParsedSection`]s on ATX heading lines,
/// tracking the heading stack so each section carries its full
/// [`atlas_domain::HeadingPath`].
fn section_by_heading(text: &str) -> ParsedDocument {
    let mut sections = Vec::new();
    let mut heading_stack: Vec<(usize, String)> = Vec::new();
    let mut buffer = String::new();

    let flush =
        |buffer: &mut String, stack: &[(usize, String)], sections: &mut Vec<ParsedSection>| {
            let trimmed = buffer.trim();
            if !trimmed.is_empty() {
                sections.push(ParsedSection {
                    heading_path: stack.iter().map(|(_, title)| title.clone()).collect(),
                    text: trimmed.to_string(),
                });
            }
            buffer.clear();
        };

    for line in text.lines() {
        if let Some((level, title)) = parse_atx_heading(line) {
            flush(&mut buffer, &heading_stack, &mut sections);
            heading_stack.retain(|(existing_level, _)| *existing_level < level);
            heading_stack.push((level, title));
            continue;
        }
        buffer.push_str(line);
        buffer.push('\n');
    }
    flush(&mut buffer, &heading_stack, &mut sections);

    ParsedDocument { sections }
}

/// Recognizes an ATX heading line (`# Title` through `###### Title`).
/// Returns the heading level and trimmed title, or `None` if `line`
/// isn't an ATX heading.
fn parse_atx_heading(line: &str) -> Option<(usize, String)> {
    let trimmed = line.trim_start();
    let hashes = trimmed.chars().take_while(|c| *c == '#').count();
    if hashes == 0 || hashes > 6 {
        return None;
    }
    let rest = &trimmed[hashes..];
    // A bare "#word" (no space) is not a heading per CommonMark's ATX
    // heading rule.
    if !rest.is_empty() && !rest.starts_with(char::is_whitespace) {
        return None;
    }
    Some((hashes, rest.trim().trim_end_matches('#').trim().to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_file_parses_to_zero_sections() {
        let parsed = MarkdownParser::new()
            .parse(b"")
            .expect("empty input is not an error");
        assert!(parsed.sections.is_empty());
    }

    #[test]
    fn whitespace_only_file_parses_to_zero_sections() {
        let parsed = MarkdownParser::new()
            .parse(b"   \n\n\t\n")
            .expect("whitespace-only input is not an error");
        assert!(parsed.sections.is_empty());
    }

    #[test]
    fn invalid_utf8_is_lossily_decoded_rather_than_rejected() {
        let bytes = b"# Title\n\xff\xfeInvalid bytes here\n";
        let parsed = MarkdownParser::new()
            .parse(bytes)
            .expect("invalid UTF-8 must not be a hard parse error");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].text.contains("Invalid bytes here"));
    }

    #[test]
    fn unterminated_front_matter_is_left_as_ordinary_content() {
        // A truncated file cut off mid-front-matter: no closing fence.
        let input = "---\ntitle: Board Deck\nbody never arrives";
        let parsed = MarkdownParser::new()
            .parse(input.as_bytes())
            .expect("must not panic");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].text.contains("title: Board Deck"));
    }

    #[test]
    fn heading_stack_tracks_nested_sections() {
        let input = "\
# Introduction
Top-level intro text.

## Background
Some background.

### Details
Nested details.

## Scope
Back to a sibling of Background.
";
        let parsed = MarkdownParser::new()
            .parse(input.as_bytes())
            .expect("valid markdown");
        assert_eq!(parsed.sections.len(), 4);
        assert_eq!(parsed.sections[0].heading_path, vec!["Introduction"]);
        assert_eq!(
            parsed.sections[1].heading_path,
            vec!["Introduction", "Background"]
        );
        assert_eq!(
            parsed.sections[2].heading_path,
            vec!["Introduction", "Background", "Details"]
        );
        assert_eq!(
            parsed.sections[3].heading_path,
            vec!["Introduction", "Scope"],
            "a sibling heading must pop the deeper nested level, not stack under it"
        );
    }

    #[test]
    fn messy_real_world_sample_with_front_matter_and_code_block_does_not_panic() {
        let input = "\
---
title: Messy Sample
tags: [a, b]
---

# Overview

Some intro <b>with embedded HTML</b> and a code block:

```rust
fn main() {}
```

## Notes

- bullet one
- bullet two
";
        let parsed = MarkdownParser::new()
            .parse(input.as_bytes())
            .expect("a real-world messy sample must not error or panic");
        assert_eq!(parsed.sections.len(), 2);
        assert_eq!(parsed.sections[0].heading_path, vec!["Overview"]);
        assert!(parsed.sections[0].text.contains("embedded HTML"));
        assert!(parsed.sections[0].text.contains("fn main()"));
        assert_eq!(parsed.sections[1].heading_path, vec!["Overview", "Notes"]);
        assert!(parsed.sections[1].text.contains("bullet one"));
    }

    #[test]
    fn bare_hash_word_is_not_treated_as_a_heading() {
        let input = "This is a #hashtag, not a heading.\n";
        let parsed = MarkdownParser::new()
            .parse(input.as_bytes())
            .expect("valid markdown");
        assert_eq!(parsed.sections.len(), 1);
        assert!(parsed.sections[0].heading_path.is_empty());
    }
}
