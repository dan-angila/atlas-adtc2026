import type { Translations } from "../types";

const ar: Translations = {
  common: {
    notMeasured: "لم يُقاس",
    loading: "جارٍ التحميل…",
    untitledSource: "مصدر بلا عنوان",
  },

  brand: {
    name: "بريكس أطلس",
    tagline: "ذكاء الرعاية الصحية",
    offlineOnDevice: "دون اتصال / على الجهاز",
    blurb:
      "يجيب أطلس اعتمادًا على الأدلة المحمّلة على هذا الجهاز. يستشهد بما استخدمه، ويرفض الإجابة عندما لا يستطيع التحقق من أدلة كافية.",
    disclaimer:
      "هذه الأداة ليست وسيلة تشخيص أو وصف علاج. يقدّم أطلس معلومات صحية مستندة فقط إلى المستندات المحمّلة.",
    runtimeLabel: "بيئة التشغيل",
  },

  nav: {
    workspace: "مساحة العمل",
    ask: "اسأل أطلس",
    knowledge: "المعرفة الطبية",
    drugs: "مرجع الأدوية",
    languages: "اللغات",
    runtime: "بيئة التشغيل والأداء",
  },

  runtimeSummary: {
    ready: (documents, languages) => `${documents} مستندًا محليًا · ${languages} لغة مسجّلة`,
    loading: "جارٍ تجهيز النماذج المحلية وقاعدة المعرفة",
    unavailable: "يلزم تشغيل تطبيق سطح المكتب لتفعيل أطلس فعليًا",
  },

  screenTitles: {
    ask: {
      title: "اسأل أطلس",
      subtitle: "اسأل، استرجع الأدلة، استشهد بها، وارفض بأمان عندما لا تكفي الأدلة المحلية.",
    },
    knowledge: {
      title: "المعرفة الطبية",
      subtitle: "تصفّح المستندات الصحية الحقيقية التي يمكن لأطلس استرجاعها والاستشهاد بها.",
    },
    drugs: {
      title: "مرجع الأدوية",
      subtitle:
        "اطّلع على الأدلة المتعلقة بالأدوية من المجموعة المحمّلة دون تحويل أطلس إلى نظام صيدلي.",
    },
    languages: {
      title: "اللغات",
      subtitle: "اطّلع على قائمة حزم اللغات المسجّلة ونتائج التحقق الفعلية المقاسة وراءها.",
    },
    runtime: {
      title: "بيئة التشغيل والأداء",
      subtitle: "يعرض هوية بيئة التشغيل المحلية وجاهزيتها وبيانات الأداء دون أي تلفيق.",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "يُجري أطلس كل عمليات الاستدلال على هذا الجهاز — لا يُرسل أي طلب عبر الشبكة.",
    checking: "جارٍ التحقق من بيئة التشغيل…",
    modelReady: "النموذج جاهز",
    loadingModel: "جارٍ تحميل النموذج…",
    unavailable: "بيئة التشغيل غير متاحة",
  },

  uiLanguage: {
    label: "لغة الواجهة",
    unverifiedNote: "نص الواجهة مترجم آليًا، ولم تتم مراجعته بعد من متحدث أصلي.",
  },

  askAtlas: {
    heroTitle: "ذكاء الرعاية الصحية دون اتصال",
    heroSubtitle:
      "يعمل أطلس على الجهاز مباشرة، ويسترجع المعلومات من مجموعة المستندات الصحية المحلية، ويقيّم مستوى الثقة قبل الإجابة، ويستشهد بالأدلة التي استخدمها.",
    badgeOffline: "دون اتصال / على الجهاز",
    badgeRuntimeConnected: "بيئة التشغيل متصلة",
    badgeRuntimeLoading: "جارٍ تحميل بيئة التشغيل",
    badgeRuntimeUnavailable: "بيئة التشغيل غير متاحة",
    badgeLanguage: (name) => `اللغة: ${name}`,
    metricDocuments: "المستندات",
    metricLanguages: "اللغات",
    metricExecution: "التنفيذ",
    executionLocalOnly: "محلي فقط",
    flowLabel: "كيف يجيب أطلس",
    flowSteps: ["السؤال", "الاسترجاع المحلي", "الأدلة", "الثقة", "التوليد المحلي", "إجابة موثّقة"],
    suggestedQuestions: [
      "ما علامات الجفاف؟",
      "ما أعراض الملاريا؟",
      "لماذا تُعد الرعاية السابقة للولادة مهمة أثناء الحمل؟",
      "ما استخدام محلول الإماهة الفموية؟",
    ],
    interactionLanguageLabel: "لغة الإجابة",
    emptyStateTitle: "اسأل أطلس",
    emptyStateBody:
      "ابدأ بسؤال صحي مدعوم بالمجموعة المحمّلة. سيعرض أطلس الأدلة ومستوى الثقة والإجابة الموثّقة النهائية في مكان واحد.",
    modelLoadingBanner:
      "لا يزال النموذج قيد التحميل — استغرقت عمليات التحميل الفعلية نحو 50 ثانية على أجهزة تطوير هذا المشروع؛ لم يُقاس الوقت بعد على أجهزة المنافسة المرجعية.",
    runtimeUnavailableBanner: (reason) => `بيئة تشغيل أطلس غير متاحة: ${reason}`,
    inputPlaceholderReady: "اطرح على أطلس سؤالًا صحيًا مستندًا إلى المجموعة المحلية...",
    inputPlaceholderWaiting: "بانتظار بيئة التشغيل...",
    sendLabel: "إرسال",
    disclaimer:
      "أطلس مساعد معرفي صحي. لا يشخّص الحالات، ولا يصف العلاج، ولا يحل محل أخصائي رعاية صحية مؤهل.",
    questionLabel: "السؤال",
    pendingStatus: "جارٍ الاسترجاع المحلي وتقييم مستوى الثقة وتوليد إجابة مستندة إلى أدلة…",
    atlasLabel: "أطلس",
    confidenceStrong: "أدلة قوية",
    confidenceWeak: "أدلة ضعيفة",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} رمزًا · ${tokensPerSecond.toFixed(1)} رمز/ثانية`,
    citedRecords: (count) => `${count} سجل أدلة مُستشهد به`,
    answerDisclaimer:
      "الإجابات مولَّدة من المجموعة المحمّلة ويجب فهمها كمساعدة مستندة إلى أدلة، لا كتشخيص أو وصفة علاجية.",
    evidenceUsedTitle: "الأدلة المستخدمة",
    retrievedChunks: (count) => `${count} مقطعًا مسترجعًا`,
    licenseVerified: "الترخيص موثّق",
    localCorpus: "مجموعة محلية",
    sourcesTitle: "المصادر",
    retrievedOn: (date) => `استُرجع بتاريخ ${date}`,
    refusalNoEvidenceTitle: "لم يُعثر على أدلة داعمة في المجموعة المحلية",
    refusalInsufficientTitle: "الأدلة الموثّقة في المجموعة المحلية غير كافية",
    refusalNoEvidenceBody:
      "لم أتمكن من استرجاع أدلة ذات صلة بهذا السؤال من قاعدة المعرفة المحمّلة. لن يخمّن أطلس عندما لا يوجد دعم من مصدر.",
    refusalInsufficientBody:
      "لم أسترجع لهذا السؤال سوى أدلة ضعيفة الدعم. لن يولّد أطلس إجابة طبية عندما يكون دعم الاسترجاع ضعيفًا جدًا.",
    refusalNoEvidenceNote: "الأدلة المتاحة: لا يوجد ما يكفي منها لدعم إجابة موثّقة.",
    refusalInsufficientNote: "الأدلة المتاحة: ذات صلة ضعيفة، وغير موثوقة بما يكفي للإجابة بأمان.",
    generationFailed: (message) => `فشل التوليد: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "بانتظار بيئة التشغيل",
    waitingLoadingBody: "تُحمَّل قاعدة المعرفة مع النموذج.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "بيئة تشغيل أطلس غير متصلة.",
    heroTitle: "تصفّح المستندات التي يمكن لأطلس الاستشهاد بها فعليًا",
    heroSubtitle:
      "التوثيق جزء من المنتج. كل عنوان ومؤسسة وولاية قضائية وترخيص معروض هنا مصدره بيانات المجموعة المحمّلة الوصفية.",
    metricLoaded: "المستندات المحمّلة",
    metricLicenseVerified: "الترخيص موثّق",
    metricJurisdictions: "الولايات القضائية",
    searchPlaceholder: "تصفية حسب العنوان أو المصدر أو الولاية القضائية...",
    documentsLoadedBadge: (count) => `${count} مستند محمَّل`,
    provenanceNotice:
      "يستشهد أطلس من هذا الفهرس. تُترك البيانات الوصفية الناقصة فارغة عمدًا؛ لا تملأ الواجهة الفجوات ببيانات وهمية.",
    noMatchTitle: (query) => `لا توجد مستندات مطابقة لـ "${query}"`,
    noMatchBody: "جرّب عنوانًا آخر، أو اسأل أطلس مباشرة — يبحث الاسترجاع في نص المستندات الكامل.",
    sourcePathLabel: "مسار المصدر",
    sourceUrlLabel: "رابط المصدر",
    licenseLabel: "الترخيص",
    retrievedOn: (date) => `استُرجع بتاريخ ${date}`,
  },

  drugReference: {
    heroTitle: "بحث عن الأدوية قائم على الأدلة",
    heroSubtitle:
      "تبحث هذه الشاشة مباشرة في مجموعة المستندات الصحية المحلية. لا تختلق حقائق عن الأدوية، ولا تصرفها، ولا تعمل كنظام صيدلي.",
    exampleQueries: ["محلول الإماهة الفموية", "أدوية علاج الملاريا", "أدوية ضغط الدم"],
    searchPlaceholder: "ابحث في المجموعة المحلية عن دواء أو علاج أو مصطلح دوائي...",
    searchButton: "البحث في الأدلة المحلية",
    waitingTitle: "بانتظار بيئة تشغيل أطلس",
    waitingLoadingBody:
      "يصبح البحث عن أدلة الأدوية متاحًا بعد اكتمال تحميل النماذج المحلية والمجموعة.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "بيئة تشغيل أطلس غير متصلة.",
    noSearchTitle: "لا يوجد بحث بعد",
    noSearchBody:
      "أدخل مصطلحًا لفحص الأدلة الدقيقة المتعلقة بالأدوية التي يمكن لأطلس استرجاعها من المجموعة المحمّلة.",
    confidenceStrong: "أدلة استرجاع قوية",
    confidenceWeak: "أدلة استرجاع ضعيفة",
    confidenceNoEvidence: "لم يُعثر على أدلة",
    matchingRecords: (count) => `${count} سجل أدلة مطابق`,
    noEvidenceTitle: "المعلومة غير متوفرة في المجموعة الحالية",
    noEvidenceBody:
      "لم يسترجع أطلس أدلة محلية موثّقة لهذا الطلب. لن يملأ المنتج هذه الفجوة بإرشادات دوائية غير مدعومة.",
    licenseVerified: "الترخيص موثّق",
    localCorpus: "مجموعة محلية",
    lexicalBadge: "لفظي",
    semanticBadge: "دلالي",
    retrievedOn: (date) => `استُرجع بتاريخ ${date}`,
    scoreLabel: (score) => `النتيجة ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "بانتظار بيئة التشغيل",
    waitingDisconnected: "بيئة تشغيل أطلس غير متصلة.",
    heroTitle: "التسجيل لا يعني التحقق الكامل",
    heroSubtitle:
      "هذا السجل بيانات تطبيق حقيقية. تعكس الحالة المعروضة لكل لغة تقييمًا مقاسًا فعليًا، لا ادعاءً تسويقيًا مبنيًا على مجرد التسجيل.",
    metricRegistered: "المسجَّلة",
    metricValidated: "تم التحقق من الاسترجاع/التوليد",
    metricPlausible: "طلاقة محتملة",
    metricPartialOrInconclusive: "جزئية أو غير حاسمة",
    banner: (validated, total) =>
      `التسجيل في هذه القائمة بيانات وصفية فقط، وليس ادعاء قدرة. أظهر اختبار التوليد الفعلي على نموذج Qwen3-4B بتاريخ 2026-08-08 أن ${validated} فقط من أصل ${total} لغة تنتج مخرجات موثوقة — راجع عمود الحالة أدناه للنتيجة الفعلية المقاسة لكل لغة.`,
    statusLabels: {
      validated: "تم التحقق",
      "plausible-fluent": "طلاقة محتملة",
      partial: "جزئي",
      inconclusive: "غير حاسم",
      garbled: "غير مفهوم",
      failed: "فشل",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "بانتظار بيئة التشغيل",
    waitingDisconnected: "بيئة تشغيل أطلس غير متصلة.",
    heroTitle: "الهوية الفعلية لبيئة التشغيل المحلية",
    heroSubtitle:
      "تعرض هذه الشاشة ما حمّله أطلس وقاسه فعليًا في تطبيق سطح المكتب. تُعرَض القيم الناقصة كـ«لم تُقَس» بدلًا من ملئها ببيانات وهمية.",
    sectionRuntimeStatus: "حالة بيئة التشغيل",
    sectionBenchmark: "اختبار الأداء",
    sectionHardware: "العتاد (فعلي، مكتشَف وقت التشغيل)",
    sectionGenerationThroughput: "معدل إنتاجية التوليد",
    labelDocumentsLoaded: "المستندات المحمّلة",
    labelLanguagesRegistered: "اللغات المسجَّلة",
    labelGenerationModel: "نموذج التوليد",
    labelEmbeddingModel: "نموذج التضمين",
    labelKnowledgeBase: "قاعدة المعرفة",
    labelWorkerState: "حالة عملية المعالجة",
    labelThreadCount: "عدد الخيوط",
    labelWorkerUptime: "مدة تشغيل العملية",
    labelRetrievalLatency: "زمن استجابة الاسترجاع",
    labelProcessMemory: "استخدام ذاكرة العملية",
    workerStateLoaded: "تم تحميل التوليد والتضمين",
    workerStatePartial: "محمَّل جزئيًا",
    workerUptimeSeconds: (seconds) => `${seconds} ثانية`,
    benchmarkDescription: (docPath) =>
      `يُجري طلب توليد فعليًا على النموذج المحمَّل ويُبلغ عن إنتاجية فعلية مقاسة — لا رقمًا مختلقًا أبدًا. راجع ${docPath} للاطلاع على المنهجية الكاملة والمؤرَّخة المُعاد استخدامها هنا.`,
    runBenchmarkButton: "تشغيل اختبار الأداء الآن",
    runningBenchmarkButton: "جارٍ تشغيل اختبار الأداء الفعلي…",
    labelCpu: "المعالج",
    labelCores: "الأنوية",
    labelTotalRam: "إجمالي الذاكرة العشوائية",
    labelAvailableRam: "الذاكرة العشوائية المتاحة",
    labelRamTier: "مستوى الذاكرة المختار",
    physicalLogicalCores: (physical, logical) => `${physical} فعلية / ${logical} منطقية`,
    labelTokensPerSecond: "رمز/ثانية",
    labelGeneratedTokens: "الرموز المولَّدة",
    labelTotalDuration: "المدة الإجمالية",
    noGenerationModel: "لم يُحمَّل أي نموذج توليد لهذا الاختبار.",
    devHardwareNotice:
      "أُجري هذا الاختبار على عتاد تطوير، وليس على فئة العتاد المرجعية للمنافسة ذات 8 غيغابايت من الذاكرة — راجع قسم «الكفاءة» في مجموعة اختبارات ADTC قبل الاستشهاد بهذه الأرقام في مواد التقديم.",
  },

  accessibility: {
    openSettings: "فتح إعدادات إمكانية الوصول",
    closeSettings: "إغلاق إعدادات إمكانية الوصول",
    panelTitle: "إمكانية الوصول",
    textSize: "حجم النص",
    highContrast: "تباين عالٍ",
    reduceMotion: "تقليل الحركة",
    alwaysShowFocus: "إظهار مؤشر التركيز دائمًا",
    resetDefaults: "إعادة التعيين إلى الافتراضي",
  },
};

export default ar;
