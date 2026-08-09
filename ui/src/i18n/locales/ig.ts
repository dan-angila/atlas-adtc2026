import type { Translations } from "../types";

const ig: Translations = {
  common: {
    notMeasured: "Etụleghị",
    loading: "Na-ebu…",
    untitledSource: "Isi iyi na-enweghị aha",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ọgụgụ Isi Ahụike",
    offlineOnDevice: "Na-anọghị n'ịntanetị / Na ngwaọrụ",
    blurb:
      "Atlas na-aza ajụjụ site na iji ihe akaebe ndị e budatara na ngwaọrụ a. Ọ na-ezo aka n'ihe ọ ji mee ihe ma jụ ịza ajụjụ mgbe ọ na-apụghị ikwenye na e nwere ihe akaebe zuru oke.",
    disclaimer:
      "Nke a abụghị ngwá ọrụ nyocha ọrịa ma ọ bụ nke na-edepụta ọgwụ. Atlas na-egosi naanị ọgụgụ isi ahụike dabere n'akwụkwọ ndị e budatara.",
    runtimeLabel: "Injin Ọrụ",
  },

  nav: {
    workspace: "Ebe Ọrụ",
    ask: "Jụọ Atlas",
    knowledge: "Ọmụmụ Ahụike",
    drugs: "Ntụaka Ọgwụ",
    languages: "Asụsụ",
    runtime: "Injin na Nyocha Arụmọrụ",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Akwụkwọ ${documents} dị na mpaghara · Asụsụ ${languages} e debanyere aha`,
    loading: "Na-akwado ụdịdị mpaghara na ebe nchekwa ihe ọmụma",
    unavailable: "Achọrọ injin desktọọpụ maka ezigbo ọrụ Atlas",
  },

  screenTitles: {
    ask: {
      title: "Jụọ Atlas",
      subtitle:
        "Jụọ ajụjụ, chọta, kwuru aha ebe ọ si, ma jụ ịza ajụjụ mgbe ihe akaebe mpaghara adịghị ezuru oke.",
    },
    knowledge: {
      title: "Ọmụmụ Ahụike",
      subtitle: "Nyochaa akwụkwọ ahụike n'ezie nke Atlas nwere ike ịchọta ma kwuru aha ebe ọ si.",
    },
    drugs: {
      title: "Ntụaka Ọgwụ",
      subtitle:
        "Nyochaa ihe akaebe metụtara ọgwụ site na nchịkọta e budatara na-emeghị Atlas ka ọ bụrụ sistemu njikwa ụlọ ọgwụ.",
    },
    languages: {
      title: "Asụsụ",
      subtitle: "Lee ndepụta asụsụ e debanyere aha na nsonaazụ nkwenye n'ezie a tụlere.",
    },
    runtime: {
      title: "Injin na Nyocha Arụmọrụ",
      subtitle:
        "Gosipụta njirimara injin mpaghara n'ezie, njikere ya, na data nyocha na-enweghị ihe echepụtara.",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas na-eme mgbako ya niile na ngwaọrụ a — enweghị oku ịntanetị ọ bụla e mere.",
    checking: "Na-enyocha injin ọrụ…",
    modelReady: "Ihe nlereanya dị njikere",
    loadingModel: "Na-ebu ihe nlereanya…",
    unavailable: "Injin ọrụ adịghị",
  },

  uiLanguage: {
    label: "Asụsụ Interface",
    unverifiedNote:
      "Ederede interface a tụgharịrị na igwe, nke onye na-asụ ya site na amamihe na-akaghị leba anya n'ime ya.",
  },

  askAtlas: {
    heroTitle: "Ọgụgụ Isi Ahụike Na-anọghị n'ịntanetị",
    heroSubtitle:
      "Atlas na-arụ ọrụ na ngwaọrụ, na-achọ site na nchịkọta ahụike mpaghara, na-atụle ọkwa ntụkwasị obi tupu ọ zaa, ma na-ezo aka n'ihe akaebe ọ jiri mee ihe.",
    badgeOffline: "Na-anọghị n'ịntanetị / Na ngwaọrụ",
    badgeRuntimeConnected: "Injin ejikọtara",
    badgeRuntimeLoading: "Injin na-ebu",
    badgeRuntimeUnavailable: "Injin adịghị",
    badgeLanguage: (name) => `Asụsụ: ${name}`,
    metricDocuments: "Akwụkwọ",
    metricLanguages: "Asụsụ",
    metricExecution: "Mmezu",
    executionLocalOnly: "Mpaghara naanị",
    flowLabel: "Otu Atlas si aza",
    flowSteps: [
      "Ajụjụ",
      "Ịchọ mpaghara",
      "Ihe akaebe",
      "Ntụkwasị obi",
      "Imepụta mpaghara",
      "Azịza akwụkwọ",
    ],
    suggestedQuestions: [
      "Gịnị bụ ihe ngosi mbufụ mmiri n'ahụ?",
      "Gịnị bụ ihe mgosi ịba ọgbụgba?",
      "Gịnị mere nlekọta tupu ọmụmụ nwa ji dị mkpa n'oge ime?",
      "Gịnị ka a na-eji mmiri mgbaghara ọnụ (ORS) eme?",
    ],
    interactionLanguageLabel: "Asụsụ Mkparịta ụka",
    emptyStateTitle: "Jụọ Atlas",
    emptyStateBody:
      "Malite site n'ajụjụ ahụike nke nchịkọta e budatara na-akwado. Atlas ga-egosi ihe akaebe, ọkwa ntụkwasị obi, na azịza ikpeazụ akwụkwọ n'otu ebe.",
    modelLoadingBanner:
      "Ihe nlereanya ka na-ebu — mbupu n'ezie a tụlela na-ewe ihe dị ka sekọnd 50 na ngwaọrụ mmepe ọrụ a; a tụlebeghị oge ya na ngwaọrụ ntanetị asọmpi.",
    runtimeUnavailableBanner: (reason) => `Injin Atlas adịghị: ${reason}`,
    inputPlaceholderReady: "Jụọ Atlas ajụjụ ahụike dabere na nchịkọta mpaghara...",
    inputPlaceholderWaiting: "Na-eche Injin Ọrụ...",
    sendLabel: "Zipu",
    disclaimer:
      "Atlas bụ onye enyemaka ọgụgụ isi ahụike. Ọ dịghị enyocha ọrịa, ọ dịghị edepụta ọgwụ, ọ dịghịkwa anọchi anya dọkịta ahụike zuru oke.",
    questionLabel: "Ajụjụ",
    pendingStatus:
      "Na-eme nchọta mpaghara, na-atụle ọkwa ntụkwasị obi, ma na-emepụta azịza dabere n'ihe akaebe…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ihe akaebe siri ike",
    confidenceWeak: "Ihe akaebe na-esighị ike",
    tokenStats: (tokens, tokensPerSecond) =>
      `Token ${tokens} · Token/sekọnd ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Ndekọ ihe akaebe ${count} e kwutere aha`,
    answerDisclaimer:
      "A na-emepụta azịza site na nchịkọta e budatara, a ga-aghọtakwa ha dị ka enyemaka dabere n'ihe akaebe, ọ bụghị nyocha ọrịa ma ọ bụ ndụmọdụ ọgwụ.",
    evidenceUsedTitle: "Ihe Akaebe E Jiri Mee Ihe",
    retrievedChunks: (count) => `Iberibe ${count} achọtara`,
    licenseVerified: "Ikike e kwadoro",
    localCorpus: "Nchịkọta Mpaghara",
    sourcesTitle: "Isi Iyi",
    retrievedOn: (date) => `achọtara na ${date}`,
    refusalNoEvidenceTitle: "Enweghị ihe akaebe na-akwado achọtara na nchịkọta mpaghara",
    refusalInsufficientTitle: "Ihe akaebe ezughị oke iji kwado n'ime nchịkọta mpaghara",
    refusalNoEvidenceBody:
      "Achọtaghị m ihe akaebe metụtara ajụjụ a na ebe nchekwa ihe ọmụma e budatara. Atlas anaghị agọ egwu mgbe enweghị isi iyi na-akwado.",
    refusalInsufficientBody:
      "Achọtara m naanị ihe akaebe na-esighị ike gbasara ajụjụ a. Atlas anaghị emepụta azịza ahụike mgbe nkwado nchọta esighị ike nke ukwuu.",
    refusalNoEvidenceNote:
      "Ihe akaebe dị: ọ dịghị nke zuru oke iji kwado azịza dabere n'ihe akaebe.",
    refusalInsufficientNote:
      "Ihe akaebe dị: metụtara nke na-esighị ike, ọ bụghị nke a ga-adabere na ya iji zaa n'enweghị ihe ize ndụ.",
    generationFailed: (message) => `Imepụta dara: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Na-eche Injin Ọrụ",
    waitingLoadingBody: "Ebe nchekwa ihe ọmụma na-ebu ọnụ na ihe nlereanya.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin Atlas ejikọtaghị.",
    heroTitle: "Nyochaa akwụkwọ Atlas nwere ike ikwu aha ebe ọ si n'ezie",
    heroSubtitle:
      "Isi mmalite bụ akụkụ nke ngwaahịa a. Isiokwu ọ bụla, ụlọ ọrụ, mpaghara iwu, na ikike egosipụtara ebe a si na data nchịkọta e budatara.",
    metricLoaded: "Akwụkwọ e budatara",
    metricLicenseVerified: "Ikike e kwadoro",
    metricJurisdictions: "Mpaghara Iwu",
    searchPlaceholder: "Nyochaa site n'isiokwu, isi iyi, ma ọ bụ mpaghara iwu...",
    documentsLoadedBadge: (count) => `Akwụkwọ ${count} e budatara`,
    provenanceNotice:
      "Atlas na-ezo aka n'ime ndepụta a. E ji ezi obi hapụ data na-adịghị na-enweghị ihe; ngwaọrụ a anaghị eji data echepụtara mejupụta oghere ahụ.",
    noMatchTitle: (query) => `Enweghị akwụkwọ dabara na "${query}"`,
    noMatchBody:
      "Nwaa isiokwu ọzọ, ma ọ bụ jụọ Atlas kpọmkwem — nchọta na-enyocha ozuruoke ederede akwụkwọ.",
    sourcePathLabel: "Ụzọ Isi Iyi",
    sourceUrlLabel: "URL Isi Iyi",
    licenseLabel: "Ikike",
    retrievedOn: (date) => `Achọtara ${date}`,
  },

  drugReference: {
    heroTitle: "Nchọta ọgwụ dabere n'ihe akaebe",
    heroSubtitle:
      "Ihu ngosi a na-achọ ozugbo n'ime nchịkọta ahụike mpaghara. Ọ naghị eche eziokwu ọgwụ, ọ naghị ekesa ọgwụ, ọ bụghịkwa arụ ọrụ dị ka sistemu ụlọ ọgwụ.",
    exampleQueries: ["mmiri mgbaghara ọnụ", "ọgwụ ọgwụgwọ ịba ọgbụgba", "ọgwụ ọbara mgbali"],
    searchPlaceholder: "Chọọ ọgwụ, ọgwụgwọ, ma ọ bụ okwu ahụike n'ime nchịkọta mpaghara...",
    searchButton: "Chọọ ihe akaebe mpaghara",
    waitingTitle: "Na-eche Injin Atlas",
    waitingLoadingBody:
      "Nchọta ihe akaebe ọgwụ ga-adị mgbe ụdịdị mpaghara na nchịkọta gwụchara ibu.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin Atlas ejikọtaghị.",
    noSearchTitle: "Enwebeghị nchọta",
    noSearchBody:
      "Tinye okwu iji nyochaa kpọmkwem ihe akaebe metụtara ọgwụ nke Atlas nwere ike ịchọta n'ime nchịkọta e budatara.",
    confidenceStrong: "Ihe akaebe nchọta siri ike",
    confidenceWeak: "Ihe akaebe nchọta na-esighị ike",
    confidenceNoEvidence: "Enweghị ihe akaebe achọtara",
    matchingRecords: (count) => `Ndekọ ihe akaebe ${count} dabara`,
    noEvidenceTitle: "Ozi adịghị n'ime nchịkọta ugbu a",
    noEvidenceBody:
      "Atlas achọtaghị ihe akaebe mpaghara e kwadoro maka arịrịọ a. Ngwaahịa a agaghị eji ndụmọdụ ọgwụ na-akwadoghị mejupụta oghere ahụ.",
    licenseVerified: "Ikike e kwadoro",
    localCorpus: "Nchịkọta Mpaghara",
    lexicalBadge: "Okwu",
    semanticBadge: "Nghọta",
    retrievedOn: (date) => `Achọtara ${date}`,
    scoreLabel: (score) => `Akara ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Na-eche Injin Ọrụ",
    waitingDisconnected: "Injin Atlas ejikọtaghị.",
    heroTitle: "Idebanye aha apụtaghị na e nyochasịrị kpamkpam",
    heroSubtitle:
      "Ndepụta a bụ data ngwaahịa n'ezie. Ọkwa egosipụtara maka asụsụ ọ bụla na-egosi nyocha e tụlere, ọ bụghị nkwupụta azụmahịa dabere naanị na ndebanye aha.",
    metricRegistered: "E Debanyere Aha",
    metricValidated: "Nchọta / Imepụta E Kwadoro",
    metricPlausible: "Ike ikwu okwu nwere ike ime",
    metricPartialOrInconclusive: "Akụkụ ma ọ bụ Na-edoghị anya",
    banner: (validated, total) =>
      `Idebanye aha na ndepụta a bụ naanị data nkọwa, ọ bụghị nkwupụta ikike. Nnwale imepụta n'ezie megide Qwen3-4B na 2026-08-08 chọpụtara na naanị asụsụ ${validated} n'ime ${total} na-enye nsonaazụ ziri ezi kwa oge — lee kọlụm ọkwa n'okpuru maka nsonaazụ n'ezie, e tụlere, nke asụsụ ọ bụla.`,
    statusLabels: {
      validated: "E Kwadoro",
      "plausible-fluent": "Ike ikwu okwu nwere ike ime",
      partial: "Akụkụ",
      inconclusive: "Na-edoghị anya",
      garbled: "Emebiri",
      failed: "Dara",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Na-eche Injin Ọrụ",
    waitingDisconnected: "Injin Atlas ejikọtaghị.",
    heroTitle: "Njirimara injin mpaghara n'ezie",
    heroSubtitle:
      "Ngosi a na-egosi ihe Atlas budatara ma tụlee n'ezie n'ime ngwa desktọọpụ. A na-egosi ụkpụrụ na-adịghị dị ka a tụleghị karịa ijupụta ha na data echepụtara.",
    sectionRuntimeStatus: "Ọnọdụ Injin",
    sectionBenchmark: "Nyocha Arụmọrụ",
    sectionHardware: "Ngwaike (n'ezie, achọtara n'oge arụmọrụ)",
    sectionGenerationThroughput: "Ọsọ Imepụta",
    labelDocumentsLoaded: "Akwụkwọ E Budatara",
    labelLanguagesRegistered: "Asụsụ E Debanyere Aha",
    labelGenerationModel: "Ihe Nlereanya Imepụta",
    labelEmbeddingModel: "Ihe Nlereanya Nnọchianya",
    labelKnowledgeBase: "Ebe Nchekwa Ihe Ọmụma",
    labelWorkerState: "Ọnọdụ Igwe Ọrụ",
    labelThreadCount: "Ọnụ Ọgụgụ Eri",
    labelWorkerUptime: "Oge Arụmọrụ",
    labelRetrievalLatency: "Oge Igbu Oge Nchọta",
    labelProcessMemory: "Ojiji Ebe Nchekwa Usoro",
    workerStateLoaded: "Imepụta na nnọchianya ebuwo",
    workerStatePartial: "E buwo akụkụ",
    workerUptimeSeconds: (seconds) => `sekọnd ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Ọ na-eme arịrịọ imepụta n'ezie megide ihe nlereanya e budatara ma kọọ ọsọ n'ezie, nke a tụlere — ọ bụghị ọnụọgụ echepụtara ọ bụla. Lee ${docPath} maka usoro zuru oke, nwere ụbọchị, e ji mee ihe ọzọ ebe a.`,
    runBenchmarkButton: "Malite nyocha ugbu a",
    runningBenchmarkButton: "Na-eme nyocha n'ezie…",
    labelCpu: "Ihe Nrụzi (CPU)",
    labelCores: "Isi CPU",
    labelTotalRam: "Mkpokọta RAM",
    labelAvailableRam: "RAM Dị",
    labelRamTier: "Ọkwa RAM Ahọpụtara",
    physicalLogicalCores: (physical, logical) => `${physical} anụ ahụ / ${logical} mgbagha`,
    labelTokensPerSecond: "Token / Sekọnd",
    labelGeneratedTokens: "Token Emepụtara",
    labelTotalDuration: "Mkpokọta Oge",
    noGenerationModel: "Enweghị ihe nlereanya imepụta e budatara maka nyocha a.",
    devHardwareNotice:
      "E mere nke a na ngwaike mmepe, ọ bụghị ọkwa ntụaka 8GB nke asọmpi ahụ — lee akụkụ “Arụmọrụ Dị Mma” nke nchịkọta nyocha ADTC tupu ịkwụ aka na ọnụọgụ ndị a n'akwụkwọ nnyefe.",
  },

  accessibility: {
    openSettings: "Meghee ntọala nnweta",
    closeSettings: "Mechie ntọala nnweta",
    panelTitle: "Nnweta",
    textSize: "Ogo Ederede",
    highContrast: "Ọdịiche Dị Elu",
    reduceMotion: "Belata Mmegharị",
    alwaysShowFocus: "Na-egosi mgbanaka nlebara anya mgbe niile",
    resetDefaults: "Weghachi Ntọala Mbụ",
  },
};

export default ig;
