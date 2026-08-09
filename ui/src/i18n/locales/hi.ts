import type { Translations } from "../types";

const hi: Translations = {
  common: {
    notMeasured: "मापा नहीं गया",
    loading: "लोड हो रहा है…",
    untitledSource: "बिना शीर्षक स्रोत",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "स्वास्थ्य सेवा बुद्धिमत्ता",
    offlineOnDevice: "ऑफ़लाइन / डिवाइस पर",
    blurb:
      "Atlas इस मशीन पर लोड किए गए प्रमाणों के आधार पर उत्तर देता है। यह जिस स्रोत का उपयोग करता है उसका हवाला देता है, और पर्याप्त प्रमाण सत्यापित न कर पाने पर उत्तर देने से इनकार करता है।",
    disclaimer:
      "यह उपकरण निदान या उपचार निर्धारित नहीं करता। Atlas केवल लोड किए गए दस्तावेज़ों पर आधारित स्वास्थ्य जानकारी प्रस्तुत करता है।",
    runtimeLabel: "रनटाइम",
  },

  nav: {
    workspace: "कार्यक्षेत्र",
    ask: "Atlas से पूछें",
    knowledge: "चिकित्सा ज्ञान",
    drugs: "दवा संदर्भ",
    languages: "भाषाएँ",
    runtime: "रनटाइम और बेंचमार्क",
  },

  runtimeSummary: {
    ready: (documents, languages) => `${documents} स्थानीय दस्तावेज़ · ${languages} पंजीकृत भाषाएँ`,
    loading: "स्थानीय मॉडल और ज्ञान आधार तैयार किए जा रहे हैं",
    unavailable: "Atlas को वास्तव में चलाने के लिए डेस्कटॉप रनटाइम आवश्यक है",
  },

  screenTitles: {
    ask: {
      title: "Atlas से पूछें",
      subtitle:
        "प्रश्न पूछें, प्रमाण प्राप्त करें, उनका हवाला दें, और स्थानीय प्रमाण अपर्याप्त होने पर सुरक्षित रूप से मना करें।",
    },
    knowledge: {
      title: "चिकित्सा ज्ञान",
      subtitle:
        "उन वास्तविक स्वास्थ्य दस्तावेज़ों को देखें जिन्हें Atlas प्राप्त कर उद्धृत कर सकता है।",
    },
    drugs: {
      title: "दवा संदर्भ",
      subtitle: "लोड किए गए संग्रह से दवा संबंधी प्रमाण देखें, बिना Atlas को ERP प्रणाली बनाए।",
    },
    languages: {
      title: "भाषाएँ",
      subtitle:
        "पंजीकृत भाषा पैकेजों की सूची और उनके पीछे के वास्तविक मापे गए सत्यापन परिणाम देखें।",
    },
    runtime: {
      title: "रनटाइम और बेंचमार्क",
      subtitle:
        "स्थानीय रनटाइम की पहचान, तैयारी और बेंचमार्क डेटा बिना किसी मनगढ़ंत जानकारी के दिखाता है।",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas सारा अनुमान इसी डिवाइस पर करता है — कोई नेटवर्क कॉल नहीं की जाती।",
    checking: "रनटाइम की जाँच हो रही है…",
    modelReady: "मॉडल तैयार है",
    loadingModel: "मॉडल लोड हो रहा है…",
    unavailable: "रनटाइम उपलब्ध नहीं है",
  },

  uiLanguage: {
    label: "इंटरफ़ेस भाषा",
    unverifiedNote:
      "यह इंटरफ़ेस टेक्स्ट मशीन-अनुवादित है, अभी तक किसी मातृभाषी द्वारा समीक्षित नहीं है।",
  },

  askAtlas: {
    heroTitle: "ऑफ़लाइन स्वास्थ्य सेवा बुद्धिमत्ता",
    heroSubtitle:
      "Atlas डिवाइस पर ही चलता है, स्थानीय स्वास्थ्य संग्रह से जानकारी प्राप्त करता है, उत्तर देने से पहले विश्वसनीयता का आकलन करता है, और उपयोग किए गए प्रमाणों का हवाला देता है।",
    badgeOffline: "ऑफ़लाइन / डिवाइस पर",
    badgeRuntimeConnected: "रनटाइम जुड़ा हुआ है",
    badgeRuntimeLoading: "रनटाइम लोड हो रहा है",
    badgeRuntimeUnavailable: "रनटाइम उपलब्ध नहीं है",
    badgeLanguage: (name) => `भाषा: ${name}`,
    metricDocuments: "दस्तावेज़",
    metricLanguages: "भाषाएँ",
    metricExecution: "निष्पादन",
    executionLocalOnly: "केवल स्थानीय",
    flowLabel: "Atlas कैसे उत्तर देता है",
    flowSteps: [
      "प्रश्न",
      "स्थानीय पुनर्प्राप्ति",
      "प्रमाण",
      "विश्वसनीयता",
      "स्थानीय जनरेशन",
      "उद्धृत उत्तर",
    ],
    suggestedQuestions: [
      "निर्जलीकरण के लक्षण क्या हैं?",
      "मलेरिया के लक्षण क्या हैं?",
      "गर्भावस्था के दौरान प्रसवपूर्व देखभाल क्यों महत्वपूर्ण है?",
      "मौखिक पुनर्जलीकरण घोल किसलिए उपयोग होता है?",
    ],
    interactionLanguageLabel: "उत्तर की भाषा",
    emptyStateTitle: "Atlas से पूछें",
    emptyStateBody:
      "लोड किए गए संग्रह द्वारा समर्थित स्वास्थ्य प्रश्न से शुरुआत करें। Atlas प्रमाण, विश्वसनीयता और अंतिम उद्धृत उत्तर एक ही स्थान पर दिखाएगा।",
    modelLoadingBanner:
      "मॉडल अभी भी लोड हो रहा है — इस परियोजना के विकास हार्डवेयर पर वास्तविक लोडिंग में लगभग 50 सेकंड लगे हैं; प्रतियोगिता के संदर्भ हार्डवेयर पर समय अभी तक मापा नहीं गया है।",
    runtimeUnavailableBanner: (reason) => `Atlas रनटाइम उपलब्ध नहीं है: ${reason}`,
    inputPlaceholderReady: "स्थानीय संग्रह पर आधारित स्वास्थ्य प्रश्न Atlas से पूछें...",
    inputPlaceholderWaiting: "रनटाइम की प्रतीक्षा हो रही है...",
    sendLabel: "भेजें",
    disclaimer:
      "Atlas एक स्वास्थ्य ज्ञान सहायक है। यह निदान नहीं करता, उपचार निर्धारित नहीं करता, और किसी योग्य स्वास्थ्य विशेषज्ञ का स्थान नहीं लेता।",
    questionLabel: "प्रश्न",
    pendingStatus:
      "स्थानीय पुनर्प्राप्ति चल रही है, विश्वसनीयता का आकलन हो रहा है, और प्रमाण-आधारित उत्तर तैयार किया जा रहा है…",
    atlasLabel: "Atlas",
    confidenceStrong: "मजबूत प्रमाण",
    confidenceWeak: "कमज़ोर प्रमाण",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} टोकन · ${tokensPerSecond.toFixed(1)} टोकन/सेकंड`,
    citedRecords: (count) => `${count} उद्धृत प्रमाण अभिलेख`,
    answerDisclaimer:
      "उत्तर लोड किए गए संग्रह से तैयार किए जाते हैं और इन्हें निदान या उपचार सलाह के रूप में नहीं, बल्कि प्रमाण-आधारित सहायता के रूप में समझा जाना चाहिए।",
    evidenceUsedTitle: "उपयोग किए गए प्रमाण",
    retrievedChunks: (count) => `${count} प्राप्त अंश`,
    licenseVerified: "लाइसेंस सत्यापित",
    localCorpus: "स्थानीय संग्रह",
    sourcesTitle: "स्रोत",
    retrievedOn: (date) => `${date} को प्राप्त`,
    refusalNoEvidenceTitle: "स्थानीय संग्रह में कोई सहायक प्रमाण नहीं मिला",
    refusalInsufficientTitle: "स्थानीय संग्रह में प्रमाण पर्याप्त रूप से पुष्ट नहीं हैं",
    refusalNoEvidenceBody:
      "मैं लोड किए गए ज्ञान आधार में इस प्रश्न से संबंधित प्रमाण प्राप्त नहीं कर सका। जब कोई स्रोत समर्थन उपलब्ध नहीं है, तो Atlas अनुमान नहीं लगाता।",
    refusalInsufficientBody:
      "इस प्रश्न के लिए मुझे केवल कमज़ोर रूप से पुष्ट प्रमाण मिले। जब पुनर्प्राप्ति का समर्थन बहुत कमज़ोर हो, तो Atlas चिकित्सा उत्तर तैयार नहीं करता।",
    refusalNoEvidenceNote:
      "उपलब्ध प्रमाण: कोई भी प्रमाण-आधारित उत्तर देने के लिए पर्याप्त रूप से प्रासंगिक नहीं है।",
    refusalInsufficientNote:
      "उपलब्ध प्रमाण: कमज़ोर संबंध, सुरक्षित रूप से उत्तर देने के लिए पर्याप्त विश्वसनीय नहीं।",
    generationFailed: (message) => `जनरेशन विफल: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "रनटाइम की प्रतीक्षा हो रही है",
    waitingLoadingBody: "ज्ञान आधार मॉडल के साथ ही लोड होता है।",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlas रनटाइम जुड़ा हुआ नहीं है।",
    heroTitle: "उन दस्तावेज़ों को देखें जिन्हें Atlas वास्तव में उद्धृत कर सकता है",
    heroSubtitle:
      "स्रोत की पारदर्शिता इस उत्पाद का हिस्सा है। यहाँ दिखाया गया प्रत्येक शीर्षक, संगठन, क्षेत्राधिकार और लाइसेंस लोड किए गए संग्रह के मेटाडेटा से आता है।",
    metricLoaded: "लोड किए गए दस्तावेज़",
    metricLicenseVerified: "लाइसेंस सत्यापित",
    metricJurisdictions: "क्षेत्राधिकार",
    searchPlaceholder: "शीर्षक, स्रोत, या क्षेत्राधिकार के अनुसार फ़िल्टर करें...",
    documentsLoadedBadge: (count) => `${count} दस्तावेज़ लोड किए गए`,
    provenanceNotice:
      "Atlas इसी सूची से उद्धरण देता है। गायब मेटाडेटा जानबूझकर खाली छोड़ा जाता है; इंटरफ़ेस इसे बनावटी जानकारी से नहीं भरता।",
    noMatchTitle: (query) => `"${query}" से मेल खाने वाला कोई दस्तावेज़ नहीं मिला`,
    noMatchBody:
      "कोई अन्य शीर्षक आज़माएँ, या सीधे Atlas से पूछें — पुनर्प्राप्ति पूरे दस्तावेज़ पाठ में खोज करती है।",
    sourcePathLabel: "स्रोत पथ",
    sourceUrlLabel: "स्रोत URL",
    licenseLabel: "लाइसेंस",
    retrievedOn: (date) => `${date} को प्राप्त`,
  },

  drugReference: {
    heroTitle: "प्रमाण-आधारित दवा खोज",
    heroSubtitle:
      "यह स्क्रीन सीधे स्थानीय स्वास्थ्य संग्रह में खोज करती है। यह दवा संबंधी तथ्य नहीं गढ़ती, दवाएँ वितरित नहीं करती, और किसी फार्मेसी प्रणाली की तरह कार्य नहीं करती।",
    exampleQueries: ["मौखिक पुनर्जलीकरण घोल", "मलेरिया उपचार दवाएँ", "रक्तचाप की दवाएँ"],
    searchPlaceholder: "स्थानीय संग्रह में किसी दवा, उपचार, या चिकित्सा शब्द की खोज करें...",
    searchButton: "स्थानीय प्रमाण खोजें",
    waitingTitle: "Atlas रनटाइम की प्रतीक्षा हो रही है",
    waitingLoadingBody:
      "स्थानीय मॉडल और संग्रह के लोड होने के बाद दवा प्रमाण खोज उपलब्ध हो जाती है।",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlas रनटाइम जुड़ा हुआ नहीं है।",
    noSearchTitle: "अभी तक कोई खोज नहीं हुई",
    noSearchBody:
      "Atlas लोड किए गए संग्रह से जो सटीक दवा संबंधी प्रमाण प्राप्त कर सकता है, उसे देखने के लिए एक शब्द दर्ज करें।",
    confidenceStrong: "मजबूत पुनर्प्राप्ति प्रमाण",
    confidenceWeak: "कमज़ोर पुनर्प्राप्ति प्रमाण",
    confidenceNoEvidence: "कोई प्रमाण नहीं मिला",
    matchingRecords: (count) => `${count} मेल खाते प्रमाण अभिलेख`,
    noEvidenceTitle: "वर्तमान संग्रह में जानकारी उपलब्ध नहीं है",
    noEvidenceBody:
      "Atlas इस अनुरोध के लिए सत्यापित स्थानीय प्रमाण प्राप्त नहीं कर सका। उत्पाद इस कमी को असमर्थित दवा मार्गदर्शन से नहीं भरेगा।",
    licenseVerified: "लाइसेंस सत्यापित",
    localCorpus: "स्थानीय संग्रह",
    lexicalBadge: "शाब्दिक",
    semanticBadge: "अर्थपरक",
    retrievedOn: (date) => `${date} को प्राप्त`,
    scoreLabel: (score) => `स्कोर ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "रनटाइम की प्रतीक्षा हो रही है",
    waitingDisconnected: "Atlas रनटाइम जुड़ा हुआ नहीं है।",
    heroTitle: "पंजीकृत होने का अर्थ पूरी तरह सत्यापित होना नहीं है",
    heroSubtitle:
      "यह रजिस्ट्री वास्तविक एप्लिकेशन डेटा है। प्रत्येक भाषा के लिए दिखाई गई स्थिति मापे गए मूल्यांकन को दर्शाती है, न कि केवल पंजीकरण पर आधारित विपणन दावे को।",
    metricRegistered: "पंजीकृत",
    metricValidated: "पुनर्प्राप्ति / जनरेशन सत्यापित",
    metricPlausible: "प्रशंसनीय प्रवाह",
    metricPartialOrInconclusive: "आंशिक या अनिर्णायक",
    banner: (validated, total) =>
      `इस सूची में सूचीबद्ध होना केवल मेटाडेटा है, क्षमता का दावा नहीं। 2026-08-08 को Qwen3-4B पर वास्तविक जनरेशन परीक्षण में पाया गया कि ${total} में से केवल ${validated} भाषाएँ विश्वसनीय रूप से सही परिणाम देती हैं — प्रत्येक भाषा के वास्तविक, मापे गए परिणाम के लिए नीचे स्थिति कॉलम देखें।`,
    statusLabels: {
      validated: "सत्यापित",
      "plausible-fluent": "प्रशंसनीय प्रवाह",
      partial: "आंशिक",
      inconclusive: "अनिर्णायक",
      garbled: "अस्पष्ट",
      failed: "असफल",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "रनटाइम की प्रतीक्षा हो रही है",
    waitingDisconnected: "Atlas रनटाइम जुड़ा हुआ नहीं है।",
    heroTitle: "वास्तविक स्थानीय रनटाइम पहचान",
    heroSubtitle:
      "यह दृश्य दिखाता है कि Atlas ने डेस्कटॉप ऐप में वास्तव में क्या लोड किया और मापा। अनुपलब्ध मान बनावटी आँकड़ों से भरने के बजाय 'मापा नहीं गया' के रूप में दिखाए जाते हैं।",
    sectionRuntimeStatus: "रनटाइम स्थिति",
    sectionBenchmark: "बेंचमार्क",
    sectionHardware: "हार्डवेयर (वास्तविक, रन-टाइम पर पहचाना गया)",
    sectionGenerationThroughput: "जनरेशन थ्रूपुट",
    labelDocumentsLoaded: "लोड किए गए दस्तावेज़",
    labelLanguagesRegistered: "पंजीकृत भाषाएँ",
    labelGenerationModel: "जनरेशन मॉडल",
    labelEmbeddingModel: "एम्बेडिंग मॉडल",
    labelKnowledgeBase: "ज्ञान आधार",
    labelWorkerState: "वर्कर प्रोसेस की स्थिति",
    labelThreadCount: "थ्रेड संख्या",
    labelWorkerUptime: "वर्कर की सक्रिय अवधि",
    labelRetrievalLatency: "पुनर्प्राप्ति विलंबता",
    labelProcessMemory: "प्रोसेस मेमोरी उपयोग",
    workerStateLoaded: "जनरेशन और एम्बेडिंग दोनों लोड किए गए",
    workerStatePartial: "आंशिक रूप से लोड किया गया",
    workerUptimeSeconds: (seconds) => `${seconds} सेकंड`,
    benchmarkDescription: (docPath) =>
      `लोड किए गए मॉडल पर एक वास्तविक जनरेशन अनुरोध चलाता है और वास्तविक, मापा गया थ्रूपुट रिपोर्ट करता है — कभी भी बनावटी आँकड़ा नहीं। यहाँ पुनः उपयोग की गई पूर्ण, तिथि-अंकित पद्धति के लिए ${docPath} देखें।`,
    runBenchmarkButton: "अभी बेंचमार्क चलाएँ",
    runningBenchmarkButton: "वास्तविक बेंचमार्क चल रहा है…",
    labelCpu: "सीपीयू",
    labelCores: "कोर",
    labelTotalRam: "कुल RAM",
    labelAvailableRam: "उपलब्ध RAM",
    labelRamTier: "चयनित RAM स्तर",
    physicalLogicalCores: (physical, logical) => `${physical} भौतिक / ${logical} लॉजिकल`,
    labelTokensPerSecond: "टोकन / सेकंड",
    labelGeneratedTokens: "उत्पन्न टोकन",
    labelTotalDuration: "कुल अवधि",
    noGenerationModel: "इस रन के लिए कोई जनरेशन मॉडल लोड नहीं किया गया।",
    devHardwareNotice:
      "यह विकास हार्डवेयर पर चलाया गया था, प्रतियोगिता के 8GB RAM संदर्भ वर्ग पर नहीं — सबमिशन सामग्री में इन आँकड़ों का हवाला देने से पहले ADTC बेंचमार्क सुइट के 'दक्षता' अनुभाग को देखें।",
  },

  accessibility: {
    openSettings: "पहुँच-योग्यता सेटिंग्स खोलें",
    closeSettings: "पहुँच-योग्यता सेटिंग्स बंद करें",
    panelTitle: "पहुँच-योग्यता",
    textSize: "टेक्स्ट आकार",
    highContrast: "उच्च कंट्रास्ट",
    reduceMotion: "गति कम करें",
    alwaysShowFocus: "फ़ोकस रिंग हमेशा दिखाएँ",
    resetDefaults: "डिफ़ॉल्ट पर रीसेट करें",
  },
};

export default hi;
