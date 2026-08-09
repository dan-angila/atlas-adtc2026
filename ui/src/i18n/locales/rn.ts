import type { Translations } from "../types";

const rn: Translations = {
  common: {
    notMeasured: "Ntibipimwe",
    loading: "Biriko birapakira…",
    untitledSource: "Inkomoko idafise umutwe",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ubwenge bw'Amagara",
    offlineOnDevice: "Nta interineti / Ku gikoresho",
    blurb:
      "Atlas itanga inyishu ikoresheje ivyemezo vyashizwe kuri iki gikoresho. Ivuga ico yakoresheje kandi yanka gutanga inyishu igihe idashoboye kwemeza ivyemezo bihagije.",
    disclaimer:
      "Iki si igikoresho co gusuzuma indwara canke co kwandika imiti. Atlas yerekana ubwenge bw'amagara bushingiye gusa ku vyandiko vyashizwemo.",
    runtimeLabel: "Umuyagankuru w'Igikorwa",
  },

  nav: {
    workspace: "Ahantu ho Gukorera",
    ask: "Baza Atlas",
    knowledge: "Ubumenyi bw'Amagara",
    drugs: "Amakuru ku Miti",
    languages: "Indimi",
    runtime: "Umuyagankuru n'Igerageza",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Inyandiko ${documents} zo ku gikoresho · Indimi ${languages} zanditswe`,
    loading: "Biriko biratunganya moderi zo ku gikoresho hamwe n'ububiko bw'ubumenyi",
    unavailable: "Umuyagankuru wa mudasobwa arakenewe kugira Atlas ikore neza",
  },

  screenTitles: {
    ask: {
      title: "Baza Atlas",
      subtitle:
        "Baza, rondera, vuga inkomoko, kandi wange gutanga inyishu witonze igihe ivyemezo vyo ku gikoresho bidahagije.",
    },
    knowledge: {
      title: "Ubumenyi bw'Amagara",
      subtitle: "Raba inyandiko z'amagara nyakuri Atlas ishobora kuronderamwo no kuvuga inkomoko.",
    },
    drugs: {
      title: "Amakuru ku Miti",
      subtitle:
        "Suzuma ivyemezo bijanye n'imiti biva mu bikoresho vyashizwemo ata gutuma Atlas iba sisiteme yo gucungera farumasi.",
    },
    languages: {
      title: "Indimi",
      subtitle: "Raba urutonde rw'indimi zanditswe n'ivyavuye mu kwemeza nyakuri vyapimwe.",
    },
    runtime: {
      title: "Umuyagankuru n'Igerageza",
      subtitle:
        "Erekana neza akamenyero nyakuri k'umuyagankuru wo ku gikoresho, ukwitegura kwawo, n'amakuru y'igerageza ata na kimwe cabaye.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas ikora ivyiharuro vyayo vyose kuri iki gikoresho — nta guhamagara interineti gukorwa.",
    checking: "Biriko birasuzuma umuyagankuru w'igikorwa…",
    modelReady: "Moderi iriteguye",
    loadingModel: "Biriko birapakira moderi…",
    unavailable: "Umuyagankuru w'igikorwa ntiboneka",
  },

  uiLanguage: {
    label: "Ururimi rw'Ikiganiro",
    unverifiedNote:
      "Inyandiko z'ikiganiro zahinduwe na mudasobwa, zitarasuzumwa n'uvuga ururimi nk'urwavukiyemwo.",
  },

  askAtlas: {
    heroTitle: "Ubwenge bw'Amagara Nta Interineti",
    heroSubtitle:
      "Atlas ikora ku gikoresho, irondera mu bikoresho by'amagara vyo ku gikoresho, ipima urugero rw'ikizigira imbere yo gutanga inyishu, kandi ivuga inkomoko y'ivyemezo yakoresheje.",
    badgeOffline: "Nta interineti / Ku gikoresho",
    badgeRuntimeConnected: "Umuyagankuru urahujwe",
    badgeRuntimeLoading: "Umuyagankuru uriko urapakira",
    badgeRuntimeUnavailable: "Umuyagankuru ntiboneka",
    badgeLanguage: (name) => `Ururimi: ${name}`,
    metricDocuments: "Inyandiko",
    metricLanguages: "Indimi",
    metricExecution: "Ishirwa mu ngiro",
    executionLocalOnly: "Ku gikoresho gusa",
    flowLabel: "Ukuntu Atlas itanga inyishu",
    flowSteps: [
      "Ikibazo",
      "Ukurondera kwo ku gikoresho",
      "Ivyemezo",
      "Ikizigira",
      "Ugukora ku gikoresho",
      "Inyishu ivuze inkomoko",
    ],
    suggestedQuestions: [
      "Ni ibiki ibimenyetso vyo kubura amazi mu mubiri?",
      "Ni ibiki ibimenyetso vya malariya?",
      "Kubera iki kwitwararika imbere yo kwibaruka ari ngirakamaro mu gihe c'inda?",
      "Amazi yo kugarukana uburinganire bw'umubiri (ORS) akoreshwa iki?",
    ],
    interactionLanguageLabel: "Ururimi rw'Ikiyago",
    emptyStateTitle: "Baza Atlas",
    emptyStateBody:
      "Tangura n'ikibazo c'amagara gishigikiwe n'ibikoresho vyashizwemo. Atlas izoerekana ivyemezo, urugero rw'ikizigira, n'inyishu ya nyuma ivuze inkomoko ahantu hamwe.",
    modelLoadingBanner:
      "Moderi iracatunganywa — gupakira nyakuri vyapimwe ko bimara amasegonda 50 ku bikoresho vyo gutera imbere uwu mugambi; igihe ku bikoresho vy'amarushanwa ntikiraba capimwe.",
    runtimeUnavailableBanner: (reason) => `Umuyagankuru wa Atlas ntiboneka: ${reason}`,
    inputPlaceholderReady:
      "Baza Atlas ikibazo c'amagara gishingiye ku bikoresho vyo ku gikoresho...",
    inputPlaceholderWaiting: "Kurindira Umuyagankuru w'Igikorwa...",
    sendLabel: "Rungika",
    disclaimer:
      "Atlas ni umufasha w'ubumenyi bw'amagara. Ntisuzuma indwara, ntiyandika imiti, kandi ntisubirira umuganga w'amagara yemewe.",
    questionLabel: "Ikibazo",
    pendingStatus:
      "Iriko irakora ukurondera kwo ku gikoresho, ipima urugero rw'ikizigira, kandi ikora inyishu ishingiye ku vyemezo…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ivyemezo bikomeye",
    confidenceWeak: "Ivyemezo bitakomeye",
    tokenStats: (tokens, tokensPerSecond) =>
      `Utuntu ${tokens} · utuntu/isegonda ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Inyandiko z'ivyemezo ${count} zivuze inkomoko`,
    answerDisclaimer:
      "Inyishu zikorwa ziva mu bikoresho vyashizwemo kandi zitegerezwa gutahurwa nk'ubufasha bushingiye ku vyemezo, atari isuzuma canke impanuro y'imiti.",
    evidenceUsedTitle: "Ivyemezo Vyakoreshejwe",
    retrievedChunks: (count) => `Ibice ${count} vyabonetse`,
    licenseVerified: "Uruhusha rwemejwe",
    localCorpus: "Ibikoresho vyo ku Gikoresho",
    sourcesTitle: "Inkomoko",
    retrievedOn: (date) => `vyabonetse ${date}`,
    refusalNoEvidenceTitle: "Nta vyemezo bishigikira vyabonetse mu bikoresho vyo ku gikoresho",
    refusalInsufficientTitle: "Ivyemezo ntibihagije kwemezwa mu bikoresho vyo ku gikoresho",
    refusalNoEvidenceBody:
      "Sinashoboye kuronka ivyemezo bijanye n'iki kibazo mu bubiko bw'ubumenyi bwashizwemo. Atlas ntitegekanya igihe ata nkomoko ishigikira ihari.",
    refusalInsufficientBody:
      "Naronse gusa ivyemezo bitakomeye kuri iki kibazo. Atlas ntikora inyishu y'amagara igihe inkunga y'ukurondera itakomeye cane.",
    refusalNoEvidenceNote:
      "Ivyemezo bihari: nta na kimwe gihagije co gushigikira inyishu ishingiye ku vyemezo.",
    refusalInsufficientNote:
      "Ivyemezo bihari: bifitaniye isano itakomeye, ntibishoboka kwizigirwa mu gutanga inyishu mu mutekano.",
    generationFailed: (message) => `Ugukora vyanse: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Kurindira Umuyagankuru w'Igikorwa",
    waitingLoadingBody: "Ububiko bw'ubumenyi burapakira hamwe na moderi.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Umuyagankuru wa Atlas ntiwahujwe.",
    heroTitle: "Raba inyandiko Atlas ishobora kuvuga inkomoko nyakuri",
    heroSubtitle:
      "Inkomoko ni igice c'igicuruzwa. Umutwe wose, ishirahamwe, akarere k'amategeko, n'uruhusha vyerekanwe ng'aha bivuye mu makuru y'ibikoresho vyashizwemo.",
    metricLoaded: "Inyandiko zashizwemo",
    metricLicenseVerified: "Uruhusha rwemejwe",
    metricJurisdictions: "Uturere tw'Amategeko",
    searchPlaceholder: "Toranya ku mutwe, inkomoko, canke akarere k'amategeko...",
    documentsLoadedBadge: (count) => `Inyandiko ${count} zashizwemo`,
    provenanceNotice:
      "Atlas ivuga inkomoko iri kuri uru rutonde. Amakuru adahari asigara ata kintu ku bushake; igikoresho ntikuzuza ico cibande n'amakuru yavuzwe ata shingiro.",
    noMatchTitle: (query) => `Nta nyandiko ihuye na "${query}"`,
    noMatchBody:
      "Gerageza uwundi mutwe, canke ubaze Atlas ata guhindukira — ukurondera kurasuzuma inyandiko yose y'inyandiko.",
    sourcePathLabel: "Inzira y'Inkomoko",
    sourceUrlLabel: "Aderesi ya Interineti y'Inkomoko",
    licenseLabel: "Uruhusha",
    retrievedOn: (date) => `Vyabonetse ${date}`,
  },

  drugReference: {
    heroTitle: "Ukurondera imiti bishingiye ku vyemezo",
    heroSubtitle:
      "Iyi mpapuro irondera ata guhindukira mu bikoresho by'amagara vyo ku gikoresho. Ntivuga ata shingiro ku vyerekeye imiti, ntigaburira imiti, kandi ntikora nka sisiteme ya farumasi.",
    exampleQueries: [
      "amazi yo kugarukana uburinganire bw'umubiri",
      "imiti yo kuvura malariya",
      "imiti y'umuvuduko w'amaraso",
    ],
    searchPlaceholder:
      "Rondera umuti, ubuvuzi, canke ijambo ry'ubuvuzi mu bikoresho vyo ku gikoresho...",
    searchButton: "Rondera ivyemezo vyo ku gikoresho",
    waitingTitle: "Kurindira Umuyagankuru wa Atlas",
    waitingLoadingBody:
      "Ukurondera ivyemezo vy'imiti kuzoboneka igihe moderi zo ku gikoresho n'ibikoresho bizoba birangije gupakira.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Umuyagankuru wa Atlas ntiwahujwe.",
    noSearchTitle: "Nta kurondera kuriho ubu",
    noSearchBody:
      "Andika ijambo kugira usuzume neza ivyemezo bijanye n'imiti Atlas ishobora kuronka mu bikoresho vyashizwemo.",
    confidenceStrong: "Ivyemezo vy'ukurondera bikomeye",
    confidenceWeak: "Ivyemezo vy'ukurondera bitakomeye",
    confidenceNoEvidence: "Nta vyemezo vyabonetse",
    matchingRecords: (count) => `Inyandiko z'ivyemezo ${count} zihuye`,
    noEvidenceTitle: "Amakuru ntaboneka mu bikoresho vya ubu",
    noEvidenceBody:
      "Atlas ntiyaronse ivyemezo vyo ku gikoresho vyemejwe kuri iki cisabwa. Igicuruzwa ntikizuza ico cibande n'impanuro y'imiti itemejwe.",
    licenseVerified: "Uruhusha rwemejwe",
    localCorpus: "Ibikoresho vyo ku Gikoresho",
    lexicalBadge: "Amajambo",
    semanticBadge: "Insobanuro",
    retrievedOn: (date) => `Vyabonetse ${date}`,
    scoreLabel: (score) => `Amanota ${score.toFixed(3)}`,
    viewFullEvidence: "Raba ivyemezo vyuzuye",
    backToResults: "Subira ku bisubizo",
    fullEvidenceHeading: "Igice c'ivyemezo cuzuye",
    sourceHeading: "Inkomoko",
    otherMatchesHeading: "Ibindi bihuye biri muri iyi nyandiko",
    scopeNote:
      "Atlas yerekana ibice vyakuwe mu nyandiko washizemwo, atari ububiko bw'imiti bugenwe. Ibikoresho vyo gupima ingano y'imiti, imbonerahamwe z'ihuzagurika, n'amakode yo gushira mu byiciro ntibiboneka keretse biri mu nyandiko yakuwe.",
  },

  languagesScreen: {
    waitingTitle: "Kurindira Umuyagankuru w'Igikorwa",
    waitingDisconnected: "Umuyagankuru wa Atlas ntiwahujwe.",
    heroTitle: "Kwandikwa ntibisobanura kwemezwa burundu",
    heroSubtitle:
      "Uru rutonde ni amakuru nyakuri ya porogaramu. Ukuntu buri rurimi rwerekanwa birerekana isuzuma ryapimwe, atari inyandiko y'ubudandaji ishingiye gusa ku kwandikwa.",
    metricRegistered: "Zanditswe",
    metricValidated: "Ukurondera / Ugukora Vyemejwe",
    metricPlausible: "Ubumenyi Bushoboka",
    metricPartialOrInconclusive: "Igice canke Bidasobanutse",
    banner: (validated, total) =>
      `Kwandikwa kuri uru rutonde ni amakuru gusa, atari inyandiko y'ubushobozi. Ibigeragezo nyakuri vyo gukora hakoreshejwe Qwen3-4B ku itariki ya 2026-08-08 vyarasanze ko gusa indimi ${validated} kuri ${total} arizo zitanga ivyavuye nyakuri buri gihe — raba inkingi y'ukuntu biri hepfo kugira urabe ivyavuye nyakuri, vyapimwe, vy'urulimi rwose.`,
    statusLabels: {
      validated: "Vyemejwe",
      "plausible-fluent": "Ubumenyi Bushoboka",
      partial: "Igice",
      inconclusive: "Bidasobanutse",
      garbled: "Vyononekaye",
      failed: "Vyanse",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Kurindira Umuyagankuru w'Igikorwa",
    waitingDisconnected: "Umuyagankuru wa Atlas ntiwahujwe.",
    heroTitle: "Akamenyero nyakuri k'umuyagankuru wo ku gikoresho",
    heroSubtitle:
      "Iyi ndorerwamo yerekana ivyo Atlas yashizemo n'ivyo yapimye nyakuri muri porogaramu ya desktop. Agaciro katariho kerekanwa nk'akatapimwe aho gukuzuzwa n'amakuru avuzwe ata shingiro.",
    sectionRuntimeStatus: "Uko Umuyagankuru Umeze",
    sectionBenchmark: "Igerageza",
    sectionHardware: "Ibikoresho (nyakuri, vyabonetse mu gihe c'igikorwa)",
    sectionGenerationThroughput: "Umuvuduko wo Gukora",
    labelDocumentsLoaded: "Inyandiko Zashizwemo",
    labelLanguagesRegistered: "Indimi Zanditswe",
    labelGenerationModel: "Moderi yo Gukora",
    labelEmbeddingModel: "Moderi yo Kwerekana",
    labelKnowledgeBase: "Ububiko bw'Ubumenyi",
    labelWorkerState: "Uko Umukozi Ameze",
    labelThreadCount: "Umubare w'Utudende",
    labelWorkerUptime: "Igihe c'Igikorwa",
    labelRetrievalLatency: "Ugutebera kw'Ukurondera",
    labelProcessMemory: "Ikoreshwa ry'Ubwenge bw'Igikorwa",
    workerStateLoaded: "Ugukora no kwerekana vyashizwemo",
    workerStatePartial: "Igice cashizwemo",
    workerUptimeSeconds: (seconds) => `amasegonda ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Irakora icisabwa nyakuri co gukora kuri moderi yashizwemo kandi ivuga umuvuduko nyakuri, wapimwe — atari umubare uvuzwe ata shingiro. Raba ${docPath} kugira uronke uburyo bwuzuye, bufise itariki, bwongeye gukoreshwa ng'aha.`,
    runBenchmarkButton: "Tangura igerageza ubu nyene",
    runningBenchmarkButton: "Iriko irakora igerageza nyakuri…",
    labelCpu: "Igikoresho c'Ivyiharuro (CPU)",
    labelCores: "Ibihimba vya CPU",
    labelTotalRam: "RAM Yose",
    labelAvailableRam: "RAM Iboneka",
    labelRamTier: "Urwego rwa RAM Rwatoranijwe",
    physicalLogicalCores: (physical, logical) => `${physical} nyakuri / ${logical} vy'ubwenge`,
    labelTokensPerSecond: "Utuntu / Isegonda",
    labelGeneratedTokens: "Utuntu Twakozwe",
    labelTotalDuration: "Igihe Cose",
    noGenerationModel: "Nta moderi yo gukora yashizwemo kuri iri gerageza.",
    devHardwareNotice:
      "Ibi vyakozwe ku bikoresho vyo gutera imbere, atari urwego rw'icitegerezwa rwa 8GB rw'amarushanwa — raba igice citwa “Ubushobozi” c'ihuriro ry'igerageza rya ADTC imbere yo kuvuga aya mibare mu nyandiko zo kurungika.",
  },

  accessibility: {
    openSettings: "Fungura amagenamiterere y'ukuronka",
    closeSettings: "Funga amagenamiterere y'ukuronka",
    panelTitle: "Ukuronka",
    textSize: "Ingano y'Inyandiko",
    highContrast: "Itandukaniro Rinini",
    reduceMotion: "Kugabanya Imvurugano",
    alwaysShowFocus: "Erekana buri gihe umupeta w'aho hitwararitse",
    sectionReadability: "Gusoma vyoroshe",
    sectionAssistiveTools: "Ibikoresho vy'ubufasha",
    sectionDisplay: "Kwerekana",
    readableSpacing: "Umwanya wo gusoma vyoroshe",
    highlightLinks: "Erekana amahuza",
    bigCursor: "Akanyoni kanini",
    readingMask: "Umuyoborozi wo gusoma",
    readPage: "Soma urupapuro mw'ijwi",
    stopReading: "Hagarika gusoma",
    invertColors: "Hindura amabara",
    grayscale: "Ibara ry'umukungugu",
    skipToContent: "Simbuka uje ku vyanditswe vy'ingenzi",
    resetDefaults: "Garukana Igenamiterere Risanzwe",
  },
};

export default rn;
