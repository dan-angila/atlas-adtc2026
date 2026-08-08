import { useCallback, useEffect, useState } from "react";

export interface AccessibilitySettings {
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  alwaysShowFocus: boolean;
}

const DEFAULTS: AccessibilitySettings = {
  textScale: 1,
  highContrast: false,
  reducedMotion: false,
  alwaysShowFocus: false,
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
