import { useState } from "react";

import { Badge } from "../components/Badge";
import { AlertIcon, ChatIcon, DocumentIcon, GaugeIcon, LinkIcon } from "../components/icons";

const CAPABILITIES: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <DocumentIcon />,
    title: "Drug & Inventory",
    description: "Stock levels, batches, and expiry tracking across facilities.",
  },
  {
    icon: <ChatIcon />,
    title: "Accounting",
    description: "Revenue, expenses, and financial performance in one ledger.",
  },
  {
    icon: <GaugeIcon />,
    title: "Reports",
    description: "Operational and financial reporting, filtered and exportable.",
  },
  {
    icon: <LinkIcon />,
    title: "BRIX Intelligence",
    description: "Business intelligence over live operational data.",
  },
];

/**
 * Represents BRIX as a distinct product in the wider ecosystem. No
 * operational data, inventory, or accounting logic lives here — the
 * four cards below are representational only, and the CTA is honest
 * about there being no configured BRIX deployment in this build.
 */
export function BrixPlatform() {
  const [showNotConfigured, setShowNotConfigured] = useState(false);

  return (
    <div style={{ maxWidth: 880 }}>
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "var(--space-10) var(--space-6)",
          marginBottom: "var(--space-8)",
          background: "linear-gradient(180deg, var(--accent-50), var(--surface-raised) 65%)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto var(--space-4)",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--accent-500), var(--accent-700))",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "var(--text-lg)",
          }}
        >
          B
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", letterSpacing: "-0.02em" }}>
          BRIX
        </h2>
        <p style={{ margin: "0 0 var(--space-4)", color: "var(--text-secondary)" }}>
          Healthcare Operations Platform
        </p>
        <Badge tone="info">Connected to the BRIX ecosystem</Badge>
      </div>

      <div className="suggestion-grid" style={{ marginBottom: "var(--space-6)" }}>
        {CAPABILITIES.map((capability) => (
          <div className="suggestion-card" key={capability.title} style={{ cursor: "default" }}>
            <span className="suggestion-card-icon" aria-hidden="true">
              {capability.icon}
            </span>
            <span className="suggestion-card-text">
              <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <strong>{capability.title}</strong>
                <Badge tone="neutral">BRIX</Badge>
              </span>
              <span style={{ color: "var(--text-secondary)" }}>{capability.description}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowNotConfigured(true)}
        >
          Open BRIX →
        </button>
        {showNotConfigured && (
          <div
            className="error-banner"
            style={{
              marginTop: "var(--space-4)",
              display: "inline-flex",
              background: "var(--info-bg)",
              borderColor: "var(--info-border)",
              color: "var(--info-text)",
            }}
          >
            <AlertIcon />
            <span>BRIX connection not configured in this build.</span>
          </div>
        )}
      </div>
    </div>
  );
}
