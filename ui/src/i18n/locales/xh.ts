import type { Translations } from "../types";

const xh: Translations = {
  common: {
    notMeasured: "Akulinganiswanga",
    loading: "Iyalayisha…",
    untitledSource: "Umthombo ongenasihloko",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ubukrelekrele Bezempilo",
    offlineOnDevice: "Ngaphandle kwe-intanethi / Kwisixhobo",
    blurb:
      "I-Atlas iphendula isebenzisa ubungqina obulayishwe kwesi sixhobo. Icaphula oko ikusebenzisileyo kwaye iyala ukuphendula xa ingakwazi ukuqinisekisa ubungqina obaneleyo.",
    disclaimer:
      "Esi asisosixhobo sokuxilonga okanye sokubhala amayeza. I-Atlas ibonisa ubukrelekrele bezempilo obususelwa kuphela kumaxwebhu alayishiweyo.",
    runtimeLabel: "Injini Yokusebenza",
  },

  nav: {
    workspace: "Indawo Yomsebenzi",
    ask: "Buza i-Atlas",
    knowledge: "Ulwazi Lonyango",
    drugs: "Isalathiso Samayeza",
    languages: "Iilwimi",
    runtime: "Injini Novavanyo",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Amaxwebhu ${documents} asekhaya · Iilwimi ${languages} ezibhalisiweyo`,
    loading: "Ilungiselela iimodeli zasekhaya nesiseko solwazi",
    unavailable: "Kufuneka injini yedesktop ukuze i-Atlas isebenze ngokwenyani",
  },

  screenTitles: {
    ask: {
      title: "Buza i-Atlas",
      subtitle:
        "Buza, khangela, caphula, kwaye wale ngononophelo xa ubungqina basekhaya bungaphelele.",
    },
    knowledge: {
      title: "Ulwazi Lonyango",
      subtitle: "Jonga amaxwebhu ezempilo okwenyani i-Atlas enokuwafumana ize iwacaphule.",
    },
    drugs: {
      title: "Isalathiso Samayeza",
      subtitle:
        "Phonononga ubungqina obumalunga namayeza kuvela kwisiseko esilayishiweyo ngaphandle kokwenza i-Atlas ibe yinkqubo yolawulo lweekhemesti.",
    },
    languages: {
      title: "Iilwimi",
      subtitle:
        "Jonga uluhlu lweelwimi ezibhalisiweyo neziphumo zokuqinisekiswa zokwenyani ezilinganisiweyo.",
    },
    runtime: {
      title: "Injini Novavanyo",
      subtitle:
        "Bonisa ubuni bokwenyani benjini yasekhaya, ukulungela kwayo, nedatha yovavanyo ngaphandle kokuqamba nantoni na.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "I-Atlas yenza yonke imisebenzi yayo kwesi sixhobo — akukho monxeba we-intanethi wenziwayo.",
    checking: "Ihlola injini yokusebenza…",
    modelReady: "Imodeli ikulungele",
    loadingModel: "Ilayisha imodeli…",
    unavailable: "Injini yokusebenza ayifumaneki",
  },

  uiLanguage: {
    label: "Ulwimi Lwenxibelelwano",
    unverifiedNote:
      "Umbhalo wenxibelelwano oguqulelwe ngomatshini, ongekaphononongwa ngumthethi wolwimi lwesiqhelo.",
  },

  askAtlas: {
    heroTitle: "Ubukrelekrele Bezempilo Ngaphandle Kwe-intanethi",
    heroSubtitle:
      "I-Atlas isebenza kwisixhobo, ikhangela kwisiseko sezempilo sasekhaya, ilinganisa inqanaba lokuzithemba phambi kokuphendula, kwaye icaphula ubungqina ebisisebenzisile.",
    badgeOffline: "Ngaphandle kwe-intanethi / Kwisixhobo",
    badgeRuntimeConnected: "Injini idityanisiwe",
    badgeRuntimeLoading: "Injini iyalayisha",
    badgeRuntimeUnavailable: "Injini ayifumaneki",
    badgeLanguage: (name) => `Ulwimi: ${name}`,
    metricDocuments: "Amaxwebhu",
    metricLanguages: "Iilwimi",
    metricExecution: "Ukuphunyezwa",
    executionLocalOnly: "Yasekhaya kuphela",
    flowLabel: "Indlela i-Atlas ephendula ngayo",
    flowSteps: [
      "Umbuzo",
      "Ukukhangela kwasekhaya",
      "Ubungqina",
      "Ukuzithemba",
      "Ukudalwa kwasekhaya",
      "Impendulo ecatshuliweyo",
    ],
    suggestedQuestions: [
      "Yiziphi iimpawu zokunqongophala kwamanzi emzimbeni?",
      "Yiziphi iimpawu zeqhenqa (malaria)?",
      "Kutheni ukhathalelo lwangaphambi kokuzalwa lubalulekile ngexesha lokukhulelwa?",
      "Sisetyenziselwa ntoni amanzi okubuyisela iseyibhalensi yomzimba (ORS)?",
    ],
    interactionLanguageLabel: "Ulwimi Lwencoko",
    emptyStateTitle: "Buza i-Atlas",
    emptyStateBody:
      "Qala ngombuzo wezempilo oxhaswa sisiseko esilayishiweyo. I-Atlas iya kubonisa ubungqina, inqanaba lokuzithemba, nempendulo yokugqibela ecatshuliweyo kwindawo enye.",
    modelLoadingBanner:
      "Imodeli isalayisha — ukulayishwa kokwenyani kulinganiselwe ukuthatha imizuzwana engama-50 kwizixhobo zophuhliso lwale projekthi; ixesha kwizixhobo ezisemthethweni zokhuphiswano alikalinganiswa.",
    runtimeUnavailableBanner: (reason) => `Injini ye-Atlas ayifumaneki: ${reason}`,
    inputPlaceholderReady: "Buza i-Atlas umbuzo wezempilo oxhomekeke kwisiseko sasekhaya...",
    inputPlaceholderWaiting: "Ilinde Injini Yokusebenza...",
    sendLabel: "Thumela",
    disclaimer:
      "I-Atlas ngumncedisi wolwazi lwezempilo. Ayixiliphi, ayibhali mayeza, kwaye ayithatheli ndawo kwingcali yezempilo egunyazisiweyo.",
    questionLabel: "Umbuzo",
    pendingStatus:
      "Yenza ukukhangela kwasekhaya, ilinganisa inqanaba lokuzithemba, kwaye idala impendulo esekelwe kubungqina…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ubungqina obuqinileyo",
    confidenceWeak: "Ubungqina obubuthathaka",
    tokenStats: (tokens, tokensPerSecond) =>
      `Iitokheni ${tokens} · iitokheni/umzuzwana ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Iirekhodi zobungqina ezingu-${count} ezicatshuliweyo`,
    answerDisclaimer:
      "Iimpendulo zidalwa kwisiseko esilayishiweyo kwaye kufuneka ziqondwe njengoncedo olusekelwe kubungqina, hayi uxilongo okanye icebiso lonyango.",
    evidenceUsedTitle: "Ubungqina Obusetyenzisiweyo",
    retrievedChunks: (count) => `Iziqwenga ezingu-${count} ezifunyenweyo`,
    licenseVerified: "Ilayisensi iqinisekisiwe",
    localCorpus: "Isiseko Sasekhaya",
    sourcesTitle: "Imithombo",
    retrievedOn: (date) => `kufunyenwe ${date}`,
    refusalNoEvidenceTitle: "Akukho bungqina buxhasayo bufunyenweyo kwisiseko sasekhaya",
    refusalInsufficientTitle: "Ubungqina abanelanga ukuqinisekiswa kwisiseko sasekhaya",
    refusalNoEvidenceBody:
      "Andikwazanga ukufumana ubungqina obuhambelana nalo mbuzo kwisiseko solwazi esilayishiweyo. I-Atlas ayiqikeleli xa kungekho mthombo uxhasayo.",
    refusalInsufficientBody:
      "Ndifumene kuphela ubungqina obubuthathaka ngalo mbuzo. I-Atlas ayidali mpendulo yezonyango xa inkxaso yokukhangela ibuthathaka kakhulu.",
    refusalNoEvidenceNote:
      "Ubungqina obukhoyo: akukho baneleyo ukuxhasa impendulo esekelwe kubungqina.",
    refusalInsufficientNote:
      "Ubungqina obukhoyo: banxulumene ngobuthathaka, abukwazi ukuthenjwa ukuphendula ngokhuseleko.",
    generationFailed: (message) => `Ukudalwa akuphumelelanga: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingLoadingBody: "Isiseko solwazi silayisha kunye nemodeli.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini ye-Atlas ayidibananga.",
    heroTitle: "Jonga amaxwebhu i-Atlas enokuwacaphula ngokwenyani",
    heroSubtitle:
      "Imvelaphi yinxalenye yemveliso. Sonke isihloko, umbutho, ummandla womthetho, nelayisensi ebonisiweyo apha ivela kwidatha yesiseko esilayishiweyo.",
    metricLoaded: "Amaxwebhu alayishiweyo",
    metricLicenseVerified: "Ilayisensi iqinisekisiwe",
    metricJurisdictions: "Iimmandla Zomthetho",
    searchPlaceholder: "Hlunga ngesihloko, umthombo, okanye ummandla womthetho...",
    documentsLoadedBadge: (count) => `Amaxwebhu angu-${count} alayishiweyo`,
    provenanceNotice:
      "I-Atlas icaphula kolu luhlu. Idatha engekhoyo ishiywa ingenanto ngabom; isixhobo asizalisi elo sithuba ngedatha eqanjiweyo.",
    noMatchTitle: (query) => `Akukho xwebhu lihambelana no-"${query}"`,
    noMatchBody:
      "Zama esinye isihloko, okanye ubuze i-Atlas ngokuthe ngqo — ukukhangela kuphonononga wonke umbhalo woxwebhu.",
    sourcePathLabel: "Indlela Yomthombo",
    sourceUrlLabel: "I-URL Yomthombo",
    licenseLabel: "Ilayisensi",
    retrievedOn: (date) => `Kufunyenwe ${date}`,
  },

  drugReference: {
    heroTitle: "Ukukhangela amayeza okusekelwe kubungqina",
    heroSubtitle:
      "Esi sikrini sikhangela ngokuthe ngqo kwisiseko sezempilo sasekhaya. Asiqambi izibakala zamayeza, asisasazi mayeza, kwaye asisebenzi njengenkqubo yekhemesti.",
    exampleQueries: [
      "amanzi okubuyisela iseyibhalensi yomzimba",
      "amayeza onyango lweqhenqa",
      "amayeza oxinzelelo lwegazi",
    ],
    searchPlaceholder: "Khangela iyeza, unyango, okanye igama lonyango kwisiseko sasekhaya...",
    searchButton: "Khangela ubungqina basekhaya",
    waitingTitle: "Ilinde Injini Ye-Atlas",
    waitingLoadingBody:
      "Ukukhangela ubungqina bamayeza kuya kufumaneka xa iimodeli zasekhaya nesiseko sigqibile ukulayisha.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini ye-Atlas ayidibananga.",
    noSearchTitle: "Akukabikho khangelo",
    noSearchBody:
      "Faka igama ukuze uphononge ngokuchanekileyo ubungqina obumalunga namayeza i-Atlas enokubufumana kwisiseko esilayishiweyo.",
    confidenceStrong: "Ubungqina bokukhangela obuqinileyo",
    confidenceWeak: "Ubungqina bokukhangela obubuthathaka",
    confidenceNoEvidence: "Akukho bungqina bufunyenweyo",
    matchingRecords: (count) => `Iirekhodi zobungqina ezingu-${count} ezihambelanayo`,
    noEvidenceTitle: "Ulwazi aluveli kwisiseko sangoku",
    noEvidenceBody:
      "I-Atlas ayifumananga bungqina basekhaya obuqinisekisiweyo kwesi sicelo. Imveliso ayizukuzalisa elo sithuba ngecebiso lamayeza elingaqinisekiswanga.",
    licenseVerified: "Ilayisensi iqinisekisiwe",
    localCorpus: "Isiseko Sasekhaya",
    lexicalBadge: "Ngamagama",
    semanticBadge: "Ngentsingiselo",
    retrievedOn: (date) => `Kufunyenwe ${date}`,
    scoreLabel: (score) => `Amanqaku ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingDisconnected: "Injini ye-Atlas ayidibananga.",
    heroTitle: "Ukubhaliswa akuthethi ukuqinisekiswa ngokupheleleyo",
    heroSubtitle:
      "Olu luhlu lidatha yokwenyani yenkqubo. Imeko eboniswayo kolwimi ngalunye ibonisa uvavanyo olulinganisiweyo, hayi ibango lorhwebo elisekelwe nje ekubhalisweni.",
    metricRegistered: "Ezibhalisiweyo",
    metricValidated: "Ukukhangela / Ukudala Okuqinisekisiweyo",
    metricPlausible: "Ukuthetha ngokucothayo okunokwenzeka",
    metricPartialOrInconclusive: "Eyinxalenye okanye Engaqinisekanga",
    banner: (validated, total) =>
      `Ukubhaliswa kolu luhlu ludatha yolwazi kuphela, hayi ibango lobuchule. Uvavanyo lokudala lokwenyani ngokuchasene ne-Qwen3-4B ngomhla we-2026-08-08 lufumene ukuba iilwimi ezingu-${validated} kwezingu-${total} kuphela ezivelisa umphumela ochanekileyo ngokuqhubekayo — jonga ikholamu yemeko ngezantsi ukubona umphumela wokwenyani, olinganisiweyo, wolwimi ngalunye.`,
    statusLabels: {
      validated: "Kuqinisekisiwe",
      "plausible-fluent": "Ukuthetha ngokucothayo okunokwenzeka",
      partial: "Eyinxalenye",
      inconclusive: "Engaqinisekanga",
      garbled: "Onakalisiwe",
      failed: "Aluphumelelanga",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingDisconnected: "Injini ye-Atlas ayidibananga.",
    heroTitle: "Ubuni bokwenyani benjini yasekhaya",
    heroSubtitle:
      "Lo mbono ubonisa oko i-Atlas ikulayishileyo neyakulinganisa ngokwenyani kwinkqubo yedesktop. Amanani angekhoyo aboniswa njengokungalinganiswanga endaweni yokuzaliswa yidatha eqanjiweyo.",
    sectionRuntimeStatus: "Imeko Yenjini",
    sectionBenchmark: "Uvavanyo Lokusebenza",
    sectionHardware: "Izixhobo (zokwenyani, ezifunyenwe ngexesha lokusebenza)",
    sectionGenerationThroughput: "Isantya Sokudala",
    labelDocumentsLoaded: "Amaxwebhu Alayishiweyo",
    labelLanguagesRegistered: "Iilwimi Ezibhalisiweyo",
    labelGenerationModel: "Imodeli Yokudala",
    labelEmbeddingModel: "Imodeli Yokumela",
    labelKnowledgeBase: "Isiseko Solwazi",
    labelWorkerState: "Imeko Yomqhubi",
    labelThreadCount: "Inani Lemicu",
    labelWorkerUptime: "Ixesha Lokusebenza",
    labelRetrievalLatency: "Ukulibaziseka Kokukhangela",
    labelProcessMemory: "Ukusetyenziswa Kwenkumbulo Yenkqubo",
    workerStateLoaded: "Ukudala nokumela sekulayishiwe",
    workerStatePartial: "Kulayishwe inxalenye",
    workerUptimeSeconds: (seconds) => `imizuzwana engu-${seconds}`,
    benchmarkDescription: (docPath) =>
      `Yenza isicelo sokwenyani sokudala kwimodeli elayishiweyo kwaye ixela isantya sokwenyani, esilinganisiweyo — hayi inani eliqanjiweyo. Jonga ${docPath} ukuze ufumane inkqubo epheleleyo, enomhla, esetyenziswa kwakhona apha.`,
    runBenchmarkButton: "Qalisa uvavanyo ngoku",
    runningBenchmarkButton: "Isebenzisa uvavanyo lokwenyani…",
    labelCpu: "Umqhubi (CPU)",
    labelCores: "Ii-cores ze-CPU",
    labelTotalRam: "Isixa se-RAM",
    labelAvailableRam: "I-RAM Efumanekayo",
    labelRamTier: "Inqanaba le-RAM Elikhethiweyo",
    physicalLogicalCores: (physical, logical) =>
      `${physical} ezibonakalayo / ${logical} ngokwengqiqo`,
    labelTokensPerSecond: "Iitokheni / Umzuzwana",
    labelGeneratedTokens: "Iitokheni Ezidaliweyo",
    labelTotalDuration: "Ixesha Lonke",
    noGenerationModel: "Akukho modeli yokudala elayishiweyo kolu vavanyo.",
    devHardwareNotice:
      "Oku kwenzeke kwizixhobo zophuhliso, hayi inqanaba lesikhokelo se-8GB lokhuphiswano — jonga icandelo elithi “Ukusebenza Ngokufanelekileyo” loqokelelo lovavanyo lwe-ADTC ngaphambi kokucaphula la manani kumaxwebhu okungenisa.",
  },

  accessibility: {
    openSettings: "Vula useto lokufikelela",
    closeSettings: "Vala useto lokufikelela",
    panelTitle: "Ukufikeleleka",
    textSize: "Ubungakanani Bombhalo",
    highContrast: "Umahluko Ophezulu",
    reduceMotion: "Nciphisa Intshukumo",
    alwaysShowFocus: "Bonisa umsesane wokugxila ngamaxesha onke",
    resetDefaults: "Buyisela Kokumiselweyo",
  },
};

export default xh;
