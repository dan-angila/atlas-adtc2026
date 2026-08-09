import type { Translations } from "../types";

const sn: Translations = {
  common: {
    notMeasured: "Hazvina kuyerwa",
    loading: "Kuri kutakura…",
    untitledSource: "Nzvimbo isina musoro",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ungwaru Hwezveutano",
    offlineOnDevice: "Kunze kwe-inhaneti / Pamudziyo",
    blurb:
      "Atlas inopindura ichishandisa uchapupu hwakatakurwa pamudziyo uyu. Inotaura zvayakashandisa uye inoramba kupindura kana isingakwanisi kusimbisa uchapupu hwakakwana.",
    disclaimer:
      "Ichi hachisi chishandiso chokuongorora chirwere kana kunyora mishonga. Atlas inoratidza ungwaru hwezveutano hunobva chete mumapepa akatakurwa.",
    runtimeLabel: "Injini Yokushanda",
  },

  nav: {
    workspace: "Nzvimbo Yebasa",
    ask: "Bvunza Atlas",
    knowledge: "Ruzivo Rwezveutano",
    drugs: "Zano Remishonga",
    languages: "Mitauro",
    runtime: "Injini Neongororo",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Magwaro ${documents} epamudziyo · Mitauro ${languages} yakanyoreswa`,
    loading: "Iri kugadzirira mamodhi epamudziyo neimba yeruzivo",
    unavailable: "Injini yedesktop inodiwa kuti Atlas ishande chaizvo",
  },

  screenTitles: {
    ask: {
      title: "Bvunza Atlas",
      subtitle:
        "Bvunza, tsvaga, taura kwazvakabva, uye ramba nokungwarira kana uchapupu hwepamudziyo husina kukwana.",
    },
    knowledge: {
      title: "Ruzivo Rwezveutano",
      subtitle: "Ongorora magwaro ezveutano chaiwo anokwanisa kutsvagwa uye kutaurwa naAtlas.",
    },
    drugs: {
      title: "Zano Remishonga",
      subtitle:
        "Ongorora uchapupu hunechekunwa nemishonga kubva muzvinyorwa zvakatakurwa pasina kuita kuti Atlas ive sisitimu yokutonga mafemesi.",
    },
    languages: {
      title: "Mitauro",
      subtitle: "Ona rondedzero yemitauro yakanyoreswa nemhedzisiro yechokwadi yakayerwa.",
    },
    runtime: {
      title: "Injini Neongororo",
      subtitle:
        "Ratidza chaizvo zita reinjini yepamudziyo, kugadzirira kwayo, uye data reongororo pasina kufunga chinhu.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas inoita mabasa ayo ese pamudziyo uyu — hakuna kufona kwe-inhaneti kunoitwa.",
    checking: "Iri kuongorora injini yokushanda…",
    modelReady: "Modhi yagadzirira",
    loadingModel: "Iri kutakura modhi…",
    unavailable: "Injini yokushanda haiwanikwe",
  },

  uiLanguage: {
    label: "Mutauro Wechiratidziro",
    unverifiedNote:
      "Zvinyorwa zvechiratidziro zvakashandurwa nemuchina, zvisati zvaongororwa nomunhu anotaura mutauro iwoyo semutauro wake wepakuzvarwa.",
  },

  askAtlas: {
    heroTitle: "Ungwaru Hwezveutano Kunze Kwe-inhaneti",
    heroSubtitle:
      "Atlas inoshanda pamudziyo, inotsvaga kubva muzvinyorwa zvezveutano zvepamudziyo, inoyera chivimbo isati yapindura, uye inotaura uchapupu hwayakashandisa.",
    badgeOffline: "Kunze kwe-inhaneti / Pamudziyo",
    badgeRuntimeConnected: "Injini yabatanidzwa",
    badgeRuntimeLoading: "Injini iri kutakura",
    badgeRuntimeUnavailable: "Injini haiwanikwe",
    badgeLanguage: (name) => `Mutauro: ${name}`,
    metricDocuments: "Magwaro",
    metricLanguages: "Mitauro",
    metricExecution: "Kuitwa",
    executionLocalOnly: "Zvepamudziyo chete",
    flowLabel: "Kuti Atlas inopindura sei",
    flowSteps: [
      "Mubvunzo",
      "Kutsvaga kwepamudziyo",
      "Uchapupu",
      "Chivimbo",
      "Kugadzirwa kwepamudziyo",
      "Mhinduro yakataurwa",
    ],
    suggestedQuestions: [
      "Ndezvipi zviratidzo zvokushaikwa kwemvura mumuviri?",
      "Ndezvipi zviratidzo zvemalaria?",
      "Nei kucherechedzwa kusati kwasununguka kuchikosha panguva yepamuviri?",
      "Mvura yokudzosera mamiriro emuviri (ORS) inoshandiswa chii?",
    ],
    interactionLanguageLabel: "Mutauro Wokutaurirana",
    emptyStateTitle: "Bvunza Atlas",
    emptyStateBody:
      "Tanga nomubvunzo wezveutano unotsigirwa nezvinyorwa zvakatakurwa. Atlas icharatidza uchapupu, chiyero chechivimbo, uye mhinduro yokupedzisira yakataurwa panzvimbo imwe chete.",
    modelLoadingBanner:
      "Modhi ichiri kutakura — kutakura chaiko kwakayerwa kuti kunotora masekondi anenge 50 pane midziyo yokusimudzira chirongwa ichi; nguva pane midziyo yemakwikwi haisati yayerwa.",
    runtimeUnavailableBanner: (reason) => `Injini yeAtlas haiwanikwe: ${reason}`,
    inputPlaceholderReady: "Bvunza Atlas mubvunzo wezveutano unobva pazvinyorwa zvepamudziyo...",
    inputPlaceholderWaiting: "Iri kumirira Injini Yokushanda...",
    sendLabel: "Tumira",
    disclaimer:
      "Atlas mubatsiri weruzivo rwezveutano. Haiongorore chirwere, haina kunyora mishonga, uye haitsivi nyanzvi yezveutano yakakodzera.",
    questionLabel: "Mubvunzo",
    pendingStatus:
      "Iri kuita kutsvaga kwepamudziyo, kuyera chiyero chechivimbo, uye kugadzira mhinduro inobva pauchapupu…",
    atlasLabel: "Atlas",
    confidenceStrong: "Uchapupu hwakasimba",
    confidenceWeak: "Uchapupu husina kusimba",
    tokenStats: (tokens, tokensPerSecond) =>
      `Matoken ${tokens} · matoken/sekondi ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Zvinyorwa zvouchapupu ${count} zvakataurwa`,
    answerDisclaimer:
      "Mhinduro dzinogadzirwa kubva muzvinyorwa zvakatakurwa uye dzinofanira kunzwisiswa sorubatsiro runobva pauchapupu, kwete kuongorora chirwere kana zano remishonga.",
    evidenceUsedTitle: "Uchapupu Hwakashandiswa",
    retrievedChunks: (count) => `Zvidimbu ${count} zvakawanikwa`,
    licenseVerified: "Rezinesi rakasimbiswa",
    localCorpus: "Zvinyorwa Zvepamudziyo",
    sourcesTitle: "Zvinobva",
    retrievedOn: (date) => `zvakawanikwa ${date}`,
    refusalNoEvidenceTitle: "Hapana uchapupu hunotsigira hwakawanikwa muzvinyorwa zvepamudziyo",
    refusalInsufficientTitle: "Uchapupu hahuna kukwana kuti husimbiswe muzvinyorwa zvepamudziyo",
    refusalNoEvidenceBody:
      "Handina kukwanisa kuwana uchapupu hunoenderana nomubvunzo uyu muimba yeruzivo yakatakurwa. Atlas haifungidzire kana pasina chinobva chinotsigira.",
    refusalInsufficientBody:
      "Ndakawana chete uchapupu husina kusimba nezvomubvunzo uyu. Atlas haigadziri mhinduro yezvokurapa kana rutsigiro rwokutsvaga rusina kusimba zvakanyanya.",
    refusalNoEvidenceNote:
      "Uchapupu huripo: hapana hwakakwana kutsigira mhinduro inobva pauchapupu.",
    refusalInsufficientNote:
      "Uchapupu huripo: hune ukama husina kusimba, hahukwanisi kuvimbwa nawo kuti hupindure zvakachengeteka.",
    generationFailed: (message) => `Kugadzira kwakundikana: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Iri Kumirira Injini Yokushanda",
    waitingLoadingBody: "Imba yeruzivo inotakura pamwe chete nemodhi.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini yeAtlas haina kubatanidzwa.",
    heroTitle: "Ongorora magwaro anokwanisa kutaurwa naAtlas chaizvo",
    heroSubtitle:
      "Kwazvakabva chikamu chechigadzirwa. Musoro wega wega, sangano, dunhu remutemo, uye rezinesi zvinoratidzwa pano zvinobva mudata rezvinyorwa zvakatakurwa.",
    metricLoaded: "Magwaro akatakurwa",
    metricLicenseVerified: "Rezinesi rakasimbiswa",
    metricJurisdictions: "Matunhu Omutemo",
    searchPlaceholder: "Sefa nomusoro, kwazvakabva, kana dunhu remutemo...",
    documentsLoadedBadge: (count) => `Magwaro ${count} akatakurwa`,
    provenanceNotice:
      "Atlas inotaura kubva muzvinyorwa izvi. Data isipo inosiiwa isina chinhu nomaune; chishandiso hachizadzisi nzvimbo iyoyo nedata rakafungidzirwa.",
    noMatchTitle: (query) => `Hapana gwaro rinoenderana no-"${query}"`,
    noMatchBody:
      "Edza mumwe musoro, kana ubvunze Atlas zvakananga — kutsvaga kunoongorora zvinyorwa zvose zvegwaro.",
    sourcePathLabel: "Nzira Yokwazvakabva",
    sourceUrlLabel: "Kero Yokwazvakabva",
    licenseLabel: "Rezinesi",
    retrievedOn: (date) => `Zvakawanikwa ${date}`,
  },

  drugReference: {
    heroTitle: "Kutsvaga mishonga kunobva pauchapupu",
    heroSubtitle:
      "Chidzoro ichi chinotsvaga zvakananga muzvinyorwa zvezveutano zvepamudziyo. Hachifungidziri zvokwadi zvemishonga, hachigoverere mishonga, uye hachishande sesisitimu yefemesi.",
    exampleQueries: [
      "mvura yokudzosera mamiriro emuviri",
      "mishonga yokurapa malaria",
      "mishonga yeropa rakawandisa",
    ],
    searchPlaceholder: "Tsvaga mushonga, kurapa, kana izwi rezvokurapa muzvinyorwa zvepamudziyo...",
    searchButton: "Tsvaga uchapupu hwepamudziyo",
    waitingTitle: "Iri Kumirira Injini yeAtlas",
    waitingLoadingBody:
      "Kutsvaga uchapupu hwemishonga kuchawanikwa kana mamodhi epamudziyo nezvinyorwa zvapedza kutakura.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini yeAtlas haina kubatanidzwa.",
    noSearchTitle: "Hapasati pava nokutsvaga",
    noSearchBody:
      "Isa izwi kuti uongorore chaizvo uchapupu hunechekunwa nemishonga hunokwanisa kuwanwa naAtlas muzvinyorwa zvakatakurwa.",
    confidenceStrong: "Uchapupu hwokutsvaga hwakasimba",
    confidenceWeak: "Uchapupu hwokutsvaga husina kusimba",
    confidenceNoEvidence: "Hapana uchapupu hwakawanikwa",
    matchingRecords: (count) => `Zvinyorwa zvouchapupu ${count} zvinoenderana`,
    noEvidenceTitle: "Ruzivo haruwanikwe muzvinyorwa zvazvino",
    noEvidenceBody:
      "Atlas haina kuwana uchapupu hwepamudziyo hwakasimbiswa hwechikumbiro ichi. Chigadzirwa hachizozadzisi nzvimbo iyoyo nezano remishonga risina kusimbiswa.",
    licenseVerified: "Rezinesi rakasimbiswa",
    localCorpus: "Zvinyorwa Zvepamudziyo",
    lexicalBadge: "Mazwi",
    semanticBadge: "Zvirevo",
    retrievedOn: (date) => `Zvakawanikwa ${date}`,
    scoreLabel: (score) => `Zvibodzwa ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Iri Kumirira Injini Yokushanda",
    waitingDisconnected: "Injini yeAtlas haina kubatanidzwa.",
    heroTitle: "Kunyoreswa hakurevi kusimbiswa zvizere",
    heroSubtitle:
      "Rondedzero iyi idata chaiyo yechigadzirwa. Mamiriro anoratidzwa pamutauro wega wega anoratidza ongororo yakayerwa, kwete chirevo chekutengeserana chinobva pakunyoreswa chete.",
    metricRegistered: "Zvakanyoreswa",
    metricValidated: "Kutsvaga / Kugadzira Zvakasimbiswa",
    metricPlausible: "Kutaura Kunogona Kuitika",
    metricPartialOrInconclusive: "Chikamu kana Zvisina Kujeka",
    banner: (validated, total) =>
      `Kunyoreswa parondedzero iyi idata rerondedzero chete, kwete chirevo chesimba. Miedzo yechaiyo yokugadzira ichipikisana neQwen3-4B nezuva ra2026-08-08 yakawana kuti mitauro ${validated} pane ${total} ndiyo chete inobudisa mhedzisiro yakarurama nguva dzose — ona koramu yemamiriro pazasi kuti uone mhedzisiro chaiyo, yakayerwa, yomutauro wega wega.`,
    statusLabels: {
      validated: "Zvakasimbiswa",
      "plausible-fluent": "Kutaura Kunogona Kuitika",
      partial: "Chikamu",
      inconclusive: "Hazvina Kujeka",
      garbled: "Zvakanganiswa",
      failed: "Zvakundikana",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Iri Kumirira Injini Yokushanda",
    waitingDisconnected: "Injini yeAtlas haina kubatanidzwa.",
    heroTitle: "Zita chairo reinjini yepamudziyo",
    heroSubtitle:
      "Chiratidzo ichi chinoratidza zvakatakurwa naAtlas uye zvaakayera chaizvo mune chishandiso chedesktop. Kukosha kusipo kunoratidzwa sekusina kuyerwa panzvimbo pekuzadzisa nedata rakafungidzirwa.",
    sectionRuntimeStatus: "Mamiriro Einjini",
    sectionBenchmark: "Ongororo Yebasa",
    sectionHardware: "Zvishandiso (chaizvo, zvakawanikwa panguva yebasa)",
    sectionGenerationThroughput: "Kukurumidza Kwokugadzira",
    labelDocumentsLoaded: "Magwaro Akatakurwa",
    labelLanguagesRegistered: "Mitauro Yakanyoreswa",
    labelGenerationModel: "Modhi Yokugadzira",
    labelEmbeddingModel: "Modhi Yomumiriri",
    labelKnowledgeBase: "Imba Yeruzivo",
    labelWorkerState: "Mamiriro Emushandi",
    labelThreadCount: "Huwandu Hwetwaini",
    labelWorkerUptime: "Nguva Yebasa",
    labelRetrievalLatency: "Kunonoka Kwokutsvaga",
    labelProcessMemory: "Kushandiswa Kwendangariro Yechirongwa",
    workerStateLoaded: "Kugadzira nomumiriri zvakatakurwa",
    workerStatePartial: "Chikamu chakatakurwa",
    workerUptimeSeconds: (seconds) => `masekondi ${seconds}`,
    benchmarkDescription: (docPath) =>
      `Inoita chikumbiro chaicho chokugadzira pamodhi yakatakurwa uye inoshuma kukurumidza chaiko, kwakayerwa — kwete nhamba yakafungidzirwa. Ona ${docPath} kuti uwane nzira izere, ine zuva, inoshandiswazve pano.`,
    runBenchmarkButton: "Tanga ongororo iye zvino",
    runningBenchmarkButton: "Iri kuita ongororo chaiyo…",
    labelCpu: "Chishandisi (CPU)",
    labelCores: "Ma-cores eCPU",
    labelTotalRam: "RAM Yose",
    labelAvailableRam: "RAM Iripo",
    labelRamTier: "Danho reRAM Rakasarudzwa",
    physicalLogicalCores: (physical, logical) => `${physical} chaidzo / ${logical} dzendangariro`,
    labelTokensPerSecond: "Matoken / Sekondi",
    labelGeneratedTokens: "Matoken Akagadzirwa",
    labelTotalDuration: "Nguva Yose",
    noGenerationModel: "Hapana modhi yokugadzira yakatakurwa yeongororo iyi.",
    devHardwareNotice:
      "Izvi zvakaitwa pazvishandiso zvokusimudzira, kwete danho rechiyero re8GB remakwikwi — ona chikamu chinonzi “Kushanda Zvakanaka” cheungano yeongororo yeADTC usati wataura nhamba idzi mumapepa okupa.",
  },

  accessibility: {
    openSettings: "Vhura zvirongwa zvokusvika nyore",
    closeSettings: "Vhara zvirongwa zvokusvika nyore",
    panelTitle: "Kusvika Nyore",
    textSize: "Saizi Yezvinyorwa",
    highContrast: "Mutsauko Mukuru",
    reduceMotion: "Deredza Kufamba",
    alwaysShowFocus: "Ratidza mhete yokutarisisa nguva dzose",
    resetDefaults: "Dzosera Zviri Pakutanga",
  },
};

export default sn;
