//! Language Registry.
//!
//! Applies **only to `atlas-adtc2026`** (the Africa Deep Tech Challenge
//! edition) — this is not assumed to carry over to any other BRIX
//! product line unmodified.
//!
//! Languages are data registered into a [`LanguageRegistry`], never
//! branches in Runtime control flow. Adding a new language pack means
//! calling [`LanguageRegistry::register`] with a new
//! [`LanguageDescriptor`] — it never requires touching any other
//! Runtime component, which is the whole point of a registry over a
//! hardcoded list.

use std::collections::BTreeMap;

use atlas_domain::{LanguageCode, LanguageDescriptor, TextDirection};

/// A registry of supported languages, keyed by [`LanguageCode`].
///
/// Deliberately just a map with a registration method — there is no
/// "supported languages" enum anywhere in the Runtime for this to get
/// out of sync with. Any code that needs to know what languages exist
/// asks this registry, not a hardcoded list.
#[derive(Debug, Clone, Default)]
pub struct LanguageRegistry {
    languages: BTreeMap<LanguageCode, LanguageDescriptor>,
}

impl LanguageRegistry {
    /// An empty registry with no languages registered.
    #[must_use]
    pub fn empty() -> Self {
        Self::default()
    }

    /// A registry pre-populated with the Africa Deep Tech Challenge
    /// edition's default language packs — see [`africa_pack`] and
    /// [`global_pack`]. This is the constructor `atlas-app`'s
    /// composition root uses; it is not the only way to build a
    /// registry, which is the point (a future BRIX product line, or a
    /// test, can start from [`LanguageRegistry::empty`] and register
    /// whatever it needs).
    #[must_use]
    pub fn with_default_packs() -> Self {
        let mut registry = Self::empty();
        for descriptor in africa_pack().into_iter().chain(global_pack()) {
            registry.register(descriptor);
        }
        registry
    }

    /// Registers a language, replacing any existing entry with the same
    /// code. Returns the replaced entry, if any.
    pub fn register(&mut self, descriptor: LanguageDescriptor) -> Option<LanguageDescriptor> {
        self.languages.insert(descriptor.code.clone(), descriptor)
    }

    /// Looks up a language by code.
    #[must_use]
    pub fn get(&self, code: &LanguageCode) -> Option<&LanguageDescriptor> {
        self.languages.get(code)
    }

    /// Whether `code` is registered.
    #[must_use]
    pub fn contains(&self, code: &LanguageCode) -> bool {
        self.languages.contains_key(code)
    }

    /// All registered languages, in code order.
    pub fn iter(&self) -> impl Iterator<Item = &LanguageDescriptor> {
        self.languages.values()
    }

    /// Number of registered languages.
    #[must_use]
    pub fn len(&self) -> usize {
        self.languages.len()
    }

    /// Whether the registry has no languages registered.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.languages.is_empty()
    }
}

fn lang(
    code: &str,
    english_name: &str,
    native_name: &str,
    direction: TextDirection,
) -> LanguageDescriptor {
    LanguageDescriptor {
        code: LanguageCode::new(code),
        english_name: english_name.to_string(),
        native_name: native_name.to_string(),
        direction,
    }
}

