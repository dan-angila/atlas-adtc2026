import { GlobeIcon } from "./icons";
import { useI18n } from "../i18n";
import { MACHINE_TRANSLATED_CODES } from "../i18n/languages";
import type { UILanguageCode } from "../i18n/types";

/**
 * The UI-chrome language switcher — distinct from Ask Atlas's own
 * per-question answer-language selector. Lives in the sidebar so it is
 * reachable from every screen without duplicating the control in the
 * header (this app has one source of truth for interface language, not
 * two competing pickers).
 */
export function LanguageSelector() {
  const { code, languages, setLanguage, t } = useI18n();
  const isUnverified = MACHINE_TRANSLATED_CODES.has(code);

  return (
    <div className="ui-language-picker">
      <label htmlFor="ui-language-select">
        <GlobeIcon aria-hidden="true" />
        <span>{t.uiLanguage.label}</span>
      </label>
      <select
        id="ui-language-select"
        value={code}
        onChange={(event) => setLanguage(event.target.value as UILanguageCode)}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
            {language.nativeName !== language.englishName ? ` — ${language.englishName}` : ""}
          </option>
        ))}
      </select>
      {isUnverified && <p className="ui-language-note">{t.uiLanguage.unverifiedNote}</p>}
    </div>
  );
}
