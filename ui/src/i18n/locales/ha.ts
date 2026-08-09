import type { Translations } from "../types";

const ha: Translations = {
  common: {
    notMeasured: "Ba a auna ba",
    loading: "Ana lodi…",
    untitledSource: "Tushen da babu take",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ilimin Kiwon Lafiya",
    offlineOnDevice: "Ba yanar gizo / a na'ura",
    blurb:
      "Atlas yana amsawa ta amfani da hujjojin da aka loda a wannan na'urar. Yana ambaton abin da ya yi amfani da shi kuma yana ƙin amsawa idan bai iya tabbatar da isasshen hujja ba.",
    disclaimer:
      "Wannan ba kayan aikin gano cuta ba ne kuma ba ya rubuta magani. Atlas yana gabatar da ilimin kiwon lafiya wanda ya dogara kawai a kan takardun da aka loda.",
    runtimeLabel: "Injin gudanarwa",
  },

  nav: {
    workspace: "Wurin aiki",
    ask: "Tambayi Atlas",
    knowledge: "Ilimin Kiwon Lafiya",
    drugs: "Bayanin Magunguna",
    languages: "Harsuna",
    runtime: "Injin Gudanarwa da Awo",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Takardu ${documents} na cikin gida · Harsuna ${languages} da aka yi rijista`,
    loading: "Ana shirya samfuran gida da ma'ajin ilimi",
    unavailable: "Ana buƙatar injin tebur don aiki na gaskiya na Atlas",
  },

  screenTitles: {
    ask: {
      title: "Tambayi Atlas",
      subtitle:
        "Yi tambaya, nemo, ambata, kuma ƙi amsa cikin hankali idan hujjojin gida ba su isa ba.",
    },
    knowledge: {
      title: "Ilimin Kiwon Lafiya",
      subtitle:
        "Bincika takardun kiwon lafiya na gaskiya waɗanda Atlas zai iya nemowa da ambatawa.",
    },
    drugs: {
      title: "Bayanin Magunguna",
      subtitle:
        "Duba hujjojin da suka shafi magunguna daga ma'ajin da aka loda ba tare da mayar da Atlas zuwa tsarin sarrafa kantin magani ba.",
    },
    languages: {
      title: "Harsuna",
      subtitle:
        "Duba jerin harsunan da aka yi rijista da sakamakon tabbatarwa na gaskiya da aka auna.",
    },
    runtime: {
      title: "Injin Gudanarwa da Awo",
      subtitle:
        "Nuna ainihin injin gida, shirye-shiryensa, da bayanan awo ba tare da ƙirƙira komai ba.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas yana yin dukkan sarrafawa a wannan na'urar — babu kiran yanar gizo da ake yi.",
    checking: "Ana duba injin gudanarwa…",
    modelReady: "Samfuri a shirye",
    loadingModel: "Ana loda samfuri…",
    unavailable: "Injin gudanarwa ba ya samuwa",
  },

  uiLanguage: {
    label: "Harshen mu'amala",
    unverifiedNote:
      "Rubutun mu'amala da aka fassara ta atomatik, wanda har yanzu ba a duba ta wurin mai magana da asali ba.",
  },

  askAtlas: {
    heroTitle: "Ilimin Kiwon Lafiya Ba Yanar Gizo",
    heroSubtitle:
      "Atlas yana aiki a na'urar, yana nema daga ma'ajin kiwon lafiya na gida, yana auna matakin tabbaci kafin amsawa, kuma yana ambaton hujjojin da ya yi amfani da su.",
    badgeOffline: "Ba yanar gizo / a na'ura",
    badgeRuntimeConnected: "An haɗa injin",
    badgeRuntimeLoading: "Ana loda injin",
    badgeRuntimeUnavailable: "Injin ba ya samuwa",
    badgeLanguage: (name) => `Harshe: ${name}`,
    metricDocuments: "Takardu",
    metricLanguages: "Harsuna",
    metricExecution: "Aiwatarwa",
    executionLocalOnly: "Na gida kaɗai",
    flowLabel: "Yadda Atlas yake amsawa",
    flowSteps: [
      "Tambaya",
      "Nemo na gida",
      "Hujja",
      "Tabbaci",
      "Ƙirƙira na gida",
      "Amsa da aka ambata",
    ],
    suggestedQuestions: [
      "Menene alamomin rashin ruwa a jiki?",
      "Menene alamomin zazzabin cizon sauro?",
      "Me ya sa kulawar kafin haihuwa ke da muhimmanci lokacin ciki?",
      "Don me ake amfani da ruwan gishirin sha (ORS)?",
    ],
    interactionLanguageLabel: "Harshen amsawa",
    emptyStateTitle: "Tambayi Atlas",
    emptyStateBody:
      "Fara da tambaya ta kiwon lafiya wadda ma'ajin da aka loda ke tallafawa. Atlas zai nuna hujjoji, matakin tabbaci, da amsa ta ƙarshe da aka ambata a wuri ɗaya.",
    modelLoadingBanner:
      "Ana ci gaba da loda samfuri — loda na gaskiya ya ɗauki kimanin daƙiƙa 50 a kayan aikin ci gaban wannan aikin; lokaci a kan kayan aikin gasar bai riga ya kasance an auna ba.",
    runtimeUnavailableBanner: (reason) => `Injin Atlas ba ya samuwa: ${reason}`,
    inputPlaceholderReady:
      "Tambayi Atlas tambaya ta kiwon lafiya wadda ta dogara a kan ma'ajin gida...",
    inputPlaceholderWaiting: "Ana jiran Injin Gudanarwa...",
    sendLabel: "Aika",
    disclaimer:
      "Atlas mataimaki ne na ilimin kiwon lafiya. Ba ya gano cuta, ba ya rubuta magani, kuma ba ya maye gurbin ƙwararren likita.",
    questionLabel: "Tambaya",
    pendingStatus:
      "Ana nemo na gida, ana auna matakin tabbaci, kuma ana ƙirƙirar amsa mai dogara a kan hujja…",
    atlasLabel: "Atlas",
    confidenceStrong: "Hujja mai ƙarfi",
    confidenceWeak: "Hujja mai rauni",
    tokenStats: (tokens, tokensPerSecond) =>
      `Alamomi ${tokens} · Alamomi/dakika ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Bayanan hujja ${count} da aka ambata`,
    answerDisclaimer:
      "Ana ƙirƙirar amsoshi daga ma'ajin da aka loda kuma ya kamata a fahimce su a matsayin taimako mai dogara a kan hujja, ba gano cuta ko shawarar magani ba.",
    evidenceUsedTitle: "Hujjojin da aka yi amfani da su",
    retrievedChunks: (count) => `Guntuwar ${count} da aka samu`,
    licenseVerified: "An tabbatar da lasisi",
    localCorpus: "Ma'ajin gida",
    sourcesTitle: "Tushe",
    retrievedOn: (date) => `an samu ${date}`,
    refusalNoEvidenceTitle: "Ba a sami hujja mai tallafawa a ma'ajin gida ba",
    refusalInsufficientTitle: "Hujjoji ba su isa a tabbatar da su a ma'ajin gida ba",
    refusalNoEvidenceBody:
      "Ban sami hujja da ta shafi wannan tambaya a ma'ajin ilimin da aka loda ba. Atlas ba ya yin hasashe idan babu tushe mai tallafawa.",
    refusalInsufficientBody:
      "Na sami hujja mai rauni kaɗai game da wannan tambaya. Atlas ba ya ƙirƙirar amsa ta likita idan tallafin nema ya yi rauni sosai.",
    refusalNoEvidenceNote:
      "Hujjojin da ke akwai: babu wanda ya isa ya tallafa wa amsa mai dogara a kan hujja.",
    refusalInsufficientNote:
      "Hujjojin da ke akwai: masu alaƙa da rauni, ba su isa a dogara da su don amsawa lafiya ba.",
    generationFailed: (message) => `Ƙirƙira ta gaza: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Ana Jiran Injin Gudanarwa",
    waitingLoadingBody: "Ma'ajin ilimi yana lodawa tare da samfuri.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin Atlas ba a haɗa shi ba.",
    heroTitle: "Bincika takardun da Atlas zai iya ambatawa da gaske",
    heroSubtitle:
      "Asalin tushe wani ɓangare ne na kayan aikin. Kowane take, hukuma, ikon shari'a, da lasisin da aka nuna anan sun fito ne daga bayanan ma'ajin da aka loda.",
    metricLoaded: "Takardun da aka loda",
    metricLicenseVerified: "An tabbatar da lasisi",
    metricJurisdictions: "Ikon shari'a",
    searchPlaceholder: "Tace ta hanyar take, tushe, ko ikon shari'a...",
    documentsLoadedBadge: (count) => `Takardu ${count} da aka loda`,
    provenanceNotice:
      "Atlas yana ambatawa daga wannan tarin. An bar bayanan da ba su akwai a fili da gangan; kayan aikin ba ya cika wannan gibin da bayanan ƙirƙira.",
    noMatchTitle: (query) => `Babu takardar da ta yi daidai da "${query}"`,
    noMatchBody:
      "Gwada wani take, ko tambayi Atlas kai tsaye — nema yana bincika cikakken rubutun takarda.",
    sourcePathLabel: "Hanyar tushe",
    sourceUrlLabel: "Adireshin tushe",
    licenseLabel: "Lasisi",
    retrievedOn: (date) => `An samu ${date}`,
  },

  drugReference: {
    heroTitle: "Nemo magani mai dogara a kan hujja",
    heroSubtitle:
      "Wannan shafi yana nema kai tsaye a ma'ajin kiwon lafiya na gida. Ba ya ƙirƙirar bayanan magani, ba ya rarraba magani, kuma ba ya aiki kamar tsarin kantin magani.",
    exampleQueries: [
      "ruwan gishirin sha",
      "magungunan maganin zazzabin cizon sauro",
      "magungunan hawan jini",
    ],
    searchPlaceholder: "Nemo magani, magani, ko kalmar likitanci a ma'ajin gida...",
    searchButton: "Nemo hujjar gida",
    waitingTitle: "Ana Jiran Injin Atlas",
    waitingLoadingBody:
      "Nemo hujjar magani zai kasance mai samuwa da zarar samfuran gida da ma'ajin sun gama lodawa.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injin Atlas ba a haɗa shi ba.",
    noSearchTitle: "Har yanzu babu bincike",
    noSearchBody:
      "Shigar da kalma don duba ainihin hujjar da ta shafi magani wadda Atlas zai iya samu a ma'ajin da aka loda.",
    confidenceStrong: "Hujjar nema mai ƙarfi",
    confidenceWeak: "Hujjar nema mai rauni",
    confidenceNoEvidence: "Ba a sami hujja ba",
    matchingRecords: (count) => `Bayanan hujja ${count} da suka yi daidai`,
    noEvidenceTitle: "Bayani ba ya samuwa a ma'ajin yanzu",
    noEvidenceBody:
      "Atlas bai sami hujjar gida da aka tabbatar ba don wannan buƙata. Kayan aikin ba zai cika wannan gibin da shawarar magani da ba a tabbatar ba.",
    licenseVerified: "An tabbatar da lasisi",
    localCorpus: "Ma'ajin gida",
    lexicalBadge: "Na kalma",
    semanticBadge: "Na ma'ana",
    retrievedOn: (date) => `An samu ${date}`,
    scoreLabel: (score) => `Maki ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Ana Jiran Injin Gudanarwa",
    waitingDisconnected: "Injin Atlas ba a haɗa shi ba.",
    heroTitle: "Yin rijista ba yana nufin an tabbatar sosai ba",
    heroSubtitle:
      "Wannan jeri bayanan aikace-aikace ne na gaskiya. Matsayin da aka nuna ga kowane harshe yana nuna kimantawa da aka auna, ba da'awar kasuwanci da ta dogara kan rijista kawai ba.",
    metricRegistered: "An yi rijista",
    metricValidated: "Nema / ƙirƙira da aka tabbatar",
    metricPlausible: "Fasaha mai yiwuwa",
    metricPartialOrInconclusive: "Sashi ko marar tabbas",
    banner: (validated, total) =>
      `Yin rijista a wannan jeri bayanan bayani ne kawai, ba da'awar iyawa ba. Gwaje-gwajen ƙirƙira na gaskiya a kan Qwen3-4B a ranar 2026-08-08 sun gano cewa harsuna ${validated} daga cikin ${total} kawai ne ke ba da sakamako mai inganci akai-akai — duba ginshiƙin matsayi a ƙasa don ainihin sakamakon da aka auna na kowane harshe.`,
    statusLabels: {
      validated: "An tabbatar",
      "plausible-fluent": "Fasaha mai yiwuwa",
      partial: "Sashi",
      inconclusive: "Marar tabbas",
      garbled: "An gurɓata",
      failed: "Ya gaza",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Ana Jiran Injin Gudanarwa",
    waitingDisconnected: "Injin Atlas ba a haɗa shi ba.",
    heroTitle: "Ainihin injin gida na gaskiya",
    heroSubtitle:
      "Wannan kallo yana nuna abin da Atlas ya loda kuma ya auna da gaske a cikin aikace-aikacen tebur. Ana nuna dabi'un da ba su akwai a matsayin ba a auna ba maimakon cika su da bayanan ƙirƙira.",
    sectionRuntimeStatus: "Matsayin injin",
    sectionBenchmark: "Awon aiki",
    sectionHardware: "Kayan aiki (na gaskiya, an gano lokacin gudanarwa)",
    sectionGenerationThroughput: "Saurin ƙirƙira",
    labelDocumentsLoaded: "Takardun da aka loda",
    labelLanguagesRegistered: "Harsunan da aka yi rijista",
    labelGenerationModel: "Samfurin ƙirƙira",
    labelEmbeddingModel: "Samfurin wakilcin",
    labelKnowledgeBase: "Ma'ajin ilimi",
    labelWorkerState: "Matsayin na'urar sarrafawa",
    labelThreadCount: "Yawan zaren",
    labelWorkerUptime: "Tsawon lokacin gudanarwa",
    labelRetrievalLatency: "Jinkirin nema",
    labelProcessMemory: "Amfani da ƙwaƙwalwar tsari",
    workerStateLoaded: "An loda ƙirƙira da wakilci",
    workerStatePartial: "An loda sashi kawai",
    workerUptimeSeconds: (seconds) => `daƙiƙa ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Yana yin buƙatar ƙirƙira ta gaskiya a kan samfurin da aka loda kuma yana ba da rahoton saurin gaskiya, da aka auna — ba lambar ƙirƙira ba kurum. Duba ${docPath} don cikakken tsarin aiki mai kwanan wata da ake sake amfani da shi anan.`,
    runBenchmarkButton: "Fara awo yanzu",
    runningBenchmarkButton: "Ana gudanar da awo na gaskiya…",
    labelCpu: "Na'urar Sarrafawa (CPU)",
    labelCores: "Ƙwayoyin CPU",
    labelTotalRam: "Jimlar RAM",
    labelAvailableRam: "RAM da ke samuwa",
    labelRamTier: "Matakin RAM da aka zaɓa",
    physicalLogicalCores: (physical, logical) => `${physical} na zahiri / ${logical} na dabaru`,
    labelTokensPerSecond: "Alamomi / daƙiƙa",
    labelGeneratedTokens: "Alamomin da aka ƙirƙira",
    labelTotalDuration: "Jimlar lokaci",
    noGenerationModel: "Babu samfurin ƙirƙira da aka loda don wannan gwajin.",
    devHardwareNotice:
      "An gudanar da wannan a kan kayan aikin ci gaba, ba matakin tunani na 8GB na gasar ba — duba sashin “Inganci” na tarin awon ADTC kafin ambaton waɗannan lambobi a cikin kayan ƙaddamarwa.",
  },

  accessibility: {
    openSettings: "Buɗe saitunan samun dama",
    closeSettings: "Rufe saitunan samun dama",
    panelTitle: "Samun Dama",
    textSize: "Girman rubutu",
    highContrast: "Bambanci mai girma",
    reduceMotion: "Rage motsi",
    alwaysShowFocus: "Koyaushe nuna zoben mayar da hankali",
    resetDefaults: "Mayar da tsoho",
  },
};

export default ha;