/// The Africa Deep Tech Challenge edition's Africa Language Pack:
/// English, French, Arabic, Swahili, Somali, Kinyarwanda, Kirundi,
/// Amharic, Hausa, Yoruba, Igbo, Zulu, Xhosa, Luganda, Dholuo (Luo),
/// Shona.
#[must_use]
pub fn africa_pack() -> Vec<LanguageDescriptor> {
    use TextDirection::{Ltr, Rtl};
    vec![
        lang("en", "English", "English", Ltr),
        lang("fr", "French", "Français", Ltr),
        lang("ar", "Arabic", "العربية", Rtl),
        lang("sw", "Swahili", "Kiswahili", Ltr),
        lang("so", "Somali", "Soomaali", Ltr),
        lang("rw", "Kinyarwanda", "Ikinyarwanda", Ltr),
        lang("rn", "Kirundi", "Ikirundi", Ltr),
        lang("am", "Amharic", "አማርኛ", Ltr),
        lang("ha", "Hausa", "Hausa", Ltr),
        lang("yo", "Yoruba", "Yorùbá", Ltr),
        lang("ig", "Igbo", "Igbo", Ltr),
        lang("zu", "Zulu", "isiZulu", Ltr),
        lang("xh", "Xhosa", "isiXhosa", Ltr),
        lang("lg", "Luganda", "Luganda", Ltr),
        lang("luo", "Dholuo", "Dholuo", Ltr),
        lang("sn", "Shona", "chiShona", Ltr),
    ]
}

/// The Africa Deep Tech Challenge edition's Global Language Pack:
/// Portuguese, German, Spanish, Italian, Russian, Chinese, Japanese,
/// Hindi.
///
/// Portuguese is included here (not in [`africa_pack`]) per the spec's
/// own grouping, even though it is also a major language across several
/// African nations (Angola, Mozambique, ...) — the pack split reflects
/// the specification as given, not a claim about where Portuguese is or
/// isn't spoken.
#[must_use]
pub fn global_pack() -> Vec<LanguageDescriptor> {
    use TextDirection::Ltr;
    vec![
        lang("pt", "Portuguese", "Português", Ltr),
        lang("de", "German", "Deutsch", Ltr),
        lang("es", "Spanish", "Español", Ltr),
        lang("it", "Italian", "Italiano", Ltr),
        lang("ru", "Russian", "Русский", Ltr),
        lang("zh", "Chinese", "中文", Ltr),
        lang("ja", "Japanese", "日本語", Ltr),
        lang("hi", "Hindi", "हिन्दी", Ltr),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_registry_contains_every_spec_d_language() {
        let registry = LanguageRegistry::with_default_packs();
        assert_eq!(registry.len(), africa_pack().len() + global_pack().len());

        for code in [
            "en", "fr", "ar", "sw", "so", "rw", "rn", "am", "ha", "yo", "ig", "zu", "xh", "lg",
            "luo", "sn", "pt", "de", "es", "it", "ru", "zh", "ja", "hi",
        ] {
            assert!(
                registry.contains(&LanguageCode::new(code)),
                "expected {code} to be registered"
            );
        }
    }

    #[test]
    fn arabic_is_registered_with_right_to_left_direction() {
        let registry = LanguageRegistry::with_default_packs();
        let arabic = registry.get(&LanguageCode::new("ar")).unwrap();
        assert_eq!(arabic.direction, TextDirection::Rtl);
        assert_eq!(arabic.native_name, "العربية");
    }

    #[test]
    fn empty_registry_supports_registering_a_language_not_in_any_default_pack() {
        let mut registry = LanguageRegistry::empty();
        assert!(registry.is_empty());

        registry.register(lang("tlh", "Klingon", "tlhIngan Hol", TextDirection::Ltr));
        assert_eq!(registry.len(), 1);
        assert!(registry.contains(&LanguageCode::new("tlh")));
    }

    #[test]
    fn registering_an_existing_code_replaces_it_and_returns_the_old_entry() {
        let mut registry = LanguageRegistry::empty();
        let original = lang("en", "English", "English", TextDirection::Ltr);
        let replacement = lang("en", "English (updated)", "English", TextDirection::Ltr);

        assert_eq!(registry.register(original.clone()), None);
        let replaced = registry.register(replacement.clone());
        assert_eq!(replaced, Some(original));
        assert_eq!(registry.get(&LanguageCode::new("en")), Some(&replacement));
    }

    #[test]
    fn iter_visits_every_registered_language_exactly_once() {
        let registry = LanguageRegistry::with_default_packs();
        let count = registry.iter().count();
        assert_eq!(count, registry.len());
    }
}
