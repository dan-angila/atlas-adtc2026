import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import en from "./en";
import { UI_LANGUAGES } from "./languages";
import type { Translations, UILanguageCode } from "./types";
import type { UILanguageMeta } from "./languages";

const STORAGE_KEY = "atlas-ui-language";

/** Guaranteed non-undefined fallback for `UI_LANGUAGES.find(...)` under
 * `noUncheckedIndexedAccess` — English is always registered, but the
 * type system can't infer that from a `.find()` call alone. */
const FALLBACK_LANGUAGE: UILanguageMeta = {
  code: "en",
  englishName: "English",
  nativeName: "English",
  direction: "ltr",
};

const loaders: Record<UILanguageCode, () => Promise<{ default: Translations }>> = {
  en: () => Promise.resolve({ default: en }),
  fr: () => import("./locales/fr"),
  ar: () => import("./locales/ar"),
  sw: () => import("./locales/sw"),
  so: () => import("./locales/so"),
  rw: () => import("./locales/rw"),
  rn: () => import("./locales/rn"),
  am: () => import("./locales/am"),
  ha: () => import("./locales/ha"),
  yo: () => import("./locales/yo"),
  ig: () => import("./locales/ig"),
  zu: () => import("./locales/zu"),
  xh: () => import("./locales/xh"),
  lg: () => import("./locales/lg"),
  luo: () => import("./locales/luo"),
  sn: () => import("./locales/sn"),
  pt: () => import("./locales/pt"),
  de: () => import("./locales/de"),
  es: () => import("./locales/es"),
  it: () => import("./locales/it"),
  ru: () => import("./locales/ru"),
  zh: () => import("./locales/zh"),
  ja: () => import("./locales/ja"),
  hi: () => import("./locales/hi"),
};

function isUILanguageCode(value: string): value is UILanguageCode {
  return value in loaders;
}

function readStoredLanguage(): UILanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isUILanguageCode(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. a strict sandbox) — fall through to the default.
  }
  return "en";
}

interface I18nContextValue {
  code: UILanguageCode;
  meta: UILanguageMeta;
  t: Translations;
  setLanguage: (code: UILanguageCode) => void;
  languages: UILanguageMeta[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Owns the UI's chrome language — distinct from Ask Atlas's per-question
 * "answer language" selector (`AskAtlas`'s own `languageCode` state).
 * The two are related (switching the interface language also seeds a
 * sensible default answer language) but not the same setting: a user
 * can read the interface in French while asking Atlas to answer in
 * Swahili, and the corpus itself has its own language independent of
 * either — see `docs/design/localization.md` for the three-way split.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<UILanguageCode>(() => readStoredLanguage());
  const [translations, setTranslations] = useState<Translations>(en);

  useEffect(() => {
    let cancelled = false;
    loaders[code]().then((module) => {
      if (!cancelled) setTranslations(module.default);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const meta = useMemo(
    () =>
      UI_LANGUAGES.find((language) => language.code === code) ??
      UI_LANGUAGES[0] ??
      FALLBACK_LANGUAGE,
    [code],
  );

  useEffect(() => {
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.direction;
  }, [meta]);

  const setLanguage = useCallback((next: UILanguageCode) => {
    setCode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best-effort persistence only — a failed write shouldn't block switching.
    }
  }, []);

  const value = useMemo(
    () => ({ code, meta, t: translations, setLanguage, languages: UI_LANGUAGES }),
    [code, meta, translations, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

/** Convenience hook for the common case of just needing the strings. */
export function useTranslation(): Translations {
  return useI18n().t;
}
