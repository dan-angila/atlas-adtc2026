import type { UILanguageCode } from "./types";

export interface UILanguageMeta {
  code: UILanguageCode;
  englishName: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}

/**
 * The UI-chrome language list. Deliberately identical, code-for-code,
 * to `atlas_engine::inference::language::{africa_pack, global_pack}` —
 * this project's own architecture doctrine is "any code that needs to
 * know what languages exist asks the registry, not a hardcoded list"
 * (see that module's doc comment). This array is the frontend's mirror
 * of that real registry, not an independently curated list — if the
 * backend registry ever changes, this file must change with it.
 */
export const UI_LANGUAGES: UILanguageMeta[] = [
  { code: "en", englishName: "English", nativeName: "English", direction: "ltr" },
  { code: "fr", englishName: "French", nativeName: "Français", direction: "ltr" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "sw", englishName: "Swahili", nativeName: "Kiswahili", direction: "ltr" },
  { code: "so", englishName: "Somali", nativeName: "Soomaali", direction: "ltr" },
  { code: "rw", englishName: "Kinyarwanda", nativeName: "Ikinyarwanda", direction: "ltr" },
  { code: "rn", englishName: "Kirundi", nativeName: "Ikirundi", direction: "ltr" },
  { code: "am", englishName: "Amharic", nativeName: "አማርኛ", direction: "ltr" },
  { code: "ha", englishName: "Hausa", nativeName: "Hausa", direction: "ltr" },
  { code: "yo", englishName: "Yoruba", nativeName: "Yorùbá", direction: "ltr" },
  { code: "ig", englishName: "Igbo", nativeName: "Igbo", direction: "ltr" },
  { code: "zu", englishName: "Zulu", nativeName: "isiZulu", direction: "ltr" },
  { code: "xh", englishName: "Xhosa", nativeName: "isiXhosa", direction: "ltr" },
  { code: "lg", englishName: "Luganda", nativeName: "Luganda", direction: "ltr" },
  { code: "luo", englishName: "Dholuo", nativeName: "Dholuo", direction: "ltr" },
  { code: "sn", englishName: "Shona", nativeName: "chiShona", direction: "ltr" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português", direction: "ltr" },
  { code: "de", englishName: "German", nativeName: "Deutsch", direction: "ltr" },
  { code: "es", englishName: "Spanish", nativeName: "Español", direction: "ltr" },
  { code: "it", englishName: "Italian", nativeName: "Italiano", direction: "ltr" },
  { code: "ru", englishName: "Russian", nativeName: "Русский", direction: "ltr" },
  { code: "zh", englishName: "Chinese", nativeName: "中文", direction: "ltr" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", direction: "ltr" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", direction: "ltr" },
];

/**
 * Languages whose UI translation has not been checked by a native or
 * fluent speaker of that specific language — every non-English
 * translation in this project today. Surfaced in the language switcher
 * so the product never implies a false certainty about translation
 * quality (this project's standing "never overclaim validation" rule,
 * applied to UI copy the same way it's already applied to model
 * generation and corpus claims).
 */
export const MACHINE_TRANSLATED_CODES: ReadonlySet<UILanguageCode> = new Set(
  UI_LANGUAGES.map((language) => language.code).filter((code) => code !== "en"),
);
