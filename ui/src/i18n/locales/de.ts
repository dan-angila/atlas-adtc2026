import type { Translations } from "../types";

const de: Translations = {
  common: {
    notMeasured: "Nicht gemessen",
    loading: "Wird geladen…",
    untitledSource: "Quelle ohne Titel",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Gesundheitsintelligenz",
    offlineOnDevice: "Offline / auf dem Gerät",
    blurb:
      "Atlas antwortet auf Grundlage der auf diesem Gerät geladenen Belege. Es zitiert, was es verwendet hat, und lehnt eine Antwort ab, wenn es nicht genügend Belege prüfen kann.",
    disclaimer:
      "Dieses Werkzeug stellt keine Diagnosen und verschreibt keine Behandlungen. Atlas präsentiert Gesundheitsinformationen, die ausschließlich auf geladenen Dokumenten beruhen.",
    runtimeLabel: "Laufzeitumgebung",
  },

  nav: {
    workspace: "Arbeitsbereich",
    ask: "Atlas fragen",
    knowledge: "Medizinisches Wissen",
    drugs: "Arzneimittelreferenz",
    languages: "Sprachen",
    runtime: "Laufzeit & Benchmark",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} lokale Dokumente · ${languages} registrierte Sprachen`,
    loading: "Lokale Modelle und Wissensdatenbank werden vorbereitet",
    unavailable:
      "Für die tatsächliche Ausführung von Atlas ist die Desktop-Laufzeitumgebung erforderlich",
  },

  screenTitles: {
    ask: {
      title: "Atlas fragen",
      subtitle:
        "Frage stellen, Belege abrufen, zitieren und bei unzureichenden lokalen Belegen sicher ablehnen.",
    },
    knowledge: {
      title: "Medizinisches Wissen",
      subtitle:
        "Durchsuchen Sie die echten Gesundheitsdokumente, die Atlas abrufen und zitieren kann.",
    },
    drugs: {
      title: "Arzneimittelreferenz",
      subtitle:
        "Medikamentenbezogene Belege aus dem geladenen Korpus einsehen, ohne Atlas in ein ERP-System zu verwandeln.",
    },
    languages: {
      title: "Sprachen",
      subtitle:
        "Liste der registrierten Sprachpakete und die tatsächlich gemessenen Validierungsergebnisse dahinter.",
    },
    runtime: {
      title: "Laufzeit & Benchmark",
      subtitle:
        "Zeigt die lokale Laufzeitidentität, Bereitschaft und Benchmark-Daten ohne Erfindungen.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas führt jede Inferenz auf diesem Gerät aus — es wird kein Netzwerkaufruf getätigt.",
    checking: "Laufzeitumgebung wird geprüft…",
    modelReady: "Modell bereit",
    loadingModel: "Modell wird geladen…",
    unavailable: "Laufzeitumgebung nicht verfügbar",
  },

  uiLanguage: {
    label: "Sprache der Oberfläche",
    unverifiedNote:
      "Maschinell übersetzter Oberflächentext, noch nicht von einem Muttersprachler geprüft.",
  },

  askAtlas: {
    heroTitle: "Offline-Gesundheitsintelligenz",
    heroSubtitle:
      "Atlas läuft direkt auf dem Gerät, ruft Informationen aus dem lokalen Gesundheitskorpus ab, bewertet die Zuverlässigkeit vor der Antwort und zitiert die verwendeten Belege.",
    badgeOffline: "Offline / auf dem Gerät",
    badgeRuntimeConnected: "Laufzeitumgebung verbunden",
    badgeRuntimeLoading: "Laufzeitumgebung wird geladen",
    badgeRuntimeUnavailable: "Laufzeitumgebung nicht verfügbar",
    badgeLanguage: (name) => `Sprache: ${name}`,
    metricDocuments: "Dokumente",
    metricLanguages: "Sprachen",
    metricExecution: "Ausführung",
    executionLocalOnly: "Nur lokal",
    flowLabel: "Wie Atlas antwortet",
    flowSteps: [
      "Frage",
      "Lokale Suche",
      "Belege",
      "Zuverlässigkeit",
      "Lokale Generierung",
      "Zitierte Antwort",
    ],
    suggestedQuestions: [
      "Was sind Anzeichen einer Dehydrierung?",
      "Was sind die Symptome von Malaria?",
      "Warum ist die Schwangerenvorsorge während der Schwangerschaft wichtig?",
      "Wofür wird orale Rehydratationslösung verwendet?",
    ],
    interactionLanguageLabel: "Antwortsprache",
    emptyStateTitle: "Atlas fragen",
    emptyStateBody:
      "Beginnen Sie mit einer Gesundheitsfrage, die durch den geladenen Korpus abgedeckt ist. Atlas zeigt Belege, Zuverlässigkeit und die endgültige zitierte Antwort an einem Ort.",
    modelLoadingBanner:
      "Das Modell wird noch geladen — reale Ladevorgänge haben auf der Entwicklungshardware dieses Projekts etwa 50 Sekunden gedauert; die Zeit auf der Referenzhardware des Wettbewerbs wurde noch nicht gemessen.",
    runtimeUnavailableBanner: (reason) => `Atlas-Laufzeitumgebung nicht verfügbar: ${reason}`,
    inputPlaceholderReady:
      "Stellen Sie Atlas eine Gesundheitsfrage, die auf dem lokalen Korpus basiert...",
    inputPlaceholderWaiting: "Warten auf die Laufzeitumgebung...",
    sendLabel: "Senden",
    disclaimer:
      "Atlas ist ein Assistent für Gesundheitswissen. Er stellt keine Diagnosen, verschreibt keine Behandlungen und ersetzt keine qualifizierte Fachkraft im Gesundheitswesen.",
    questionLabel: "Frage",
    pendingStatus:
      "Lokale Suche läuft, Zuverlässigkeit wird bewertet und eine belegbasierte Antwort wird generiert…",
    atlasLabel: "Atlas",
    confidenceStrong: "Starke Beleglage",
    confidenceWeak: "Schwache Beleglage",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} Tokens · ${tokensPerSecond.toFixed(1)} Tok/s`,
    citedRecords: (count) =>
      `${count} zitierte${count === 1 ? "r" : ""} Beleg${count === 1 ? "" : "e"}`,
    answerDisclaimer:
      "Antworten werden aus dem geladenen Korpus generiert und sollten als belegbasierte Unterstützung verstanden werden, nicht als Diagnose oder Behandlungsempfehlung.",
    evidenceUsedTitle: "Verwendete Belege",
    retrievedChunks: (count) =>
      `${count} abgerufene${count === 1 ? "r" : ""} Ausschnitt${count === 1 ? "" : "e"}`,
    licenseVerified: "Lizenz geprüft",
    localCorpus: "Lokaler Korpus",
    sourcesTitle: "Quellen",
    retrievedOn: (date) => `abgerufen am ${date}`,
    refusalNoEvidenceTitle: "Keine stützenden Belege im lokalen Korpus gefunden",
    refusalInsufficientTitle: "Im lokalen Korpus nicht ausreichend belegt",
    refusalNoEvidenceBody:
      "Ich konnte in der geladenen Wissensdatenbank keine relevanten Belege für diese Frage finden. Atlas rät nicht, wenn keine Quelle vorhanden ist.",
    refusalInsufficientBody:
      "Ich habe für diese Frage nur schwach belegte Informationen gefunden. Atlas erzeugt keine medizinische Antwort, wenn die Beleglage zu schwach ist.",
    refusalNoEvidenceNote:
      "Verfügbare Belege: keine ausreichend relevant für eine fundierte Antwort.",
    refusalInsufficientNote:
      "Verfügbare Belege: schwacher Bezug, nicht zuverlässig genug für eine sichere Antwort.",
    generationFailed: (message) => `Generierung fehlgeschlagen: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Warten auf die Laufzeitumgebung",
    waitingLoadingBody: "Die Wissensdatenbank wird zusammen mit dem Modell geladen.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Die Atlas-Laufzeitumgebung ist nicht verbunden.",
    heroTitle: "Durchsuchen Sie die Dokumente, die Atlas tatsächlich zitieren kann",
    heroSubtitle:
      "Herkunftsnachweis ist Teil des Produkts. Jeder hier angezeigte Titel, jede Organisation, Rechtsordnung und Lizenz stammt aus den Metadaten des geladenen Korpus.",
    metricLoaded: "Geladene Dokumente",
    metricLicenseVerified: "Lizenz geprüft",
    metricJurisdictions: "Rechtsordnungen",
    searchPlaceholder: "Nach Titel, Quelle oder Rechtsordnung filtern...",
    documentsLoadedBadge: (count) => `${count} Dokument${count === 1 ? "" : "e"} geladen`,
    provenanceNotice:
      "Atlas zitiert aus diesem Katalog. Fehlende Metadaten bleiben absichtlich leer; die Oberfläche füllt sie nicht mit Platzhaltern auf.",
    noMatchTitle: (query) => `Keine Dokumente entsprechen „${query}“`,
    noMatchBody:
      "Versuchen Sie einen anderen Titel oder fragen Sie Atlas direkt — die Suche durchsucht den vollständigen Dokumenttext.",
    sourcePathLabel: "Quellpfad",
    sourceUrlLabel: "Quell-URL",
    licenseLabel: "Lizenz",
    retrievedOn: (date) => `Abgerufen am ${date}`,
  },

  drugReference: {
    heroTitle: "Evidenzbasierte Medikamentensuche",
    heroSubtitle:
      "Dieser Bildschirm durchsucht direkt den lokalen Gesundheitskorpus. Er erfindet keine Arzneimittelfakten, gibt keine Medikamente ab und verhält sich nicht wie ein Apothekensystem.",
    exampleQueries: [
      "orale Rehydratationslösung",
      "Malaria-Behandlungsmittel",
      "Blutdruckmedikamente",
    ],
    searchPlaceholder:
      "Im lokalen Korpus nach einem Medikament, einer Behandlung oder einem Begriff suchen...",
    searchButton: "Lokale Belege durchsuchen",
    waitingTitle: "Warten auf die Atlas-Laufzeitumgebung",
    waitingLoadingBody:
      "Die Suche nach Arzneimittelbelegen wird verfügbar, sobald die lokalen Modelle und der Korpus geladen sind.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Die Atlas-Laufzeitumgebung ist nicht verbunden.",
    noSearchTitle: "Noch keine Suche",
    noSearchBody:
      "Geben Sie einen Begriff ein, um die genauen medikamentenbezogenen Belege zu prüfen, die Atlas aus dem geladenen Korpus abrufen kann.",
    confidenceStrong: "Starke Suchbelege",
    confidenceWeak: "Schwache Suchbelege",
    confidenceNoEvidence: "Keine Belege gefunden",
    matchingRecords: (count) =>
      `${count} passende${count === 1 ? "r" : ""} Beleg${count === 1 ? "" : "e"}`,
    noEvidenceTitle: "Information im aktuellen Korpus nicht verfügbar",
    noEvidenceBody:
      "Atlas konnte für diese Anfrage keine geprüften lokalen Belege abrufen. Das Produkt füllt diese Lücke nicht mit ungestützten Arzneimittelhinweisen.",
    licenseVerified: "Lizenz geprüft",
    localCorpus: "Lokaler Korpus",
    lexicalBadge: "Lexikalisch",
    semanticBadge: "Semantisch",
    retrievedOn: (date) => `Abgerufen am ${date}`,
    scoreLabel: (score) => `Wert ${score.toFixed(3)}`,
    viewFullEvidence: "Vollständigen Beleg ansehen",
    backToResults: "Zurück zu den Ergebnissen",
    fullEvidenceHeading: "Vollständiger Belegausschnitt",
    sourceHeading: "Quelle",
    otherMatchesHeading: "Weitere Treffer in diesem Dokument",
    scopeNote:
      "Atlas zeigt abgerufene Textstellen aus Ihren geladenen Dokumenten, keine strukturierte Arzneimitteldatenbank. Dosierungswerkzeuge, Interaktionstabellen und Klassifikationscodes werden nur angezeigt, wenn sie im abgerufenen Text enthalten sind.",
  },

  languagesScreen: {
    waitingTitle: "Warten auf die Laufzeitumgebung",
    waitingDisconnected: "Die Atlas-Laufzeitumgebung ist nicht verbunden.",
    heroTitle: "Registriert bedeutet nicht vollständig validiert",
    heroSubtitle:
      "Dieses Register enthält echte Anwendungsdaten. Der für jede Sprache angezeigte Status spiegelt eine gemessene Bewertung wider, keine Marketingaussage aufgrund bloßer Registrierung.",
    metricRegistered: "Registriert",
    metricValidated: "Abruf/Generierung validiert",
    metricPlausible: "Plausible Flüssigkeit",
    metricPartialOrInconclusive: "Teilweise oder nicht eindeutig",
    banner: (validated, total) =>
      `Die Aufnahme in diese Liste ist lediglich ein Metadatum, kein Fähigkeitsanspruch. Echte Generierungstests mit Qwen3-4B am 2026-08-08 ergaben, dass nur ${validated} von ${total} Sprachen zuverlässig korrekte Ausgaben liefern — siehe die Statusspalte unten für das tatsächliche, gemessene Ergebnis jeder Sprache.`,
    statusLabels: {
      validated: "Validiert",
      "plausible-fluent": "Plausible Flüssigkeit",
      partial: "Teilweise",
      inconclusive: "Nicht eindeutig",
      garbled: "Unverständlich",
      failed: "Fehlgeschlagen",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Warten auf die Laufzeitumgebung",
    waitingDisconnected: "Die Atlas-Laufzeitumgebung ist nicht verbunden.",
    heroTitle: "Reale lokale Laufzeitidentität",
    heroSubtitle:
      "Diese Ansicht zeigt, was Atlas in der Desktop-Anwendung tatsächlich geladen und gemessen hat. Fehlende Werte werden als nicht gemessen gekennzeichnet, statt mit Platzhaltern aufgefüllt zu werden.",
    sectionRuntimeStatus: "Status der Laufzeitumgebung",
    sectionBenchmark: "Benchmark",
    sectionHardware: "Hardware (real, zur Laufzeit erkannt)",
    sectionGenerationThroughput: "Generierungsdurchsatz",
    labelDocumentsLoaded: "Geladene Dokumente",
    labelLanguagesRegistered: "Registrierte Sprachen",
    labelGenerationModel: "Generierungsmodell",
    labelEmbeddingModel: "Embedding-Modell",
    labelKnowledgeBase: "Wissensdatenbank",
    labelWorkerState: "Status des Worker-Prozesses",
    labelThreadCount: "Anzahl der Threads",
    labelWorkerUptime: "Laufzeit des Worker-Prozesses",
    labelRetrievalLatency: "Abruflatenz",
    labelProcessMemory: "Speicherverbrauch des Prozesses",
    workerStateLoaded: "Generierung und Embedding geladen",
    workerStatePartial: "Teilweise geladen",
    workerUptimeSeconds: (seconds) => `${seconds} s`,
    benchmarkDescription: (docPath) =>
      `Führt eine echte Generierungsanfrage gegen das geladene Modell aus und meldet einen realen, gemessenen Durchsatz — nie eine erfundene Zahl. Siehe ${docPath} für die vollständige, datierte Methodik, die hier wiederverwendet wird.`,
    runBenchmarkButton: "Benchmark jetzt ausführen",
    runningBenchmarkButton: "Echter Benchmark läuft…",
    labelCpu: "CPU",
    labelCores: "Kerne",
    labelTotalRam: "Gesamter Arbeitsspeicher",
    labelAvailableRam: "Verfügbarer Arbeitsspeicher",
    labelRamTier: "Ausgewählte RAM-Stufe",
    physicalLogicalCores: (physical, logical) => `${physical} physisch / ${logical} logisch`,
    labelTokensPerSecond: "Tokens / Sekunde",
    labelGeneratedTokens: "Generierte Tokens",
    labelTotalDuration: "Gesamtdauer",
    noGenerationModel: "Für diesen Durchlauf wurde kein Generierungsmodell geladen.",
    devHardwareNotice:
      "Dies wurde auf Entwicklungshardware ausgeführt, nicht auf der 8-GB-RAM-Referenzklasse des Wettbewerbs — siehe den Abschnitt „Effizienz“ der ADTC-Benchmark-Suite, bevor diese Zahlen in Einreichungsmaterial zitiert werden.",
  },

  accessibility: {
    openSettings: "Barrierefreiheitseinstellungen öffnen",
    closeSettings: "Barrierefreiheitseinstellungen schließen",
    panelTitle: "Barrierefreiheit",
    textSize: "Textgröße",
    highContrast: "Hoher Kontrast",
    reduceMotion: "Bewegung reduzieren",
    alwaysShowFocus: "Fokusring immer anzeigen",
    sectionReadability: "Lesbarkeit",
    sectionAssistiveTools: "Assistenzwerkzeuge",
    sectionDisplay: "Anzeige",
    readableSpacing: "Lesefreundlicher Abstand",
    highlightLinks: "Links hervorheben",
    bigCursor: "Großer Cursor",
    readingMask: "Lesehilfe",
    readPage: "Seite vorlesen",
    stopReading: "Vorlesen stoppen",
    invertColors: "Farben umkehren",
    grayscale: "Graustufen",
    skipToContent: "Zum Hauptinhalt springen",
    resetDefaults: "Auf Standard zurücksetzen",
  },
};

export default de;
