import type { Translations } from "../types";

const rw: Translations = {
  common: {
    notMeasured: "Ntibipimwe",
    loading: "Birimo gupakira…",
    untitledSource: "Inkomoko idafite umutwe",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ubwenge bw'Ubuzima",
    offlineOnDevice: "Nta interineti / Ku mudukanwa",
    blurb:
      "Atlas isubiza ikoresheje ibimenyetso byashyizwe kuri uyu mudukanwa. Ivuga icyo yakoresheje kandi ikanga gusubiza igihe idashoboye kwemeza ibimenyetso bihagije.",
    disclaimer:
      "Iki si igikoresho cyo gusuzuma indwara cyangwa cyo kwandika imiti. Atlas yerekana ubwenge bw'ubuzima bushingiye gusa ku nyandiko zashyizwemo.",
    runtimeLabel: "Moteri y'Ikoreshwa",
  },

  nav: {
    workspace: "Aho Gukorera",
    ask: "Baza Atlas",
    knowledge: "Ubumenyi bw'Ubuvuzi",
    drugs: "Ibisobanuro by'Imiti",
    languages: "Indimi",
    runtime: "Moteri n'Igerageza",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Inyandiko ${documents} zo mu mudukanwa · Indimi ${languages} zanditswe`,
    loading: "Birimo gutegura moderi z'aho biri hamwe n'ububiko bw'ubumenyi",
    unavailable: "Moteri ya mudasobwa irakenewe kugira ngo Atlas ikore neza",
  },

  screenTitles: {
    ask: {
      title: "Baza Atlas",
      subtitle:
        "Baza, shakisha, vuga inkomoko, kandi wange gusubiza witonze igihe ibimenyetso byo mu mudukanwa bidahagije.",
    },
    knowledge: {
      title: "Ubumenyi bw'Ubuvuzi",
      subtitle: "Reba inyandiko z'ubuzima nyazo Atlas ishobora gushakisha no kuvuga inkomoko.",
    },
    drugs: {
      title: "Ibisobanuro by'Imiti",
      subtitle:
        "Suzuma ibimenyetso birebana n'imiti biva mu bikusanyirizo byashyizwemo nta gutuma Atlas iba sisitemu yo gucunga farumasi.",
    },
    languages: {
      title: "Indimi",
      subtitle: "Reba urutonde rw'indimi zanditswe n'ibisubizo by'ukuri byo kwemeza byapimwe.",
    },
    runtime: {
      title: "Moteri n'Igerageza",
      subtitle:
        "Erekana neza umwirondoro w'ukuri wa moteri yo mu mudukanwa, kwitegura kwayo, n'amakuru y'igerageza nta gushushanya na kimwe.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas ikora ibarurishamibare byayo byose kuri uyu mudukanwa — nta guhamagara interineti gukorwa.",
    checking: "Irimo gusuzuma moteri y'ikoreshwa…",
    modelReady: "Moderi yiteguye",
    loadingModel: "Irimo gupakira moderi…",
    unavailable: "Moteri y'ikoreshwa ntiboneka",
  },

  uiLanguage: {
    label: "Ururimi rw'Imikoreshereze",
    unverifiedNote:
      "Inyandiko z'imikoreshereze zahinduwe na mudasobwa, zitarasuzumwa n'uvuga ururimi rwavukiyemo.",
  },

  askAtlas: {
    heroTitle: "Ubwenge bw'Ubuzima Nta Interineti",
    heroSubtitle:
      "Atlas ikora ku mudukanwa, ishakisha mu bikusanyirizo by'ubuzima byo mu mudukanwa, ipima urwego rw'icyizere mbere yo gusubiza, kandi ivuga inkomoko y'ibimenyetso yakoresheje.",
    badgeOffline: "Nta interineti / Ku mudukanwa",
    badgeRuntimeConnected: "Moteri ihujwe",
    badgeRuntimeLoading: "Moteri irimo gupakira",
    badgeRuntimeUnavailable: "Moteri ntiboneka",
    badgeLanguage: (name) => `Ururimi: ${name}`,
    metricDocuments: "Inyandiko",
    metricLanguages: "Indimi",
    metricExecution: "Ishyirwa mu bikorwa",
    executionLocalOnly: "Aho biri gusa",
    flowLabel: "Uko Atlas isubiza",
    flowSteps: [
      "Ikibazo",
      "Ishakisha ryo mu mudukanwa",
      "Ibimenyetso",
      "Icyizere",
      "Gukora mu mudukanwa",
      "Igisubizo cyavuzwe inkomoko",
    ],
    suggestedQuestions: [
      "Ni ibihe bimenyetso byo kubura amazi mu mubiri?",
      "Ni ibihe bimenyetso bya malariya?",
      "Kuki kwitabwaho mbere yo kubyara ari ngombwa igihe cy'inda?",
      "Amazi yo kugarura uburinganire bw'umubiri (ORS) akoreshwa iki?",
    ],
    interactionLanguageLabel: "Ururimi rw'Ikiganiro",
    emptyStateTitle: "Baza Atlas",
    emptyStateBody:
      "Tangira n'ikibazo cy'ubuzima gishyigikiwe n'ibikusanyirizo byashyizwemo. Atlas izerekana ibimenyetso, urwego rw'icyizere, n'igisubizo cya nyuma cyavuzwe inkomoko ahantu hamwe.",
    modelLoadingBanner:
      "Moderi iracyapakira — gupakira nyakuri byapimwe ko bimara amasegonda 50 ku bikoresho byo guteza imbere uyu mushinga; igihe ku bikoresho by'amarushanwa ntibiraba bipimwe.",
    runtimeUnavailableBanner: (reason) => `Moteri ya Atlas ntiboneka: ${reason}`,
    inputPlaceholderReady:
      "Baza Atlas ikibazo cy'ubuzima gishingiye ku bikusanyirizo byo mu mudukanwa...",
    inputPlaceholderWaiting: "Gutegereza Moteri y'Ikoreshwa...",
    sendLabel: "Ohereza",
    disclaimer:
      "Atlas ni umufasha w'ubumenyi bw'ubuzima. Ntisuzuma indwara, ntiyandika imiti, kandi ntisimbura umuganga w'ubuzima wemewe.",
    questionLabel: "Ikibazo",
    pendingStatus:
      "Irakora ishakisha ryo mu mudukanwa, ipima urwego rw'icyizere, kandi ikora igisubizo gishingiye ku bimenyetso…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ibimenyetso bikomeye",
    confidenceWeak: "Ibimenyetso bidakomeye",
    tokenStats: (tokens, tokensPerSecond) =>
      `Utuguru ${tokens} · utuguru/isegonda ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Inyandiko z'ibimenyetso ${count} zavuzwe inkomoko`,
    answerDisclaimer:
      "Ibisubizo bikorwa biva mu bikusanyirizo byashyizwemo kandi bigomba gusobanurwa nk'ubufasha bushingiye ku bimenyetso, ntabwo ari isuzuma cyangwa inama y'imiti.",
    evidenceUsedTitle: "Ibimenyetso Byakoreshejwe",
    retrievedChunks: (count) => `Ibice ${count} byabonetse`,
    licenseVerified: "Uruhushya rwemejwe",
    localCorpus: "Ibikusanyirizo byo mu Mudukanwa",
    sourcesTitle: "Inkomoko",
    retrievedOn: (date) => `byabonetse ${date}`,
    refusalNoEvidenceTitle:
      "Nta bimenyetso bishyigikira byabonetse mu bikusanyirizo byo mu mudukanwa",
    refusalInsufficientTitle: "Ibimenyetso ntibihagije kwemezwa mu bikusanyirizo byo mu mudukanwa",
    refusalNoEvidenceBody:
      "Sinashoboye kubona ibimenyetso bijyanye n'iki kibazo mu bubiko bw'ubumenyi bwashyizwemo. Atlas ntiyibwira igihe nta nkomoko ishyigikira ihari.",
    refusalInsufficientBody:
      "Nabonye gusa ibimenyetso bidakomeye kuri iki kibazo. Atlas ntikora igisubizo cy'ubuvuzi igihe inkunga y'ishakisha idakomeye cyane.",
    refusalNoEvidenceNote:
      "Ibimenyetso bihari: nta na kimwe gihagije cyo gushyigikira igisubizo gishingiye ku bimenyetso.",
    refusalInsufficientNote:
      "Ibimenyetso bihari: bifitanye isano idakomeye, ntibishoboka kwiringirwa mu gusubiza mu mutekano.",
    generationFailed: (message) => `Gukora byanze: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Gutegereza Moteri y'Ikoreshwa",
    waitingLoadingBody: "Ububiko bw'ubumenyi bupakira hamwe na moderi.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Moteri ya Atlas ntiyahujwe.",
    heroTitle: "Reba inyandiko Atlas ishobora kuvuga inkomoko nyayo",
    heroSubtitle:
      "Inkomoko ni igice cy'igicuruzwa. Buri mutwe, umuryango, akarere k'amategeko, n'uruhushya byerekanwe hano biva mu makuru y'ibikusanyirizo byashyizwemo.",
    metricLoaded: "Inyandiko zashyizwemo",
    metricLicenseVerified: "Uruhushya rwemejwe",
    metricJurisdictions: "Uturere tw'Amategeko",
    searchPlaceholder: "Yungurura ku mutwe, inkomoko, cyangwa akarere k'amategeko...",
    documentsLoadedBadge: (count) => `Inyandiko ${count} zashyizwemo`,
    provenanceNotice:
      "Atlas ivuga inkomoko iri kuri uru rutonde. Amakuru adahari asigara ari ubusa ku bushake; igikoresho ntikuzuza icyo cyuho n'amakuru yashushanijwe.",
    noMatchTitle: (query) => `Nta nyandiko ihuye na "${query}"`,
    noMatchBody:
      "Gerageza indi mutwe, cyangwa ubaze Atlas ku buryo butaziguye — ishakisha risuzuma inyandiko yose y'inyandiko.",
    sourcePathLabel: "Inzira y'Inkomoko",
    sourceUrlLabel: "Aderesi ya Interineti y'Inkomoko",
    licenseLabel: "Uruhushya",
    retrievedOn: (date) => `Byabonetse ${date}`,
  },

  drugReference: {
    heroTitle: "Gushakisha imiti bishingiye ku bimenyetso",
    heroSubtitle:
      "Iyi ekrani ishakisha ku buryo butaziguye mu bikusanyirizo by'ubuzima byo mu mudukanwa. Ntishushanya ukuri ku miti, ntigabura imiti, kandi ntikora nka sisitemu ya farumasi.",
    exampleQueries: [
      "amazi yo kugarura uburinganire bw'umubiri",
      "imiti yo kuvura malariya",
      "imiti y'umuvuduko w'amaraso",
    ],
    searchPlaceholder:
      "Shakisha umuti, ubuvuzi, cyangwa ijambo ry'ubuvuzi mu bikusanyirizo byo mu mudukanwa...",
    searchButton: "Shakisha ibimenyetso byo mu mudukanwa",
    waitingTitle: "Gutegereza Moteri ya Atlas",
    waitingLoadingBody:
      "Gushakisha ibimenyetso by'imiti bizaboneka igihe moderi zo mu mudukanwa n'ibikusanyirizo bizaba birangije gupakira.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Moteri ya Atlas ntiyahujwe.",
    noSearchTitle: "Nta shakisha ririho ubu",
    noSearchBody:
      "Andika ijambo kugira ngo usuzume neza ibimenyetso birebana n'imiti Atlas ishobora kubona mu bikusanyirizo byashyizwemo.",
    confidenceStrong: "Ibimenyetso by'ishakisha bikomeye",
    confidenceWeak: "Ibimenyetso by'ishakisha bidakomeye",
    confidenceNoEvidence: "Nta bimenyetso byabonetse",
    matchingRecords: (count) => `Inyandiko z'ibimenyetso ${count} zihuye`,
    noEvidenceTitle: "Amakuru ntaboneka mu bikusanyirizo bya none",
    noEvidenceBody:
      "Atlas ntiyabonye ibimenyetso byo mu mudukanwa byemejwe kuri iki cyifuzo. Igicuruzwa ntikizuza icyo cyuho n'inama y'imiti itemejwe.",
    licenseVerified: "Uruhushya rwemejwe",
    localCorpus: "Ibikusanyirizo byo mu Mudukanwa",
    lexicalBadge: "Amagambo",
    semanticBadge: "Ibisobanuro",
    retrievedOn: (date) => `Byabonetse ${date}`,
    scoreLabel: (score) => `Amanota ${score.toFixed(3)}`,
    viewFullEvidence: "Reba ibimenyetso byuzuye",
    backToResults: "Subira ku bisubizo",
    fullEvidenceHeading: "Igice cy'ibimenyetso cyuzuye",
    sourceHeading: "Inkomoko",
    otherMatchesHeading: "Ibindi bihuye biri muri iyi nyandiko",
    scopeNote:
      "Atlas igaragaza ibice byavuye mu nyandiko wafashe, ntabwo ari ububiko bw'imiti bugenwe. Ibikoresho by'ingano y'imiti, imbonerahamwe z'ihuzagurika, n'amakode yo gushyira mu byiciro ntibigaragara keretse biri mu nyandiko yavuye mu bushakashatsi.",
  },

  languagesScreen: {
    waitingTitle: "Gutegereza Moteri y'Ikoreshwa",
    waitingDisconnected: "Moteri ya Atlas ntiyahujwe.",
    heroTitle: "Kwandikwa ntibisobanura kwemezwa burundu",
    heroSubtitle:
      "Uru rutonde ni amakuru nyayo ya porogaramu. Uko buri rurimi rugaragazwa byerekana isuzuma ryapimwe, ntabwo ari inyandiko y'ubucuruzi ishingiye gusa ku kwandikwa.",
    metricRegistered: "Zanditswe",
    metricValidated: "Ishakisha / Gukora Byemejwe",
    metricPlausible: "Ubumenyi Bushoboka",
    metricPartialOrInconclusive: "Igice cyangwa Bitagaragara",
    banner: (validated, total) =>
      `Kwandikwa kuri uru rutonde ni amakuru gusa, ntabwo ari inyandiko y'ubushobozi. Ibigeragezo by'ukuri byo gukora hifashishijwe Qwen3-4B ku itariki ya 2026-08-08 byasanze ko gusa indimi ${validated} kuri ${total} aricyo gitanga ibisubizo byukuri buri gihe — reba inkingi y'imiterere hepfo kugira ngo urebe ibisubizo by'ukuri, byapimwe, by'buri rurimi.`,
    statusLabels: {
      validated: "Byemejwe",
      "plausible-fluent": "Ubumenyi Bushoboka",
      partial: "Igice",
      inconclusive: "Bitagaragara",
      garbled: "Byangiritse",
      failed: "Byanze",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Gutegereza Moteri y'Ikoreshwa",
    waitingDisconnected: "Moteri ya Atlas ntiyahujwe.",
    heroTitle: "Umwirondoro w'ukuri wa moteri yo mu mudukanwa",
    heroSubtitle:
      "Iyi ndorerwamo yerekana ibyo Atlas yashyizemo n'ibyo yapimye by'ukuri muri porogaramu ya desktop. Agaciro kabuze kerekanwa nk'ikitapimwe aho kuzuzwa n'amakuru yashushanijwe.",
    sectionRuntimeStatus: "Imiterere ya Moteri",
    sectionBenchmark: "Igerageza",
    sectionHardware: "Ibikoresho (by'ukuri, byabonetse mu gihe cy'ikoreshwa)",
    sectionGenerationThroughput: "Umuvuduko wo Gukora",
    labelDocumentsLoaded: "Inyandiko Zashyizwemo",
    labelLanguagesRegistered: "Indimi Zanditswe",
    labelGenerationModel: "Moderi yo Gukora",
    labelEmbeddingModel: "Moderi yo Kwerekana",
    labelKnowledgeBase: "Ububiko bw'Ubumenyi",
    labelWorkerState: "Imiterere y'Ukazi",
    labelThreadCount: "Umubare w'Uduce",
    labelWorkerUptime: "Igihe cy'Akazi",
    labelRetrievalLatency: "Ugutinda kw'Ishakisha",
    labelProcessMemory: "Ikoreshwa ry'Ubwibutso bw'Igikorwa",
    workerStateLoaded: "Gukora no kwerekana byashyizwemo",
    workerStatePartial: "Igice cyashyizwemo",
    workerUptimeSeconds: (seconds) => `amasegonda ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Ikora icyifuzo cy'ukuri cyo gukora kuri moderi yashyizwemo kandi ivuga umuvuduko w'ukuri, wapimwe — ntabwo ari umubare washushanijwe. Reba ${docPath} kugira ngo ubone uburyo bwuzuye, bufite itariki, bwongeye gukoreshwa hano.`,
    runBenchmarkButton: "Tangira igerageza nonaha",
    runningBenchmarkButton: "Irimo gukora igerageza ry'ukuri…",
    labelCpu: "Igikoresho cy'Ibarura (CPU)",
    labelCores: "Uduce twa CPU",
    labelTotalRam: "RAM Yose",
    labelAvailableRam: "RAM Iboneka",
    labelRamTier: "Urwego rwa RAM Rwatoranyijwe",
    physicalLogicalCores: (physical, logical) => `${physical} nyaburanga / ${logical} by'ubwenge`,
    labelTokensPerSecond: "Utuguru / Isegonda",
    labelGeneratedTokens: "Utuguru Twakozwe",
    labelTotalDuration: "Igihe Cyose",
    noGenerationModel: "Nta moderi yo gukora yashyizwemo kuri iri gerageza.",
    devHardwareNotice:
      "Ibi byakozwe ku bikoresho byo guteza imbere, ntabwo ari urwego rw'icyitegererezo rwa 8GB rw'amarushanwa — reba igice cyitwa “Ubushobozi” cy'itsinda ry'igerageza rya ADTC mbere yo kuvuga aya mibare mu nyandiko zo kohereza.",
  },

  accessibility: {
    openSettings: "Fungura amagenamiterere y'ubushobozi",
    closeSettings: "Funga amagenamiterere y'ubushobozi",
    panelTitle: "Ubushobozi",
    textSize: "Ingano y'Inyandiko",
    highContrast: "Itandukaniro Rikomeye",
    reduceMotion: "Kugabanya Imigendekere",
    alwaysShowFocus: "Erekana buri gihe impeta y'aho witerekeje",
    sectionReadability: "Gusoma byoroshye",
    sectionAssistiveTools: "Ibikoresho by'ubufasha",
    sectionDisplay: "Kugaragaza",
    readableSpacing: "Icyuho cyo gusoma byoroshye",
    highlightLinks: "Garagaza amahuza",
    bigCursor: "Kanyoni kanini",
    readingMask: "Umuyoboro wo gusoma",
    readPage: "Soma urupapuro mu ijwi",
    stopReading: "Hagarika gusoma",
    invertColors: "Hindura amabara",
    grayscale: "Ibara ry'ivu",
    skipToContent: "Simbuka ujye ku bikubiyemo",
    resetDefaults: "Garura Igenamiterere Risanzwe",
  },
};

export default rw;
