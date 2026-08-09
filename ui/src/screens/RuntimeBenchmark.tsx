import { useEffect, useState } from "react";

import { AlertIcon, GaugeIcon } from "../components/icons";
import { Badge } from "../components/Badge";
import { atlas } from "../lib/tauri";
import { useTranslation } from "../i18n";
import type { BenchmarkReportDto, RuntimeDetailsDto, RuntimeStatusDto } from "../lib/tauri";

const BENCHMARK_METHODOLOGY_PATH = "docs/benchmarks/2026-08-08-adtc-benchmark-suite.md";

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}

export function RuntimeBenchmark({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const t = useTranslation();
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
        <h3>{t.runtimeBenchmark.waitingTitle}</h3>
        <p>{runtimeStatus?.reason ?? t.runtimeBenchmark.waitingDisconnected}</p>
      </div>
    );
  }

  const workerLoaded = Boolean(details?.generationModelLoaded && details?.embeddingModelLoaded);
  const benchmarkDescription = t.runtimeBenchmark.benchmarkDescription(BENCHMARK_METHODOLOGY_PATH);
  const [descriptionBefore, descriptionAfter] = benchmarkDescription.split(
    BENCHMARK_METHODOLOGY_PATH,
  );

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <h3>{t.runtimeBenchmark.heroTitle}</h3>
          <p>{t.runtimeBenchmark.heroSubtitle}</p>
        </div>
      </section>

      <section className="atlas-panel">
        <div className="section-heading">{t.runtimeBenchmark.sectionRuntimeStatus}</div>
        <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelDocumentsLoaded}</div>
            <div className="metric-value">{runtimeStatus.documentCount ?? "—"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelLanguagesRegistered}</div>
            <div className="metric-value">{runtimeStatus.languageCount ?? "—"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelGenerationModel}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.generationModelName ?? t.common.notMeasured}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelEmbeddingModel}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.embeddingModelName ?? t.common.notMeasured}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelKnowledgeBase}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details?.knowledgeBaseName ?? t.common.notMeasured}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelWorkerState}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {details ? (
                <Badge tone={workerLoaded ? "success" : "warning"}>
                  {workerLoaded
                    ? t.runtimeBenchmark.workerStateLoaded
                    : t.runtimeBenchmark.workerStatePartial}
                </Badge>
              ) : (
                t.common.notMeasured
              )}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelThreadCount}</div>
            <div className="metric-value">{details?.threadCount ?? t.common.notMeasured}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelWorkerUptime}</div>
            <div className="metric-value">
              {details
                ? t.runtimeBenchmark.workerUptimeSeconds(Math.round(details.workerUptimeMs / 1000))
                : t.common.notMeasured}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelRetrievalLatency}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {t.common.notMeasured}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.runtimeBenchmark.labelProcessMemory}</div>
            <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
              {t.common.notMeasured}
            </div>
          </div>
        </div>

        <div className="section-heading">{t.runtimeBenchmark.sectionBenchmark}</div>
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <p className="card-subtitle" style={{ margin: "0 0 var(--space-4)" }}>
            {descriptionBefore}
            <code>{BENCHMARK_METHODOLOGY_PATH}</code>
            {descriptionAfter}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={runBenchmark}
            disabled={running}
          >
            {running ? (
              <>
                <span className="spinner" aria-hidden="true" />{" "}
                {t.runtimeBenchmark.runningBenchmarkButton}
              </>
            ) : (
              t.runtimeBenchmark.runBenchmarkButton
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
            <div className="section-heading">{t.runtimeBenchmark.sectionHardware}</div>
            <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
              <div className="metric-card">
                <div className="metric-label">{t.runtimeBenchmark.labelCpu}</div>
                <div
                  className="metric-value"
                  style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)" }}
                >
                  {report.hardware.cpuBrand}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.runtimeBenchmark.labelCores}</div>
                <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
                  {t.runtimeBenchmark.physicalLogicalCores(
                    report.hardware.physicalCoreCount,
                    report.hardware.logicalCoreCount,
                  )}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.runtimeBenchmark.labelTotalRam}</div>
                <div className="metric-value">{formatBytes(report.hardware.totalMemoryBytes)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.runtimeBenchmark.labelAvailableRam}</div>
                <div className="metric-value">
                  {formatBytes(report.hardware.availableMemoryBytes)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.runtimeBenchmark.labelRamTier}</div>
                <div className="metric-value" style={{ fontSize: "var(--text-md)" }}>
                  <Badge tone={report.ramTier === "standard" ? "success" : "warning"}>
                    {report.ramTier}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="section-heading">{t.runtimeBenchmark.sectionGenerationThroughput}</div>
            {report.generation ? (
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-label">{t.runtimeBenchmark.labelTokensPerSecond}</div>
                  <div className="metric-value">{report.generation.tokensPerSecond.toFixed(2)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">{t.runtimeBenchmark.labelGeneratedTokens}</div>
                  <div className="metric-value">{report.generation.generatedTokens}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">{t.runtimeBenchmark.labelTotalDuration}</div>
                  <div className="metric-value">
                    {report.generation.totalDurationMs}
                    <span className="metric-unit">ms</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t.runtimeBenchmark.noGenerationModel}</p>
              </div>
            )}

            <p className="notice" style={{ marginTop: "var(--space-6)" }}>
              {t.runtimeBenchmark.devHardwareNotice}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
