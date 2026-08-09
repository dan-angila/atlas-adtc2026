import type { Translations } from "../types";

const yo: Translations = {
  common: {
    notMeasured: "A kò díwọ̀n",
    loading: "Ń gbé wọlé…",
    untitledSource: "Orísun tí kò ní àkọlé",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ìmọ̀ Ìtọ́jú Ìlera",
    offlineOnDevice: "Láìsí Íńtánẹ́ẹ̀tì / Lórí Ẹ̀rọ",
    blurb:
      "Atlas ń dáhùn nípa lílo ẹ̀rí tí a gbé sórí ẹ̀rọ yìí. Ó ń tọ́ka sí ohun tí ó lò, ó sì ń kọ̀ láti dáhùn nígbà tí kò bá lè fi ẹ̀rí tó tó hàn.",
    disclaimer:
      "Èyí kì í ṣe irinṣẹ́ àyẹ̀wò àìsàn tàbí ìkọ̀wé oògùn. Atlas ń fi ìmọ̀ ìtọ́jú ìlera tí ó gbé ka àwọn ìwé tí a gbé wọlé hàn nìkan.",
    runtimeLabel: "Ẹ̀rọ Ìṣiṣẹ́",
  },

  nav: {
    workspace: "Ibi Iṣẹ́",
    ask: "Béèrè lọ́wọ́ Atlas",
    knowledge: "Ìmọ̀ Ìṣègùn",
    drugs: "Ìtọ́kasí Oògùn",
    languages: "Àwọn Èdè",
    runtime: "Ẹ̀rọ àti Àyẹ̀wò Iṣẹ́",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Àwọn ìwé ${documents} tí ó wà nínú ẹ̀rọ · Èdè ${languages} tí a forúkọ sílẹ̀`,
    loading: "Ń múra àwọn àwòṣe àdúgbò àti ibi ìpamọ́ ìmọ̀ sílẹ̀",
    unavailable: "A nílò ẹ̀rọ tábìlì fún iṣẹ́ Atlas gan-an",
  },

  screenTitles: {
    ask: {
      title: "Béèrè lọ́wọ́ Atlas",
      subtitle: "Béèrè, wá, tọ́ka, kí o sì kọ̀ pẹ̀lú ìṣọ́ra nígbà tí ẹ̀rí àdúgbò kò bá tó.",
    },
    knowledge: {
      title: "Ìmọ̀ Ìṣègùn",
      subtitle: "Wo àwọn ìwé ìlera gidi tí Atlas lè wá tí ó sì lè tọ́ka sí.",
    },
    drugs: {
      title: "Ìtọ́kasí Oògùn",
      subtitle:
        "Yẹ ẹ̀rí nípa oògùn wò láti inú àkójọpọ̀ tí a gbé wọlé láìsí sísọ Atlas di ètò ìṣàkóso ilé ìtajà oògùn.",
    },
    languages: {
      title: "Àwọn Èdè",
      subtitle: "Wo àtòjọ àwọn èdè tí a forúkọ sílẹ̀ àti àbájáde ìmúdájú gidi tí a díwọ̀n.",
    },
    runtime: {
      title: "Ẹ̀rọ àti Àyẹ̀wò Iṣẹ́",
      subtitle:
        "Fi ìdánimọ̀ gidi ẹ̀rọ àdúgbò, ìmúrasílẹ̀ rẹ̀, àti dátà àyẹ̀wò hàn láìsí kíkọ ohunkóhun.",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas ń ṣe gbogbo ìṣirò rẹ̀ lórí ẹ̀rọ yìí — kò sí ìpè íńtánẹ́ẹ̀tì kankan tí a ń ṣe.",
    checking: "Ń yẹ ẹ̀rọ ìṣiṣẹ́ wò…",
    modelReady: "Àwòṣe ti ṣetán",
    loadingModel: "Ń gbé àwòṣe wọlé…",
    unavailable: "Ẹ̀rọ ìṣiṣẹ́ kò sí",
  },

  uiLanguage: {
    label: "Èdè Ìbánisọ̀rọ̀",
    unverifiedNote: "Ọ̀rọ̀ ìbánisọ̀rọ̀ tí a túmọ̀ pẹ̀lú ẹ̀rọ, tí a kò tíì fi àyẹ̀wò olùsọ̀rọ̀ ìbílẹ̀ ṣe.",
  },

  askAtlas: {
    heroTitle: "Ìmọ̀ Ìtọ́jú Ìlera Láìsí Íńtánẹ́ẹ̀tì",
    heroSubtitle:
      "Atlas ń ṣiṣẹ́ lórí ẹ̀rọ, ó ń wá láti inú àkójọpọ̀ ìlera àdúgbò, ó ń díwọ̀n ìdánilójú kí ó tó dáhùn, ó sì ń tọ́ka sí ẹ̀rí tí ó lò.",
    badgeOffline: "Láìsí Íńtánẹ́ẹ̀tì / Lórí Ẹ̀rọ",
    badgeRuntimeConnected: "Ẹ̀rọ ti so pọ̀",
    badgeRuntimeLoading: "Ẹ̀rọ ń gbéwọlé",
    badgeRuntimeUnavailable: "Ẹ̀rọ kò sí",
    badgeLanguage: (name) => `Èdè: ${name}`,
    metricDocuments: "Àwọn Ìwé",
    metricLanguages: "Àwọn Èdè",
    metricExecution: "Ìṣiṣẹ́",
    executionLocalOnly: "Àdúgbò nìkan",
    flowLabel: "Bí Atlas ṣe ń dáhùn",
    flowSteps: ["Ìbéèrè", "Wíwá àdúgbò", "Ẹ̀rí", "Ìdánilójú", "Ìṣẹ̀dá àdúgbò", "Ìdáhùn tí a tọ́ka sí"],
    suggestedQuestions: [
      "Kí ni àwọn àmì àìní omi nínú ara?",
      "Kí ni àwọn àmì ibà?",
      "Kí ló dé tí ìtọ́jú tẹ́lẹ̀-kí-a-tó-bí fi ṣe pàtàkì nígbà oyún?",
      "Kí ni omi ìmúpadàbọ̀sípò (ORS) fi ń ṣe?",
    ],
    interactionLanguageLabel: "Èdè Ìbánisọ̀rọ̀",
    emptyStateTitle: "Béèrè lọ́wọ́ Atlas",
    emptyStateBody:
      "Bẹ̀rẹ̀ pẹ̀lú ìbéèrè ìlera tí àkójọpọ̀ tí a gbé wọlé ń ṣètìlẹ́yìn fún. Atlas yóò fi ẹ̀rí, ìpele ìdánilójú, àti ìdáhùn tí a tọ́ka sí kẹ́yìn hàn ní ibì kan ṣoṣo.",
    modelLoadingBanner:
      "Àwòṣe ṣì ń gbéwọlé — gbígbéwọlé gidi ti gba ìwọ̀n ìṣẹ́jú àáyá 50 lórí ohun èlò ìdàgbàsókè iṣẹ́ yìí; a kò tíì díwọ̀n àkókò rẹ̀ lórí ohun èlò ìdíje náà.",
    runtimeUnavailableBanner: (reason) => `Ẹ̀rọ Atlas kò sí: ${reason}`,
    inputPlaceholderReady: "Béèrè lọ́wọ́ Atlas ìbéèrè ìlera tí ó gbé ka àkójọpọ̀ àdúgbò...",
    inputPlaceholderWaiting: "Ń dúró de Ẹ̀rọ Ìṣiṣẹ́...",
    sendLabel: "Fi ránṣẹ́",
    disclaimer:
      "Atlas jẹ́ olùrànlọ́wọ́ ìmọ̀ ìlera. Kò ṣe àyẹ̀wò àìsàn, kò kọ oògùn, kò sì rọ́pò akọ́ṣẹ́mọṣẹ́ ìlera tí ó pé.",
    questionLabel: "Ìbéèrè",
    pendingStatus: "Ń ṣe wíwá àdúgbò, ń díwọ̀n ìpele ìdánilójú, ó sì ń ṣẹ̀dá ìdáhùn tí ó gbé ka ẹ̀rí…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ẹ̀rí tí ó lágbára",
    confidenceWeak: "Ẹ̀rí tí ó rẹlẹ̀",
    tokenStats: (tokens, tokensPerSecond) =>
      `Àmì ${tokens} · Àmì/ìṣẹ́jú àáyá ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Àkọsílẹ̀ ẹ̀rí ${count} tí a tọ́ka sí`,
    answerDisclaimer:
      "A ṣẹ̀dá àwọn ìdáhùn láti inú àkójọpọ̀ tí a gbé wọlé, ó sì yẹ kí a lóye wọn gẹ́gẹ́ bí ìrànlọ́wọ́ tí ó gbé ka ẹ̀rí, kì í ṣe àyẹ̀wò àìsàn tàbí ìmọ̀ràn oògùn.",
    evidenceUsedTitle: "Ẹ̀rí tí a lò",
    retrievedChunks: (count) => `Ẹ̀yà ${count} tí a rí`,
    licenseVerified: "A ti fi ìwé àṣẹ hàn",
    localCorpus: "Àkójọpọ̀ Àdúgbò",
    sourcesTitle: "Àwọn Orísun",
    retrievedOn: (date) => `a rí ní ${date}`,
    refusalNoEvidenceTitle: "A kò rí ẹ̀rí tí ó ṣètìlẹ́yìn nínú àkójọpọ̀ àdúgbò",
    refusalInsufficientTitle: "Ẹ̀rí kò tó láti fi ìdí rẹ̀ múlẹ̀ nínú àkójọpọ̀ àdúgbò",
    refusalNoEvidenceBody:
      "N kò rí ẹ̀rí tí ó bá ìbéèrè yìí mu nínú ibi ìpamọ́ ìmọ̀ tí a gbé wọlé. Atlas kò gbéra dájú nígbà tí kò sí orísun tí ó ṣètìlẹ́yìn.",
    refusalInsufficientBody:
      "Mo rí ẹ̀rí tí ó rẹlẹ̀ nìkan nípa ìbéèrè yìí. Atlas kò ṣẹ̀dá ìdáhùn ìṣègùn nígbà tí ìtìlẹ́yìn wíwá kò lágbára tó.",
    refusalNoEvidenceNote:
      "Ẹ̀rí tí ó wà: kò sí ọ̀kan tí ó tó láti ṣètìlẹ́yìn fún ìdáhùn tí ó gbé ka ẹ̀rí.",
    refusalInsufficientNote:
      "Ẹ̀rí tí ó wà: ó ní àjọṣe tí ó rẹlẹ̀, kò lè gbáralé láti dáhùn ní ọ̀nà tí ó ní ààbò.",
    generationFailed: (message) => `Ìṣẹ̀dá kùnà: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Ń Dúró de Ẹ̀rọ Ìṣiṣẹ́",
    waitingLoadingBody: "Ibi ìpamọ́ ìmọ̀ ń gbéwọlé pẹ̀lú àwòṣe náà.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Ẹ̀rọ Atlas kò so pọ̀.",
    heroTitle: "Wo àwọn ìwé tí Atlas lè tọ́ka sí gan-an",
    heroSubtitle:
      "Ìpilẹ̀ṣẹ̀ jẹ́ apá kan ọjà náà. Gbogbo àkọlé, àjọ, agbègbè òfin, àti ìwé àṣẹ tí a fihàn níbí wá láti inú dátà àkójọpọ̀ tí a gbé wọlé.",
    metricLoaded: "Àwọn ìwé tí a gbé wọlé",
    metricLicenseVerified: "A ti fi ìwé àṣẹ hàn",
    metricJurisdictions: "Àgbègbè Òfin",
    searchPlaceholder: "Ṣe àyẹ̀wò nípa àkọlé, orísun, tàbí agbègbè òfin...",
    documentsLoadedBadge: (count) => `Ìwé ${count} tí a gbé wọlé`,
    provenanceNotice:
      "Atlas ń tọ́ka láti inú àkójọpọ̀ yìí. A fi mọ̀ọ́mọ̀ fi dátà tí kò sí sílẹ̀ ní òfo; ẹ̀rọ náà kò fi dátà àròsọ kún ààyè náà.",
    noMatchTitle: (query) => `Kò sí ìwé tí ó bá "${query}" mu`,
    noMatchBody:
      "Gbìyànjú àkọlé mìíràn, tàbí béèrè lọ́wọ́ Atlas tààrà — wíwá ń ṣe àyẹ̀wò gbogbo ọ̀rọ̀ inú ìwé náà.",
    sourcePathLabel: "Ọ̀nà Orísun",
    sourceUrlLabel: "Àdírẹ́sì Orísun",
    licenseLabel: "Ìwé Àṣẹ",
    retrievedOn: (date) => `A rí ní ${date}`,
  },

  drugReference: {
    heroTitle: "Wíwá oògùn tí ó gbé ka ẹ̀rí",
    heroSubtitle:
      "Ojú-ìwé yìí ń wá tààrà nínú àkójọpọ̀ ìlera àdúgbò. Kò ṣẹ̀dá òtítọ́ oògùn, kò pín oògùn, kò sì ṣiṣẹ́ bí ètò ilé ìtajà oògùn.",
    exampleQueries: ["omi ìmúpadàbọ̀sípò", "oògùn ìtọ́jú ibà", "oògùn ẹ̀jẹ̀ ríru"],
    searchPlaceholder: "Wá oògùn, ìtọ́jú, tàbí ọ̀rọ̀ ìṣègùn nínú àkójọpọ̀ àdúgbò...",
    searchButton: "Wá ẹ̀rí àdúgbò",
    waitingTitle: "Ń Dúró de Ẹ̀rọ Atlas",
    waitingLoadingBody:
      "Wíwá ẹ̀rí oògùn yóò wà tán nígbà tí àwọn àwòṣe àdúgbò àti àkójọpọ̀ bá parí gbígbéwọlé.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Ẹ̀rọ Atlas kò so pọ̀.",
    noSearchTitle: "Kò tíì sí wíwá kankan",
    noSearchBody:
      "Tẹ ọ̀rọ̀ kan sí i láti yẹ ẹ̀rí tí ó bá oògùn mu tí Atlas lè rí nínú àkójọpọ̀ tí a gbé wọlé wò gan-an.",
    confidenceStrong: "Ẹ̀rí wíwá tí ó lágbára",
    confidenceWeak: "Ẹ̀rí wíwá tí ó rẹlẹ̀",
    confidenceNoEvidence: "A kò rí ẹ̀rí kankan",
    matchingRecords: (count) => `Àkọsílẹ̀ ẹ̀rí ${count} tí ó bá a mu`,
    noEvidenceTitle: "Ìròyìn kò sí nínú àkójọpọ̀ lọ́wọ́lọ́wọ́",
    noEvidenceBody:
      "Atlas kò rí ẹ̀rí àdúgbò tí a fi ìdí rẹ̀ múlẹ̀ fún ìbéèrè yìí. Ọjà náà kò ní fi ìmọ̀ràn oògùn tí a kò fi ìdí rẹ̀ múlẹ̀ kún àlàfo yẹn.",
    licenseVerified: "A ti fi ìwé àṣẹ hàn",
    localCorpus: "Àkójọpọ̀ Àdúgbò",
    lexicalBadge: "Ọ̀rọ̀-ọ̀rọ̀",
    semanticBadge: "Ìtumọ̀",
    retrievedOn: (date) => `A rí ní ${date}`,
    scoreLabel: (score) => `Àmì ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Ń Dúró de Ẹ̀rọ Ìṣiṣẹ́",
    waitingDisconnected: "Ẹ̀rọ Atlas kò so pọ̀.",
    heroTitle: "Fífi orúkọ sílẹ̀ kò túmọ̀ sí ìmúdájú pátápátá",
    heroSubtitle:
      "Àtòjọ yìí jẹ́ dátà ọjà gidi. Ipò tí a fihàn fún èdè kọ̀ọ̀kan fi àyẹ̀wò tí a díwọ̀n hàn, kì í ṣe ẹ̀tọ́ òwò tí ó gbé ka fífi orúkọ sílẹ̀ nìkan.",
    metricRegistered: "Tí a Forúkọ Sílẹ̀",
    metricValidated: "Wíwá / Ìṣẹ̀dá tí a Fi Ìdí Múlẹ̀",
    metricPlausible: "Ìṣàn Ọ̀rọ̀ Tí Ó Ṣeéṣe",
    metricPartialOrInconclusive: "Apá kan tàbí Aláìdánilójú",
    banner: (validated, total) =>
      `Fífi orúkọ sílẹ̀ nínú àtòjọ yìí jẹ́ dátà àlàyé nìkan, kì í ṣe ẹ̀tọ́ agbára. Àdánwò ìṣẹ̀dá gidi lórí Qwen3-4B ní ọjọ́ 2026-08-08 rí i pé èdè ${validated} nínú ${total} nìkan ni ó ń mú àbájáde tí ó tọ́ jáde ní ọ̀nà tí a lè gbẹ́kẹ̀lé — wo ọ̀wọ́n ipò nísàlẹ̀ fún àbájáde gidi, tí a díwọ̀n, ti èdè kọ̀ọ̀kan.`,
    statusLabels: {
      validated: "A Ti Fi Ìdí Múlẹ̀",
      "plausible-fluent": "Ìṣàn Ọ̀rọ̀ Tí Ó Ṣeéṣe",
      partial: "Apá Kan",
      inconclusive: "Aláìdánilójú",
      garbled: "Tí Ó Bàjẹ́",
      failed: "Kùnà",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Ń Dúró de Ẹ̀rọ Ìṣiṣẹ́",
    waitingDisconnected: "Ẹ̀rọ Atlas kò so pọ̀.",
    heroTitle: "Ìdánimọ̀ gidi ẹ̀rọ àdúgbò",
    heroSubtitle:
      "Ìwòye yìí ń fi ohun tí Atlas gbé wọlé tí ó sì díwọ̀n gan-an nínú ohun èlò tábìlì hàn. A fi àwọn iye tí kò sí hàn gẹ́gẹ́ bí a kò díwọ̀n dípò kí a fi dátà àròsọ kún wọn.",
    sectionRuntimeStatus: "Ipò Ẹ̀rọ",
    sectionBenchmark: "Àyẹ̀wò Iṣẹ́",
    sectionHardware: "Ohun Èlò (gidi, tí a rí nígbà iṣẹ́ṣiṣẹ́)",
    sectionGenerationThroughput: "Iyára Ìṣẹ̀dá",
    labelDocumentsLoaded: "Àwọn Ìwé Tí A Gbé Wọlé",
    labelLanguagesRegistered: "Àwọn Èdè Tí A Forúkọ Sílẹ̀",
    labelGenerationModel: "Àwòṣe Ìṣẹ̀dá",
    labelEmbeddingModel: "Àwòṣe Aṣojú",
    labelKnowledgeBase: "Ibi Ìpamọ́ Ìmọ̀",
    labelWorkerState: "Ipò Ẹ̀rọ Ìṣirò",
    labelThreadCount: "Iye Òwú",
    labelWorkerUptime: "Àkókò Iṣẹ́ṣiṣẹ́",
    labelRetrievalLatency: "Ìdádúró Wíwá",
    labelProcessMemory: "Lílo Ìrántí Iṣẹ́",
    workerStateLoaded: "Ìṣẹ̀dá àti Aṣojú ti gbéwọlé",
    workerStatePartial: "Apá kan ni a gbé wọlé",
    workerUptimeSeconds: (seconds) => `ìṣẹ́jú àáyá ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Ó ń ṣe ìbéèrè ìṣẹ̀dá gidi lórí àwòṣe tí a gbé wọlé, ó sì ń fi iyára gidi, tí a díwọ̀n hàn — kì í ṣe nọ́ńbà àròsọ rárá. Wo ${docPath} fún ọ̀nà ìṣiṣẹ́ pípé, tí ó ní ọjọ́, tí a tún lò níbí.`,
    runBenchmarkButton: "Bẹ̀rẹ̀ àyẹ̀wò náà nísinsin yìí",
    runningBenchmarkButton: "Ń ṣe àyẹ̀wò gidi…",
    labelCpu: "Ẹ̀rọ Ìṣirò (CPU)",
    labelCores: "Àwọn Ohun Kóró CPU",
    labelTotalRam: "Àpapọ̀ RAM",
    labelAvailableRam: "RAM Tí Ó Wà",
    labelRamTier: "Ipele RAM Tí A Yàn",
    physicalLogicalCores: (physical, logical) => `${physical} gidi / ${logical} onípìlẹ̀`,
    labelTokensPerSecond: "Àmì / Ìṣẹ́jú Àáyá",
    labelGeneratedTokens: "Àwọn Àmì Tí A Ṣẹ̀dá",
    labelTotalDuration: "Àpapọ̀ Àkókò",
    noGenerationModel: "Kò sí àwòṣe ìṣẹ̀dá tí a gbé wọlé fún àyẹ̀wò yìí.",
    devHardwareNotice:
      "A ṣe èyí lórí ohun èlò ìdàgbàsókè, kì í ṣe ìpele ìtọ́kasí 8GB ti ìdíje náà — wo apá “Ìṣiṣẹ́ Dáradára” ti àkójọ àyẹ̀wò ADTC kí o tó tọ́ka sí àwọn nọ́ńbà wọ̀nyí nínú àwọn ìwé ìfisílẹ̀.",
  },

  accessibility: {
    openSettings: "Ṣí àwọn ètò ìwọlé rírọrùn",
    closeSettings: "Ti àwọn ètò ìwọlé rírọrùn",
    panelTitle: "Ìwọlé Rírọrùn",
    textSize: "Ìwọ̀n Ọ̀rọ̀",
    highContrast: "Ìyàtọ̀ Gíga",
    reduceMotion: "Dín Ìṣíra Kù",
    alwaysShowFocus: "Máa Fi Òrùka Ìdojúkọ Hàn Nígbà Gbogbo",
    resetDefaults: "Padà Sí Ìpéwọ̀n",
  },
};

export default yo;
