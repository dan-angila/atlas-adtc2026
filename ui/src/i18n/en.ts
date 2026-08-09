/**
 * English is the source-of-truth dictionary: every other locale file is
 * typed against `typeof en` (see `types.ts`), so a missing key in any
 * translation is a compile error, not a silent English fallback string
 * shown under a different language's flag.
 *
 * Interpolated strings are functions, not template placeholders — each
 * locale decides its own word order/pluralization/noun-class agreement
 * rather than inheriting English's "count + optional s" pattern, which
 * does not hold across most of these 24 languages.
 */
const en = {
  common: {
    notMeasured: "Not measured",
    loading: "Loading…",
    untitledSource: "Untitled source",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Healthcare Intelligence",
    offlineOnDevice: "Offline / On-device",
    blurb:
      "Atlas answers from the evidence loaded on this machine. It cites what it used and refuses when it cannot verify enough support.",
    disclaimer:
      "Not a diagnostic or prescribing tool. Atlas presents healthcare intelligence grounded in loaded documents only.",
    runtimeLabel: "Runtime",
  },

  nav: {
    workspace: "Workspace",
    ask: "Ask Atlas",
    knowledge: "Medical Knowledge",
    drugs: "Drug Reference",
    languages: "Languages",
    runtime: "Runtime & Benchmark",
  },

  runtimeSummary: {
    ready: (documents: number, languages: number) =>
      `${documents} local documents · ${languages} languages registered`,
    loading: "Preparing local models and knowledge base",
    unavailable: "Desktop runtime required for real Atlas execution",
  },

  screenTitles: {
    ask: {
      title: "Ask Atlas",
      subtitle:
        "Question, retrieve, cite, and refuse safely when the local evidence is insufficient.",
    },
    knowledge: {
      title: "Medical Knowledge",
      subtitle: "Browse the real healthcare documents Atlas can retrieve and cite.",
    },
    drugs: {
      title: "Drug Reference",
      subtitle:
        "Inspect medication-related evidence from the loaded corpus without turning Atlas into an ERP.",
    },
    languages: {
      title: "Languages",
      subtitle:
        "See the registered language pack list and the actual measured validation results behind it.",
    },
    runtime: {
      title: "Runtime & Benchmark",
      subtitle:
        "Expose the local runtime identity, readiness, and benchmark data without fabrication.",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas performs all inference on this device — no network call is made.",
    checking: "Checking runtime…",
    modelReady: "Model ready",
    loadingModel: "Loading model…",
    unavailable: "Runtime unavailable",
  },

  uiLanguage: {
    label: "Interface language",
    unverifiedNote: "Machine-translated interface text, not yet reviewed by a native speaker.",
  },

  askAtlas: {
    heroTitle: "Offline Healthcare Intelligence",
    heroSubtitle:
      "Atlas runs on-device, retrieves from the local healthcare corpus, measures confidence before answering, and cites the evidence it used.",
    badgeOffline: "Offline / on-device",
    badgeRuntimeConnected: "Runtime connected",
    badgeRuntimeLoading: "Runtime loading",
    badgeRuntimeUnavailable: "Runtime unavailable",
    badgeLanguage: (name: string) => `Language: ${name}`,
    metricDocuments: "Documents",
    metricLanguages: "Languages",
    metricExecution: "Execution",
    executionLocalOnly: "Local only",
    flowLabel: "How Atlas answers",
    flowSteps: [
      "Question",
      "Local retrieval",
      "Evidence",
      "Confidence",
      "Local generation",
      "Cited answer",
    ] as [string, string, string, string, string, string],
    suggestedQuestions: [
      "What are the signs of dehydration?",
      "What are the symptoms of malaria?",
      "Why is prenatal care important during pregnancy?",
      "What is oral rehydration solution used for?",
    ] as [string, string, string, string],
    interactionLanguageLabel: "Interaction language",
    emptyStateTitle: "Ask Atlas",
    emptyStateBody:
      "Start with a healthcare question supported by the loaded corpus. Atlas will show the evidence, confidence, and final cited answer in one place.",
    modelLoadingBanner:
      "The model is still loading — real model loads have measured around 50 seconds on this project's development hardware; timing on the competition's reference hardware has not been measured.",
    runtimeUnavailableBanner: (reason: string) => `Atlas Runtime unavailable: ${reason}`,
    inputPlaceholderReady: "Ask Atlas a healthcare question grounded in the local corpus...",
    inputPlaceholderWaiting: "Waiting for the Runtime...",
    sendLabel: "Send",
    disclaimer:
      "Atlas is a healthcare knowledge assistant. It does not diagnose, prescribe, or replace a qualified healthcare professional.",
    questionLabel: "Question",
    pendingStatus:
      "Running local retrieval, assessing confidence, and generating a grounded answer…",
    atlasLabel: "Atlas",
    confidenceStrong: "Strong evidence",
    confidenceWeak: "Weak evidence",
    tokenStats: (tokens: number, tokensPerSecond: number) =>
      `${tokens} tokens · ${tokensPerSecond.toFixed(1)} tok/s`,
    citedRecords: (count: number) => `${count} cited evidence record${count === 1 ? "" : "s"}`,
    answerDisclaimer:
      "Answers are generated from the loaded corpus and should be interpreted as evidence-grounded assistance, not diagnosis or prescribing advice.",
    evidenceUsedTitle: "Evidence used",
    retrievedChunks: (count: number) => `${count} retrieved chunk${count === 1 ? "" : "s"}`,
    licenseVerified: "License verified",
    localCorpus: "Local corpus",
    sourcesTitle: "Sources",
    retrievedOn: (date: string) => `retrieved ${date}`,
    refusalNoEvidenceTitle: "No supporting evidence found in the local corpus",
    refusalInsufficientTitle: "Insufficient corroborated evidence in the local corpus",
    refusalNoEvidenceBody:
      "I could not retrieve relevant evidence for this question in the loaded knowledge base. Atlas will not guess when no source support is available.",
    refusalInsufficientBody:
      "I retrieved only weakly corroborated evidence for this question. Atlas will not generate a medical answer when the retrieval support is too weak.",
    refusalNoEvidenceNote:
      "Evidence available: none relevant enough to support a grounded response.",
    refusalInsufficientNote:
      "Evidence available: weakly related, not reliable enough to answer safely.",
    generationFailed: (message: string) => `Generation failed: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Waiting for the Runtime",
    waitingLoadingBody: "The knowledge base loads alongside the model.",
    waitingUnavailableBody: (reason: string) => reason,
    waitingDisconnected: "The Atlas Runtime is not connected.",
    heroTitle: "Browse the documents Atlas can actually cite",
    heroSubtitle:
      "Provenance is part of the product. Every title, organization, jurisdiction, and license field shown here comes from the loaded corpus metadata.",
    metricLoaded: "Loaded documents",
    metricLicenseVerified: "License verified",
    metricJurisdictions: "Jurisdictions",
    searchPlaceholder: "Filter by title, source, or jurisdiction...",
    documentsLoadedBadge: (count: number) => `${count} document${count === 1 ? "" : "s"} loaded`,
    provenanceNotice:
      "Atlas cites from this catalog. Empty metadata is left empty on purpose; the UI does not backfill provenance with placeholders.",
    noMatchTitle: (query: string) => `No documents match "${query}"`,
    noMatchBody:
      "Try a different title, or ask Atlas directly — retrieval searches full document text.",
    sourcePathLabel: "Source path",
    sourceUrlLabel: "Source URL",
    licenseLabel: "License",
    retrievedOn: (date: string) => `Retrieved ${date}`,
  },

  drugReference: {
    heroTitle: "Evidence-first medication lookup",
    heroSubtitle:
      "This screen searches the local healthcare corpus directly. It does not invent drug facts, dispense medications, or act like a pharmacy system.",
    exampleQueries: [
      "oral rehydration solution",
      "malaria treatment drugs",
      "blood pressure medicines",
    ] as [string, string, string],
    searchPlaceholder: "Search the local corpus for a drug, treatment, or medication term...",
    searchButton: "Search local evidence",
    waitingTitle: "Waiting for the Atlas Runtime",
    waitingLoadingBody:
      "Drug evidence search becomes available once the local models and corpus finish loading.",
    waitingUnavailableBody: (reason: string) => reason,
    waitingDisconnected: "The Atlas Runtime is not connected.",
    noSearchTitle: "No search yet",
    noSearchBody:
      "Enter a term to inspect the exact medication-related evidence Atlas can retrieve from the loaded corpus.",
    confidenceStrong: "Strong retrieval evidence",
    confidenceWeak: "Weak retrieval evidence",
    confidenceNoEvidence: "No evidence found",
    matchingRecords: (count: number) =>
      `${count} matching evidence record${count === 1 ? "" : "s"}`,
    noEvidenceTitle: "Information unavailable in the current corpus",
    noEvidenceBody:
      "Atlas did not retrieve verified local evidence for this request. The product will not fill that gap with unsupported drug guidance.",
    licenseVerified: "License verified",
    localCorpus: "Local corpus",
    lexicalBadge: "Lexical",
    semanticBadge: "Semantic",
    retrievedOn: (date: string) => `Retrieved ${date}`,
    scoreLabel: (score: number) => `Score ${score.toFixed(3)}`,
    viewFullEvidence: "View full evidence",
    backToResults: "Back to results",
    fullEvidenceHeading: "Full evidence passage",
    sourceHeading: "Source",
    otherMatchesHeading: "Other matches in this document",
    scopeNote:
      "Atlas shows retrieved passages from your loaded documents, not a structured drug database. Dosing tools, interaction tables, and classification codes are not shown unless present in the retrieved text itself.",
  },

  languagesScreen: {
    waitingTitle: "Waiting for the Runtime",
    waitingDisconnected: "The Atlas Runtime is not connected.",
    heroTitle: "Registered does not mean fully validated",
    heroSubtitle:
      "This registry is real application data. The status shown for each language reflects measured evaluation, not a marketing claim based on mere registration.",
    metricRegistered: "Registered",
    metricValidated: "Retrieval / generation validated",
    metricPlausible: "Plausible fluent",
    metricPartialOrInconclusive: "Partial or inconclusive",
    banner: (validated: number, total: number) =>
      `Registration in this list is metadata only, not a capability claim. Real generation testing against Qwen3-4B on 2026-08-08 found only ${validated} of ${total} languages produce reliably correct output — see the status column below for every language's actual, measured result.`,
    statusLabels: {
      validated: "Validated",
      "plausible-fluent": "Plausible fluent",
      partial: "Partial",
      inconclusive: "Inconclusive",
      garbled: "Garbled",
      failed: "Failed",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Waiting for the Runtime",
    waitingDisconnected: "The Atlas Runtime is not connected.",
    heroTitle: "Real local runtime identity",
    heroSubtitle:
      "This view exposes what Atlas actually loaded and measured in the desktop shell. Missing values are called out as not measured rather than padded with placeholders.",
    sectionRuntimeStatus: "Runtime status",
    sectionBenchmark: "Benchmark",
    sectionHardware: "Hardware (real, detected at run time)",
    sectionGenerationThroughput: "Generation throughput",
    labelDocumentsLoaded: "Documents loaded",
    labelLanguagesRegistered: "Languages registered",
    labelGenerationModel: "Generation model",
    labelEmbeddingModel: "Embedding model",
    labelKnowledgeBase: "Knowledge base",
    labelWorkerState: "Worker state",
    labelThreadCount: "Thread count",
    labelWorkerUptime: "Worker uptime",
    labelRetrievalLatency: "Retrieval latency",
    labelProcessMemory: "Process memory usage",
    workerStateLoaded: "Generation + embedding loaded",
    workerStatePartial: "Partially loaded",
    workerUptimeSeconds: (seconds: number) => `${seconds}s`,
    benchmarkDescription: (docPath: string) =>
      `Runs a real generation request against the loaded model and reports real, measured throughput — never a fabricated number. See ${docPath} for the full, dated methodology this reuses.`,
    runBenchmarkButton: "Run benchmark now",
    runningBenchmarkButton: "Running real benchmark…",
    labelCpu: "CPU",
    labelCores: "Cores",
    labelTotalRam: "Total RAM",
    labelAvailableRam: "Available RAM",
    labelRamTier: "RAM tier selected",
    physicalLogicalCores: (physical: number, logical: number) =>
      `${physical} physical / ${logical} logical`,
    labelTokensPerSecond: "Tokens / second",
    labelGeneratedTokens: "Generated tokens",
    labelTotalDuration: "Total duration",
    noGenerationModel: "No generation model was loaded for this run.",
    devHardwareNotice:
      "This ran on development hardware, not the competition's 8GB-RAM reference class — see the ADTC benchmark suite's “Efficiency” section for why that gap matters before citing these numbers in submission material.",
  },

  accessibility: {
    openSettings: "Open accessibility settings",
    closeSettings: "Close accessibility settings",
    panelTitle: "Accessibility",
    textSize: "Text size",
    highContrast: "High contrast",
    reduceMotion: "Reduce motion",
    alwaysShowFocus: "Always show focus ring",
    sectionReadability: "Readability",
    sectionAssistiveTools: "Assistive tools",
    sectionDisplay: "Display",
    readableSpacing: "Readable spacing",
    highlightLinks: "Highlight links",
    bigCursor: "Large cursor",
    readingMask: "Reading guide",
    readPage: "Read page aloud",
    stopReading: "Stop reading",
    invertColors: "Invert colors",
    grayscale: "Grayscale",
    skipToContent: "Skip to main content",
    resetDefaults: "Reset to defaults",
  },
};

export default en;
