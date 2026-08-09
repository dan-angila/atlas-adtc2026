import type { Translations } from "../types";

const am: Translations = {
  common: {
    notMeasured: "አልተለካም",
    loading: "በመጫን ላይ…",
    untitledSource: "ርዕስ የሌለው ምንጭ",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "የጤና እውቀት",
    offlineOnDevice: "ከበይነመረብ ውጭ / በመሣሪያው ላይ",
    blurb:
      "አትላስ በዚህ መሣሪያ ላይ በተጫኑ ማስረጃዎች ላይ ተመስርቶ ይመልሳል። የተጠቀመበትን ይጠቅሳል፣ በቂ ማስረጃ ማረጋገጥ ካልቻለ ደግሞ መልስ ከመስጠት ይቆጠባል።",
    disclaimer:
      "ይህ የበሽታ ምርመራ ወይም መድሃኒት የሚያዝ መሣሪያ አይደለም። አትላስ የሚያሳየው በተጫኑ ሰነዶች ላይ ብቻ የተመሰረተ የጤና እውቀትን ነው።",
    runtimeLabel: "የማስኬጃ ሞተር",
  },

  nav: {
    workspace: "የስራ ቦታ",
    ask: "አትላስን ጠይቅ",
    knowledge: "የህክምና እውቀት",
    drugs: "የመድሃኒት ማጣቀሻ",
    languages: "ቋንቋዎች",
    runtime: "ሞተር እና መለኪያ",
  },

  runtimeSummary: {
    ready: (documents, languages) => `${documents} በአካባቢ ያሉ ሰነዶች · ${languages} የተመዘገቡ ቋንቋዎች`,
    loading: "የአካባቢ ሞዴሎችን እና የእውቀት ማከማቻን በማዘጋጀት ላይ",
    unavailable: "አትላስ በትክክል እንዲሰራ የዴስክቶፕ ሞተር ያስፈልጋል",
  },

  screenTitles: {
    ask: {
      title: "አትላስን ጠይቅ",
      subtitle: "ጠይቅ፣ ፈልግ፣ ጥቀስ፣ የአካባቢ ማስረጃ በቂ ካልሆነ ደግሞ በጥንቃቄ አትቀበል።",
    },
    knowledge: {
      title: "የህክምና እውቀት",
      subtitle: "አትላስ ሊፈልጋቸው እና ሊጠቅሳቸው የሚችላቸውን እውነተኛ የጤና ሰነዶች ያስሱ።",
    },
    drugs: {
      title: "የመድሃኒት ማጣቀሻ",
      subtitle: "አትላስን የፋርማሲ አስተዳደር ስርዓት ሳያደርጉት ከተጫነው ስብስብ ጋር የተያያዙ የመድሃኒት ማስረጃዎችን ይመልከቱ።",
    },
    languages: {
      title: "ቋንቋዎች",
      subtitle: "የተመዘገቡ ቋንቋዎችን ዝርዝር እና እውነተኛ የተለኩ የማረጋገጫ ውጤቶችን ይመልከቱ።",
    },
    runtime: {
      title: "ሞተር እና መለኪያ",
      subtitle: "ምንም ሳይፈጠር የአካባቢውን ሞተር እውነተኛ ማንነት፣ ዝግጁነት እና የመለኪያ መረጃ ያሳዩ።",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "አትላስ ሁሉንም ስሌት የሚያደርገው በዚህ መሣሪያ ላይ ነው — ምንም የበይነመረብ ጥሪ አይደረግም።",
    checking: "የማስኬጃ ሞተርን በመፈተሽ ላይ…",
    modelReady: "ሞዴል ዝግጁ ነው",
    loadingModel: "ሞዴል በመጫን ላይ…",
    unavailable: "የማስኬጃ ሞተር አይገኝም",
  },

  uiLanguage: {
    label: "የገጽ ቋንቋ",
    unverifiedNote: "በማሽን የተተረጎመ የገጽ ጽሑፍ ነው፣ በአፍ መፍቻ ቋንቋ ተናጋሪ ገና አልተገመገመም።",
  },

  askAtlas: {
    heroTitle: "ከበይነመረብ ውጭ የጤና እውቀት",
    heroSubtitle:
      "አትላስ በመሣሪያው ላይ ይሰራል፣ ከአካባቢ የጤና ስብስብ ይፈልጋል፣ ከመመለስ በፊት የመተማመን ደረጃን ይለካል፣ የተጠቀመበትንም ማስረጃ ይጠቅሳል።",
    badgeOffline: "ከበይነመረብ ውጭ / በመሣሪያው ላይ",
    badgeRuntimeConnected: "ሞተር ተገናኝቷል",
    badgeRuntimeLoading: "ሞተር በመጫን ላይ",
    badgeRuntimeUnavailable: "ሞተር አይገኝም",
    badgeLanguage: (name) => `ቋንቋ: ${name}`,
    metricDocuments: "ሰነዶች",
    metricLanguages: "ቋንቋዎች",
    metricExecution: "አፈጻጸም",
    executionLocalOnly: "በአካባቢ ብቻ",
    flowLabel: "አትላስ እንዴት እንደሚመልስ",
    flowSteps: ["ጥያቄ", "የአካባቢ ፍለጋ", "ማስረጃ", "መተማመን", "የአካባቢ ማመንጨት", "የተጠቀሰ መልስ"],
    suggestedQuestions: [
      "የሰውነት ድርቀት ምልክቶች ምንድናቸው?",
      "የወባ ምልክቶች ምንድናቸው?",
      "በእርግዝና ወቅት የቅድመ ወሊድ እንክብካቤ ለምን አስፈላጊ ነው?",
      "የአፍ ውስጥ ፈሳሽ መልሶ ማቋቋሚያ (ORS) ለምን ጥቅም ላይ ይውላል?",
    ],
    interactionLanguageLabel: "የመልስ ቋንቋ",
    emptyStateTitle: "አትላስን ጠይቅ",
    emptyStateBody:
      "በተጫነው ስብስብ በሚደገፍ የጤና ጥያቄ ይጀምሩ። አትላስ ማስረጃውን፣ የመተማመን ደረጃውን እና የመጨረሻውን የተጠቀሰ መልስ በአንድ ቦታ ያሳያል።",
    modelLoadingBanner:
      "ሞዴሉ አሁንም በመጫን ላይ ነው — በዚህ ፕሮጀክት የልማት ሃርድዌር ላይ እውነተኛ የመጫኛ ጊዜዎች በግምት 50 ሰከንድ ፈጅተዋል፤ በውድድሩ ማጣቀሻ ሃርድዌር ላይ ያለው ጊዜ ገና አልተለካም።",
    runtimeUnavailableBanner: (reason) => `የአትላስ ሞተር አይገኝም: ${reason}`,
    inputPlaceholderReady: "አትላስን በአካባቢ ስብስብ ላይ የተመሰረተ የጤና ጥያቄ ይጠይቁ...",
    inputPlaceholderWaiting: "የማስኬጃ ሞተርን በመጠበቅ ላይ...",
    sendLabel: "ላክ",
    disclaimer: "አትላስ የጤና እውቀት ረዳት ነው። በሽታ አይመረምርም፣ መድሃኒት አያዝም፣ እንዲሁም ብቁ የጤና ባለሙያን አይተካም።",
    questionLabel: "ጥያቄ",
    pendingStatus: "የአካባቢ ፍለጋ በማድረግ፣ የመተማመን ደረጃን በመለካት፣ በማስረጃ ላይ የተመሰረተ መልስ በማመንጨት ላይ…",
    atlasLabel: "አትላስ",
    confidenceStrong: "ጠንካራ ማስረጃ",
    confidenceWeak: "ደካማ ማስረጃ",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} ቶከኖች · ${tokensPerSecond.toFixed(1)} ቶከን/ሰከንድ`,
    citedRecords: (count) => `${count} የተጠቀሱ የማስረጃ መዝገቦች`,
    answerDisclaimer:
      "መልሶች የሚመነጩት ከተጫነው ስብስብ ነው፣ እንደ በሽታ ምርመራ ወይም የመድሃኒት ምክር ሳይሆን በማስረጃ ላይ የተመሰረተ እገዛ ተደርገው መታየት አለባቸው።",
    evidenceUsedTitle: "ጥቅም ላይ የዋለ ማስረጃ",
    retrievedChunks: (count) => `${count} የተገኙ ቁርጥራጮች`,
    licenseVerified: "ፈቃድ ተረጋግጧል",
    localCorpus: "የአካባቢ ስብስብ",
    sourcesTitle: "ምንጮች",
    retrievedOn: (date) => `በ${date} ተገኝቷል`,
    refusalNoEvidenceTitle: "በአካባቢ ስብስብ ውስጥ የሚደግፍ ማስረጃ አልተገኘም",
    refusalInsufficientTitle: "ማስረጃ በአካባቢ ስብስብ ውስጥ ለማረጋገጥ በቂ አይደለም",
    refusalNoEvidenceBody:
      "ለዚህ ጥያቄ በተጫነው የእውቀት ማከማቻ ውስጥ ተዛማጅ ማስረጃ ማግኘት አልቻልኩም። የሚደግፍ ምንጭ በሌለበት አትላስ አይገምትም።",
    refusalInsufficientBody:
      "ለዚህ ጥያቄ ደካማ የተደገፈ ማስረጃ ብቻ አግኝቻለሁ። የፍለጋ ድጋፍ በጣም ደካማ በሚሆንበት ጊዜ አትላስ የህክምና መልስ አያመነጭም።",
    refusalNoEvidenceNote: "ያለው ማስረጃ: በማስረጃ ላይ የተመሰረተ መልስ ለመደገፍ በቂ የሆነ የለም።",
    refusalInsufficientNote: "ያለው ማስረጃ: በደካማ የተያያዘ ነው፣ በደህንነት ለመመለስ በቂ ታማኝ አይደለም።",
    generationFailed: (message) => `ማመንጨት አልተሳካም: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "የማስኬጃ ሞተርን በመጠበቅ ላይ",
    waitingLoadingBody: "የእውቀት ማከማቻ ከሞዴሉ ጋር አብሮ ይጫናል።",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "የአትላስ ሞተር አልተገናኘም።",
    heroTitle: "አትላስ በእውነት ሊጠቅሳቸው የሚችላቸውን ሰነዶች ያስሱ",
    heroSubtitle:
      "ምንጭ አመላካችነት የምርቱ አካል ነው። እዚህ የሚታየው እያንዳንዱ ርዕስ፣ ድርጅት፣ ስልጣን እና ፈቃድ ከተጫነው ስብስብ ውሂብ የመጣ ነው።",
    metricLoaded: "የተጫኑ ሰነዶች",
    metricLicenseVerified: "ፈቃድ ተረጋግጧል",
    metricJurisdictions: "ስልጣኖች",
    searchPlaceholder: "በርዕስ፣ በምንጭ ወይም በስልጣን ያጣሩ...",
    documentsLoadedBadge: (count) => `${count} የተጫኑ ሰነዶች`,
    provenanceNotice:
      "አትላስ የሚጠቅሰው ከዚህ ካታሎግ ነው። የሌለ ውሂብ ሆን ተብሎ ባዶ ተትቷል፤ ገጹ ያንን ክፍተት በተፈጠረ ውሂብ አይሞላውም።",
    noMatchTitle: (query) => `ከ"${query}" ጋር የሚዛመድ ሰነድ የለም`,
    noMatchBody: "ሌላ ርዕስ ይሞክሩ፣ ወይም በቀጥታ አትላስን ይጠይቁ — ፍለጋ ሙሉውን የሰነድ ጽሑፍ ይመረምራል።",
    sourcePathLabel: "የምንጭ መንገድ",
    sourceUrlLabel: "የምንጭ ዩአርኤል",
    licenseLabel: "ፈቃድ",
    retrievedOn: (date) => `በ${date} ተገኝቷል`,
  },

  drugReference: {
    heroTitle: "በማስረጃ ላይ የተመሰረተ የመድሃኒት ፍለጋ",
    heroSubtitle:
      "ይህ ገጽ በቀጥታ የአካባቢውን የጤና ስብስብ ይፈልጋል። የመድሃኒት እውነታዎችን አይፈጥርም፣ መድሃኒት አያከፋፍልም፣ እንደ ፋርማሲ ስርዓትም አይሰራም።",
    exampleQueries: ["የአፍ ውስጥ ፈሳሽ መልሶ ማቋቋሚያ", "የወባ ህክምና መድሃኒቶች", "የደም ግፊት መድሃኒቶች"],
    searchPlaceholder: "በአካባቢ ስብስብ ውስጥ መድሃኒት፣ ህክምና ወይም የህክምና ቃል ይፈልጉ...",
    searchButton: "የአካባቢ ማስረጃ ፈልግ",
    waitingTitle: "የአትላስ ሞተርን በመጠበቅ ላይ",
    waitingLoadingBody: "የመድሃኒት ማስረጃ ፍለጋ የአካባቢ ሞዴሎችና ስብስቡ መጫናቸውን ሲጨርሱ ይገኛል።",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "የአትላስ ሞተር አልተገናኘም።",
    noSearchTitle: "እስካሁን ፍለጋ የለም",
    noSearchBody: "አትላስ በተጫነው ስብስብ ውስጥ ሊያገኘው የሚችለውን ትክክለኛ ከመድሃኒት ጋር የተያያዘ ማስረጃ ለመመርመር ቃል ያስገቡ።",
    confidenceStrong: "ጠንካራ የፍለጋ ማስረጃ",
    confidenceWeak: "ደካማ የፍለጋ ማስረጃ",
    confidenceNoEvidence: "ምንም ማስረጃ አልተገኘም",
    matchingRecords: (count) => `${count} የሚዛመዱ የማስረጃ መዝገቦች`,
    noEvidenceTitle: "መረጃ በአሁኑ ስብስብ ውስጥ አይገኝም",
    noEvidenceBody: "አትላስ ለዚህ ጥያቄ የተረጋገጠ የአካባቢ ማስረጃ አላገኘም። ምርቱ ያንን ክፍተት ባልተረጋገጠ የመድሃኒት ምክር አይሞላውም።",
    licenseVerified: "ፈቃድ ተረጋግጧል",
    localCorpus: "የአካባቢ ስብስብ",
    lexicalBadge: "የቃል",
    semanticBadge: "የትርጉም",
    retrievedOn: (date) => `በ${date} ተገኝቷል`,
    scoreLabel: (score) => `ውጤት ${score.toFixed(3)}`,
    viewFullEvidence: "ሙሉ ማስረጃ ይመልከቱ",
    backToResults: "ወደ ውጤቶች ተመለስ",
    fullEvidenceHeading: "ሙሉ የማስረጃ ክፍል",
    sourceHeading: "ምንጭ",
    otherMatchesHeading: "በዚህ ሰነድ ውስጥ ያሉ ሌሎች ተዛማጆች",
    scopeNote:
      "አትላስ ከጫኗቸው ሰነዶች የተገኙ ክፍሎችን ያሳያል፣ የተዋቀረ የመድሃኒት ዳታቤዝ አይደለም። የመጠን መሳሪያዎች፣ የግንኙነት ሰንጠረዦች እና የመመደቢያ ኮዶች የሚታዩት በተገኘው ጽሑፍ ውስጥ ካሉ ብቻ ነው።",
  },

  languagesScreen: {
    waitingTitle: "የማስኬጃ ሞተርን በመጠበቅ ላይ",
    waitingDisconnected: "የአትላስ ሞተር አልተገናኘም።",
    heroTitle: "መመዝገብ ሙሉ በሙሉ መረጋገጥ ማለት አይደለም",
    heroSubtitle:
      "ይህ መዝገብ እውነተኛ የመተግበሪያ ውሂብ ነው። ለእያንዳንዱ ቋንቋ የሚታየው ሁኔታ ከምዝገባ ብቻ በተነሳ የንግድ ማረጋገጫ ሳይሆን የተለካ ግምገማን ያሳያል።",
    metricRegistered: "የተመዘገቡ",
    metricValidated: "የተረጋገጠ ፍለጋ / ማመንጨት",
    metricPlausible: "ሊሆን የሚችል አቀላጥፎነት",
    metricPartialOrInconclusive: "ከፊል ወይም ያልተረጋገጠ",
    banner: (validated, total) =>
      `በዚህ ዝርዝር ውስጥ መመዝገብ የመግለጫ ውሂብ ብቻ ነው፣ የችሎታ ማረጋገጫ አይደለም። በ2026-08-08 በ Qwen3-4B ላይ የተደረገ እውነተኛ የማመንጨት ሙከራ ከ${total} ቋንቋዎች ውስጥ ${validated} ቋንቋዎች ብቻ በተከታታይ ትክክለኛ ውጤት እንደሚያመነጩ አግኝቷል — ለእያንዳንዱ ቋንቋ እውነተኛ፣ የተለካ ውጤት ከታች ያለውን የሁኔታ አምድ ይመልከቱ።`,
    statusLabels: {
      validated: "ተረጋግጧል",
      "plausible-fluent": "ሊሆን የሚችል አቀላጥፎነት",
      partial: "ከፊል",
      inconclusive: "ያልተረጋገጠ",
      garbled: "የተዛባ",
      failed: "አልተሳካም",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "የማስኬጃ ሞተርን በመጠበቅ ላይ",
    waitingDisconnected: "የአትላስ ሞተር አልተገናኘም።",
    heroTitle: "እውነተኛ የአካባቢ ሞተር ማንነት",
    heroSubtitle:
      "ይህ እይታ አትላስ በዴስክቶፕ መተግበሪያው ውስጥ በእውነት የጫነውንና የለካውን ያሳያል። የጎደሉ ዋጋዎች በፈጠራ ውሂብ ከመሙላት ይልቅ እንዳልተለኩ ተጠቁመዋል።",
    sectionRuntimeStatus: "የሞተር ሁኔታ",
    sectionBenchmark: "መለኪያ",
    sectionHardware: "ሃርድዌር (እውነተኛ፣ በአሰራር ጊዜ የተገኘ)",
    sectionGenerationThroughput: "የማመንጨት ፍጥነት",
    labelDocumentsLoaded: "የተጫኑ ሰነዶች",
    labelLanguagesRegistered: "የተመዘገቡ ቋንቋዎች",
    labelGenerationModel: "የማመንጫ ሞዴል",
    labelEmbeddingModel: "የመክተቻ ሞዴል",
    labelKnowledgeBase: "የእውቀት ማከማቻ",
    labelWorkerState: "የሰራተኛ ሁኔታ",
    labelThreadCount: "የክር ብዛት",
    labelWorkerUptime: "የስራ ጊዜ",
    labelRetrievalLatency: "የፍለጋ መዘግየት",
    labelProcessMemory: "የሂደት ማህደረ ትውስታ አጠቃቀም",
    workerStateLoaded: "ማመንጨትና መክተት ተጭነዋል",
    workerStatePartial: "በከፊል ተጭኗል",
    workerUptimeSeconds: (seconds) => `${seconds} ሰከንድ`,
    benchmarkDescription: (docPath) =>
      `በተጫነው ሞዴል ላይ እውነተኛ የማመንጨት ጥያቄ ያደርጋል፣ እውነተኛ የተለካ ፍጥነትንም ያሳውቃል — በፍጹም የተፈጠረ ቁጥር አይደለም። እዚህ ጋር ዳግም ጥቅም ላይ የዋለውን ሙሉ፣ ቀን ያለው ዘዴ ለማየት ${docPath}ን ይመልከቱ።`,
    runBenchmarkButton: "አሁን መለኪያ ጀምር",
    runningBenchmarkButton: "እውነተኛ መለኪያ በማድረግ ላይ…",
    labelCpu: "ሲፒዩ",
    labelCores: "የሲፒዩ ኮሮች",
    labelTotalRam: "ጠቅላላ ራም",
    labelAvailableRam: "ያለ ራም",
    labelRamTier: "የተመረጠ የራም ደረጃ",
    physicalLogicalCores: (physical, logical) => `${physical} አካላዊ / ${logical} ሎጂካዊ`,
    labelTokensPerSecond: "ቶከን / ሰከንድ",
    labelGeneratedTokens: "የተመነጩ ቶከኖች",
    labelTotalDuration: "ጠቅላላ ጊዜ",
    noGenerationModel: "ለዚህ ሙከራ የተጫነ የማመንጫ ሞዴል የለም።",
    devHardwareNotice:
      "ይህ የተካሄደው በልማት ሃርድዌር ላይ ነው፣ በውድድሩ 8ጂቢ ማጣቀሻ ደረጃ ላይ አይደለም — እነዚህን ቁጥሮች በማቅረቢያ ሰነዶች ውስጥ ከመጥቀስዎ በፊት የADTC መለኪያ ስብስብ “ቅልጥፍና” ክፍልን ይመልከቱ።",
  },

  accessibility: {
    openSettings: "የተደራሽነት ቅንብሮችን ክፈት",
    closeSettings: "የተደራሽነት ቅንብሮችን ዝጋ",
    panelTitle: "ተደራሽነት",
    textSize: "የጽሑፍ መጠን",
    highContrast: "ከፍተኛ ንፅፅር",
    reduceMotion: "እንቅስቃሴን ቀንስ",
    alwaysShowFocus: "የትኩረት ቀለበትን ሁልጊዜ አሳይ",
    sectionReadability: "ለማንበብ ቀላል",
    sectionAssistiveTools: "የድጋፍ መሣሪያዎች",
    sectionDisplay: "ማሳያ",
    readableSpacing: "ሰፊ የንባብ ክፍተት",
    highlightLinks: "አገናኞችን አጉላ",
    bigCursor: "ትልቅ ጠቋሚ",
    readingMask: "የንባብ መመሪያ",
    readPage: "ገጹን በድምጽ አንብብ",
    stopReading: "ንባብ አቁም",
    invertColors: "ቀለማትን ግልብጥ",
    grayscale: "ግራጫማ",
    skipToContent: "ወደ ዋና ይዘት ዝለል",
    resetDefaults: "ወደ ነባሪ መልስ",
  },
};

export default am;
