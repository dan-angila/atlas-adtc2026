import type { Translations } from "../types";

const fr: Translations = {
  common: {
    notMeasured: "Non mesuré",
    loading: "Chargement…",
    untitledSource: "Source sans titre",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Intelligence en santé",
    offlineOnDevice: "Hors ligne / sur l'appareil",
    blurb:
      "Atlas répond à partir des preuves chargées sur cette machine. Il cite ce qu'il a utilisé et refuse de répondre quand il ne peut pas vérifier suffisamment de preuves.",
    disclaimer:
      "Cet outil ne pose pas de diagnostic et ne prescrit pas de traitement. Atlas présente une intelligence en santé fondée uniquement sur les documents chargés.",
    runtimeLabel: "Moteur d'exécution",
  },

  nav: {
    workspace: "Espace de travail",
    ask: "Demander à Atlas",
    knowledge: "Connaissances médicales",
    drugs: "Référence des médicaments",
    languages: "Langues",
    runtime: "Moteur et performance",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} documents locaux · ${languages} langues enregistrées`,
    loading: "Préparation des modèles locaux et de la base de connaissances",
    unavailable: "Le moteur de bureau est requis pour l'exécution réelle d'Atlas",
  },

  screenTitles: {
    ask: {
      title: "Demander à Atlas",
      subtitle:
        "Posez une question, consultez la source, citez-la, et obtenez un refus prudent si les preuves locales sont insuffisantes.",
    },
    knowledge: {
      title: "Connaissances médicales",
      subtitle: "Parcourez les documents de santé réels qu'Atlas peut consulter et citer.",
    },
    drugs: {
      title: "Référence des médicaments",
      subtitle:
        "Consultez les preuves relatives aux médicaments issues du corpus chargé, sans transformer Atlas en logiciel de gestion pharmaceutique.",
    },
    languages: {
      title: "Langues",
      subtitle:
        "Consultez la liste des langues enregistrées et les résultats de validation réellement mesurés.",
    },
    runtime: {
      title: "Moteur et performance",
      subtitle:
        "Affiche l'identité du moteur local, son état de préparation, et les données de performance, sans rien inventer.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas exécute toute l'inférence sur cet appareil — aucun appel réseau n'est effectué.",
    checking: "Vérification du moteur…",
    modelReady: "Modèle prêt",
    loadingModel: "Chargement du modèle…",
    unavailable: "Moteur indisponible",
  },

  uiLanguage: {
    label: "Langue de l'interface",
    unverifiedNote:
      "Texte d'interface traduit automatiquement, non encore relu par un locuteur natif.",
  },

  askAtlas: {
    heroTitle: "Intelligence en santé hors ligne",
    heroSubtitle:
      "Atlas s'exécute localement, interroge le corpus de santé local, évalue son niveau de confiance avant de répondre, et cite les preuves utilisées.",
    badgeOffline: "Hors ligne / sur l'appareil",
    badgeRuntimeConnected: "Moteur connecté",
    badgeRuntimeLoading: "Chargement du moteur",
    badgeRuntimeUnavailable: "Moteur indisponible",
    badgeLanguage: (name) => `Langue : ${name}`,
    metricDocuments: "Documents",
    metricLanguages: "Langues",
    metricExecution: "Exécution",
    executionLocalOnly: "Local uniquement",
    flowLabel: "Comment Atlas répond",
    flowSteps: [
      "Question",
      "Recherche locale",
      "Preuves",
      "Confiance",
      "Génération locale",
      "Réponse citée",
    ],
    suggestedQuestions: [
      "Quels sont les signes de déshydratation ?",
      "Quels sont les symptômes du paludisme ?",
      "Pourquoi les soins prénatals sont-ils importants pendant la grossesse ?",
      "À quoi sert la solution de réhydratation orale ?",
    ],
    interactionLanguageLabel: "Langue de réponse",
    emptyStateTitle: "Demander à Atlas",
    emptyStateBody:
      "Commencez par une question de santé couverte par le corpus chargé. Atlas affichera les preuves, le niveau de confiance et la réponse citée dans un même endroit.",
    modelLoadingBanner:
      "Le modèle est encore en cours de chargement — les chargements réels ont pris environ 50 secondes sur le matériel de développement de ce projet ; la durée sur le matériel de référence du concours n'a pas encore été mesurée.",
    runtimeUnavailableBanner: (reason) => `Moteur Atlas indisponible : ${reason}`,
    inputPlaceholderReady: "Posez à Atlas une question de santé fondée sur le corpus local...",
    inputPlaceholderWaiting: "En attente du moteur...",
    sendLabel: "Envoyer",
    disclaimer:
      "Atlas est un assistant de connaissances en santé. Il ne pose pas de diagnostic, ne prescrit pas de traitement et ne remplace pas un professionnel de santé qualifié.",
    questionLabel: "Question",
    pendingStatus:
      "Recherche locale en cours, évaluation de la confiance et génération d'une réponse fondée sur des preuves…",
    atlasLabel: "Atlas",
    confidenceStrong: "Preuves solides",
    confidenceWeak: "Preuves faibles",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} jetons · ${tokensPerSecond.toFixed(1)} jetons/s`,
    citedRecords: (count) =>
      `${count} preuve${count === 1 ? "" : "s"} citée${count === 1 ? "" : "s"}`,
    answerDisclaimer:
      "Les réponses sont générées à partir du corpus chargé et doivent être comprises comme une aide fondée sur des preuves, non comme un diagnostic ou une prescription.",
    evidenceUsedTitle: "Preuves utilisées",
    retrievedChunks: (count) =>
      `${count} extrait${count === 1 ? "" : "s"} récupéré${count === 1 ? "" : "s"}`,
    licenseVerified: "Licence vérifiée",
    localCorpus: "Corpus local",
    sourcesTitle: "Sources",
    retrievedOn: (date) => `récupéré le ${date}`,
    refusalNoEvidenceTitle: "Aucune preuve trouvée dans le corpus local",
    refusalInsufficientTitle: "Preuves insuffisamment corroborées dans le corpus local",
    refusalNoEvidenceBody:
      "Je n'ai trouvé aucune preuve pertinente pour cette question dans la base de connaissances chargée. Atlas ne devine pas lorsqu'aucune source ne l'appuie.",
    refusalInsufficientBody:
      "Je n'ai trouvé que des preuves faiblement corroborées pour cette question. Atlas ne génère pas de réponse médicale lorsque le support de recherche est trop faible.",
    refusalNoEvidenceNote:
      "Preuves disponibles : aucune suffisamment pertinente pour une réponse fondée.",
    refusalInsufficientNote:
      "Preuves disponibles : faiblement liées, insuffisamment fiables pour répondre en toute sécurité.",
    generationFailed: (message) => `Échec de la génération : ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "En attente du moteur",
    waitingLoadingBody: "La base de connaissances se charge en même temps que le modèle.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Le moteur Atlas n'est pas connecté.",
    heroTitle: "Parcourez les documents qu'Atlas peut réellement citer",
    heroSubtitle:
      "La traçabilité fait partie du produit. Chaque titre, organisation, juridiction et licence affiché ici provient des métadonnées du corpus chargé.",
    metricLoaded: "Documents chargés",
    metricLicenseVerified: "Licence vérifiée",
    metricJurisdictions: "Juridictions",
    searchPlaceholder: "Filtrer par titre, source ou juridiction...",
    documentsLoadedBadge: (count) =>
      `${count} document${count === 1 ? "" : "s"} chargé${count === 1 ? "" : "s"}`,
    provenanceNotice:
      "Atlas cite à partir de ce catalogue. Les métadonnées manquantes sont volontairement laissées vides ; l'interface ne les remplace pas par des valeurs fictives.",
    noMatchTitle: (query) => `Aucun document ne correspond à « ${query} »`,
    noMatchBody:
      "Essayez un autre titre, ou posez directement une question à Atlas — la recherche couvre le texte intégral des documents.",
    sourcePathLabel: "Chemin de la source",
    sourceUrlLabel: "URL de la source",
    licenseLabel: "Licence",
    retrievedOn: (date) => `Récupéré le ${date}`,
  },

  drugReference: {
    heroTitle: "Recherche de médicaments fondée sur les preuves",
    heroSubtitle:
      "Cet écran interroge directement le corpus de santé local. Il n'invente pas de faits sur les médicaments, ne délivre rien et n'agit pas comme un logiciel de pharmacie.",
    exampleQueries: [
      "solution de réhydratation orale",
      "médicaments contre le paludisme",
      "médicaments contre l'hypertension",
    ],
    searchPlaceholder:
      "Recherchez un médicament, un traitement ou un terme médical dans le corpus local...",
    searchButton: "Rechercher dans les preuves locales",
    waitingTitle: "En attente du moteur Atlas",
    waitingLoadingBody:
      "La recherche de preuves sur les médicaments devient disponible une fois les modèles locaux et le corpus chargés.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Le moteur Atlas n'est pas connecté.",
    noSearchTitle: "Aucune recherche pour l'instant",
    noSearchBody:
      "Saisissez un terme pour examiner précisément les preuves relatives aux médicaments qu'Atlas peut retrouver dans le corpus chargé.",
    confidenceStrong: "Preuves de recherche solides",
    confidenceWeak: "Preuves de recherche faibles",
    confidenceNoEvidence: "Aucune preuve trouvée",
    matchingRecords: (count) =>
      `${count} preuve${count === 1 ? "" : "s"} correspondante${count === 1 ? "" : "s"}`,
    noEvidenceTitle: "Information indisponible dans le corpus actuel",
    noEvidenceBody:
      "Atlas n'a trouvé aucune preuve locale vérifiée pour cette demande. Le produit ne comblera pas ce vide par des conseils sur les médicaments non étayés.",
    licenseVerified: "Licence vérifiée",
    localCorpus: "Corpus local",
    lexicalBadge: "Lexical",
    semanticBadge: "Sémantique",
    retrievedOn: (date) => `Récupéré le ${date}`,
    scoreLabel: (score) => `Score ${score.toFixed(3)}`,
    viewFullEvidence: "Voir la preuve complète",
    backToResults: "Retour aux résultats",
    fullEvidenceHeading: "Passage de preuve complet",
    sourceHeading: "Source",
    otherMatchesHeading: "Autres correspondances dans ce document",
    scopeNote:
      "Atlas affiche des passages extraits de vos documents chargés, pas une base de données structurée de médicaments. Les outils de dosage, les tableaux d'interactions et les codes de classification ne sont affichés que s'ils figurent dans le texte récupéré.",
  },

  languagesScreen: {
    waitingTitle: "En attente du moteur",
    waitingDisconnected: "Le moteur Atlas n'est pas connecté.",
    heroTitle: "Être enregistré ne signifie pas être entièrement validé",
    heroSubtitle:
      "Ce registre correspond à des données réelles de l'application. Le statut de chaque langue reflète une évaluation mesurée, pas une allégation commerciale fondée sur le simple enregistrement.",
    metricRegistered: "Enregistrées",
    metricValidated: "Recherche / génération validées",
    metricPlausible: "Fluidité plausible",
    metricPartialOrInconclusive: "Partielles ou non concluantes",
    banner: (validated, total) =>
      `L'inscription dans cette liste n'est qu'une métadonnée, pas une allégation de capacité. Des tests réels de génération sur Qwen3-4B le 2026-08-08 ont montré que seulement ${validated} langue(s) sur ${total} produisent des résultats fiables — voir la colonne de statut ci-dessous pour le résultat réel et mesuré de chaque langue.`,
    statusLabels: {
      validated: "Validée",
      "plausible-fluent": "Fluidité plausible",
      partial: "Partielle",
      inconclusive: "Non concluante",
      garbled: "Incompréhensible",
      failed: "Échec",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "En attente du moteur",
    waitingDisconnected: "Le moteur Atlas n'est pas connecté.",
    heroTitle: "Identité réelle du moteur local",
    heroSubtitle:
      "Cette vue expose ce qu'Atlas a réellement chargé et mesuré dans l'application de bureau. Les valeurs manquantes sont signalées comme non mesurées plutôt que comblées par des valeurs fictives.",
    sectionRuntimeStatus: "État du moteur",
    sectionBenchmark: "Test de performance",
    sectionHardware: "Matériel (réel, détecté à l'exécution)",
    sectionGenerationThroughput: "Débit de génération",
    labelDocumentsLoaded: "Documents chargés",
    labelLanguagesRegistered: "Langues enregistrées",
    labelGenerationModel: "Modèle de génération",
    labelEmbeddingModel: "Modèle d'encodage",
    labelKnowledgeBase: "Base de connaissances",
    labelWorkerState: "État du processus de calcul",
    labelThreadCount: "Nombre de threads",
    labelWorkerUptime: "Durée de fonctionnement",
    labelRetrievalLatency: "Latence de recherche",
    labelProcessMemory: "Utilisation mémoire du processus",
    workerStateLoaded: "Génération et encodage chargés",
    workerStatePartial: "Partiellement chargé",
    workerUptimeSeconds: (seconds) => `${seconds} s`,
    benchmarkDescription: (docPath) =>
      `Lance une véritable requête de génération sur le modèle chargé et rapporte un débit réel et mesuré — jamais un chiffre inventé. Voir ${docPath} pour la méthodologie complète et datée réutilisée ici.`,
    runBenchmarkButton: "Lancer le test maintenant",
    runningBenchmarkButton: "Test en cours…",
    labelCpu: "Processeur",
    labelCores: "Cœurs",
    labelTotalRam: "RAM totale",
    labelAvailableRam: "RAM disponible",
    labelRamTier: "Palier de RAM sélectionné",
    physicalLogicalCores: (physical, logical) => `${physical} physiques / ${logical} logiques`,
    labelTokensPerSecond: "Jetons / seconde",
    labelGeneratedTokens: "Jetons générés",
    labelTotalDuration: "Durée totale",
    noGenerationModel: "Aucun modèle de génération n'a été chargé pour ce test.",
    devHardwareNotice:
      "Ce test a été exécuté sur du matériel de développement, pas sur la classe de référence à 8 Go de RAM du concours — voir la section « Efficacité » de la suite de tests ADTC avant de citer ces chiffres dans un dossier de soumission.",
  },

  accessibility: {
    openSettings: "Ouvrir les paramètres d'accessibilité",
    closeSettings: "Fermer les paramètres d'accessibilité",
    panelTitle: "Accessibilité",
    textSize: "Taille du texte",
    highContrast: "Contraste élevé",
    reduceMotion: "Réduire les animations",
    alwaysShowFocus: "Toujours afficher l'anneau de focus",
    sectionReadability: "Lisibilité",
    sectionAssistiveTools: "Outils d'assistance",
    sectionDisplay: "Affichage",
    readableSpacing: "Espacement lisible",
    highlightLinks: "Mettre en évidence les liens",
    bigCursor: "Grand curseur",
    readingMask: "Guide de lecture",
    readPage: "Lire la page à voix haute",
    stopReading: "Arrêter la lecture",
    invertColors: "Inverser les couleurs",
    grayscale: "Niveaux de gris",
    skipToContent: "Passer au contenu principal",
    resetDefaults: "Réinitialiser",
  },
};

export default fr;
