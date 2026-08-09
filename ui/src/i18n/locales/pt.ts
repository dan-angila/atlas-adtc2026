import type { Translations } from "../types";

const pt: Translations = {
  common: {
    notMeasured: "Não medido",
    loading: "A carregar…",
    untitledSource: "Fonte sem título",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Inteligência em saúde",
    offlineOnDevice: "Offline / no dispositivo",
    blurb:
      "O Atlas responde com base nas evidências carregadas nesta máquina. Cita o que utilizou e recusa responder quando não consegue verificar evidências suficientes.",
    disclaimer:
      "Esta ferramenta não diagnostica nem prescreve tratamentos. O Atlas apresenta inteligência em saúde baseada exclusivamente nos documentos carregados.",
    runtimeLabel: "Ambiente de execução",
  },

  nav: {
    workspace: "Espaço de trabalho",
    ask: "Perguntar ao Atlas",
    knowledge: "Conhecimento médico",
    drugs: "Referência de medicamentos",
    languages: "Idiomas",
    runtime: "Ambiente e desempenho",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} documentos locais · ${languages} idiomas registados`,
    loading: "A preparar os modelos locais e a base de conhecimento",
    unavailable: "É necessário o ambiente de desktop para a execução real do Atlas",
  },

  screenTitles: {
    ask: {
      title: "Perguntar ao Atlas",
      subtitle:
        "Pergunte, recupere evidências, cite-as e recuse com segurança quando as evidências locais forem insuficientes.",
    },
    knowledge: {
      title: "Conhecimento médico",
      subtitle: "Explore os documentos de saúde reais que o Atlas pode recuperar e citar.",
    },
    drugs: {
      title: "Referência de medicamentos",
      subtitle:
        "Consulte evidências sobre medicamentos do corpus carregado, sem transformar o Atlas num sistema de gestão farmacêutica.",
    },
    languages: {
      title: "Idiomas",
      subtitle:
        "Consulte a lista de pacotes de idiomas registados e os resultados de validação realmente medidos.",
    },
    runtime: {
      title: "Ambiente e desempenho",
      subtitle:
        "Mostra a identidade do ambiente local, a sua disponibilidade e os dados de desempenho sem qualquer invenção.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "O Atlas executa toda a inferência neste dispositivo — nenhuma chamada de rede é realizada.",
    checking: "A verificar o ambiente de execução…",
    modelReady: "Modelo pronto",
    loadingModel: "A carregar o modelo…",
    unavailable: "Ambiente indisponível",
  },

  uiLanguage: {
    label: "Idioma da interface",
    unverifiedNote:
      "Texto da interface traduzido automaticamente, ainda não revisto por um falante nativo.",
  },

  askAtlas: {
    heroTitle: "Inteligência em saúde offline",
    heroSubtitle:
      "O Atlas funciona no próprio dispositivo, recupera informações do corpus de saúde local, avalia o nível de confiança antes de responder e cita as evidências utilizadas.",
    badgeOffline: "Offline / no dispositivo",
    badgeRuntimeConnected: "Ambiente conectado",
    badgeRuntimeLoading: "A carregar o ambiente",
    badgeRuntimeUnavailable: "Ambiente indisponível",
    badgeLanguage: (name) => `Idioma: ${name}`,
    metricDocuments: "Documentos",
    metricLanguages: "Idiomas",
    metricExecution: "Execução",
    executionLocalOnly: "Apenas local",
    flowLabel: "Como o Atlas responde",
    flowSteps: [
      "Pergunta",
      "Recuperação local",
      "Evidências",
      "Confiança",
      "Geração local",
      "Resposta citada",
    ],
    suggestedQuestions: [
      "Quais são os sinais de desidratação?",
      "Quais são os sintomas da malária?",
      "Por que os cuidados pré-natais são importantes durante a gravidez?",
      "Para que serve a solução de reidratação oral?",
    ],
    interactionLanguageLabel: "Idioma da resposta",
    emptyStateTitle: "Perguntar ao Atlas",
    emptyStateBody:
      "Comece com uma pergunta de saúde apoiada pelo corpus carregado. O Atlas mostrará as evidências, o nível de confiança e a resposta citada final num só lugar.",
    modelLoadingBanner:
      "O modelo ainda está a ser carregado — os carregamentos reais demoraram cerca de 50 segundos no hardware de desenvolvimento deste projeto; o tempo no hardware de referência da competição ainda não foi medido.",
    runtimeUnavailableBanner: (reason) => `Ambiente do Atlas indisponível: ${reason}`,
    inputPlaceholderReady: "Faça ao Atlas uma pergunta de saúde baseada no corpus local...",
    inputPlaceholderWaiting: "A aguardar o ambiente de execução...",
    sendLabel: "Enviar",
    disclaimer:
      "O Atlas é um assistente de conhecimento em saúde. Não diagnostica, não prescreve nem substitui um profissional de saúde qualificado.",
    questionLabel: "Pergunta",
    pendingStatus:
      "A executar a recuperação local, a avaliar a confiança e a gerar uma resposta baseada em evidências…",
    atlasLabel: "Atlas",
    confidenceStrong: "Evidências sólidas",
    confidenceWeak: "Evidências fracas",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} tokens · ${tokensPerSecond.toFixed(1)} tok/s`,
    citedRecords: (count) => `${count} registo(s) de evidência citado(s)`,
    answerDisclaimer:
      "As respostas são geradas a partir do corpus carregado e devem ser entendidas como assistência baseada em evidências, não como diagnóstico ou indicação de tratamento.",
    evidenceUsedTitle: "Evidências utilizadas",
    retrievedChunks: (count) => `${count} trecho(s) recuperado(s)`,
    licenseVerified: "Licença verificada",
    localCorpus: "Corpus local",
    sourcesTitle: "Fontes",
    retrievedOn: (date) => `obtido em ${date}`,
    refusalNoEvidenceTitle: "Nenhuma evidência de apoio encontrada no corpus local",
    refusalInsufficientTitle: "Evidências insuficientemente corroboradas no corpus local",
    refusalNoEvidenceBody:
      "Não consegui recuperar evidências relevantes para esta pergunta na base de conhecimento carregada. O Atlas não adivinha quando não há nenhuma fonte de apoio disponível.",
    refusalInsufficientBody:
      "Só recuperei evidências fracamente corroboradas para esta pergunta. O Atlas não gera uma resposta médica quando o suporte da recuperação é demasiado fraco.",
    refusalNoEvidenceNote:
      "Evidências disponíveis: nenhuma suficientemente relevante para apoiar uma resposta fundamentada.",
    refusalInsufficientNote:
      "Evidências disponíveis: relação fraca, não suficientemente fiável para responder com segurança.",
    generationFailed: (message) => `Falha na geração: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "A aguardar o ambiente de execução",
    waitingLoadingBody: "A base de conhecimento carrega juntamente com o modelo.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "O ambiente do Atlas não está conectado.",
    heroTitle: "Explore os documentos que o Atlas pode realmente citar",
    heroSubtitle:
      "A proveniência faz parte do produto. Cada título, organização, jurisdição e licença apresentados aqui provêm dos metadados do corpus carregado.",
    metricLoaded: "Documentos carregados",
    metricLicenseVerified: "Licença verificada",
    metricJurisdictions: "Jurisdições",
    searchPlaceholder: "Filtrar por título, fonte ou jurisdição...",
    documentsLoadedBadge: (count) => `${count} documento(s) carregado(s)`,
    provenanceNotice:
      "O Atlas cita a partir deste catálogo. Os metadados em falta são deixados vazios propositadamente; a interface não os preenche com marcadores fictícios.",
    noMatchTitle: (query) => `Nenhum documento corresponde a "${query}"`,
    noMatchBody:
      "Experimente outro título, ou pergunte diretamente ao Atlas — a recuperação pesquisa no texto completo dos documentos.",
    sourcePathLabel: "Caminho da fonte",
    sourceUrlLabel: "URL da fonte",
    licenseLabel: "Licença",
    retrievedOn: (date) => `Obtido em ${date}`,
  },

  drugReference: {
    heroTitle: "Pesquisa de medicamentos baseada em evidências",
    heroSubtitle:
      "Este ecrã pesquisa diretamente no corpus de saúde local. Não inventa factos sobre medicamentos, não os dispensa nem age como um sistema de farmácia.",
    exampleQueries: [
      "solução de reidratação oral",
      "medicamentos para o tratamento da malária",
      "medicamentos para a pressão arterial",
    ],
    searchPlaceholder: "Pesquise no corpus local um medicamento, tratamento ou termo médico...",
    searchButton: "Pesquisar evidências locais",
    waitingTitle: "A aguardar o ambiente do Atlas",
    waitingLoadingBody:
      "A pesquisa de evidências sobre medicamentos fica disponível assim que os modelos locais e o corpus terminarem de carregar.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "O ambiente do Atlas não está conectado.",
    noSearchTitle: "Ainda sem pesquisas",
    noSearchBody:
      "Introduza um termo para examinar as evidências exatas relacionadas com medicamentos que o Atlas pode recuperar do corpus carregado.",
    confidenceStrong: "Evidências de recuperação sólidas",
    confidenceWeak: "Evidências de recuperação fracas",
    confidenceNoEvidence: "Nenhuma evidência encontrada",
    matchingRecords: (count) => `${count} registo(s) de evidência correspondente(s)`,
    noEvidenceTitle: "Informação indisponível no corpus atual",
    noEvidenceBody:
      "O Atlas não recuperou evidências locais verificadas para este pedido. O produto não preencherá essa lacuna com orientações farmacológicas não sustentadas.",
    licenseVerified: "Licença verificada",
    localCorpus: "Corpus local",
    lexicalBadge: "Lexical",
    semanticBadge: "Semântico",
    retrievedOn: (date) => `Obtido em ${date}`,
    scoreLabel: (score) => `Pontuação ${score.toFixed(3)}`,
    viewFullEvidence: "Ver evidência completa",
    backToResults: "Voltar aos resultados",
    fullEvidenceHeading: "Trecho de evidência completo",
    sourceHeading: "Fonte",
    otherMatchesHeading: "Outras correspondências neste documento",
    scopeNote:
      "O Atlas mostra trechos recuperados dos seus documentos carregados, não um banco de dados estruturado de medicamentos. Ferramentas de dosagem, tabelas de interação e códigos de classificação só aparecem se estiverem presentes no texto recuperado.",
  },

  languagesScreen: {
    waitingTitle: "A aguardar o ambiente de execução",
    waitingDisconnected: "O ambiente do Atlas não está conectado.",
    heroTitle: "Estar registado não significa estar totalmente validado",
    heroSubtitle:
      "Este registo contém dados reais da aplicação. O estado apresentado para cada idioma reflete uma avaliação medida, não uma afirmação comercial baseada no simples registo.",
    metricRegistered: "Registados",
    metricValidated: "Recuperação / geração validadas",
    metricPlausible: "Fluência plausível",
    metricPartialOrInconclusive: "Parciais ou inconclusivos",
    banner: (validated, total) =>
      `O registo nesta lista é apenas um metadado, não uma alegação de capacidade. Testes reais de geração com o Qwen3-4B em 2026-08-08 revelaram que apenas ${validated} de ${total} idiomas produzem resultados fiáveis — veja a coluna de estado abaixo para o resultado real e medido de cada idioma.`,
    statusLabels: {
      validated: "Validado",
      "plausible-fluent": "Fluência plausível",
      partial: "Parcial",
      inconclusive: "Inconclusivo",
      garbled: "Incompreensível",
      failed: "Falhou",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "A aguardar o ambiente de execução",
    waitingDisconnected: "O ambiente do Atlas não está conectado.",
    heroTitle: "Identidade real do ambiente local",
    heroSubtitle:
      "Esta vista mostra o que o Atlas efetivamente carregou e mediu na aplicação de desktop. Os valores em falta são assinalados como não medidos em vez de preenchidos com marcadores fictícios.",
    sectionRuntimeStatus: "Estado do ambiente",
    sectionBenchmark: "Teste de desempenho",
    sectionHardware: "Hardware (real, detetado em tempo de execução)",
    sectionGenerationThroughput: "Débito de geração",
    labelDocumentsLoaded: "Documentos carregados",
    labelLanguagesRegistered: "Idiomas registados",
    labelGenerationModel: "Modelo de geração",
    labelEmbeddingModel: "Modelo de incorporação",
    labelKnowledgeBase: "Base de conhecimento",
    labelWorkerState: "Estado do processo de trabalho",
    labelThreadCount: "Número de threads",
    labelWorkerUptime: "Tempo de atividade do processo",
    labelRetrievalLatency: "Latência de recuperação",
    labelProcessMemory: "Utilização de memória do processo",
    workerStateLoaded: "Geração e incorporação carregadas",
    workerStatePartial: "Parcialmente carregado",
    workerUptimeSeconds: (seconds) => `${seconds} s`,
    benchmarkDescription: (docPath) =>
      `Executa um pedido de geração real no modelo carregado e reporta um débito real e medido — nunca um número inventado. Veja ${docPath} para a metodologia completa e datada aqui reutilizada.`,
    runBenchmarkButton: "Executar teste agora",
    runningBenchmarkButton: "A executar teste real…",
    labelCpu: "CPU",
    labelCores: "Núcleos",
    labelTotalRam: "RAM total",
    labelAvailableRam: "RAM disponível",
    labelRamTier: "Nível de RAM selecionado",
    physicalLogicalCores: (physical, logical) => `${physical} físicos / ${logical} lógicos`,
    labelTokensPerSecond: "Tokens / segundo",
    labelGeneratedTokens: "Tokens gerados",
    labelTotalDuration: "Duração total",
    noGenerationModel: "Nenhum modelo de geração foi carregado para este teste.",
    devHardwareNotice:
      "Este teste foi executado em hardware de desenvolvimento, não na classe de referência de 8 GB de RAM da competição — veja a secção «Eficiência» do conjunto de testes ADTC antes de citar estes números em material de candidatura.",
  },

  accessibility: {
    openSettings: "Abrir definições de acessibilidade",
    closeSettings: "Fechar definições de acessibilidade",
    panelTitle: "Acessibilidade",
    textSize: "Tamanho do texto",
    highContrast: "Alto contraste",
    reduceMotion: "Reduzir movimento",
    alwaysShowFocus: "Mostrar sempre o anel de foco",
    sectionReadability: "Legibilidade",
    sectionAssistiveTools: "Ferramentas de assistência",
    sectionDisplay: "Exibição",
    readableSpacing: "Espaçamento legível",
    highlightLinks: "Destacar links",
    bigCursor: "Cursor grande",
    readingMask: "Guia de leitura",
    readPage: "Ler página em voz alta",
    stopReading: "Parar leitura",
    invertColors: "Inverter cores",
    grayscale: "Escala de cinza",
    skipToContent: "Pular para o conteúdo principal",
    resetDefaults: "Repor predefinições",
  },
};

export default pt;
