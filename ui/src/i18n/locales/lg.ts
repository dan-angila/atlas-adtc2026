import type { Translations } from "../types";

const lg: Translations = {
  common: {
    notMeasured: "Tekipimiddwa",
    loading: "Kikwata…",
    untitledSource: "Ensibuko etaliiko mutwe",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Amagezi g'Obulamu",
    offlineOnDevice: "Nga tekusibuka kw'intaneeti / Ku ky'akatambi",
    blurb:
      "Atlas addamu ng'akozesa obukakafu obwateekebwa ku kyuma kino. Awa amagezi ku ekyo kye yakozesezza era agaana okuddamu bw'aba tasobola kukakasa obukakafu obumala.",
    disclaimer:
      "Kino si kyuma kya kwekenneenya endwadde oba okuwandiika eddagala. Atlas alaga amagezi g'obulamu agasinziira bulambe ku bawandiiko abateekeddwaawo.",
    runtimeLabel: "Emikutu gy'Okukola",
  },

  nav: {
    workspace: "Ekifo ky'Omulimu",
    ask: "Buuza Atlas",
    knowledge: "Amagezi g'Ebyobulamu",
    drugs: "Obubaka ku Ddagala",
    languages: "Ennimi",
    runtime: "Emikutu n'Okugezesa",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Ebiwandiiko ${documents} eby'awo · Ennimi ${languages} eziwandiikiddwa`,
    loading: "Kiteekateeka emisono egy'awo n'ekitongole ky'amagezi",
    unavailable: "Emikutu gya desktop geetaagisa Atlas asobole okukola bulungi",
  },

  screenTitles: {
    ask: {
      title: "Buuza Atlas",
      subtitle:
        "Buuza, noonya, wandiika ensibuko, era ogaane n'obwegendereza obukakafu bw'awo bwe butamala.",
    },
    knowledge: {
      title: "Amagezi g'Ebyobulamu",
      subtitle:
        "Laba ebiwandiiko by'obulamu ebituufu Atlas by'asobola okunoonya n'okuwandiikako ensibuko.",
    },
    drugs: {
      title: "Obubaka ku Ddagala",
      subtitle:
        "Kebera obukakafu obukwatagana n'eddagala okuva mu kitongole ekyateekebwaawo nga tofudde Atlas kabwatu k'okukwata famasi.",
    },
    languages: {
      title: "Ennimi",
      subtitle:
        "Laba olukalala lw'ennimi eziwandiikiddwa n'ebivudde mu kukakasa okw'amazima ebyapimiddwa.",
    },
    runtime: {
      title: "Emikutu n'Okugezesa",
      subtitle:
        "Laga endagamuntu ey'amazima ey'emikutu gy'awo, obuteekateeka bwagyo, n'ebikwata ku kugezesa nga tewali kigunjiddwa.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas akola byonna ku kyuma kino — tewali kukubira ssimu ya intaneeti kukolebwa.",
    checking: "Kikebera emikutu gy'okukola…",
    modelReady: "Ekyokulabirako kiteekateefu",
    loadingModel: "Kikwata ekyokulabirako…",
    unavailable: "Emikutu gy'okukola tegiriwo",
  },

  uiLanguage: {
    label: "Olulimi lw'Enkozesa",
    unverifiedNote:
      "Ebiwandiiko by'enkozesa ebyakyusibwa n'ekyuma, ebitannakebererwa muntu ayogera olulimi olwo ng'olwazaalibwa.",
  },

  askAtlas: {
    heroTitle: "Amagezi g'Obulamu Nga Tekusibuka kw'Intaneeti",
    heroSubtitle:
      "Atlas akola ku kyuma, anoonya mu kitongole ky'obulamu eky'awo, apima omuwendo gw'obwesige nga tannaddamu, era awandiika ensibuko y'obukakafu bw'akozesezza.",
    badgeOffline: "Nga tekusibuka kw'intaneeti / Ku ky'akatambi",
    badgeRuntimeConnected: "Emikutu gyakwatagana",
    badgeRuntimeLoading: "Emikutu gikwata",
    badgeRuntimeUnavailable: "Emikutu tegiriwo",
    badgeLanguage: (name) => `Olulimi: ${name}`,
    metricDocuments: "Ebiwandiiko",
    metricLanguages: "Ennimi",
    metricExecution: "Okukolebwa",
    executionLocalOnly: "Eby'awo bwokka",
    flowLabel: "Engeri Atlas gy'addamu",
    flowSteps: [
      "Ekibuuzo",
      "Okunoonya kw'awo",
      "Obukakafu",
      "Obwesige",
      "Okukola kw'awo",
      "Eky'okuddamu ekiwandiikiddwako ensibuko",
    ],
    suggestedQuestions: [
      "Bubaka ki obulaga okubula amazzi mu mubiri?",
      "Bubaka ki obulaga omusujja gw'ensiri?",
      "Lwaki okulabirira nga tonnazaala kikulu mu kiseera ky'olubuto?",
      "Amazzi ag'okuzzaawo obutebenkevu mu mubiri (ORS) gakozesebwa ki?",
    ],
    interactionLanguageLabel: "Olulimi lw'Empuliziganya",
    emptyStateTitle: "Buuza Atlas",
    emptyStateBody:
      "Tandika n'ekibuuzo ky'obulamu ekiwagirwa ekitongole ekyateekebwaawo. Atlas alilaga obukakafu, omuwendo gw'obwesige, n'eky'okuddamu ekisembayo ekiwandiikiddwako ensibuko mu kifo kimu.",
    modelLoadingBanner:
      "Ekyokulabirako kikyakwata — okukwata okw'amazima kwapimiddwa okumala nga ssekonda 50 ku bikozesebwa by'okukulaakulanya omulamwa guno; ekiseera ku bikozesebwa by'omuzannyo tekinnapimibwa.",
    runtimeUnavailableBanner: (reason) => `Emikutu gya Atlas tegiriwo: ${reason}`,
    inputPlaceholderReady: "Buuza Atlas ekibuuzo ky'obulamu ekisinziira ku kitongole ky'awo...",
    inputPlaceholderWaiting: "Kulindirira Emikutu gy'Okukola...",
    sendLabel: "Sindika",
    disclaimer:
      "Atlas mubeezi w'amagezi g'obulamu. Tekwekenneenya ndwadde, tewandiika ddagala, era tekisikuulukanya musawo w'obulamu asaanidde.",
    questionLabel: "Ekibuuzo",
    pendingStatus:
      "Kikola okunoonya kw'awo, kipima omuwendo gw'obwesige, era kikola eky'okuddamu ekisinziira ku bukakafu…",
    atlasLabel: "Atlas",
    confidenceStrong: "Obukakafu obw'amaanyi",
    confidenceWeak: "Obukakafu obutali bwa maanyi",
    tokenStats: (tokens, tokensPerSecond) =>
      `Obubonero ${tokens} · obubonero/ssekonda ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Ebiwandiiko by'obukakafu ${count} ebiwandiikiddwako ensibuko`,
    answerDisclaimer:
      "Eby'okuddamu bikolebwa okuva mu kitongole ekyateekebwaawo era byetaaga okutegeerwa ng'obuyambi obusinziira ku bukakafu, so si kwekenneenya oba magezi ku ddagala.",
    evidenceUsedTitle: "Obukakafu Obwakozesebwa",
    retrievedChunks: (count) => `Ebitundu ${count} ebizuuliddwa`,
    licenseVerified: "Layisensi ekakasiddwa",
    localCorpus: "Ekitongole ky'Awo",
    sourcesTitle: "Ensibuko",
    retrievedOn: (date) => `kizuuliddwa ${date}`,
    refusalNoEvidenceTitle: "Tewali bukakafu obuwagira obuzuuliddwa mu kitongole ky'awo",
    refusalInsufficientTitle: "Obukakafu tebumala kukakasibwa mu kitongole ky'awo",
    refusalNoEvidenceBody:
      "Sisobodde kuzuula bukakafu obukwatagana n'ekibuuzo kino mu kitongole ky'amagezi ekyateekebwaawo. Atlas tagezaako ng'ensibuko ewagira teriiwo.",
    refusalInsufficientBody:
      "Nazuula bukakafu obutali bwa maanyi bwokka ekikwata ku kibuuzo kino. Atlas takola ky'okuddamu ky'obulamu ng'obuwagizi bw'okunoonya butali bwa maanyi nnyo.",
    refusalNoEvidenceNote:
      "Obukakafu obuliwo: tewali bumala kuwagira eky'okuddamu ekisinziira ku bukakafu.",
    refusalInsufficientNote:
      "Obukakafu obuliwo: bukwatagana kitono, tebusobola kwesigibwaako okuddamu mu bukuumi.",
    generationFailed: (message) => `Okukola kulemereddwa: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Kulindirira Emikutu gy'Okukola",
    waitingLoadingBody: "Ekitongole ky'amagezi kikwata wamu n'ekyokulabirako.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Emikutu gya Atlas tegikwataganye.",
    heroTitle: "Laba ebiwandiiko Atlas by'asobola okuwandiikako ensibuko mu mazima",
    heroSubtitle:
      "Ensibuko kitundu ky'ekintu. Buli mutwe, ekibiina, ekitundu ky'amateeka, ne layisensi ebilagiddwa wano biva mu bikwata ku kitongole ekyateekebwaawo.",
    metricLoaded: "Ebiwandiiko ebiteekeddwaawo",
    metricLicenseVerified: "Layisensi ekakasiddwa",
    metricJurisdictions: "Ebitundu by'Amateeka",
    searchPlaceholder: "Sengejja nga okozesa omutwe, ensibuko, oba ekitundu ky'amateeka...",
    documentsLoadedBadge: (count) => `Ebiwandiiko ${count} ebiteekeddwaawo`,
    provenanceNotice:
      "Atlas awandiika ensibuko okuva mu lukalala luno. Ebikwata ebitali biriwo bilekebwa nga bimu ku bugonjoofu; ekyuma tekijjuza kifo ekyo n'ebikwata ebigunjiddwa.",
    noMatchTitle: (query) => `Tewali kiwandiiko kikwatagana ne "${query}"`,
    noMatchBody:
      "Gezaako omutwe omulala, oba buuza Atlas butereevu — okunoonya kwekenneenya ebiwandiiko byonna mu kiwandiiko.",
    sourcePathLabel: "Ekkubo ly'Ensibuko",
    sourceUrlLabel: "Endagiriro ya Ensibuko",
    licenseLabel: "Layisensi",
    retrievedOn: (date) => `Kizuuliddwa ${date}`,
  },

  drugReference: {
    heroTitle: "Okunoonya eddagala okusinziira ku bukakafu",
    heroSubtitle:
      "Empapula eno enoonya butereevu mu kitongole ky'obulamu eky'awo. Tegunja mazima ku ddagala, tegaba ddagala, era tekola nga kabwatu ka famasi.",
    exampleQueries: [
      "amazzi ag'okuzzaawo obutebenkevu mu mubiri",
      "eddagala ery'okujjanjaba omusujja gw'ensiri",
      "eddagala ery'omusaayi omunene",
    ],
    searchPlaceholder:
      "Noonya eddagala, obujjanjabi, oba ekigambo ky'obusawo mu kitongole ky'awo...",
    searchButton: "Noonya obukakafu obw'awo",
    waitingTitle: "Kulindirira Emikutu gya Atlas",
    waitingLoadingBody:
      "Okunoonya obukakafu ku ddagala kujja kubaawo emisono gy'awo n'ekitongole nga bimaze okukwata.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Emikutu gya Atlas tegikwataganye.",
    noSearchTitle: "Tewali kunoonya kwabaawo",
    noSearchBody:
      "Wandiika ekigambo okwekenneenya n'amazima obukakafu obukwatagana n'eddagala Atlas b'asobola okuzuula mu kitongole ekyateekebwaawo.",
    confidenceStrong: "Obukakafu obw'okunoonya obw'amaanyi",
    confidenceWeak: "Obukakafu obw'okunoonya obutali bwa maanyi",
    confidenceNoEvidence: "Tewali bukakafu buzuuliddwa",
    matchingRecords: (count) => `Ebiwandiiko by'obukakafu ${count} ebikwatagana`,
    noEvidenceTitle: "Amawulire tegariiwo mu kitongole ky'kaakano",
    noEvidenceBody:
      "Atlas teyazuula bukakafu bw'awo obukakasiddwa ku kyetaago kino. Ekintu tekiijja kujjuza kifo ekyo n'amagezi ku ddagala agatakakasiddwa.",
    licenseVerified: "Layisensi ekakasiddwa",
    localCorpus: "Ekitongole ky'Awo",
    lexicalBadge: "Ky'ebigambo",
    semanticBadge: "Ky'amakulu",
    retrievedOn: (date) => `Kizuuliddwa ${date}`,
    scoreLabel: (score) => `Amasomo ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Kulindirira Emikutu gy'Okukola",
    waitingDisconnected: "Emikutu gya Atlas tegikwataganye.",
    heroTitle: "Okuwandiikibwa tekitegeeza kukakasibwa mu bujjuvu",
    heroSubtitle:
      "Olukalala luno bikwata bya mazima eby'ekintu. Embeera erabikira buli lulimi erindiika okwekenneenya okwapimiddwa, so si magezi g'obusuubuzi agasinziira bulambe ku kuwandiikibwa.",
    metricRegistered: "Ebiwandiikiddwa",
    metricValidated: "Okunoonya / Okukola Ebikakasiddwa",
    metricPlausible: "Obumanyirivu Obuyinzika",
    metricPartialOrInconclusive: "Ekitundu oba Ebitalaga bulambulukufu",
    banner: (validated, total) =>
      `Okuwandiikibwa mu lukalala luno bikwata by'okunnyonnyola byokka, so si magezi ku busobozi. Okugezesa okw'amazima okw'okukola ku Qwen3-4B ku lunaku 2026-08-08 kwazuula nti ennimi ${validated} ku ${total} zokka ze zivaamu ebivudde ebituufu obudde bwonna — laba olubu lw'embeera wansi okulaba ebivudde eby'amazima, ebyapimiddwa, eby'olulimi lwonna.`,
    statusLabels: {
      validated: "Bikakasiddwa",
      "plausible-fluent": "Obumanyirivu Obuyinzika",
      partial: "Ekitundu",
      inconclusive: "Tebiragibulambulukufu",
      garbled: "Byonoonefu",
      failed: "Bilemereddwa",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Kulindirira Emikutu gy'Okukola",
    waitingDisconnected: "Emikutu gya Atlas tegikwataganye.",
    heroTitle: "Endagamuntu ey'amazima ey'emikutu gy'awo",
    heroSubtitle:
      "Endabika eno erlaga ekyo Atlas kye yateekaawo n'ekyo kye yapima mu mazima mu app ya desktop. Emiwendo egitaliiwo giragibwa ng'ebitapimiddwa mu kifo ky'okujjuzibwa n'ebikwata ebigunjiddwa.",
    sectionRuntimeStatus: "Embeera y'Emikutu",
    sectionBenchmark: "Okugezesa",
    sectionHardware: "Ebyuma (eby'amazima, ebizuuliddwa mu kiseera ky'okukola)",
    sectionGenerationThroughput: "Embiro ez'Okukola",
    labelDocumentsLoaded: "Ebiwandiiko Ebiteekeddwaawo",
    labelLanguagesRegistered: "Ennimi Eziwandiikiddwa",
    labelGenerationModel: "Ekyokulabirako ky'Okukola",
    labelEmbeddingModel: "Ekyokulabirako ky'Okukiikirira",
    labelKnowledgeBase: "Ekitongole ky'Amagezi",
    labelWorkerState: "Embeera y'Omukozi",
    labelThreadCount: "Omuwendo gw'Ebifundikwa",
    labelWorkerUptime: "Ekiseera ky'Omulimu",
    labelRetrievalLatency: "Okulwawo mu Kunoonya",
    labelProcessMemory: "Okukozesa Ekijjukizo ky'Enkola",
    workerStateLoaded: "Okukola n'okukiikirira bikutte",
    workerStatePartial: "Ekitundu kikutte",
    workerUptimeSeconds: (seconds) => `ssekonda ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Kikola okwetaaga okw'amazima okw'okukola ku kyokulabirako ekiteekeddwaawo era kirangirira embiro ez'amazima, ezapimiddwa — so si nnamba egunjiddwa. Laba ${docPath} okulaba enkola ejjuvu, erina olunaku, ekozesebwa nate wano.`,
    runBenchmarkButton: "Tandika okugezesa kaakano",
    runningBenchmarkButton: "Kikola okugezesa okw'amazima…",
    labelCpu: "Ekikola (CPU)",
    labelCores: "Ebitundu bya CPU",
    labelTotalRam: "RAM Yonna",
    labelAvailableRam: "RAM Eriwo",
    labelRamTier: "Omuwendo gwa RAM Ogulondeddwa",
    physicalLogicalCores: (physical, logical) => `${physical} ez'omubiri / ${logical} ez'amagezi`,
    labelTokensPerSecond: "Obubonero / Ssekonda",
    labelGeneratedTokens: "Obubonero Obukoleddwa",
    labelTotalDuration: "Ekiseera Kyonna",
    noGenerationModel: "Tewali kyokulabirako ky'okukola ekiteekeddwaawo mu kugezesa kuno.",
    devHardwareNotice:
      "Kino kyakolebwa ku byuma by'okukulaakulanya, so si omuwendo gw'okulabirako 8GB ogw'omuzannyo — laba ekitundu ekiyitibwa “Obusobozi” eky'ekibiina ky'okugezesa kya ADTC nga tonnayogera ku nnamba zino mu biwandiiko by'okuwaayo.",
  },

  accessibility: {
    openSettings: "Ggula entekateeka z'okutuukirira",
    closeSettings: "Ggalawo entekateeka z'okutuukirira",
    panelTitle: "Okutuukirira",
    textSize: "Obunene bw'Ebiwandiiko",
    highContrast: "Enjawulo Ennene",
    reduceMotion: "Kendeeza Okutambula",
    alwaysShowFocus: "Lagira empeta y'okwesigika buli kiseera",
    resetDefaults: "Zzaayo Entekateeka Ez'obulijjo",
  },
};

export default lg;
