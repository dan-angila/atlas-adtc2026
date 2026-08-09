import { useCallback, useEffect, useState } from "react";

export interface AccessibilitySettings {
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  alwaysShowFocus: boolean;
  /** Wider letter/word spacing and line height — a real, evidence-supported
   * readability aid that needs no special font asset (unlike a genuine
   * dyslexia-specific typeface, which this project doesn't ship, so this
   * control is never labeled as one). */
  readableSpacing: boolean;
  /** Underline + heavier weight on every in-app link, so link targets are
   * distinguishable without relying on color alone. */
  highlightLinks: boolean;
  /** Swaps the pointer for a larger, higher-contrast cursor via a CSS
   * `cursor` data-URI — no external asset required. */
  bigCursor: boolean;
  /** A horizontal band that follows the pointer, dimming everything above
   * and below it — implemented in `AccessibilityWidget` via a mousemove
   * listener that sets `--a11y-mask-y`. */
  readingMask: boolean;
  /** CSS filter-based color inversion (`invert(1) hue-rotate(180deg)`). */
  invertColors: boolean;
  /** CSS filter-based grayscale. Mutually applied alongside invertColors if
   * both are on — the two filters compose, matching how CSS filters stack. */
  grayscale: boolean;
}

const DEFAULTS: AccessibilitySettings = {
  textScale: 1,
  highContrast: false,
  reducedMotion: false,
  alwaysShowFocus: false,
  readableSpacing: false,
  highlightLinks: false,
  bigCursor: false,
  readingMask: false,
  invertColors: false,
  grayscale: false,
};

const STORAGE_KEY = "atlas.accessibility";

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.style.setProperty("--text-scale", String(settings.textScale));
  root.setAttribute("data-a11y-contrast", settings.highContrast ? "high" : "normal");
  root.setAttribute("data-a11y-motion", settings.reducedMotion ? "reduced" : "normal");
  root.setAttribute("data-a11y-focus", settings.alwaysShowFocus ? "always" : "normal");
  root.setAttribute("data-a11y-spacing", settings.readableSpacing ? "wide" : "normal");
  root.setAttribute("data-a11y-links", settings.highlightLinks ? "highlight" : "normal");
  root.setAttribute("data-a11y-cursor", settings.bigCursor ? "large" : "normal");
  root.setAttribute("data-a11y-invert", settings.invertColors ? "on" : "off");
  root.setAttribute("data-a11y-grayscale", settings.grayscale ? "on" : "off");
  root.setAttribute("data-a11y-reading-mask", settings.readingMask ? "on" : "off");
}

/**
 * Real, functioning accessibility controls — every setting here maps
 * to an actual CSS rule (see the `[data-a11y-*]` selectors and
 * `--text-scale` token in index.css), persisted across restarts via
 * localStorage. Not a decorative widget.
 */
export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const loaded = loadSettings();
    applySettings(loaded);
    return loaded;
  });

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Best-effort persistence — a disabled/full storage quota must
      // not break the accessibility controls themselves.
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return { settings, update, reset };
}
