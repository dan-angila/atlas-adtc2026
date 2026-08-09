import type { Translations } from "../types";

const sw: Translations = {
  common: {
    notMeasured: "Haijapimwa",
    loading: "Inapakia…",
    untitledSource: "Chanzo bila kichwa",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Akili ya Huduma ya Afya",
    offlineOnDevice: "Nje ya mtandao / kwenye kifaa",
    blurb:
      "Atlas hujibu kwa kutumia ushahidi uliopakiwa kwenye kifaa hiki. Hunukuu alichotumia na hukataa kujibu pale asiposhindwa kuthibitisha ushahidi wa kutosha.",
    disclaimer:
      "Hii si zana ya kuchunguza wala kuagiza matibabu. Atlas huwasilisha akili ya afya inayotegemea nyaraka zilizopakiwa pekee.",
    runtimeLabel: "Mfumo endeshi",
  },

  nav: {
    workspace: "Nafasi ya kazi",
    ask: "Uliza Atlas",
    knowledge: "Maarifa ya Kitiba",
    drugs: "Rejeleo la Dawa",
    languages: "Lugha",
    runtime: "Mfumo na Vipimo",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Hati ${documents} za ndani · Lugha ${languages} zilizosajiliwa`,
    loading: "Inaandaa miundo ya ndani na hazina ya maarifa",
    unavailable: "Mfumo wa eneo-kazi unahitajika kwa utendaji halisi wa Atlas",
  },

  screenTitles: {
    ask: {
      title: "Uliza Atlas",
      subtitle: "Uliza, tafuta, nukuu, na kataa kwa tahadhari pale ushahidi wa ndani hautoshi.",
    },
    knowledge: {
      title: "Maarifa ya Kitiba",
      subtitle: "Vinjari hati halisi za afya ambazo Atlas anaweza kuzitafuta na kuzinukuu.",
    },
    drugs: {
      title: "Rejeleo la Dawa",
      subtitle:
        "Chunguza ushahidi kuhusu dawa kutoka kwenye hazina iliyopakiwa bila kumfanya Atlas kuwa mfumo wa usimamizi wa maduka ya dawa.",
    },
    languages: {
      title: "Lugha",
      subtitle: "Ona orodha ya lugha zilizosajiliwa na matokeo halisi ya uthibitisho yaliyopimwa.",
    },
    runtime: {
      title: "Mfumo na Vipimo",
      subtitle:
        "Onyesha utambulisho halisi wa mfumo endeshi, utayari wake, na data ya vipimo bila kubuni chochote.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas hufanya uchakataji wote kwenye kifaa hiki — hakuna wito wa mtandao unaofanyika.",
    checking: "Inakagua mfumo endeshi…",
    modelReady: "Modeli tayari",
    loadingModel: "Inapakia modeli…",
    unavailable: "Mfumo endeshi haupatikani",
  },

  uiLanguage: {
    label: "Lugha ya kiolesura",
    unverifiedNote:
      "Maandishi ya kiolesura yaliyotafsiriwa kwa mashine, bado hayajakaguliwa na mzungumzaji asilia.",
  },

  askAtlas: {
    heroTitle: "Akili ya Huduma ya Afya Nje ya Mtandao",
    heroSubtitle:
      "Atlas hufanya kazi kwenye kifaa, hutafuta kutoka kwenye hazina ya afya ya ndani, hupima kiwango cha uhakika kabla ya kujibu, na kunukuu ushahidi alioutumia.",
    badgeOffline: "Nje ya mtandao / kwenye kifaa",
    badgeRuntimeConnected: "Mfumo umeunganishwa",
    badgeRuntimeLoading: "Mfumo unapakia",
    badgeRuntimeUnavailable: "Mfumo haupatikani",
    badgeLanguage: (name) => `Lugha: ${name}`,
    metricDocuments: "Hati",
    metricLanguages: "Lugha",
    metricExecution: "Utekelezaji",
    executionLocalOnly: "Ndani pekee",
    flowLabel: "Jinsi Atlas anavyojibu",
    flowSteps: [
      "Swali",
      "Utafutaji wa ndani",
      "Ushahidi",
      "Uhakika",
      "Uzalishaji wa ndani",
      "Jibu lililonukuliwa",
    ],
    suggestedQuestions: [
      "Ni dalili gani za upungufu wa maji mwilini?",
      "Ni dalili gani za malaria?",
      "Kwa nini huduma ya kabla ya kuzaa ni muhimu wakati wa ujauzito?",
      "Maji ya chumvichumvi ya kunywa (ORS) hutumika kwa nini?",
    ],
    interactionLanguageLabel: "Lugha ya mazungumzo",
    emptyStateTitle: "Uliza Atlas",
    emptyStateBody:
      "Anza kwa swali la afya linaloungwa mkono na hazina iliyopakiwa. Atlas ataonyesha ushahidi, kiwango cha uhakika, na jibu la mwisho lililonukuliwa mahali pamoja.",
    modelLoadingBanner:
      "Modeli bado inapakia — upakiaji halisi umepimwa kuchukua takriban sekunde 50 kwenye vifaa vya maendeleo vya mradi huu; muda kwenye vifaa rasmi vya shindano bado haujapimwa.",
    runtimeUnavailableBanner: (reason) => `Mfumo wa Atlas haupatikani: ${reason}`,
    inputPlaceholderReady: "Muulize Atlas swali la afya linalotegemea hazina ya ndani...",
    inputPlaceholderWaiting: "Inasubiri Mfumo Endeshi...",
    sendLabel: "Tuma",
    disclaimer:
      "Atlas ni msaidizi wa maarifa ya afya. Hachunguzi, haagizi matibabu, wala hachukui nafasi ya mtaalamu wa afya aliyehitimu.",
    questionLabel: "Swali",
    pendingStatus:
      "Inafanya utafutaji wa ndani, kupima kiwango cha uhakika, na kutengeneza jibu linalotegemea ushahidi…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ushahidi imara",
    confidenceWeak: "Ushahidi dhaifu",
    tokenStats: (tokens, tokensPerSecond) =>
      `Tokeni ${tokens} · Tokeni/sekunde ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Rekodi ${count} za ushahidi zilizonukuliwa`,
    answerDisclaimer:
      "Majibu yanatengenezwa kutoka kwenye hazina iliyopakiwa na yanapaswa kueleweka kama msaada unaotegemea ushahidi, si utambuzi wala ushauri wa matibabu.",
    evidenceUsedTitle: "Ushahidi uliotumika",
    retrievedChunks: (count) => `Vipande ${count} vilivyopatikana`,
    licenseVerified: "Leseni imethibitishwa",
    localCorpus: "Hazina ya ndani",
    sourcesTitle: "Vyanzo",
    retrievedOn: (date) => `imepatikana ${date}`,
    refusalNoEvidenceTitle: "Hakuna ushahidi unaounga mkono uliopatikana kwenye hazina ya ndani",
    refusalInsufficientTitle: "Ushahidi hautoshi kuthibitishwa kwenye hazina ya ndani",
    refusalNoEvidenceBody:
      "Sikuweza kupata ushahidi unaohusiana na swali hili kwenye hazina ya maarifa iliyopakiwa. Atlas hakisii pale hakuna chanzo kinachounga mkono.",
    refusalInsufficientBody:
      "Nilipata ushahidi dhaifu tu kuhusu swali hili. Atlas hatengenezi jibu la kitiba pale msaada wa utafutaji ni dhaifu mno.",
    refusalNoEvidenceNote:
      "Ushahidi uliopo: hakuna unaotosha kuunga mkono jibu linalotegemea ushahidi.",
    refusalInsufficientNote:
      "Ushahidi uliopo: unahusiana kwa udhaifu, hautoshi kuaminika kujibu kwa usalama.",
    generationFailed: (message) => `Uzalishaji umeshindwa: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Inasubiri Mfumo Endeshi",
    waitingLoadingBody: "Hazina ya maarifa hupakia sambamba na modeli.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Mfumo wa Atlas haujaunganishwa.",
    heroTitle: "Vinjari hati ambazo Atlas anaweza kuzinukuu kihalisia",
    heroSubtitle:
      "Uwazi wa chanzo ni sehemu ya bidhaa hii. Kila kichwa, taasisi, mamlaka, na leseni inayoonyeshwa hapa hutoka kwenye data asilia ya hazina iliyopakiwa.",
    metricLoaded: "Hati zilizopakiwa",
    metricLicenseVerified: "Leseni imethibitishwa",
    metricJurisdictions: "Mamlaka",
    searchPlaceholder: "Chuja kwa kichwa, chanzo, au mamlaka...",
    documentsLoadedBadge: (count) => `Hati ${count} zilizopakiwa`,
    provenanceNotice:
      "Atlas hunukuu kutoka kwenye orodha hii. Data isiyokuwepo huachwa wazi kwa makusudi; kiolesura hakijazi nafasi hiyo kwa data ya kubuni.",
    noMatchTitle: (query) => `Hakuna hati inayolingana na "${query}"`,
    noMatchBody:
      "Jaribu kichwa kingine, au muulize Atlas moja kwa moja — utafutaji huchunguza maandishi yote ya hati.",
    sourcePathLabel: "Njia ya chanzo",
    sourceUrlLabel: "Kiungo cha chanzo",
    licenseLabel: "Leseni",
    retrievedOn: (date) => `Imepatikana ${date}`,
  },

  drugReference: {
    heroTitle: "Utafutaji wa dawa unaotegemea ushahidi",
    heroSubtitle:
      "Skrini hii hutafuta moja kwa moja kwenye hazina ya afya ya ndani. Haibuni ukweli wa dawa, haigawi dawa, wala haifanyi kazi kama mfumo wa duka la dawa.",
    exampleQueries: [
      "maji ya chumvichumvi ya kunywa",
      "dawa za matibabu ya malaria",
      "dawa za shinikizo la damu",
    ],
    searchPlaceholder: "Tafuta dawa, matibabu, au neno la kitiba kwenye hazina ya ndani...",
    searchButton: "Tafuta ushahidi wa ndani",
    waitingTitle: "Inasubiri Mfumo wa Atlas",
    waitingLoadingBody:
      "Utafutaji wa ushahidi wa dawa unapatikana baada ya miundo ya ndani na hazina kumaliza kupakia.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Mfumo wa Atlas haujaunganishwa.",
    noSearchTitle: "Bado hakuna utafutaji",
    noSearchBody:
      "Andika neno ili kuchunguza kwa usahihi ushahidi kuhusu dawa ambao Atlas anaweza kuupata kwenye hazina iliyopakiwa.",
    confidenceStrong: "Ushahidi imara wa utafutaji",
    confidenceWeak: "Ushahidi dhaifu wa utafutaji",
    confidenceNoEvidence: "Hakuna ushahidi uliopatikana",
    matchingRecords: (count) => `Rekodi ${count} za ushahidi zinazolingana`,
    noEvidenceTitle: "Taarifa haipatikani kwenye hazina ya sasa",
    noEvidenceBody:
      "Atlas hakupata ushahidi wa ndani uliothibitishwa kwa ombi hili. Bidhaa hii haitajaza pengo hilo kwa ushauri wa dawa usiothibitishwa.",
    licenseVerified: "Leseni imethibitishwa",
    localCorpus: "Hazina ya ndani",
    lexicalBadge: "Kileksika",
    semanticBadge: "Kimaana",
    retrievedOn: (date) => `Imepatikana ${date}`,
    scoreLabel: (score) => `Alama ${score.toFixed(3)}`,
    viewFullEvidence: "Tazama ushahidi kamili",
    backToResults: "Rudi kwenye matokeo",
    fullEvidenceHeading: "Kifungu kamili cha ushahidi",
    sourceHeading: "Chanzo",
    otherMatchesHeading: "Mechi nyingine katika hati hii",
    scopeNote:
      "Atlas inaonyesha vifungu vilivyopatikana kutoka hati ulizopakia, si hifadhidata iliyopangwa ya dawa. Zana za kipimo cha dozi, majedwali ya mwingiliano, na misimbo ya uainishaji havionyeshwi isipokuwa vimo kwenye maandishi yaliyopatikana.",
  },

  languagesScreen: {
    waitingTitle: "Inasubiri Mfumo Endeshi",
    waitingDisconnected: "Mfumo wa Atlas haujaunganishwa.",
    heroTitle: "Kusajiliwa si sawa na kuthibitishwa kikamilifu",
    heroSubtitle:
      "Orodha hii ni data halisi ya programu. Hali inayoonyeshwa kwa kila lugha inaonyesha tathmini iliyopimwa, si dai la kibiashara linalotegemea usajili tu.",
    metricRegistered: "Zilizosajiliwa",
    metricValidated: "Utafutaji / uzalishaji vilivyothibitishwa",
    metricPlausible: "Ufasaha unaowezekana",
    metricPartialOrInconclusive: "Sehemu au zisizo dhahiri",
    banner: (validated, total) =>
      `Kusajiliwa kwenye orodha hii ni data ya maelezo pekee, si dai la uwezo. Majaribio halisi ya uzalishaji dhidi ya Qwen3-4B tarehe 2026-08-08 yaligundua kuwa lugha ${validated} kati ya ${total} pekee ndizo zinazotoa matokeo sahihi kwa uthabiti — angalia safu ya hali hapa chini kwa matokeo halisi, yaliyopimwa ya kila lugha.`,
    statusLabels: {
      validated: "Imethibitishwa",
      "plausible-fluent": "Ufasaha unaowezekana",
      partial: "Sehemu",
      inconclusive: "Haidhihiriki",
      garbled: "Imeharibika",
      failed: "Imeshindwa",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Inasubiri Mfumo Endeshi",
    waitingDisconnected: "Mfumo wa Atlas haujaunganishwa.",
    heroTitle: "Utambulisho halisi wa mfumo wa ndani",
    heroSubtitle:
      "Mwonekano huu unaonyesha kile Atlas alichopakia na kupima kihalisia kwenye programu ya eneo-kazi. Thamani zisizopo huonyeshwa kama hazijapimwa badala ya kujazwa na data ya kubuni.",
    sectionRuntimeStatus: "Hali ya mfumo",
    sectionBenchmark: "Kipimo cha utendaji",
    sectionHardware: "Vifaa (halisi, vilivyogunduliwa wakati wa utekelezaji)",
    sectionGenerationThroughput: "Kasi ya uzalishaji",
    labelDocumentsLoaded: "Hati zilizopakiwa",
    labelLanguagesRegistered: "Lugha zilizosajiliwa",
    labelGenerationModel: "Modeli ya uzalishaji",
    labelEmbeddingModel: "Modeli ya uwakilishi",
    labelKnowledgeBase: "Hazina ya maarifa",
    labelWorkerState: "Hali ya kichakataji",
    labelThreadCount: "Idadi ya nyuzi",
    labelWorkerUptime: "Muda wa uendeshaji",
    labelRetrievalLatency: "Muda wa kuchelewa kwa utafutaji",
    labelProcessMemory: "Matumizi ya kumbukumbu ya mchakato",
    workerStateLoaded: "Uzalishaji na uwakilishi vimepakiwa",
    workerStatePartial: "Vimepakiwa kwa sehemu",
    workerUptimeSeconds: (seconds) => `sekunde ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Hufanya ombi halisi la uzalishaji dhidi ya modeli iliyopakiwa na kuripoti kasi halisi, iliyopimwa — kamwe si namba ya kubuni. Angalia ${docPath} kwa mbinu kamili, yenye tarehe, inayotumika tena hapa.`,
    runBenchmarkButton: "Anzisha kipimo sasa",
    runningBenchmarkButton: "Kinaendesha kipimo halisi…",
    labelCpu: "Kichakataji (CPU)",
    labelCores: "Chembe za CPU",
    labelTotalRam: "RAM jumla",
    labelAvailableRam: "RAM inayopatikana",
    labelRamTier: "Kiwango cha RAM kilichochaguliwa",
    physicalLogicalCores: (physical, logical) => `${physical} halisi / ${logical} kimantiki`,
    labelTokensPerSecond: "Tokeni / sekunde",
    labelGeneratedTokens: "Tokeni zilizozalishwa",
    labelTotalDuration: "Muda jumla",
    noGenerationModel: "Hakuna modeli ya uzalishaji iliyopakiwa kwa jaribio hili.",
    devHardwareNotice:
      "Hii iliendeshwa kwenye vifaa vya maendeleo, si daraja rasmi la kumbukumbu la GB 8 la shindano — angalia sehemu ya “Ufanisi” ya mkusanyiko wa vipimo vya ADTC kabla ya kunukuu namba hizi kwenye nyaraka za uwasilishaji.",
  },

  accessibility: {
    openSettings: "Fungua mipangilio ya ufikivu",
    closeSettings: "Funga mipangilio ya ufikivu",
    panelTitle: "Ufikivu",
    textSize: "Ukubwa wa maandishi",
    highContrast: "Mkabala wa juu",
    reduceMotion: "Punguza mwendo",
    alwaysShowFocus: "Onyesha pete ya lengo kila wakati",
    sectionReadability: "Usomaji rahisi",
    sectionAssistiveTools: "Zana za usaidizi",
    sectionDisplay: "Onyesho",
    readableSpacing: "Nafasi rahisi kusoma",
    highlightLinks: "Angazia viungo",
    bigCursor: "Kionyeshi kikubwa",
    readingMask: "Mwongozo wa kusoma",
    readPage: "Soma ukurasa kwa sauti",
    stopReading: "Simamisha usomaji",
    invertColors: "Geuza rangi",
    grayscale: "Rangi ya kijivu",
    skipToContent: "Ruka hadi maudhui makuu",
    resetDefaults: "Rejesha chaguo-msingi",
  },
};

export default sw;
