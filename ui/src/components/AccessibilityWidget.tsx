import { useState } from "react";

import { AccessibilityIcon, CloseIcon } from "./icons";
import { useAccessibility } from "../lib/useAccessibility";

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
 * Global, persistent accessibility control — reachable from every
 * screen (rendered once at the app shell level). Every control here
 * changes a real CSS rule; nothing is decorative.
 */
export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const { settings, update, reset } = useAccessibility();

  return (
    <>
      <button
        type="button"
        className="a11y-trigger"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={open ? "Close accessibility settings" : "Open accessibility settings"}
      >
        {open ? <CloseIcon /> : <AccessibilityIcon />}
      </button>

      {open && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility settings">
          <h3>Accessibility</h3>

          <div className="a11y-row">
            <span>Text size</span>
            <div className="a11y-segmented" role="group" aria-label="Text size">
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
            <span>High contrast</span>
            <Switch
              on={settings.highContrast}
              onToggle={() => update("highContrast", !settings.highContrast)}
              label="High contrast"
            />
          </div>

          <div className="a11y-row">
            <span>Reduce motion</span>
            <Switch
              on={settings.reducedMotion}
              onToggle={() => update("reducedMotion", !settings.reducedMotion)}
              label="Reduce motion"
            />
          </div>

          <div className="a11y-row">
            <span>Always show focus ring</span>
            <Switch
              on={settings.alwaysShowFocus}
              onToggle={() => update("alwaysShowFocus", !settings.alwaysShowFocus)}
              label="Always show focus ring"
            />
          </div>

          <button type="button" className="btn btn-secondary a11y-reset" onClick={reset}>
            Reset to defaults
          </button>
        </div>
      )}
    </>
  );
}
