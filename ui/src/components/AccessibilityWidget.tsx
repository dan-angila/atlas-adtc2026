import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { AccessibilityIcon, ChevronRightIcon, CloseIcon } from "./icons";
import { useAccessibility } from "../lib/useAccessibility";
import { useI18n, useTranslation } from "../i18n";
import { MACHINE_TRANSLATED_CODES } from "../i18n/languages";
import type { UILanguageCode } from "../i18n/types";

const TEXT_SIZES: { label: string; scale: number }[] = [
  { label: "A", scale: 1 },
  { label: "A", scale: 1.15 },
  { label: "A", scale: 1.3 },
];

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      className={`a11y-switch${on ? " on" : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
    >
      <span className="a11y-switch-knob" />
    </button>
  );
}

/**
 * Compact listbox replacing a native `<select>` for the interface-language
 * choice — a native select's popup is OS/webview chrome that can't be
 * constrained to the accessibility panel's footprint, which is exactly the
 * "dominates the screen" problem this replaces. Follows the WAI-ARIA
 * "Collapsible Dropdown Listbox" pattern: trigger button + `role="listbox"`
 * with `aria-activedescendant`, scroll-contained rather than OS-rendered.
 */
function LanguagePicker() {
  const { code, meta, languages, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeCode, setActiveCode] = useState<UILanguageCode>(code);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isUnverified = MACHINE_TRANSLATED_CODES.has(code);

  const closeList = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveCode(code);
    listRef.current?.focus();
  }, [open, code]);

  const commit = useCallback(
    (next: UILanguageCode) => {
      setLanguage(next);
      closeList(true);
    },
    [setLanguage, closeList],
  );

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const index = languages.findIndex((language) => language.code === activeCode);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = languages[Math.min(index + 1, languages.length - 1)];
      if (next) setActiveCode(next.code);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const previous = languages[Math.max(index - 1, 0)];
      if (previous) setActiveCode(previous.code);
    } else if (event.key === "Home") {
      event.preventDefault();
      const first = languages[0];
      if (first) setActiveCode(first.code);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = languages[languages.length - 1];
      if (last) setActiveCode(last.code);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeCode);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeList(true);
    } else if (event.key === "Tab") {
      closeList(false);
    }
  };

  return (
    <div className="a11y-language">
      <button
        ref={buttonRef}
        type="button"
        className="a11y-language-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="a11y-language-current">
          {meta.nativeName}
          {meta.nativeName !== meta.englishName ? ` — ${meta.englishName}` : ""}
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          className="a11y-language-listbox"
          role="listbox"
          tabIndex={-1}
          aria-label={t.uiLanguage.label}
          aria-activedescendant={`a11y-lang-${activeCode}`}
          onKeyDown={handleListKeyDown}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) closeList(false);
          }}
        >
          {languages.map((language) => (
            <li
              key={language.code}
              id={`a11y-lang-${language.code}`}
              role="option"
              aria-selected={language.code === code}
              className={`a11y-language-option${language.code === activeCode ? " active" : ""}`}
              onMouseEnter={() => setActiveCode(language.code)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit(language.code)}
            >
              <span>{language.nativeName}</span>
              {language.nativeName !== language.englishName && (
                <span className="a11y-language-option-en">{language.englishName}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {isUnverified && <p className="a11y-language-note">{t.uiLanguage.unverifiedNote}</p>}
    </div>
  );
}

/**
 * Global, persistent accessibility control — reachable from every
 * screen (rendered once at the app shell level). Every control here
 * changes a real CSS rule, or the real interface language; nothing is
 * decorative. Interface-language selection lives here rather than as a
 * standalone sidebar picker, since it is itself an accessibility concern
 * and the two were previously visually disconnected.
 */
export function AccessibilityWidget() {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const { settings, update, reset } = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        close(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="a11y-trigger"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={open ? t.accessibility.closeSettings : t.accessibility.openSettings}
      >
        {open ? <CloseIcon /> : <AccessibilityIcon />}
      </button>

      {open && (
        <div
          className="a11y-panel"
          role="dialog"
          aria-label={t.accessibility.panelTitle}
          ref={panelRef}
        >
          <h3>{t.accessibility.panelTitle}</h3>

          <div className="a11y-row a11y-row-language">
            <span>{t.uiLanguage.label}</span>
            <LanguagePicker />
          </div>

          <div className="a11y-row">
            <span>{t.accessibility.textSize}</span>
            <div className="a11y-segmented" role="group" aria-label={t.accessibility.textSize}>
              {TEXT_SIZES.map((size, index) => (
                <button
                  key={size.scale}
                  type="button"
                  className={settings.textScale === size.scale ? "active" : ""}
                  style={{ fontSize: 11 + index * 2 }}
                  onClick={() => update("textScale", size.scale)}
                  aria-pressed={settings.textScale === size.scale}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="a11y-row">
            <span>{t.accessibility.highContrast}</span>
            <Switch
              on={settings.highContrast}
              onToggle={() => update("highContrast", !settings.highContrast)}
              label={t.accessibility.highContrast}
            />
          </div>

          <div className="a11y-row">
            <span>{t.accessibility.reduceMotion}</span>
            <Switch
              on={settings.reducedMotion}
              onToggle={() => update("reducedMotion", !settings.reducedMotion)}
              label={t.accessibility.reduceMotion}
            />
          </div>

          <div className="a11y-row">
            <span>{t.accessibility.alwaysShowFocus}</span>
            <Switch
              on={settings.alwaysShowFocus}
              onToggle={() => update("alwaysShowFocus", !settings.alwaysShowFocus)}
              label={t.accessibility.alwaysShowFocus}
            />
          </div>

          <button type="button" className="btn btn-secondary a11y-reset" onClick={reset}>
            {t.accessibility.resetDefaults}
          </button>
        </div>
      )}
    </>
  );
}
