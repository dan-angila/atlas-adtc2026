import type { Translations } from "../types";

const es: Translations = {
  common: {
    notMeasured: "No medido",
    loading: "Cargando…",
    untitledSource: "Fuente sin título",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "Inteligencia en salud",
    offlineOnDevice: "Sin conexión / en el dispositivo",
    blurb:
      "Atlas responde a partir de la evidencia cargada en esta máquina. Cita lo que usó y se niega a responder cuando no puede verificar suficiente evidencia.",
    disclaimer:
      "Esta herramienta no diagnostica ni prescribe tratamientos. Atlas presenta inteligencia en salud basada únicamente en los documentos cargados.",
    runtimeLabel: "Entorno de ejecución",
  },

  nav: {
    workspace: "Espacio de trabajo",
    ask: "Preguntar a Atlas",
    knowledge: "Conocimiento médico",
    drugs: "Referencia de medicamentos",
    languages: "Idiomas",
    runtime: "Entorno y rendimiento",
  },

  runtimeSummary: {
    ready: (documents, languages) =>
      `${documents} documentos locales · ${languages} idiomas registrados`,
    loading: "Preparando modelos locales y base de conocimiento",
    unavailable: "Se requiere el entorno de escritorio para la ejecución real de Atlas",
  },

  screenTitles: {
    ask: {
      title: "Preguntar a Atlas",
      subtitle:
        "Pregunta, recupera evidencia, cítala y rechaza con seguridad cuando la evidencia local sea insuficiente.",
    },
    knowledge: {
      title: "Conocimiento médico",
      subtitle: "Explora los documentos de salud reales que Atlas puede recuperar y citar.",
    },
    drugs: {
      title: "Referencia de medicamentos",
      subtitle:
        "Consulta evidencia sobre medicamentos del corpus cargado sin convertir a Atlas en un sistema de gestión farmacéutica.",
    },
    languages: {
      title: "Idiomas",
      subtitle:
        "Consulta la lista de paquetes de idiomas registrados y los resultados de validación realmente medidos.",
    },
    runtime: {
      title: "Entorno y rendimiento",
      subtitle:
        "Muestra la identidad del entorno local, su disponibilidad y los datos de rendimiento sin inventar nada.",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlas ejecuta toda la inferencia en este dispositivo — no se realiza ninguna llamada de red.",
    checking: "Comprobando el entorno de ejecución…",
    modelReady: "Modelo listo",
    loadingModel: "Cargando modelo…",
    unavailable: "Entorno no disponible",
  },

  uiLanguage: {
    label: "Idioma de la interfaz",
    unverifiedNote:
      "Texto de la interfaz traducido automáticamente, aún no revisado por un hablante nativo.",
  },

  askAtlas: {
    heroTitle: "Inteligencia en salud sin conexión",
    heroSubtitle:
      "Atlas se ejecuta en el dispositivo, recupera información del corpus de salud local, mide su nivel de confianza antes de responder y cita la evidencia utilizada.",
    badgeOffline: "Sin conexión / en el dispositivo",
    badgeRuntimeConnected: "Entorno conectado",
    badgeRuntimeLoading: "Cargando entorno",
    badgeRuntimeUnavailable: "Entorno no disponible",
    badgeLanguage: (name) => `Idioma: ${name}`,
    metricDocuments: "Documentos",
    metricLanguages: "Idiomas",
    metricExecution: "Ejecución",
    executionLocalOnly: "Solo local",
    flowLabel: "Cómo responde Atlas",
    flowSteps: [
      "Pregunta",
      "Recuperación local",
      "Evidencia",
      "Confianza",
      "Generación local",
      "Respuesta citada",
    ],
    suggestedQuestions: [
      "¿Cuáles son los signos de deshidratación?",
      "¿Cuáles son los síntomas de la malaria?",
      "¿Por qué es importante el control prenatal durante el embarazo?",
      "¿Para qué se usa la solución de rehidratación oral?",
    ],
    interactionLanguageLabel: "Idioma de respuesta",
    emptyStateTitle: "Preguntar a Atlas",
    emptyStateBody:
      "Comienza con una pregunta de salud respaldada por el corpus cargado. Atlas mostrará la evidencia, el nivel de confianza y la respuesta citada final en un solo lugar.",
    modelLoadingBanner:
      "El modelo todavía se está cargando — las cargas reales han tomado alrededor de 50 segundos en el hardware de desarrollo de este proyecto; el tiempo en el hardware de referencia de la competencia aún no se ha medido.",
    runtimeUnavailableBanner: (reason) => `Entorno de Atlas no disponible: ${reason}`,
    inputPlaceholderReady: "Hazle a Atlas una pregunta de salud basada en el corpus local...",
    inputPlaceholderWaiting: "Esperando al entorno de ejecución...",
    sendLabel: "Enviar",
    disclaimer:
      "Atlas es un asistente de conocimiento en salud. No diagnostica, no prescribe ni reemplaza a un profesional de la salud calificado.",
    questionLabel: "Pregunta",
    pendingStatus:
      "Ejecutando recuperación local, evaluando la confianza y generando una respuesta basada en evidencia…",
    atlasLabel: "Atlas",
    confidenceStrong: "Evidencia sólida",
    confidenceWeak: "Evidencia débil",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} tokens · ${tokensPerSecond.toFixed(1)} tok/s`,
    citedRecords: (count) =>
      `${count} registro${count === 1 ? "" : "s"} de evidencia citado${count === 1 ? "" : "s"}`,
    answerDisclaimer:
      "Las respuestas se generan a partir del corpus cargado y deben interpretarse como asistencia basada en evidencia, no como diagnóstico o indicación de tratamiento.",
    evidenceUsedTitle: "Evidencia utilizada",
    retrievedChunks: (count) =>
      `${count} fragmento${count === 1 ? "" : "s"} recuperado${count === 1 ? "" : "s"}`,
    licenseVerified: "Licencia verificada",
    localCorpus: "Corpus local",
    sourcesTitle: "Fuentes",
    retrievedOn: (date) => `obtenido el ${date}`,
    refusalNoEvidenceTitle: "No se encontró evidencia de respaldo en el corpus local",
    refusalInsufficientTitle: "Evidencia insuficientemente corroborada en el corpus local",
    refusalNoEvidenceBody:
      "No pude recuperar evidencia relevante para esta pregunta en la base de conocimiento cargada. Atlas no adivina cuando no hay ninguna fuente que lo respalde.",
    refusalInsufficientBody:
      "Solo recuperé evidencia débilmente corroborada para esta pregunta. Atlas no genera una respuesta médica cuando el respaldo de la recuperación es demasiado débil.",
    refusalNoEvidenceNote:
      "Evidencia disponible: ninguna lo suficientemente relevante para respaldar una respuesta fundamentada.",
    refusalInsufficientNote:
      "Evidencia disponible: relación débil, no lo suficientemente fiable para responder con seguridad.",
    generationFailed: (message) => `Error en la generación: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "Esperando al entorno de ejecución",
    waitingLoadingBody: "La base de conocimiento se carga junto con el modelo.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "El entorno de Atlas no está conectado.",
    heroTitle: "Explora los documentos que Atlas realmente puede citar",
    heroSubtitle:
      "La procedencia forma parte del producto. Cada título, organización, jurisdicción y licencia mostrados aquí provienen de los metadatos del corpus cargado.",
    metricLoaded: "Documentos cargados",
    metricLicenseVerified: "Licencia verificada",
    metricJurisdictions: "Jurisdicciones",
    searchPlaceholder: "Filtrar por título, fuente o jurisdicción...",
    documentsLoadedBadge: (count) =>
      `${count} documento${count === 1 ? "" : "s"} cargado${count === 1 ? "" : "s"}`,
    provenanceNotice:
      "Atlas cita a partir de este catálogo. Los metadatos ausentes se dejan vacíos intencionalmente; la interfaz no los rellena con marcadores de posición.",
    noMatchTitle: (query) => `Ningún documento coincide con "${query}"`,
    noMatchBody:
      "Prueba con otro título, o pregúntale directamente a Atlas — la recuperación busca en el texto completo de los documentos.",
    sourcePathLabel: "Ruta de la fuente",
    sourceUrlLabel: "URL de la fuente",
    licenseLabel: "Licencia",
    retrievedOn: (date) => `Obtenido el ${date}`,
  },

  drugReference: {
    heroTitle: "Búsqueda de medicamentos basada en evidencia",
    heroSubtitle:
      "Esta pantalla busca directamente en el corpus de salud local. No inventa datos sobre medicamentos, no los dispensa ni actúa como un sistema de farmacia.",
    exampleQueries: [
      "solución de rehidratación oral",
      "medicamentos contra la malaria",
      "medicamentos para la presión arterial",
    ],
    searchPlaceholder: "Busca en el corpus local un medicamento, tratamiento o término médico...",
    searchButton: "Buscar evidencia local",
    waitingTitle: "Esperando el entorno de Atlas",
    waitingLoadingBody:
      "La búsqueda de evidencia sobre medicamentos estará disponible una vez que se carguen los modelos locales y el corpus.",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "El entorno de Atlas no está conectado.",
    noSearchTitle: "Aún no hay búsquedas",
    noSearchBody:
      "Ingresa un término para examinar la evidencia exacta relacionada con medicamentos que Atlas puede recuperar del corpus cargado.",
    confidenceStrong: "Evidencia de recuperación sólida",
    confidenceWeak: "Evidencia de recuperación débil",
    confidenceNoEvidence: "No se encontró evidencia",
    matchingRecords: (count) =>
      `${count} registro${count === 1 ? "" : "s"} de evidencia coincidente${count === 1 ? "" : "s"}`,
    noEvidenceTitle: "Información no disponible en el corpus actual",
    noEvidenceBody:
      "Atlas no recuperó evidencia local verificada para esta solicitud. El producto no llenará ese vacío con orientación farmacológica no respaldada.",
    licenseVerified: "Licencia verificada",
    localCorpus: "Corpus local",
    lexicalBadge: "Léxico",
    semanticBadge: "Semántico",
    retrievedOn: (date) => `Obtenido el ${date}`,
    scoreLabel: (score) => `Puntuación ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "Esperando al entorno de ejecución",
    waitingDisconnected: "El entorno de Atlas no está conectado.",
    heroTitle: "Estar registrado no significa estar totalmente validado",
    heroSubtitle:
      "Este registro es información real de la aplicación. El estado mostrado para cada idioma refleja una evaluación medida, no una afirmación comercial basada en el simple registro.",
    metricRegistered: "Registrados",
    metricValidated: "Recuperación / generación validadas",
    metricPlausible: "Fluidez plausible",
    metricPartialOrInconclusive: "Parciales o no concluyentes",
    banner: (validated, total) =>
      `El registro en esta lista es solo un metadato, no una afirmación de capacidad. Pruebas reales de generación con Qwen3-4B el 2026-08-08 encontraron que solo ${validated} de ${total} idiomas producen resultados fiables — consulta la columna de estado abajo para el resultado real y medido de cada idioma.`,
    statusLabels: {
      validated: "Validado",
      "plausible-fluent": "Fluidez plausible",
      partial: "Parcial",
      inconclusive: "No concluyente",
      garbled: "Incomprensible",
      failed: "Fallido",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "Esperando al entorno de ejecución",
    waitingDisconnected: "El entorno de Atlas no está conectado.",
    heroTitle: "Identidad real del entorno local",
    heroSubtitle:
      "Esta vista muestra lo que Atlas realmente cargó y midió en la aplicación de escritorio. Los valores faltantes se marcan como no medidos en lugar de rellenarse con marcadores de posición.",
    sectionRuntimeStatus: "Estado del entorno",
    sectionBenchmark: "Prueba de rendimiento",
    sectionHardware: "Hardware (real, detectado en tiempo de ejecución)",
    sectionGenerationThroughput: "Rendimiento de generación",
    labelDocumentsLoaded: "Documentos cargados",
    labelLanguagesRegistered: "Idiomas registrados",
    labelGenerationModel: "Modelo de generación",
    labelEmbeddingModel: "Modelo de embeddings",
    labelKnowledgeBase: "Base de conocimiento",
    labelWorkerState: "Estado del proceso de trabajo",
    labelThreadCount: "Número de hilos",
    labelWorkerUptime: "Tiempo de actividad del proceso",
    labelRetrievalLatency: "Latencia de recuperación",
    labelProcessMemory: "Uso de memoria del proceso",
    workerStateLoaded: "Generación y embeddings cargados",
    workerStatePartial: "Parcialmente cargado",
    workerUptimeSeconds: (seconds) => `${seconds} s`,
    benchmarkDescription: (docPath) =>
      `Ejecuta una solicitud de generación real contra el modelo cargado e informa un rendimiento real y medido — nunca un número inventado. Consulta ${docPath} para ver la metodología completa y fechada que se reutiliza aquí.`,
    runBenchmarkButton: "Ejecutar prueba ahora",
    runningBenchmarkButton: "Ejecutando prueba real…",
    labelCpu: "CPU",
    labelCores: "Núcleos",
    labelTotalRam: "RAM total",
    labelAvailableRam: "RAM disponible",
    labelRamTier: "Nivel de RAM seleccionado",
    physicalLogicalCores: (physical, logical) => `${physical} físicos / ${logical} lógicos`,
    labelTokensPerSecond: "Tokens / segundo",
    labelGeneratedTokens: "Tokens generados",
    labelTotalDuration: "Duración total",
    noGenerationModel: "No se cargó ningún modelo de generación para esta prueba.",
    devHardwareNotice:
      "Esto se ejecutó en hardware de desarrollo, no en la clase de referencia de 8 GB de RAM de la competencia — consulta la sección de «Eficiencia» de la suite de pruebas de ADTC antes de citar estas cifras en material de presentación.",
  },

  accessibility: {
    openSettings: "Abrir configuración de accesibilidad",
    closeSettings: "Cerrar configuración de accesibilidad",
    panelTitle: "Accesibilidad",
    textSize: "Tamaño del texto",
    highContrast: "Alto contraste",
    reduceMotion: "Reducir movimiento",
    alwaysShowFocus: "Mostrar siempre el anillo de enfoque",
    resetDefaults: "Restablecer valores predeterminados",
  },
};

export default es;
