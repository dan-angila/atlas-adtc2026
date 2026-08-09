import type { Translations } from "../types";

const it: Translations = {
  common: {
    notMeasured: "Non misurato",
    loading: "Caricamento…",
    untitledSource: "Fonte senza titolo",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Intelligenza sanitaria",
    offlineOnDevice: "Offline / sul dispositivo",
    blurb:
      "Atlas risponde sulla base delle prove caricate su questa macchina. Cita ciò che ha usato e rifiuta di rispondere quando non può verificare prove sufficienti.",
    disclaimer:
      "Questo strumento non pone diagnosi né prescrive trattamenti. Atlas presenta informazioni sanitarie basate esclusivamente sui documenti caricati.",
    runtimeLabel: "Ambiente di esecuzione",
  },

  nav: {
    workspace: "Area di lavoro",
    ask: "Chiedi ad Atlas",
    knowledge: "Conoscenza medica",
    drugs: "Riferimento farmaci",
    languages: "Lingue",
    runtime: "Runtime e benchmark",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} documenti locali · ${languages} lingue registrate`,
    loading: "Preparazione dei modelli locali e della base di conoscenza",
    unavailable: "È richiesto l'ambiente desktop per l'esecuzione reale di Atlas",
  },

  screenTitles: {
    ask: {
      title: "Chiedi ad Atlas",
      subtitle:
        "Fai una domanda, recupera le prove, citale e rifiuta con prudenza se le prove locali sono insufficienti.",
    },
    knowledge: {
      title: "Conoscenza medica",
      subtitle: "Sfoglia i documenti sanitari reali che Atlas può recuperare e citare.",
    },
    drugs: {
      title: "Riferimento farmaci",
      subtitle:
        "Consulta le prove sui farmaci dal corpus caricato senza trasformare Atlas in un sistema gestionale.",
    },
    languages: {
      title: "Lingue",
      subtitle:
        "Consulta l'elenco dei pacchetti linguistici registrati e i risultati di validazione effettivamente misurati.",
    },
    runtime: {
      title: "Runtime e benchmark",
      subtitle:
        "Mostra l'identità del runtime locale, la sua disponibilità e i dati di benchmark senza invenzioni.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas esegue ogni inferenza su questo dispositivo — non viene effettuata alcuna chiamata di rete.",
    checking: "Verifica del runtime in corso…",
    modelReady: "Modello pronto",
    loadingModel: "Caricamento del modello…",
    unavailable: "Runtime non disponibile",
  },

  uiLanguage: {
    label: "Lingua dell'interfaccia",
    unverifiedNote:
      "Testo dell'interfaccia tradotto automaticamente, non ancora revisionato da un madrelingua.",
  },

  askAtlas: {
    heroTitle: "Intelligenza sanitaria offline",
    heroSubtitle:
      "Atlas funziona direttamente sul dispositivo, recupera informazioni dal corpus sanitario locale, valuta il livello di affidabilità prima di rispondere e cita le prove utilizzate.",
    badgeOffline: "Offline / sul dispositivo",
    badgeRuntimeConnected: "Runtime connesso",
    badgeRuntimeLoading: "Caricamento del runtime",
    badgeRuntimeUnavailable: "Runtime non disponibile",
    badgeLanguage: (name) => `Lingua: ${name}`,
    metricDocuments: "Documenti",
    metricLanguages: "Lingue",
    metricExecution: "Esecuzione",
    executionLocalOnly: "Solo locale",
    flowLabel: "Come risponde Atlas",
    flowSteps: [
      "Domanda",
      "Recupero locale",
      "Prove",
      "Affidabilità",
      "Generazione locale",
      "Risposta citata",
    ],
    suggestedQuestions: [
      "Quali sono i segni della disidratazione?",
      "Quali sono i sintomi della malaria?",
      "Perché l'assistenza prenatale è importante durante la gravidanza?",
      "A cosa serve la soluzione di reidratazione orale?",
    ],
    interactionLanguageLabel: "Lingua della risposta",
    emptyStateTitle: "Chiedi ad Atlas",
    emptyStateBody:
      "Inizia con una domanda sanitaria supportata dal corpus caricato. Atlas mostrerà le prove, il livello di affidabilità e la risposta citata finale in un unico posto.",
    modelLoadingBanner:
      "Il modello è ancora in fase di caricamento — i caricamenti reali hanno richiesto circa 50 secondi sull'hardware di sviluppo di questo progetto; i tempi sull'hardware di riferimento della competizione non sono ancora stati misurati.",
    runtimeUnavailableBanner: (reason) => `Runtime di Atlas non disponibile: ${reason}`,
    inputPlaceholderReady: "Fai ad Atlas una domanda sanitaria basata sul corpus locale...",
    inputPlaceholderWaiting: "In attesa del runtime...",
    sendLabel: "Invia",
    disclaimer:
      "Atlas è un assistente di conoscenza sanitaria. Non pone diagnosi, non prescrive trattamenti e non sostituisce un professionista sanitario qualificato.",
    questionLabel: "Domanda",
    pendingStatus:
      "Recupero locale in corso, valutazione dell'affidabilità e generazione di una risposta basata su prove…",
    atlasLabel: "Atlas",
    confidenceStrong: "Prove solide",
    confidenceWeak: "Prove deboli",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} token · ${tokensPerSecond.toFixed(1)} tok/s`,
    citedRecords: (count) => `${count} prova/e citata/e`,
    answerDisclaimer:
      "Le risposte sono generate a partire dal corpus caricato e devono essere intese come assistenza basata su prove, non come diagnosi o indicazione terapeutica.",
    evidenceUsedTitle: "Prove utilizzate",
    retrievedChunks: (count) => `${count} estratto/i recuperato/i`,
    licenseVerified: "Licenza verificata",
    localCorpus: "Corpus locale",
    sourcesTitle: "Fonti",
    retrievedOn: (date) => `recuperato il ${date}`,
    refusalNoEvidenceTitle: "Nessuna prova a supporto trovata nel corpus locale",
    refusalInsufficientTitle: "Prove non sufficientemente corroborate nel corpus locale",
    refusalNoEvidenceBody:
      "Non sono riuscito a recuperare prove pertinenti per questa domanda nella base di conoscenza caricata. Atlas non indovina quando non c'è alcuna fonte a supporto.",
    refusalInsufficientBody:
      "Per questa domanda ho recuperato solo prove debolmente corroborate. Atlas non genera una risposta medica quando il supporto del recupero è troppo debole.",
    refusalNoEvidenceNote:
      "Prove disponibili: nessuna abbastanza pertinente da supportare una risposta fondata.",
    refusalInsufficientNote:
      "Prove disponibili: correlazione debole, non sufficientemente affidabile per rispondere in sicurezza.",
    generationFailed: (message) => `Generazione non riuscita: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "In attesa del runtime",
    waitingLoadingBody: "La base di conoscenza si carica insieme al modello.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Il runtime di Atlas non è connesso.",
    heroTitle: "Sfoglia i documenti che Atlas può effettivamente citare",
    heroSubtitle:
      "La tracciabilità delle fonti fa parte del prodotto. Ogni titolo, organizzazione, giurisdizione e licenza mostrati qui provengono dai metadati del corpus caricato.",
    metricLoaded: "Documenti caricati",
    metricLicenseVerified: "Licenza verificata",
    metricJurisdictions: "Giurisdizioni",
    searchPlaceholder: "Filtra per titolo, fonte o giurisdizione...",
    documentsLoadedBadge: (count) => `${count} documento/i caricato/i`,
    provenanceNotice:
      "Atlas cita da questo catalogo. I metadati mancanti sono lasciati intenzionalmente vuoti; l'interfaccia non li riempie con valori fittizi.",
    noMatchTitle: (query) => `Nessun documento corrisponde a "${query}"`,
    noMatchBody:
      "Prova con un altro titolo, oppure chiedi direttamente ad Atlas — il recupero cerca nel testo completo dei documenti.",
    sourcePathLabel: "Percorso della fonte",
    sourceUrlLabel: "URL della fonte",
    licenseLabel: "Licenza",
    retrievedOn: (date) => `Recuperato il ${date}`,
  },

  drugReference: {
    heroTitle: "Ricerca di farmaci basata sulle prove",
    heroSubtitle:
      "Questa schermata interroga direttamente il corpus sanitario locale. Non inventa fatti sui farmaci, non li dispensa e non si comporta come un sistema di farmacia.",
    exampleQueries: [
      "soluzione di reidratazione orale",
      "farmaci per il trattamento della malaria",
      "farmaci per la pressione sanguigna",
    ],
    searchPlaceholder: "Cerca nel corpus locale un farmaco, un trattamento o un termine medico...",
    searchButton: "Cerca nelle prove locali",
    waitingTitle: "In attesa del runtime di Atlas",
    waitingLoadingBody:
      "La ricerca di prove sui farmaci sarà disponibile una volta caricati i modelli locali e il corpus.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Il runtime di Atlas non è connesso.",
    noSearchTitle: "Nessuna ricerca ancora effettuata",
    noSearchBody:
      "Inserisci un termine per esaminare le prove esatte relative ai farmaci che Atlas può recuperare dal corpus caricato.",
    confidenceStrong: "Prove di recupero solide",
    confidenceWeak: "Prove di recupero deboli",
    confidenceNoEvidence: "Nessuna prova trovata",
    matchingRecords: (count) => `${count} prova/e corrispondente/i`,
    noEvidenceTitle: "Informazione non disponibile nel corpus attuale",
    noEvidenceBody:
      "Atlas non ha recuperato prove locali verificate per questa richiesta. Il prodotto non colmerà questa lacuna con indicazioni farmacologiche non supportate.",
    licenseVerified: "Licenza verificata",
    localCorpus: "Corpus locale",
    lexicalBadge: "Lessicale",
    semanticBadge: "Semantico",
    retrievedOn: (date) => `Recuperato il ${date}`,
    scoreLabel: (score) => `Punteggio ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "In attesa del runtime",
    waitingDisconnected: "Il runtime di Atlas non è connesso.",
    heroTitle: "Registrata non significa pienamente validata",
    heroSubtitle:
      "Questo registro contiene dati reali dell'applicazione. Lo stato mostrato per ciascuna lingua riflette una valutazione misurata, non un'affermazione commerciale basata sulla semplice registrazione.",
    metricRegistered: "Registrate",
    metricValidated: "Recupero / generazione validati",
    metricPlausible: "Fluidità plausibile",
    metricPartialOrInconclusive: "Parziali o non conclusive",
    banner: (validated, total) =>
      `La registrazione in questo elenco è solo un metadato, non un'affermazione di capacità. Test reali di generazione con Qwen3-4B del 2026-08-08 hanno rilevato che solo ${validated} lingue su ${total} producono risultati affidabili — vedi la colonna di stato qui sotto per il risultato reale e misurato di ciascuna lingua.`,
    statusLabels: {
      validated: "Validata",
      "plausible-fluent": "Fluidità plausibile",
      partial: "Parziale",
      inconclusive: "Non conclusiva",
      garbled: "Incomprensibile",
      failed: "Non riuscita",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "In attesa del runtime",
    waitingDisconnected: "Il runtime di Atlas non è connesso.",
    heroTitle: "Identità reale del runtime locale",
    heroSubtitle:
      "Questa vista mostra ciò che Atlas ha effettivamente caricato e misurato nell'applicazione desktop. I valori mancanti sono indicati come non misurati anziché riempiti con valori fittizi.",
    sectionRuntimeStatus: "Stato del runtime",
    sectionBenchmark: "Benchmark",
    sectionHardware: "Hardware (reale, rilevato in fase di esecuzione)",
    sectionGenerationThroughput: "Velocità di generazione",
    labelDocumentsLoaded: "Documenti caricati",
    labelLanguagesRegistered: "Lingue registrate",
    labelGenerationModel: "Modello di generazione",
    labelEmbeddingModel: "Modello di embedding",
    labelKnowledgeBase: "Base di conoscenza",
    labelWorkerState: "Stato del processo worker",
    labelThreadCount: "Numero di thread",
    labelWorkerUptime: "Tempo di attività del worker",
    labelRetrievalLatency: "Latenza di recupero",
    labelProcessMemory: "Utilizzo di memoria del processo",
    workerStateLoaded: "Generazione ed embedding caricati",
    workerStatePartial: "Parzialmente caricato",
    workerUptimeSeconds: (seconds) => `${seconds} s`,
    benchmarkDescription: (docPath) =>
      `Esegue una richiesta di generazione reale sul modello caricato e riporta una velocità reale e misurata — mai un numero inventato. Vedi ${docPath} per la metodologia completa e datata riutilizzata qui.`,
    runBenchmarkButton: "Esegui il benchmark ora",
    runningBenchmarkButton: "Benchmark reale in corso…",
    labelCpu: "CPU",
    labelCores: "Core",
    labelTotalRam: "RAM totale",
    labelAvailableRam: "RAM disponibile",
    labelRamTier: "Livello di RAM selezionato",
    physicalLogicalCores: (physical, logical) => `${physical} fisici / ${logical} logici`,
    labelTokensPerSecond: "Token / secondo",
    labelGeneratedTokens: "Token generati",
    labelTotalDuration: "Durata totale",
    noGenerationModel: "Nessun modello di generazione è stato caricato per questa esecuzione.",
    devHardwareNotice:
      "Questo test è stato eseguito su hardware di sviluppo, non sulla classe di riferimento a 8 GB di RAM della competizione — vedi la sezione «Efficienza» della suite di benchmark ADTC prima di citare questi numeri nel materiale di candidatura.",
  },

  accessibility: {
    openSettings: "Apri le impostazioni di accessibilità",
    closeSettings: "Chiudi le impostazioni di accessibilità",
    panelTitle: "Accessibilità",
    textSize: "Dimensione del testo",
    highContrast: "Alto contrasto",
    reduceMotion: "Riduci le animazioni",
    alwaysShowFocus: "Mostra sempre l'indicatore di focus",
    resetDefaults: "Ripristina le impostazioni predefinite",
  },
};

export default it;
