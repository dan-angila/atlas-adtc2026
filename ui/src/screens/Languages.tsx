import { useEffect, useState } from "react";

import { AlertIcon, GlobeIcon } from "../components/icons";
import { Badge, validationTone } from "../components/Badge";
import { atlas } from "../lib/tauri";
import type { LanguageDto, RuntimeStatusDto } from "../lib/tauri";

const STATUS_LABEL: Record<LanguageDto["validationStatus"], string> = {
  validated: "Validated",
  "plausible-fluent": "Plausible fluent",
  partial: "Partial",
  inconclusive: "Inconclusive",
  garbled: "Garbled",
  failed: "Failed",
};

export function Languages({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const [languages, setLanguages] = useState<LanguageDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (runtimeStatus?.state !== "ready") return;
    let cancelled = false;
    atlas
      .listLanguages()
      .then((result) => {
        if (!cancelled) setLanguages(result);
      })
      .catch((error_) => {
        if (!cancelled) setError(error_ instanceof Error ? error_.message : String(error_));
      });
    return () => {
      cancelled = true;
    };
  }, [runtimeStatus?.state]);

  if (runtimeStatus?.state !== "ready") {
    return (
      <div className="empty-state">
        <GlobeIcon style={{ fontSize: 28 }} />
        <h3>Waiting for the Runtime</h3>
        <p>{runtimeStatus?.reason ?? "The Atlas Runtime is not connected."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <AlertIcon />
        <span>{error}</span>
      </div>
    );
  }

  if (languages === null) {
    return (
      <div className="doc-list">
        {[0, 1, 2].map((index) => (
          <div className="doc-card" key={index}>
            <div className="skeleton" style={{ height: 18, width: "30%" }} />
          </div>
        ))}
      </div>
    );
  }

  const validatedCount = languages.filter(
    (language) => language.validationStatus === "validated",
  ).length;

  return (
    <div>
      <div
        className="error-banner"
        style={{
          background: "var(--info-bg)",
          borderColor: "var(--info-border)",
          color: "var(--info-text)",
          marginBottom: "var(--space-5)",
        }}
      >
        <AlertIcon />
        <span>
          Registration in this list is metadata only, not a capability claim. Real generation
          testing against Qwen3-4B on 2026-08-08 found only <strong>{validatedCount}</strong> of{" "}
          {languages.length} languages produce reliably correct output — see the status column below
          for every language's actual, measured result.
        </span>
      </div>

      <div className="doc-list">
        {languages.map((language) => (
          <div className="doc-card" key={language.code}>
            <div className="doc-card-header">
              <div>
                <h3 className="doc-card-title">
                  {language.englishName}{" "}
                  <span className="notice" style={{ fontWeight: 400 }}>
                    {language.nativeName !== language.englishName
                      ? `· ${language.nativeName}`
                      : null}
                  </span>
                </h3>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge tone="neutral">{language.direction.toUpperCase()}</Badge>
                <Badge tone={validationTone(language.validationStatus)}>
                  {STATUS_LABEL[language.validationStatus]}
                </Badge>
              </div>
            </div>
            <p className="notice" style={{ margin: 0 }}>
              {language.validationNote}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
