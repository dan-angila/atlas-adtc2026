import { useEffect, useState } from "react";

import { AlertIcon, GaugeIcon } from "../components/icons";
import { Badge } from "../components/Badge";
import { atlas } from "../lib/tauri";
import type { BenchmarkReportDto, RuntimeDetailsDto, RuntimeStatusDto } from "../lib/tauri";

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}

export function RuntimeBenchmark({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const [report, setReport] = useState<BenchmarkReportDto | null>(null);
  const [details, setDetails] = useState<RuntimeDetailsDto | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (runtimeStatus?.state !== "ready") return;
    let cancelled = false;
    atlas
      .getRuntimeDetails()
      .then((result) => {
        if (!cancelled) setDetails(result);
      })
      .catch((error_) => {
        if (!cancelled) setError(error_ instanceof Error ? error_.message : String(error_));
      });
    return () => {
      cancelled = true;
    };
  }, [runtimeStatus?.state]);

  async function runBenchmark() {
    setRunning(true);
    setError(null);
    try {
      const result = await atlas.getBenchmark();
      setReport(result);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setRunning(false);
    }
  }

  if (runtimeStatus?.state !== "ready") {
    return (
      <div className="empty-state">
        <GaugeIcon style={{ fontSize: 28 }} />
        <h3>Waiting for the Runtime</h3>
        <p>{runtimeStatus?.reason ?? "The Atlas Runtime is not connected."}</p>
      </div>
    );
  }

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <span className="eyebrow">Runtime &amp; Benchmark</span>
          <h2>Real local runtime identity</h2>
          <p>
            This view exposes what Atlas actually loaded and measured in the desktop shell. Missing
            values are called out as not measured rather than padded with placeholders.
          </p>
        </div>
      </section>

      <section className="atlas-panel">
        <div className="section-heading">Runtime status</div>
        <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
          <div className="metric-card">
            <div className="metric-label">Documents loaded</div>
            <div className="metric-value">{runtimeStatus.documentCount ?? "—"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Languages registered</div>
            <div className="metric-value">{runtimeStatus.languageCount ?? "—"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Generation model</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.generationModelName ?? "Not measured"}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Embedding model</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.embeddingModelName ?? "Not measured"}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Knowledge base</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.knowledgeBaseName ?? "Not measured"}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Worker state</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details ? (
                <Badge
                  tone={
                    details.generationModelLoaded && details.embeddingModelLoaded
                      ? "success"
                      : "warning"
                  }
                >
                  {details.generationModelLoaded && details.embeddingModelLoaded
                    ? "Generation + embedding loaded"
                    : "Partially loaded"}
                </Badge>
              ) : (
                "Not measured"
              )}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Thread count</div>
            <div className="metric-value">{details?.threadCount ?? "Not measured"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Worker uptime</div>
            <div className="metric-value">
              {details ? `${Math.round(details.workerUptimeMs / 1000)}s` : "Not measured"}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Retrieval latency</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              Not measured
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Process memory usage</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              Not measured
            </div>
          </div>
        </div>

        <div className="section-heading">Benchmark</div>
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <p className="card-subtitle" style={{ margin: "0 0 var(--space-4)" }}>
            Runs a real generation request against the loaded model and reports real, measured
            throughput — never a fabricated number. See{" "}
            <code>docs/benchmarks/2026-08-08-adtc-benchmark-suite.md</code> for the full, dated
            methodology this reuses.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={runBenchmark}
            disabled={running}
          >
            {running ? (
              <>
                <span className="spinner" aria-hidden="true" /> Running real benchmark…
              </>
            ) : (
              "Run benchmark now"
            )}
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: "var(--space-6)" }}>
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {report && (
          <>
            <div className="section-heading">Hardware (real, detected at run time)</div>
            <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
              <div className="metric-card">
                <div className="metric-label">CPU</div>
                <div
                  className="metric-value"
                  style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)" }}
                >
                  {report.hardware.cpuBrand}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Cores</div>
                <div className="metric-value">
                  {report.hardware.physicalCoreCount}
                  <span className="metric-unit">
                    physical / {report.hardware.logicalCoreCount} logical
                  </span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total RAM</div>
                <div className="metric-value">{formatBytes(report.hardware.totalMemoryBytes)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Available RAM</div>
                <div className="metric-value">
                  {formatBytes(report.hardware.availableMemoryBytes)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">RAM tier selected</div>
                <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
                  <Badge tone={report.ramTier === "standard" ? "success" : "warning"}>
                    {report.ramTier}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="section-heading">Generation throughput</div>
            {report.generation ? (
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-label">Tokens / second</div>
                  <div className="metric-value">{report.generation.tokensPerSecond.toFixed(2)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Generated tokens</div>
                  <div className="metric-value">{report.generation.generatedTokens}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Total duration</div>
                  <div className="metric-value">
                    {report.generation.totalDurationMs}
                    <span className="metric-unit">ms</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No generation model was loaded for this run.</p>
              </div>
            )}

            <p className="notice" style={{ marginTop: "var(--space-6)" }}>
              This ran on development hardware, not the competition&apos;s 8GB-RAM reference class —
              see the ADTC benchmark suite&apos;s &ldquo;Efficiency&rdquo; section for why that gap
              matters before citing these numbers in submission material.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
