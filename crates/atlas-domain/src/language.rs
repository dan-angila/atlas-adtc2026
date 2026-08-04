use serde::{Deserialize, Serialize};

/// A language identifier, normalized to a lowercase BCP-47-style
/// subtag (`"en"`, `"fr"`, `"sw"`, `"am"`, ...).
///
/// Deliberately **not a closed enum** — the whole point of the Language
/// Registry (see `atlas-engine::inference::language`) is that new
/// language packs register themselves at runtime without a Runtime code
/// change. This type is the identifier the registry keys on; the actual
/// list of supported languages lives in registry *data*, not in this
/// type's definition.
#[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct LanguageCode(String);

impl LanguageCode {
    /// Constructs a language code from any string, normalized to
    /// lowercase.
    #[must_use]
    pub fn new(code: impl Into<String>) -> Self {
        Self(code.into().to_lowercase())
    }

    /// The normalized code string.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for LanguageCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

/// Text directionality, for UI rendering and prompt formatting. Unlike
/// [`LanguageCode`] or [`crate::ModelFamily`], this genuinely is a
/// closed set — there is no third writing direction to plan for.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TextDirection {
    /// Left-to-right (English, French, Swahili, ...).
    Ltr,
    /// Right-to-left (Arabic).
    Rtl,
}

/// One entry in the Language Registry: everything the Runtime and UI
/// need to know about a supported language, as data — never as a branch
/// in Runtime control flow.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LanguageDescriptor {
    /// The language's identifier.
    pub code: LanguageCode,
    /// English name, for logs, developer tooling, and as a fallback UI
    /// label (e.g. `"Swahili"`).
    pub english_name: String,
    /// Native/endonym name, for user-facing display (e.g. `"Kiswahili"`).
    pub native_name: String,
    /// Text directionality.
    pub direction: TextDirection,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn language_code_normalizes_case() {
        assert_eq!(LanguageCode::new("EN").as_str(), "en");
        assert_eq!(LanguageCode::new("Sw"), LanguageCode::new("sw"));
    }

    #[test]
    fn language_code_supports_unregistered_codes_without_type_changes() {
        let custom = LanguageCode::new("tlh"); // Klingon — not in any spec'd pack
        assert_eq!(custom.as_str(), "tlh");
    }

    #[test]
    fn language_descriptor_holds_direction() {
        let arabic = LanguageDescriptor {
            code: LanguageCode::new("ar"),
            english_name: "Arabic".to_string(),
            native_name: "العربية".to_string(),
            direction: TextDirection::Rtl,
        };
        assert_eq!(arabic.direction, TextDirection::Rtl);
    }
}
