import type { Translations } from "../types";

const zu: Translations = {
  common: {
    notMeasured: "Akukalinganiswa",
    loading: "Iyalayisha…",
    untitledSource: "Umthombo ongenasihloko",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Ukuhlakanipha Kwezempilo",
    offlineOnDevice: "Ngaphandle kwe-inthanethi / Kudivayisi",
    blurb:
      "I-Atlas iphendula isebenzisa ubufakazi obulayishwe kule divayisi. Icaphuna lokho ekusebenzisile futhi yenqaba ukuphendula uma ingakwazi ukuqinisekisa ubufakazi obanele.",
    disclaimer:
      "Lokhu akusona ithuluzi lokuxilonga noma ukubhala imithi. I-Atlas ivela ukuhlakanipha kwezempilo okususelwa kuphela emadokhumentini alayishiwe.",
    runtimeLabel: "Injini Yokusebenza",
  },

  nav: {
    workspace: "Indawo Yomsebenzi",
    ask: "Buza i-Atlas",
    knowledge: "Ulwazi Lwezokwelapha",
    drugs: "Isikhombo Semithi",
    languages: "Izilimi",
    runtime: "Injini Kanye Nokuhlolwa",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `Amadokhumenti ${documents} asendaweni · Izilimi ${languages} ezibhalisiwe`,
    loading: "Ilungiselela amamodeli asendaweni kanye nesizinda solwazi",
    unavailable: "Kudingeka injini yedeskithophu ukuze i-Atlas isebenze ngempela",
  },

  screenTitles: {
    ask: {
      title: "Buza i-Atlas",
      subtitle:
        "Buza, sesha, caphuna, futhi wenqabe ngokucophelela lapho ubufakazi bendawo bungenele.",
    },
    knowledge: {
      title: "Ulwazi Lwezokwelapha",
      subtitle: "Buka amadokhumenti wezempilo angempela i-Atlas engawathola futhi iwacaphune.",
    },
    drugs: {
      title: "Isikhombo Semithi",
      subtitle:
        "Hlola ubufakazi obuphathelene nemithi kusuka enqolobaneni elayishiwe ngaphandle kokwenza i-Atlas ibe uhlelo lokuphatha ikhemisi.",
    },
    languages: {
      title: "Izilimi",
      subtitle:
        "Buka uhlu lwezilimi ezibhalisiwe kanye nemiphumela yokuqinisekiswa yangempela ekalwe.",
    },
    runtime: {
      title: "Injini Kanye Nokuhlolwa",
      subtitle:
        "Veza ubunikazi obungempela benjini yasendaweni, ukulungela kwayo, nedatha yokuhlolwa ngaphandle kokusunguza noma yini.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "I-Atlas yenza yonke imisebenzi yayo kule divayisi — akukho ucingo lwe-inthanethi olwenziwayo.",
    checking: "Ihlola injini yokusebenza…",
    modelReady: "Imodeli isilungele",
    loadingModel: "Ilayisha imodeli…",
    unavailable: "Injini yokusebenza ayitholakali",
  },

  uiLanguage: {
    label: "Ulimi Lwesixhumi Sokusebenzisana",
    unverifiedNote:
      "Umbhalo wesixhumi sokusebenzisana ohunyushwe ngomshini, ongakabuyekezwa umuntu okhuluma ulimi lwakhe lomdabu.",
  },

  askAtlas: {
    heroTitle: "Ukuhlakanipha Kwezempilo Ngaphandle Kwe-inthanethi",
    heroSubtitle:
      "I-Atlas isebenza kudivayisi, isesha kusuka enqolobaneni yezempilo yasendaweni, ilinganisa izinga lokuzethemba ngaphambi kokuphendula, futhi icaphuna ubufakazi ebusebenzisile.",
    badgeOffline: "Ngaphandle kwe-inthanethi / Kudivayisi",
    badgeRuntimeConnected: "Injini ixhunyiwe",
    badgeRuntimeLoading: "Injini iyalayisha",
    badgeRuntimeUnavailable: "Injini ayitholakali",
    badgeLanguage: (name) => `Ulimi: ${name}`,
    metricDocuments: "Amadokhumenti",
    metricLanguages: "Izilimi",
    metricExecution: "Ukwenziwa",
    executionLocalOnly: "Endaweni kuphela",
    flowLabel: "Indlela i-Atlas ephendula ngayo",
    flowSteps: [
      "Umbuzo",
      "Ukusesha kwendawo",
      "Ubufakazi",
      "Ukuzethemba",
      "Ukudalwa kwendawo",
      "Impendulo ecashuniwe",
    ],
    suggestedQuestions: [
      "Yiziphi izimpawu zokushoda kwamanzi emzimbeni?",
      "Yiziphi izimpawu zesifo sommemezelo (malaria)?",
      "Kungani ukunakekelwa ngaphambi kokubeletha kubalulekile ngesikhathi sokukhulelwa?",
      "Amanzi wokubuyisela isimo somzimba (ORS) asetshenziselwa ni?",
    ],
    interactionLanguageLabel: "Ulimi Lwengxoxo",
    emptyStateTitle: "Buza i-Atlas",
    emptyStateBody:
      "Qala ngombuzo wezempilo osekelwa yinqolobane elayishiwe. I-Atlas izobonisa ubufakazi, izinga lokuzethemba, kanye nempendulo yokugcina ecashuniwe kuyona indawo eyodwa.",
    modelLoadingBanner:
      "Imodeli isalayisha — ukulayisha kwangempela kulinganiselwe ukuthatha imizuzwana engu-50 kumshini wokuthuthukisa walo mklamo; isikhathi kumshini wokuncintisana asikakalinganiswa.",
    runtimeUnavailableBanner: (reason) => `Injini ye-Atlas ayitholakali: ${reason}`,
    inputPlaceholderReady: "Buza i-Atlas umbuzo wezempilo osekelwe enqolobaneni yendawo...",
    inputPlaceholderWaiting: "Ilinde Injini Yokusebenza...",
    sendLabel: "Thumela",
    disclaimer:
      "I-Atlas ingumsizi wolwazi lwezempilo. Ayixilongi, ayibhali imithi, futhi ayithathi indawo yochwepheshe wezempilo ohlonziwe.",
    questionLabel: "Umbuzo",
    pendingStatus:
      "Yenza ukusesha kwendawo, ilinganisa izinga lokuzethemba, futhi idala impendulo esekelwe ebufakazini…",
    atlasLabel: "Atlas",
    confidenceStrong: "Ubufakazi obuqinile",
    confidenceWeak: "Ubufakazi obubuthaka",
    tokenStats: (tokens, tokensPerSecond) =>
      `Amathokheni ${tokens} · amathokheni/isekhondi ${tokensPerSecond.toFixed(1)}`,
    citedRecords: (count) => `Amarekhodi obufakazi angu-${count} acashuniwe`,
    answerDisclaimer:
      "Izimpendulo zidalwa kusuka enqolobaneni elayishiwe futhi kufanele zizwakale njengosizo olusekelwe ebufakazini, hhayi ukuxilongwa noma iseluleko sokwelashwa.",
    evidenceUsedTitle: "Ubufakazi Obusetshenzisiwe",
    retrievedChunks: (count) => `Izicucu ezingu-${count} ezitholiwe`,
    licenseVerified: "Ilayisensi iqinisekisiwe",
    localCorpus: "Inqolobane Yendawo",
    sourcesTitle: "Imithombo",
    retrievedOn: (date) => `kutholwe ${date}`,
    refusalNoEvidenceTitle: "Abukho ubufakazi obusekelayo obutholakele enqolobaneni yendawo",
    refusalInsufficientTitle: "Ubufakazi abenele ukuqinisekiswa enqolobaneni yendawo",
    refusalNoEvidenceBody:
      "Angikwazanga ukuthola ubufakazi obuhambisana nalo mbuzo esizindeni solwazi esilayishiwe. I-Atlas ayiqageli uma kungekho mthombo osekelayo.",
    refusalInsufficientBody:
      "Ngithole kuphela ubufakazi obubuthaka ngalo mbuzo. I-Atlas ayidali impendulo yezokwelapha uma ukusekelwa kokusesha kubuthaka kakhulu.",
    refusalNoEvidenceNote:
      "Ubufakazi obukhona: abukho obwanele ukusekela impendulo esekelwe ebufakazini.",
    refusalInsufficientNote:
      "Ubufakazi obukhona: buhlobene ngokubuthaka, abunakuthenjelwa ukuphendula ngokuphephile.",
    generationFailed: (message) => `Ukudalwa kwehlulekile: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingLoadingBody: "Isizinda solwazi silayisha ndawonye nemodeli.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini ye-Atlas ayixhunyiwe.",
    heroTitle: "Buka amadokhumenti i-Atlas engawacaphuna ngempela",
    heroSubtitle:
      "Umsuka uyingxenye yomkhiqizo. Sonke isihloko, inhlangano, isigaba somthetho, kanye nelayisensi eboniswe lapha kuvela kusuka kudatha yenqolobane elayishiwe.",
    metricLoaded: "Amadokhumenti alayishiwe",
    metricLicenseVerified: "Ilayisensi iqinisekisiwe",
    metricJurisdictions: "Izigaba Zomthetho",
    searchPlaceholder: "Hlunga ngesihloko, umthombo, noma isigaba somthetho...",
    documentsLoadedBadge: (count) => `Amadokhumenti angu-${count} alayishiwe`,
    provenanceNotice:
      "I-Atlas icaphuna kusuka kulolu hlu. Idatha engekho ishiywa ingenalutho ngamabomu; isixhumi asigcwalisi leyo ndawo ngedatha esunguziwe.",
    noMatchTitle: (query) => `Alikho idokhumenti elihambisana no-"${query}"`,
    noMatchBody:
      "Zama esinye isihloko, noma ubuze i-Atlas ngokuqondile — ukusesha kuhlola wonke umbhalo wedokhumenti.",
    sourcePathLabel: "Indlela Yomthombo",
    sourceUrlLabel: "I-URL Yomthombo",
    licenseLabel: "Ilayisensi",
    retrievedOn: (date) => `Kutholwe ${date}`,
  },

  drugReference: {
    heroTitle: "Ukusesha imithi okusekelwe ebufakazini",
    heroSubtitle:
      "Lesi sikrini sisesha ngokuqondile enqolobaneni yezempilo yasendaweni. Asisunguzi amaqiniso emithi, asisabalalisi imithi, futhi asisebenzi njengohlelo lwekhemisi.",
    exampleQueries: [
      "amanzi wokubuyisela isimo somzimba",
      "imithi yokwelapha isifo sommemezelo",
      "imithi yomfutho wegazi",
    ],
    searchPlaceholder: "Sesha umuthi, ukwelashwa, noma igama lezokwelapha enqolobaneni yendawo...",
    searchButton: "Sesha ubufakazi bendawo",
    waitingTitle: "Ilinde Injini Ye-Atlas",
    waitingLoadingBody:
      "Ukusesha ubufakazi bemithi kuzotholakala uma amamodeli asendaweni kanye nenqolobane sebeqedile ukulayisha.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Injini ye-Atlas ayixhunyiwe.",
    noSearchTitle: "Akukabi khona ukusesha",
    noSearchBody:
      "Faka igama ukuze uhlole ngokunembile ubufakazi obuphathelene nemithi i-Atlas engabuthola enqolobaneni elayishiwe.",
    confidenceStrong: "Ubufakazi bokusesha obuqinile",
    confidenceWeak: "Ubufakazi bokusesha obubuthaka",
    confidenceNoEvidence: "Abukho ubufakazi obutholiwe",
    matchingRecords: (count) => `Amarekhodi obufakazi angu-${count} ahambisanayo`,
    noEvidenceTitle: "Ulwazi aluveli enqolobaneni yamanje",
    noEvidenceBody:
      "I-Atlas ayitholanga ubufakazi bendawo obuqinisekisiwe balesi sicelo. Umkhiqizo ngeke ugcwalise leyo gebe ngeseluleko semithi esingaqinisekisiwe.",
    licenseVerified: "Ilayisensi iqinisekisiwe",
    localCorpus: "Inqolobane Yendawo",
    lexicalBadge: "Ngamagama",
    semanticBadge: "Ngencazelo",
    retrievedOn: (date) => `Kutholwe ${date}`,
    scoreLabel: (score) => `Amaphuzu ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingDisconnected: "Injini ye-Atlas ayixhunyiwe.",
    heroTitle: "Ukubhaliswa akusho ukuqinisekiswa ngokuphelele",
    heroSubtitle:
      "Lolu hlu iyidatha yangempela yohlelo lokusebenza. Isimo esiboniswa kulimi ngalunye sibonisa ukuhlolwa okulinganisiwe, hhayi isimangalo sezentengiselwano esisekelwe nje ekubhalisweni.",
    metricRegistered: "Ezibhalisiwe",
    metricValidated: "Ukusesha / Ukudala Okuqinisekisiwe",
    metricPlausible: "Ukukhuluma okucabangelwe ukuthi kungenzeka",
    metricPartialOrInconclusive: "Okuyingxenye noma Okungaqiniseki",
    banner: (validated, total) =>
      `Ukubhaliswa kulolu hlu kuyidatha yolwazi kuphela, hhayi isimangalo samakhono. Ukuhlolwa kwangempela kokudalwa mayelana ne-Qwen3-4B ngomhla ka-2026-08-08 kuthole ukuthi izilimi ezingu-${validated} kuphela kwezingu-${total} ezikhiqiza umphumela oqondile ngokuqhubekayo — bheka ikholomu yesimo ngezansi ukuze ubone umphumela wangempela, olinganisiwe, walulimi ngalunye.`,
    statusLabels: {
      validated: "Kuqinisekisiwe",
      "plausible-fluent": "Ukukhuluma okucabangelwe ukuthi kungenzeka",
      partial: "Ingxenye",
      inconclusive: "Akuqiniseki",
      garbled: "Konakalisiwe",
      failed: "Kwehlulekile",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Ilinde Injini Yokusebenza",
    waitingDisconnected: "Injini ye-Atlas ayixhunyiwe.",
    heroTitle: "Ubunikazi bangempela benjini yendawo",
    heroSubtitle:
      "Lo mbono ubonisa lokho i-Atlas ekulayishile futhi yakulinganisa ngempela ohlelweni lwedeskithophu. Amanani angekho aboniswa njengokungakalinganiswa esikhundleni sokugcwaliswa ngedatha esunguziwe.",
    sectionRuntimeStatus: "Isimo Senjini",
    sectionBenchmark: "Ukuhlolwa Kokusebenza",
    sectionHardware: "Izingxenyekazi (zangempela, ezitholwe ngesikhathi sokusebenza)",
    sectionGenerationThroughput: "Isivinini Sokudala",
    labelDocumentsLoaded: "Amadokhumenti Alayishiwe",
    labelLanguagesRegistered: "Izilimi Ezibhalisiwe",
    labelGenerationModel: "Imodeli Yokudala",
    labelEmbeddingModel: "Imodeli Yokumela",
    labelKnowledgeBase: "Isizinda Solwazi",
    labelWorkerState: "Isimo Sesisebenzi",
    labelThreadCount: "Inani Lezinhlanga",
    labelWorkerUptime: "Isikhathi Sokusebenza",
    labelRetrievalLatency: "Ukubambezeleka Kokusesha",
    labelProcessMemory: "Ukusetshenziswa Kwememori Yenqubo",
    workerStateLoaded: "Ukudala kanye nokumela sekulayishiwe",
    workerStatePartial: "Kulayishwe ingxenye",
    workerUptimeSeconds: (seconds) => `imizuzwana engu-${seconds}`,
    benchmarkDescription: (docPath) =>
      `Yenza isicelo sangempela sokudala kumodeli elayishiwe futhi ibike isivinini sangempela, esilinganisiwe — akulona inombolo esunguziwe. Bheka ${docPath} ukuze uthole indlela ephelele, enosuku, esetshenziswa kabusha lapha.`,
    runBenchmarkButton: "Qala ukuhlolwa manje",
    runningBenchmarkButton: "Isebenzisa ukuhlolwa kwangempela…",
    labelCpu: "Isishuklulisi (CPU)",
    labelCores: "Ama-cores e-CPU",
    labelTotalRam: "Isamba se-RAM",
    labelAvailableRam: "I-RAM Etholakalayo",
    labelRamTier: "Izinga le-RAM Elikhethiwe",
    physicalLogicalCores: (physical, logical) =>
      `${physical} ezibonakalayo / ${logical} ngokwengqondo`,
    labelTokensPerSecond: "Amathokheni / Isekhondi",
    labelGeneratedTokens: "Amathokheni Adaliwe",
    labelTotalDuration: "Isikhathi Esiphelele",
    noGenerationModel: "Ayikho imodeli yokudala elayishwe kulokhu kuhlolwa.",
    devHardwareNotice:
      "Lokhu kwenzeke ku-hadiwe yokuthuthukisa, hhayi izinga lokubhekisela le-8GB yomqhudelwano — bheka isigaba esithi “Ukusebenza Ngempumelelo” soqoqo lokuhlolwa lwe-ADTC ngaphambi kokucaphuna lezi zinombolo emibhalweni yokuthumela.",
  },

  accessibility: {
    openSettings: "Vula izilungiselelo zokufinyeleleka",
    closeSettings: "Vala izilungiselelo zokufinyeleleka",
    panelTitle: "Ukufinyeleleka",
    textSize: "Usayizi Wombhalo",
    highContrast: "Umehluko Ophezulu",
    reduceMotion: "Nciphisa Ukunyakaza",
    alwaysShowFocus: "Njalo bonisa indandatho yokugxila",
    resetDefaults: "Setha Kabusha Okuzenzakalelayo",
  },
};

export default zu;
