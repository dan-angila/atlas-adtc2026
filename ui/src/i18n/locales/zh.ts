import type { Translations } from "../types";

const zh: Translations = {
  common: {
    notMeasured: "未测量",
    loading: "加载中…",
    untitledSource: "无标题来源",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "医疗健康智能",
    offlineOnDevice: "离线 / 本地设备",
    blurb: "Atlas 根据本机加载的证据作答,会引用所使用的资料,并在无法核实足够证据时拒绝回答。",
    disclaimer: "本工具不提供诊断或处方建议。Atlas 提供的医疗信息仅基于已加载的文档。",
    runtimeLabel: "运行环境",
  },

  nav: {
    workspace: "工作区",
    ask: "咨询 Atlas",
    knowledge: "医学知识库",
    drugs: "药品参考",
    languages: "语言",
    runtime: "运行环境与基准测试",
  },

  runtimeSummary: {
    ready: (documents, languages) => `${documents} 份本地文档 · 已注册 ${languages} 种语言`,
    loading: "正在准备本地模型与知识库",
    unavailable: "需要桌面运行环境才能实际运行 Atlas",
  },

  screenTitles: {
    ask: {
      title: "咨询 Atlas",
      subtitle: "提问、检索证据、引用来源,并在本地证据不足时安全地拒绝回答。",
    },
    knowledge: {
      title: "医学知识库",
      subtitle: "浏览 Atlas 可以检索并引用的真实医疗文档。",
    },
    drugs: {
      title: "药品参考",
      subtitle: "查阅已加载语料库中的药品相关证据,而不会让 Atlas 变成企业资源管理系统。",
    },
    languages: {
      title: "语言",
      subtitle: "查看已注册的语言包列表及其实际测量的验证结果。",
    },
    runtime: {
      title: "运行环境与基准测试",
      subtitle: "如实展示本地运行环境的身份、就绪状态与基准测试数据,绝不虚构。",
    },
  },

  runtimeStatusPill: {
    offlineTitle: "Atlas 在本设备上完成所有推理 —— 不会发起任何网络请求。",
    checking: "正在检查运行环境…",
    modelReady: "模型已就绪",
    loadingModel: "正在加载模型…",
    unavailable: "运行环境不可用",
  },

  uiLanguage: {
    label: "界面语言",
    unverifiedNote: "界面文本为机器翻译,尚未经过母语者审校。",
  },

  askAtlas: {
    heroTitle: "离线医疗健康智能",
    heroSubtitle:
      "Atlas 在本机运行,从本地医疗语料库中检索信息,在作答前评估置信度,并引用所使用的证据。",
    badgeOffline: "离线 / 本地设备",
    badgeRuntimeConnected: "运行环境已连接",
    badgeRuntimeLoading: "运行环境加载中",
    badgeRuntimeUnavailable: "运行环境不可用",
    badgeLanguage: (name) => `语言:${name}`,
    metricDocuments: "文档数",
    metricLanguages: "语言数",
    metricExecution: "执行方式",
    executionLocalOnly: "仅本地",
    flowLabel: "Atlas 的作答流程",
    flowSteps: ["提问", "本地检索", "证据", "置信度", "本地生成", "引用式回答"],
    suggestedQuestions: [
      "脱水的症状有哪些?",
      "疟疾的症状有哪些?",
      "为什么孕期产前保健很重要?",
      "口服补液盐溶液有什么用途?",
    ],
    interactionLanguageLabel: "回答语言",
    emptyStateTitle: "咨询 Atlas",
    emptyStateBody:
      "从已加载语料库支持的健康问题开始提问。Atlas 会在同一处展示证据、置信度和最终的引用式回答。",
    modelLoadingBanner:
      "模型仍在加载中 —— 在本项目的开发硬件上,实际加载耗时约 50 秒;在竞赛参考硬件上的耗时尚未测量。",
    runtimeUnavailableBanner: (reason) => `Atlas 运行环境不可用:${reason}`,
    inputPlaceholderReady: "向 Atlas 提出基于本地语料库的健康问题...",
    inputPlaceholderWaiting: "正在等待运行环境...",
    sendLabel: "发送",
    disclaimer: "Atlas 是一个医疗知识助手,不进行诊断、不提供处方,也不能替代合格的医疗专业人员。",
    questionLabel: "问题",
    pendingStatus: "正在进行本地检索、评估置信度并生成基于证据的回答…",
    atlasLabel: "Atlas",
    confidenceStrong: "证据充分",
    confidenceWeak: "证据薄弱",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} 个词元 · ${tokensPerSecond.toFixed(1)} 词元/秒`,
    citedRecords: (count) => `已引用 ${count} 条证据记录`,
    answerDisclaimer: "回答内容由已加载语料库生成,应理解为基于证据的辅助信息,而非诊断或处方建议。",
    evidenceUsedTitle: "已使用的证据",
    retrievedChunks: (count) => `检索到 ${count} 个片段`,
    licenseVerified: "许可证已核实",
    localCorpus: "本地语料库",
    sourcesTitle: "来源",
    retrievedOn: (date) => `获取于 ${date}`,
    refusalNoEvidenceTitle: "本地语料库中未找到支持性证据",
    refusalInsufficientTitle: "本地语料库中的证据未获得充分佐证",
    refusalNoEvidenceBody:
      "我在已加载的知识库中未能检索到与该问题相关的证据。当没有来源支持时,Atlas 不会进行猜测。",
    refusalInsufficientBody:
      "针对该问题,我只检索到佐证薄弱的证据。当检索支持过于薄弱时,Atlas 不会生成医疗回答。",
    refusalNoEvidenceNote: "现有证据:没有足够相关的证据可支持有依据的回答。",
    refusalInsufficientNote: "现有证据:相关性较弱,可靠性不足以安全作答。",
    generationFailed: (message) => `生成失败:${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "正在等待运行环境",
    waitingLoadingBody: "知识库会与模型一同加载。",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlas 运行环境未连接。",
    heroTitle: "浏览 Atlas 真正能够引用的文档",
    heroSubtitle:
      "来源可追溯性是本产品的一部分。此处显示的每个标题、机构、司法辖区和许可证信息均来自已加载语料库的元数据。",
    metricLoaded: "已加载文档",
    metricLicenseVerified: "许可证已核实",
    metricJurisdictions: "司法辖区",
    searchPlaceholder: "按标题、来源或司法辖区筛选...",
    documentsLoadedBadge: (count) => `已加载 ${count} 份文档`,
    provenanceNotice:
      "Atlas 从此目录中引用内容。缺失的元数据会被有意留空;界面不会用占位内容填补来源信息。",
    noMatchTitle: (query) => `没有与“${query}”匹配的文档`,
    noMatchBody: "请尝试其他标题,或直接向 Atlas 提问 —— 检索会搜索文档的全文内容。",
    sourcePathLabel: "来源路径",
    sourceUrlLabel: "来源网址",
    licenseLabel: "许可证",
    retrievedOn: (date) => `获取于 ${date}`,
  },

  drugReference: {
    heroTitle: "以证据为基础的药品查询",
    heroSubtitle:
      "此页面直接检索本地医疗语料库,不会编造药品信息、不会配药,也不会像药房系统一样运作。",
    exampleQueries: ["口服补液盐溶液", "疟疾治疗药物", "血压药物"],
    searchPlaceholder: "在本地语料库中搜索药品、治疗方法或医学术语...",
    searchButton: "搜索本地证据",
    waitingTitle: "正在等待 Atlas 运行环境",
    waitingLoadingBody: "本地模型和语料库加载完成后,药品证据搜索功能即可使用。",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlas 运行环境未连接。",
    noSearchTitle: "尚未进行搜索",
    noSearchBody: "输入一个词语,以查看 Atlas 可从已加载语料库中检索到的确切药品相关证据。",
    confidenceStrong: "检索证据充分",
    confidenceWeak: "检索证据薄弱",
    confidenceNoEvidence: "未找到证据",
    matchingRecords: (count) => `${count} 条匹配的证据记录`,
    noEvidenceTitle: "当前语料库中没有相关信息",
    noEvidenceBody:
      "Atlas 未能为此请求检索到经核实的本地证据。产品不会用未经证实的用药指导来填补这一空白。",
    licenseVerified: "许可证已核实",
    localCorpus: "本地语料库",
    lexicalBadge: "词汇匹配",
    semanticBadge: "语义匹配",
    retrievedOn: (date) => `获取于 ${date}`,
    scoreLabel: (score) => `得分 ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "正在等待运行环境",
    waitingDisconnected: "Atlas 运行环境未连接。",
    heroTitle: "已注册不代表已完全验证",
    heroSubtitle:
      "该注册表是真实的应用数据。每种语言显示的状态反映的是实际测量的评估结果,而非仅凭注册就作出的宣传性声明。",
    metricRegistered: "已注册",
    metricValidated: "检索/生成已验证",
    metricPlausible: "疑似流畅",
    metricPartialOrInconclusive: "部分或不确定",
    banner: (validated, total) =>
      `出现在此列表中仅代表元数据登记,并非能力声明。2026-08-08 针对 Qwen3-4B 的实际生成测试发现,${total} 种语言中只有 ${validated} 种能够可靠地产生正确输出 —— 请查看下方状态列以了解每种语言实际测量的结果。`,
    statusLabels: {
      validated: "已验证",
      "plausible-fluent": "疑似流畅",
      partial: "部分可用",
      inconclusive: "结果不确定",
      garbled: "输出混乱",
      failed: "失败",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "正在等待运行环境",
    waitingDisconnected: "Atlas 运行环境未连接。",
    heroTitle: "真实的本地运行环境信息",
    heroSubtitle:
      "此页面展示 Atlas 在桌面应用中实际加载和测量到的信息。缺失的数值会标注为“未测量”,而不会用占位数据填补。",
    sectionRuntimeStatus: "运行环境状态",
    sectionBenchmark: "基准测试",
    sectionHardware: "硬件信息(运行时实际检测)",
    sectionGenerationThroughput: "生成吞吐量",
    labelDocumentsLoaded: "已加载文档数",
    labelLanguagesRegistered: "已注册语言数",
    labelGenerationModel: "生成模型",
    labelEmbeddingModel: "嵌入模型",
    labelKnowledgeBase: "知识库",
    labelWorkerState: "工作进程状态",
    labelThreadCount: "线程数",
    labelWorkerUptime: "工作进程运行时长",
    labelRetrievalLatency: "检索延迟",
    labelProcessMemory: "进程内存占用",
    workerStateLoaded: "生成模型与嵌入模型均已加载",
    workerStatePartial: "部分已加载",
    workerUptimeSeconds: (seconds) => `${seconds} 秒`,
    benchmarkDescription: (docPath) =>
      `对已加载模型发起一次真实的生成请求,并报告真实测量的吞吐量 —— 绝不使用虚构数字。完整、可追溯日期的方法说明请参见 ${docPath}。`,
    runBenchmarkButton: "立即运行基准测试",
    runningBenchmarkButton: "正在运行真实基准测试…",
    labelCpu: "处理器",
    labelCores: "核心数",
    labelTotalRam: "总内存",
    labelAvailableRam: "可用内存",
    labelRamTier: "所选内存等级",
    physicalLogicalCores: (physical, logical) => `${physical} 物理核心 / ${logical} 逻辑核心`,
    labelTokensPerSecond: "每秒词元数",
    labelGeneratedTokens: "生成的词元数",
    labelTotalDuration: "总耗时",
    noGenerationModel: "本次运行未加载任何生成模型。",
    devHardwareNotice:
      "此测试在开发硬件上运行,并非比赛规定的 8GB 内存参考机型 —— 在引用这些数字用于提交材料前,请参阅 ADTC 基准测试套件的“效率”部分了解相关差异。",
  },

  accessibility: {
    openSettings: "打开无障碍设置",
    closeSettings: "关闭无障碍设置",
    panelTitle: "无障碍功能",
    textSize: "文字大小",
    highContrast: "高对比度",
    reduceMotion: "减少动画效果",
    alwaysShowFocus: "始终显示焦点框",
    resetDefaults: "恢复默认设置",
  },
};

export default zh;
