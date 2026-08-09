import type en from "./en";

/**
 * Every locale file must satisfy this exact shape — a missing or
 * mistyped key in any translation file is a TypeScript compile error,
 * not a silent fallback to English under a different language's label.
 */
export type Translations = typeof en;

/** The real, backend-registered language codes this UI can render in —
 * mirrors `crates/atlas-engine/src/inference/language.rs` exactly, so
 * the UI-language switcher never offers a language Atlas doesn't
 * actually have registered (and never omits one it does). */
export type UILanguageCode =
  | "en"
  | "fr"
  | "ar"
  | "sw"
  | "so"
  | "rw"
  | "rn"
  | "am"
  | "ha"
  | "yo"
  | "ig"
  | "zu"
  | "xh"
  | "lg"
  | "luo"
  | "sn"
  | "pt"
  | "de"
  | "es"
  | "it"
  | "ru"
  | "zh"
  | "ja"
  | "hi";
