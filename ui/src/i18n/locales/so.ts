import type { Translations } from "../types";

const so: Translations = {
  common: {
    notMeasured: "Lama cabbirin",
    loading: "Waa la soo dejinayaa…",
    untitledSource: "Isha aan cinwaan lahayn",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Aqoonta Caafimaadka",
    offlineOnDevice: "Internet la'aan / Aaladda",
    blurb:
      "Atlas wuxuu ka jawaabaa isagoo isticmaalaya caddaynta lagu soo dejiyay aaladdan. Wuxuu xusaa waxa uu isticmaalay, wuxuuna diidaa inuu jawaabo marka uusan awoodin inuu xaqiijiyo caddayn ku filan.",
    disclaimer:
      "Kani ma aha qalab lagu baaro cudurro ama lagu qoro daawooyin. Atlas wuxuu soo bandhigayaa aqoon caafimaad oo ku salaysan dukumentiyada la soo dejiyay oo keliya.",
    runtimeLabel: "Matoorka Fulinta",
  },

  nav: {
    workspace: "Meesha Shaqada",
    ask: "Weydii Atlas",
    knowledge: "Aqoonta Caafimaadka",
    drugs: "Tixraaca Daawooyinka",
    languages: "Luqadaha",
    runtime: "Matoorka iyo Qiimaynta",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} dukumenti oo maxalli ah · ${languages} luqadood oo diiwaan gashan`,
    loading: "Waxaa la diyaarinayaa moodeelka maxalliga ah iyo kaydka aqoonta",
    unavailable: "Matoor deesktoob ah ayaa loo baahan yahay si Atlas run ahaantii u shaqeeyo",
  },

  screenTitles: {
    ask: {
      title: "Weydii Atlas",
      subtitle:
        "Weydii, raadi, tibaax, oo diidaan si taxaddar leh marka caddaynta maxalliga ah aysan ku filnayn.",
    },
    knowledge: {
      title: "Aqoonta Caafimaadka",
      subtitle:
        "Baadh dukumentiyada caafimaadka ee dhabta ah ee Atlas awoodo inuu raadiyo oo tibaaxo.",
    },
    drugs: {
      title: "Tixraaca Daawooyinka",
      subtitle:
        "Baadh caddaynta la xiriirta daawooyinka ee ka timaadda ururinta la soo dejiyay iyadoo aan Atlas laga dhigin nidaam maamulka farmasiga.",
    },
    languages: {
      title: "Luqadaha",
      subtitle:
        "Fiiri liiska luqadaha diiwaan gashan iyo natiijooyinka xaqiijinta dhabta ah ee la cabbiray.",
    },
    runtime: {
      title: "Matoorka iyo Qiimaynta",
      subtitle:
        "Muuji aqoonsiga dhabta ah ee matoorka maxalliga ah, diyaarnimadiisa, iyo xogta qiimaynta iyadoon wax la halleyn.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas wuxuu ku sameeyaa dhammaan xisaabinta aaladdan — wax wicitaan internet ah lama sameeyo.",
    checking: "Waa la baarayaa matoorka fulinta…",
    modelReady: "Moodeelku waa diyaar",
    loadingModel: "Waa la soo dejinayaa moodeelka…",
    unavailable: "Matoorka fulinta ma jiro",
  },

  uiLanguage: {
    label: "Luqadda Isku-dhafka",
    unverifiedNote:
      "Qoraal isku-dhaf oo mishiin lagu turjumay, oo aan weli hubin ku dhawaaqe hooyo ku hadal ah.",
  },

  askAtlas: {
    heroTitle: "Aqoonta Caafimaadka ee Internet la'aan",
    heroSubtitle:
      "Atlas wuxuu ku shaqeeyaa aaladda, wuxuu ka raadiyaa ururinta caafimaadka maxalliga ah, wuxuu cabbiraa heerka kalsoonida ka hor jawaabta, wuxuuna tibaaxaa caddaynta uu isticmaalay.",
    badgeOffline: "Internet la'aan / Aaladda",
    badgeRuntimeConnected: "Matoorku waa xiran yahay",
    badgeRuntimeLoading: "Matoorku waa soo dejinayaa",
    badgeRuntimeUnavailable: "Matoorku ma jiro",
    badgeLanguage: (name) => `Luqad: ${name}`,
    metricDocuments: "Dukumentiyada",
    metricLanguages: "Luqadaha",
    metricExecution: "Fulinta",
    executionLocalOnly: "Maxalli oo keliya",
    flowLabel: "Sida Atlas u jawaabo",
    flowSteps: [
      "Su'aal",
      "Raadinta maxalliga ah",
      "Caddayn",
      "Kalsooni",
      "Abuurista maxalliga ah",
      "Jawaab la tibaaxay",
    ],
    suggestedQuestions: [
      "Waa maxay calaamadaha gudka biyaha ee jirka?",
      "Waa maxay calaamadaha duumada?",
      "Maxaa daryeelka ka hor dhalmadu muhiim ugu yahay xilliga uurka?",
      "Biyaha soo celinta xaaladda jirka (ORS) maxaa loo isticmaalaa?",
    ],
    interactionLanguageLabel: "Luqadda Wada Hadalka",
    emptyStateTitle: "Weydii Atlas",
    emptyStateBody:
      "Ku bilow su'aal caafimaad oo ay taageerto ururinta la soo dejiyay. Atlas wuxuu tusi doonaa caddaynta, heerka kalsoonida, iyo jawaabta ugu dambeysa oo la tibaaxay meel keliya.",
    modelLoadingBanner:
      "Moodeelku wali wuu soo dejinayaa — soo dejinta dhabta ah waxaa la cabbiray inay qaadato ilaa 50 ilbiriqsi oo ku saabsan qalabka horumarinta ee mashruucan; wakhtiga ku saabsan qalabka tartanka weli lama cabbirin.",
    runtimeUnavailableBanner: (reason) => `Matoorka Atlas ma jiro: ${reason}`,
    inputPlaceholderReady: "Weydii Atlas su'aal caafimaad oo ku salaysan ururinta maxalliga ah...",
    inputPlaceholderWaiting: "Sugaya Matoorka Fulinta...",
    sendLabel: "Dir",
    disclaimer:
      "Atlas waa kaaliye aqoon caafimaad. Ma baaro cudurro, ma qoro daawooyin, mana beddelo khabiir caafimaad oo aqoonsan.",
    questionLabel: "Su'aal",
    pendingStatus:
      "Waxay samaynaysaa raadinta maxalliga ah, waxay cabbirtaa heerka kalsoonida, waxayna abuurtaa jawaab ku salaysan caddaynta…",
    atlasLabel: "Atlas",
    confidenceStrong: "Caddayn xoog leh",
    confidenceWeak: "Caddayn daciif ah",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} calaamado · ${tokensPerSecond.toFixed(1)} calaamo/ilbiriqsi`,
    citedRecords: (count) => `${count} diiwaan caddayn oo la tibaaxay`,
    answerDisclaimer:
      "Jawaabaha waxaa laga abuuraa ururinta la soo dejiyay, waana in loo fahmaa caawimaad ku salaysan caddayn, ma aha baaritaan cudur ama talo daawo.",
    evidenceUsedTitle: "Caddaynta La Isticmaalay",
    retrievedChunks: (count) => `${count} qayb oo la helay`,
    licenseVerified: "Ruqsadda waa la xaqiijiyay",
    localCorpus: "Ururinta Maxalliga ah",
    sourcesTitle: "Ilaha",
    retrievedOn: (date) => `waxaa la helay ${date}`,
    refusalNoEvidenceTitle: "Ma jirto caddayn taageeraysa oo laga helay ururinta maxalliga ah",
    refusalInsufficientTitle: "Caddaynta kuma filna in lagu xaqiijiyo ururinta maxalliga ah",
    refusalNoEvidenceBody:
      "Ma heli karin caddayn la xiriirta su'aashan gudaha kaydka aqoonta la soo dejiyay. Atlas ma male-awaalo marka aysan jirin il taageereysa.",
    refusalInsufficientBody:
      "Waxaan kaliya helay caddayn daciif ah oo ku saabsan su'aashan. Atlas ma abuuro jawaab caafimaad marka taageerada raadinta ay aad u daciif tahay.",
    refusalNoEvidenceNote:
      "Caddaynta jirta: mid ku filan oo taageeraysa jawaab ku salaysan caddayn ma jiro.",
    refusalInsufficientNote:
      "Caddaynta jirta: si daciif ah ayay ula xiriirtaa, lagumana kalsoonaan karo in lagu jawaabo si ammaan ah.",
    generationFailed: (message) => `Abuurista way fashilantay: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Sugaya Matoorka Fulinta",
    waitingLoadingBody: "Kaydka aqoonta ayaa la soo dejiyaa isla marka moodeelka.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Matoorka Atlas lama xirin.",
    heroTitle: "Baadh dukumentiyada Atlas run ahaantii awoodo inuu tibaaxo",
    heroSubtitle:
      "Asalka ilaha waa qayb ka mid ah alaabta. Cinwaan kasta, urur, gobol sharci, iyo ruqsad oo halkan lagu muujiyay waxay ka yimaadaan xogta ururinta la soo dejiyay.",
    metricLoaded: "Dukumentiyada la soo dejiyay",
    metricLicenseVerified: "Ruqsadda waa la xaqiijiyay",
    metricJurisdictions: "Gobollada Sharciga",
    searchPlaceholder: "Ku shaandhee cinwaanka, isha, ama gobolka sharciga...",
    documentsLoadedBadge: (count) => `${count} dukumenti oo la soo dejiyay`,
    provenanceNotice:
      "Atlas wuxuu ka tibaaxaa liiskan. Xogta maqan si ula kac ah ayaa loo daayay madhan; barta lama buuxiyo booskaas xog la abuuray.",
    noMatchTitle: (query) => `Ma jiro dukumenti la mid ah "${query}"`,
    noMatchBody:
      "Isku day cinwaan kale, ama toos u weydii Atlas — raadintu waxay baadhaa qoraalka buuxa ee dukumentiga.",
    sourcePathLabel: "Wadada Isha",
    sourceUrlLabel: "URL-ka Isha",
    licenseLabel: "Ruqsadda",
    retrievedOn: (date) => `Waxaa la helay ${date}`,
  },

  drugReference: {
    heroTitle: "Raadinta daawooyinka ee ku salaysan caddaynta",
    heroSubtitle:
      "Shaashaddan waxay si toos ah uga raadisaa ururinta caafimaadka maxalliga ah. Ma abuurto xaqiiqooyin daawo, ma qaybiso daawooyin, mana u shaqeyso sida nidaam farmasi.",
    exampleQueries: [
      "biyaha soo celinta xaaladda jirka",
      "daawooyinka daaweynta duumada",
      "daawooyinka cadaadiska dhiigga",
    ],
    searchPlaceholder: "Ka raadi daawo, daaweyn, ama erey caafimaad ururinta maxalliga ah...",
    searchButton: "Raadi caddaynta maxalliga ah",
    waitingTitle: "Sugaya Matoorka Atlas",
    waitingLoadingBody:
      "Raadinta caddaynta daawooyinka ayaa la heli doonaa marka moodeelka maxalliga ah iyo ururintu ay dhammeeyaan soo dejinta.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Matoorka Atlas lama xirin.",
    noSearchTitle: "Wali raadin ma jirto",
    noSearchBody:
      "Geli eray si aad si sax ah u baadho caddaynta la xiriirta daawooyinka ee Atlas ka heli karo ururinta la soo dejiyay.",
    confidenceStrong: "Caddayn raadin oo xoog leh",
    confidenceWeak: "Caddayn raadin oo daciif ah",
    confidenceNoEvidence: "Wax caddayn ah lama helin",
    matchingRecords: (count) => `${count} diiwaan caddayn oo is waafaqsan`,
    noEvidenceTitle: "Macluumaadku kuma jiro ururinta hadda",
    noEvidenceBody:
      "Atlas ma helin caddayn maxalli ah oo la xaqiijiyay codsigan. Alaabtu ma buuxin doonto booskaas talo daawo oo aan la xaqiijin.",
    licenseVerified: "Ruqsadda waa la xaqiijiyay",
    localCorpus: "Ururinta Maxalliga ah",
    lexicalBadge: "Erayo",
    semanticBadge: "Macnaha",
    retrievedOn: (date) => `Waxaa la helay ${date}`,
    scoreLabel: (score) => `Dhibcaha ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Sugaya Matoorka Fulinta",
    waitingDisconnected: "Matoorka Atlas lama xirin.",
    heroTitle: "Diiwaangelintu macnaheedu ma aha xaqiijin buuxda",
    heroSubtitle:
      "Liiskani waa xog dhab ah oo barnaamijku leeyahay. Xaaladda loogu muujiyay luqad kasta waxay muujinaysaa qiimeyn la cabbiray, mana aha sheegasho ganacsi oo ku salaysan diiwaangelinta kaliya.",
    metricRegistered: "Diiwaan Gashan",
    metricValidated: "Raadinta / Abuurista La Xaqiijiyay",
    metricPlausible: "Fasaaxad Suurtogal ah",
    metricPartialOrInconclusive: "Qayb ama Aan Cadeyn",
    banner: (validated, total) =>
      `Diiwaangelinta liiskan waxay tahay xog sharraxaad ah oo keliya, mana aha sheegasho awood. Tijaabooyin abuurid oo dhab ah oo lagu sameeyay Qwen3-4B taariikhda 2026-08-08 waxay ogaadeen in luqadaha ${validated} ee ${total} kaliya ay soo saaraan natiijo sax ah si joogto ah — fiiri tiirka xaaladda ee hoose si aad u aragto natiijada dhabta ah, ee la cabbiray, ee luqad kasta.`,
    statusLabels: {
      validated: "La Xaqiijiyay",
      "plausible-fluent": "Fasaaxad Suurtogal ah",
      partial: "Qayb",
      inconclusive: "Aan Cadeyn",
      garbled: "Qalday",
      failed: "Fashilantay",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Sugaya Matoorka Fulinta",
    waitingDisconnected: "Matoorka Atlas lama xirin.",
    heroTitle: "Aqoonsiga dhabta ah ee matoorka maxalliga ah",
    heroSubtitle:
      "Muuqaalkani wuxuu muujinayaa waxa Atlas run ahaantii soo dejiyay oo uu cabbiray barnaamijka deesktoobka. Qiimayaasha maqan waxaa loogu tilmaamaa mid aan la cabbirin halkii xogta la abuuray lagu buuxin lahaa.",
    sectionRuntimeStatus: "Xaaladda Matoorka",
    sectionBenchmark: "Qiimaynta",
    sectionHardware: "Qalabka (dhabta ah, ee la ogaaday wakhtiga fulinta)",
    sectionGenerationThroughput: "Xawaaraha Abuurista",
    labelDocumentsLoaded: "Dukumentiyada La Soo Dejiyay",
    labelLanguagesRegistered: "Luqadaha Diiwaan Gashan",
    labelGenerationModel: "Moodeelka Abuurista",
    labelEmbeddingModel: "Moodeelka Metelaadda",
    labelKnowledgeBase: "Kaydka Aqoonta",
    labelWorkerState: "Xaaladda Shaqaalaha",
    labelThreadCount: "Tirada Xadhkaha",
    labelWorkerUptime: "Wakhtiga Shaqada",
    labelRetrievalLatency: "Raagga Raadinta",
    labelProcessMemory: "Isticmaalka Xusuusta Habraaca",
    workerStateLoaded: "Abuurista iyo metelaadda waa la soo dejiyay",
    workerStatePartial: "Qayb ayaa la soo dejiyay",
    workerUptimeSeconds: (seconds) => `${seconds} ilbiriqsi`,
    benchmarkDescription: (docPath) =>
      `Waxay samaysaa codsi abuur oo dhab ah oo ku saabsan moodeelka la soo dejiyay waxayna soo warisaa xawaare dhab ah, oo la cabbiray — marnaba lama abuuro tiro. Fiiri ${docPath} si aad u aragto hab dhamaystiran, oo taariikh leh, oo halkan dib loogu isticmaalay.`,
    runBenchmarkButton: "Bilaa qiimeynta hadda",
    runningBenchmarkButton: "Waa la samaynayaa qiimeyn dhab ah…",
    labelCpu: "Xisaabiyaha (CPU)",
    labelCores: "Cores-ka CPU-ga",
    labelTotalRam: "Wadarta RAM-ka",
    labelAvailableRam: "RAM-ka Diyaarka Ah",
    labelRamTier: "Heerka RAM-ka La Doortay",
    physicalLogicalCores: (physical, logical) => `${physical} jireed / ${logical} caqli`,
    labelTokensPerSecond: "Calaamado / Ilbiriqsi",
    labelGeneratedTokens: "Calaamadaha La Abuuray",
    labelTotalDuration: "Wakhtiga Guud",
    noGenerationModel: "Ma jiro moodeel abuur ah oo loo soo dejiyay qiimayntan.",
    devHardwareNotice:
      "Tan waxaa lagu sameeyay qalab horumarin, mana aha heerka tixraaca 8GB ee tartanka — fiiri qaybta “Waxtarka” ee ururinta qiimaynta ADTC ka hor intaadan xusin lambarradan dukumentiyada gudbinta.",
  },

  accessibility: {
    openSettings: "Fur dejinta gaadhista",
    closeSettings: "Xir dejinta gaadhista",
    panelTitle: "Gaadhista",
    textSize: "Cabbirka Qoraalka",
    highContrast: "Kala Duwanaan Sare",
    reduceMotion: "Yaree Dhaqdhaqaaqa",
    alwaysShowFocus: "Had iyo jeer muuji giraanta diiradda",
    resetDefaults: "Ku Celi Dejinta Asalka ah",
  },
};

export default so;
