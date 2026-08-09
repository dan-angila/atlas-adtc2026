import type { Translations } from "../types";

const luo: Translations = {
  common: {
    notMeasured: "Ok osepim",
    loading: "Chiegni kaw…",
    untitledSource: "Sokorone maonge wi",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Rieko mar Ngima",
    offlineOnDevice: "Maonge intanet / E gir tich",
    blurb:
      "Atlas dwoko wach kotiyo gi ranyisi mosekaw e gir tichni. Owacho gima ne otiyogo kendo otamore dwoko ka ok onyal siro ranyisi moromo.",
    disclaimer:
      "Ma ok en gir tich mar nono tuo kata ndiko yath. Atlas nyiso mana rieko mar ngima moyudo mana kuom gaset mosekaw.",
    runtimeLabel: "Injin mar Tich",
  },

  nav: {
    workspace: "Kar Tich",
    ask: "Penj Atlas",
    knowledge: "Ngeyo mar Yath",
    drugs: "Weche Yath",
    languages: "Dhok",
    runtime: "Injin gi Nonro",
  },

  runtimeSummary: {
    ready: (documents, languages) => `Gaset ${documents} manie gir tich · Dhok ${languages} mondik`,
    loading: "Chiegni oiko kido mag gir tich gi kar keno mar rieko",
    unavailable: "Injin mar desktop dwarore mondo Atlas oti adier",
  },

  screenTitles: {
    ask: {
      title: "Penj Atlas",
      subtitle:
        "Penj, many, wach sokorone, kendo tam dwoko gi rito ka ranyisi mar gir tich ok oromo.",
    },
    knowledge: {
      title: "Ngeyo mar Yath",
      subtitle: "Ne gaset mag ngima madier ma Atlas nyalo manyo kendo wachone sokorone.",
    },
    drugs: {
      title: "Weche Yath",
      subtitle:
        "Non ranyisi mowinjore gi yath moa e kaka mosekaw ka ok imi Atlas obed system mar rito duka yath.",
    },
    languages: {
      title: "Dhok",
      subtitle: "Ne kitabu mar dhok mondik kod olemo madier mar sirore mosepim.",
    },
    runtime: {
      title: "Injin gi Nonro",
      subtitle:
        "Nyis nying madier mar injin mar gir tich, oikoruok mare, kod fweny mar nonro maonge gichuoyo gimoro.",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas timo kwan duto e gir tichni — onge luongo mar intanet mitimo.",
    checking: "Chiegni nono injin mar tich…",
    modelReady: "Kido oikore",
    loadingModel: "Chiegni kaw kido…",
    unavailable: "Injin mar tich onge",
  },

  uiLanguage: {
    label: "Dhok mar Wuoyruok",
    unverifiedNote:
      "Ndiko mag wuoyruok molok gi injin, mapok non gi ngʼat mawuoyo gi dhogino kaka dhog dalane.",
  },

  askAtlas: {
    heroTitle: "Rieko mar Ngima Maonge Intanet",
    heroSubtitle:
      "Atlas tiyo e gir tich, manyo e kaka mag ngima mag gir tich, pimo diriba kapok odwoko, kendo wacho sokorone mar ranyisi mane otiyogo.",
    badgeOffline: "Maonge intanet / E gir tich",
    badgeRuntimeConnected: "Injin oriere",
    badgeRuntimeLoading: "Injin chiegni kaw",
    badgeRuntimeUnavailable: "Injin onge",
    badgeLanguage: (name) => `Dhok: ${name}`,
    metricDocuments: "Gaset",
    metricLanguages: "Dhok",
    metricExecution: "Tim",
    executionLocalOnly: "Mag gir tich kende",
    flowLabel: "Kaka Atlas dwoko wach",
    flowSteps: [
      "Penjo",
      "Manyo mar gir tich",
      "Ranyisi",
      "Diriba",
      "Chuoyo mar gir tich",
      "Dwoko molembgi sokorone",
    ],
    suggestedQuestions: [
      "Ranyisi mage nyiso ni pi orumo e del?",
      "Ranyisi mage nyiso midhusi?",
      "Angʼo momiyo rito madhako kapok onywol duong' e kinde ich?",
      "Pi mar duogo del e yo mowinjore (ORS) itiyo godo nangʼo?",
    ],
    interactionLanguageLabel: "Dhok mar Wuoyruok",
    emptyStateTitle: "Penj Atlas",
    emptyStateBody:
      "Chak gi penjo mar ngima ma gaset mosekaw okonyo. Atlas nonyis ranyisi, diriba, kod dwoko mogik molembgi sokorone kar achiel.",
    modelLoadingBanner:
      "Kido pod chiegni kaw — kaw madier ne opim ni kawo kar sekonde 50 e kido mag dongruok mar gwelni; sa e kido mar akwaya pok opim.",
    runtimeUnavailableBanner: (reason) => `Injin mar Atlas onge: ${reason}`,
    inputPlaceholderReady: "Penj Atlas penjo mar ngima moyudo kuom gaset mag gir tich...",
    inputPlaceholderWaiting: "Rito Injin mar Tich...",
    sendLabel: "Or",
    disclaimer:
      "Atlas en jakony mar rieko mar ngima. Ok non tuo, ok ndik yath, kendo ok kaw kar jathieth mowinjore.",
    questionLabel: "Penjo",
    pendingStatus: "Timo manyo mar gir tich, pimo diriba, kendo chuoyo dwoko moyudo kuom ranyisi…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ranyisi motegno",
    confidenceWeak: "Ranyisi maonge teko",
    tokenStats: (tokens, tokensPerSecond) =>
      `Token ${tokens} · token/sekonde ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Gaset mag ranyisi ${count} mowach sokorone`,
    answerDisclaimer:
      "Dwoko ochwo koa e gaset mosekaw kendo onego ongʼe kaka kony moyudo kuom ranyisi, ok non tuo kata puonj yath.",
    evidenceUsedTitle: "Ranyisi Motiyoe",
    retrievedChunks: (count) => `Fetni ${count} moyudi`,
    licenseVerified: "Lisensi osir",
    localCorpus: "Gaset mag Gir Tich",
    sourcesTitle: "Sokorone",
    retrievedOn: (date) => `oyudi ${date}`,
    refusalNoEvidenceTitle: "Onge ranyisi makonyo moyudi e gaset mag gir tich",
    refusalInsufficientTitle: "Ranyisi ok oromo mondo osir e gaset mag gir tich",
    refusalNoEvidenceBody:
      "Ne ok anyal yudo ranyisi mowinjore gi penjoni e kar keno mar rieko mosekaw. Atlas ok par ka onge sokorone makonyo.",
    refusalInsufficientBody:
      "Ne ayudo mana ranyisi maonge teko kuom penjoni. Atlas ok chuo dwoko mar yath ka kony mar manyo onge teko moloyo.",
    refusalNoEvidenceNote: "Ranyisi manitie: onge moromo mondo okony dwoko moyudo kuom ranyisi.",
    refusalInsufficientNote:
      "Ranyisi manitie: winjore gi teko matin, ok nyal geno kuome mondo odwok gi ritruok.",
    generationFailed: (message) => `Chuoyo ok oloyo: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Rito Injin mar Tich",
    waitingLoadingBody: "Kar keno mar rieko kawo kaachiel gi kido.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin mar Atlas ok oriere.",
    heroTitle: "Ne gaset ma Atlas nyalo wacho sokorone adier",
    heroSubtitle:
      "Sokorone en achiel kuom gik moko. Wi ka wi duto, riwruok, gwengʼ mar chik, kod lisensi monyisi ka aa e weche mag gaset mosekaw.",
    metricLoaded: "Gaset mosekaw",
    metricLicenseVerified: "Lisensi osir",
    metricJurisdictions: "Gwengni mag Chik",
    searchPlaceholder: "Yier gi wi, sokorone, kata gwengʼ mar chik...",
    documentsLoadedBadge: (count) => `Gaset ${count} mosekaw`,
    provenanceNotice:
      "Atlas wacho sokorone koa e kitabuni. Weche maonge iweyo nono ka gionge gi paro; gir tich ok opong kanyo gi weche mochuoye.",
    noMatchTitle: (query) => `Onge gaset mowinjore gi "${query}"`,
    noMatchBody: "Tem wi machielo, kata ipenj Atlas tir — manyo nono ndiko duto mar gaset.",
    sourcePathLabel: "Yo mar Sokorone",
    sourceUrlLabel: "URL mar Sokorone",
    licenseLabel: "Lisensi",
    retrievedOn: (date) => `Oyudi ${date}`,
  },

  drugReference: {
    heroTitle: "Manyo yath moyudo kuom ranyisi",
    heroSubtitle:
      "Skrinni manyo tir e kaka mag ngima mag gir tich. Ok ochuo adiera mag yath, ok opog yath, kendo ok ti kaka duka yath.",
    exampleQueries: [
      "pi mar duogo del e yo mowinjore",
      "yath mar thiedho midhusi",
      "yath mar remo motegno",
    ],
    searchPlaceholder: "Many yath, thieth, kata wach mar thieth e kaka mag gir tich...",
    searchButton: "Many ranyisi mag gir tich",
    waitingTitle: "Rito Injin mar Atlas",
    waitingLoadingBody:
      "Manyo ranyisi mag yath biro yudore ka kido mag gir tich gi gaset osetieko kaw.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin mar Atlas ok oriere.",
    noSearchTitle: "Onge manyo pod otimre",
    noSearchBody:
      "Ket wach mondo inon tir ranyisi mowinjore gi yath ma Atlas nyalo yudo e gaset mosekaw.",
    confidenceStrong: "Ranyisi mar manyo motegno",
    confidenceWeak: "Ranyisi mar manyo maonge teko",
    confidenceNoEvidence: "Onge ranyisi moyudi",
    matchingRecords: (count) => `Gaset mag ranyisi ${count} mowinjore`,
    noEvidenceTitle: "Weche onge e gaset mar sani",
    noEvidenceBody:
      "Atlas ne ok oyudo ranyisi mar gir tich mosir kuom kwayoni. Gima ochuo ok opong kanyo gi puonj yath ma ok osir.",
    licenseVerified: "Lisensi osir",
    localCorpus: "Gaset mag Gir Tich",
    lexicalBadge: "Mag Wach",
    semanticBadge: "Mag Tiend Wach",
    retrievedOn: (date) => `Oyudi ${date}`,
    scoreLabel: (score) => `Kwan ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Rito Injin mar Tich",
    waitingDisconnected: "Injin mar Atlas ok oriere.",
    heroTitle: "Ndiko ok nyis ni osesir chuth",
    heroSubtitle:
      "Kitabuni en weche madier mag gir tich. Kaka dhoke moro amora nenore nyiso non mosepim, ok wach mar ohala moyudo mana kuom ndiko.",
    metricRegistered: "Mondik",
    metricValidated: "Manyo / Chuoyo Mosir",
    metricPlausible: "Wuoyo Manyalo Bet Madier",
    metricPartialOrInconclusive: "Bath kata Maonge Adiera",
    banner: (validated, total) =>
      `Ndiko e kitabuni en mana weche mar lero, ok wach mar teko. Tem mar chuoyo madier motim gi Qwen3-4B tarik 2026-08-08 nonwang'o ni dhok ${validated} kuom ${total} kende ema kelo olemo makare pile — ne kanyakla mar kido e piny mondo ine olemo madier, mosepim, mag dhok duto.`,
    statusLabels: {
      validated: "Osir",
      "plausible-fluent": "Wuoyo Manyalo Bet Madier",
      partial: "Bath",
      inconclusive: "Maonge Adiera",
      garbled: "Okethore",
      failed: "Ok oloyo",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Rito Injin mar Tich",
    waitingDisconnected: "Injin mar Atlas ok oriere.",
    heroTitle: "Nying madier mar injin mar gir tich",
    heroSubtitle:
      "Nenoni nyiso gima Atlas nosekawo kendo nopimo adier e app mar desktop. Kwan maonge inyiso kaka mapok opim kar pongʼo gi weche mochuoye.",
    sectionRuntimeStatus: "Chal mar Injin",
    sectionBenchmark: "Nonro",
    sectionHardware: "Gik mag tich (madier, moyudi e sa mar tich)",
    sectionGenerationThroughput: "Nyawo mar Chuoyo",
    labelDocumentsLoaded: "Gaset Mosekaw",
    labelLanguagesRegistered: "Dhok Mondik",
    labelGenerationModel: "Kido mar Chuoyo",
    labelEmbeddingModel: "Kido mar Ranyiso",
    labelKnowledgeBase: "Kar Keno mar Rieko",
    labelWorkerState: "Chal mar Jatich",
    labelThreadCount: "Kar Rangʼiny mar Tond",
    labelWorkerUptime: "Sa mar Tich",
    labelRetrievalLatency: "Deko mar Manyo",
    labelProcessMemory: "Tiyo gi Paro mar Tim",
    workerStateLoaded: "Chuoyo gi ranyiso osekaw",
    workerStatePartial: "Bath osekaw",
    workerUptimeSeconds: (seconds) => `sekonde ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Timo kwayo madier mar chuoyo kuom kido mosekaw kendo lando nyawo madier, mosepim — ok nambar mochuoye. Ne ${docPath} mondo ine yo motieki maber, man gi tarik, motigo kendo ka.`,
    runBenchmarkButton: "Chak nonro sani",
    runningBenchmarkButton: "Timo nonro madier…",
    labelCpu: "Jachal (CPU)",
    labelCores: "Cores mag CPU",
    labelTotalRam: "RAM Duto",
    labelAvailableRam: "RAM Manitie",
    labelRamTier: "Kar RAM Moyier",
    physicalLogicalCores: (physical, logical) => `${physical} mag del / ${logical} mag paro`,
    labelTokensPerSecond: "Token / Sekonde",
    labelGeneratedTokens: "Token Mochuoyi",
    labelTotalDuration: "Sa Duto",
    noGenerationModel: "Onge kido mar chuoyo mosekaw ne nonroni.",
    devHardwareNotice:
      "Ma notim e gik mag dongruok, ok e kar rapim mar 8GB mar akwaya — ne bath miluongo ni “Tiyo Maber” mar kitabu mar nonro mar ADTC kapok iwacho nambargi e gaset mar oro.",
  },

  accessibility: {
    openSettings: "Yaw chenro mag yudo",
    closeSettings: "Lor chenro mag yudo",
    panelTitle: "Yudo",
    textSize: "Duong' mar Ndiko",
    highContrast: "Pogruok Maduong'",
    reduceMotion: "Dwok Chal Wuok",
    alwaysShowFocus: "Nyis tond mar rango kinde duto",
    resetDefaults: "Dwok Chenro mokwongo",
  },
};

export default luo;
