import { invoke } from "@tauri-apps/api/core";

/** Mirrors `atlas_app_lib::commands::AppInfo` (Rust) field-for-field. */
export interface AppInfo {
  name: string;
  version: string;
  logLevel: string;
}

/** Mirrors `atlas_app_lib::commands::RuntimeStatusDto`. */
export interface RuntimeStatusDto {
  state: "loading" | "ready" | "unavailable";
  reason: string | null;
  documentCount: number | null;
  languageCount: number | null;
}

/** Mirrors `atlas_app_lib::commands::CitationDto`. */
export interface CitationDto {
  documentId: string;
  chunkId: string;
  documentTitle: string | null;
  headingPath: string[];
}

/** Mirrors `atlas_app_lib::commands::AskAtlasResponseDto`. */
export type AskAtlasResponseDto =
  | {
      outcome: "answered";
      confidence: "weak" | "strong";
      citations: CitationDto[];
      answer: string;
      tokensPerSecond: number;
      generatedTokens: number;
    }
  | {
      outcome: "refused";
      reason: "no-evidence";
    }
  | {
      outcome: "failed";
      message: string;
    };

/** Mirrors `atlas_app_lib::commands::DocumentSummaryDto`. */
export interface DocumentSummaryDto {
  id: string;
  title: string;
  sourcePath: string;
  format: string;
}

/** Mirrors `atlas_app_lib::commands::LanguageDto`. */
export interface LanguageDto {
  code: string;
  englishName: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  validationStatus:
    "validated" | "plausible-fluent" | "partial" | "inconclusive" | "garbled" | "failed";
  validationNote: string;
}

/** Mirrors `atlas_app_lib::commands::HardwareDto`. */
export interface HardwareDto {
  totalMemoryBytes: number;
  availableMemoryBytes: number;
  physicalCoreCount: number;
  logicalCoreCount: number;
  cpuBrand: string;
}

/** Mirrors `atlas_app_lib::commands::GenerationBenchmarkDto`. */
export interface GenerationBenchmarkDto {
  promptTokens: number;
  generatedTokens: number;
  tokensPerSecond: number;
  totalDurationMs: number;
}

/** Mirrors `atlas_app_lib::commands::BenchmarkReportDto`. */
export interface BenchmarkReportDto {
  prompt: string;
  hardware: HardwareDto;
  ramTier: string;
  generation: GenerationBenchmarkDto | null;
}

/**
 * True only when running inside the real Tauri webview — every command
 * below fails gracefully outside it (e.g. `npm run dev` in a plain
 * browser for UI-only iteration) rather than throwing an unhandled
 * error, per this app's "represent honestly, never fabricate" rule.
 */
export function isTauriRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauriRuntime()) {
    throw new Error(
      "Not running inside the Atlas desktop shell — this view expects to be loaded by the Tauri app.",
    );
  }
  return invoke<T>(command, args);
}

export const atlas = {
  getAppInfo: () => safeInvoke<AppInfo>("get_app_info"),
  getRuntimeStatus: () => safeInvoke<RuntimeStatusDto>("get_runtime_status"),
  askAtlas: (query: string) => safeInvoke<AskAtlasResponseDto>("ask_atlas", { query }),
  listDocuments: () => safeInvoke<DocumentSummaryDto[]>("list_documents"),
  listLanguages: () => safeInvoke<LanguageDto[]>("list_languages"),
  getBenchmark: () => safeInvoke<BenchmarkReportDto>("get_benchmark"),
};
