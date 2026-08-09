import type { Translations } from "../types";

const ja: Translations = {
  common: {
    notMeasured: "未計測",
    loading: "読み込み中…",
    untitledSource: "無題の出典",
  },

  brand: {
    name: "BRIX ATLAS",
    tagline: "ヘルスケア・インテリジェンス",
    offlineOnDevice: "オフライン / オンデバイス",
    blurb:
      "Atlasはこの端末に読み込まれた根拠に基づいて回答します。使用した根拠を明示し、十分な根拠を確認できない場合は回答を拒否します。",
    disclaimer:
      "本ツールは診断や処方を行うものではありません。Atlasが提示する情報は、読み込まれた文書のみに基づいています。",
    runtimeLabel: "ランタイム環境",
  },

  nav: {
    workspace: "ワークスペース",
    ask: "Atlasに質問",
    knowledge: "医療知識",
    drugs: "医薬品リファレンス",
    languages: "言語",
    runtime: "ランタイムとベンチマーク",
  },

  runtimeSummary: {
    ready: (documents, languages) => `ローカル文書 ${documents} 件 · 登録言語 ${languages} 件`,
    loading: "ローカルモデルと知識ベースを準備しています",
    unavailable: "Atlasを実際に動作させるにはデスクトップ版のランタイムが必要です",
  },

  screenTitles: {
    ask: {
      title: "Atlasに質問",
      subtitle:
        "質問し、根拠を取得して引用し、ローカルの根拠が不十分な場合は安全に回答を拒否します。",
    },
    knowledge: {
      title: "医療知識",
      subtitle: "Atlasが実際に検索・引用できる医療文書を閲覧できます。",
    },
    drugs: {
      title: "医薬品リファレンス",
      subtitle:
        "読み込まれたコーパスから医薬品関連の根拠を確認できます。ATLASを薬局管理システムにするものではありません。",
    },
    languages: {
      title: "言語",
      subtitle: "登録されている言語パックの一覧と、実際に計測された検証結果を確認できます。",
    },
    runtime: {
      title: "ランタイムとベンチマーク",
      subtitle: "ローカルランタイムの実態、稼働状況、ベンチマークデータを、誇張なく提示します。",
    },
  },

  runtimeStatusPill: {
    offlineTitle:
      "Atlasはすべての推論をこの端末上で実行します — ネットワーク通信は一切行われません。",
    checking: "ランタイムを確認しています…",
    modelReady: "モデル準備完了",
    loadingModel: "モデルを読み込み中…",
    unavailable: "ランタイムが利用できません",
  },

  uiLanguage: {
    label: "表示言語",
    unverifiedNote:
      "この画面表示テキストは機械翻訳であり、ネイティブスピーカーによる確認はまだ行われていません。",
  },

  askAtlas: {
    heroTitle: "オフライン ヘルスケア・インテリジェンス",
    heroSubtitle:
      "Atlasは端末上で動作し、ローカルの医療コーパスから情報を検索し、回答前に確信度を評価した上で、使用した根拠を引用します。",
    badgeOffline: "オフライン / オンデバイス",
    badgeRuntimeConnected: "ランタイム接続済み",
    badgeRuntimeLoading: "ランタイムを読み込み中",
    badgeRuntimeUnavailable: "ランタイムが利用できません",
    badgeLanguage: (name) => `言語: ${name}`,
    metricDocuments: "文書数",
    metricLanguages: "言語数",
    metricExecution: "実行方式",
    executionLocalOnly: "ローカルのみ",
    flowLabel: "Atlasの回答の流れ",
    flowSteps: ["質問", "ローカル検索", "根拠", "確信度", "ローカル生成", "引用付き回答"],
    suggestedQuestions: [
      "脱水症状の兆候は何ですか?",
      "マラリアの症状は何ですか?",
      "妊娠中の妊婦健診はなぜ重要ですか?",
      "経口補水液は何のために使われますか?",
    ],
    interactionLanguageLabel: "回答言語",
    emptyStateTitle: "Atlasに質問",
    emptyStateBody:
      "読み込まれたコーパスで対応可能な健康に関する質問から始めてください。Atlasは根拠、確信度、最終的な引用付き回答を一箇所にまとめて表示します。",
    modelLoadingBanner:
      "モデルはまだ読み込み中です — 本プロジェクトの開発用ハードウェアでは実際の読み込みに約50秒かかっています。競技用の基準ハードウェアでの計測はまだ行われていません。",
    runtimeUnavailableBanner: (reason) => `Atlasランタイムが利用できません: ${reason}`,
    inputPlaceholderReady: "ローカルコーパスに基づいた健康に関する質問をAtlasにしてください...",
    inputPlaceholderWaiting: "ランタイムを待機しています...",
    sendLabel: "送信",
    disclaimer:
      "Atlasは医療知識アシスタントです。診断・処方は行わず、資格を持つ医療専門家の代わりにはなりません。",
    questionLabel: "質問",
    pendingStatus:
      "ローカル検索を実行し、確信度を評価した上で、根拠に基づいた回答を生成しています…",
    atlasLabel: "Atlas",
    confidenceStrong: "根拠が十分にあります",
    confidenceWeak: "根拠が乏しいです",
    tokenStats: (tokens, tokensPerSecond) =>
      `${tokens} トークン · ${tokensPerSecond.toFixed(1)} トークン/秒`,
    citedRecords: (count) => `${count} 件の根拠を引用`,
    answerDisclaimer:
      "回答は読み込まれたコーパスから生成されたものであり、診断や処方ではなく、根拠に基づく支援情報として理解してください。",
    evidenceUsedTitle: "使用した根拠",
    retrievedChunks: (count) => `${count} 件の断片を取得`,
    licenseVerified: "ライセンス確認済み",
    localCorpus: "ローカルコーパス",
    sourcesTitle: "出典",
    retrievedOn: (date) => `取得日: ${date}`,
    refusalNoEvidenceTitle: "ローカルコーパスに裏付けとなる根拠が見つかりませんでした",
    refusalInsufficientTitle: "ローカルコーパスの根拠が十分に裏付けられていません",
    refusalNoEvidenceBody:
      "読み込まれた知識ベースの中に、この質問に関連する根拠を見つけられませんでした。裏付けとなる情報源がない場合、Atlasは推測で答えません。",
    refusalInsufficientBody:
      "この質問については、裏付けの弱い根拠しか見つかりませんでした。検索による裏付けが弱すぎる場合、Atlasは医療的な回答を生成しません。",
    refusalNoEvidenceNote: "利用可能な根拠: 回答を裏付けるのに十分な関連性のある根拠はありません。",
    refusalInsufficientNote:
      "利用可能な根拠: 関連性が弱く、安全に回答するには十分な信頼性がありません。",
    generationFailed: (message) => `生成に失敗しました: ${message}`,
  },

  medicalKnowledge: {
    waitingTitle: "ランタイムを待機しています",
    waitingLoadingBody: "知識ベースはモデルと同時に読み込まれます。",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlasランタイムは接続されていません。",
    heroTitle: "Atlasが実際に引用できる文書を閲覧する",
    heroSubtitle:
      "出典の追跡可能性は本製品の一部です。表示されるタイトル、団体名、司法管轄、ライセンスはすべて、読み込まれたコーパスのメタデータに基づいています。",
    metricLoaded: "読み込み済み文書数",
    metricLicenseVerified: "ライセンス確認済み",
    metricJurisdictions: "司法管轄数",
    searchPlaceholder: "タイトル、出典、司法管轄で絞り込む...",
    documentsLoadedBadge: (count) => `${count} 件の文書を読み込み済み`,
    provenanceNotice:
      "Atlasはこのカタログから引用します。欠落しているメタデータは意図的に空欄のままにしており、UIが仮の値で補完することはありません。",
    noMatchTitle: (query) => `「${query}」に一致する文書はありません`,
    noMatchBody:
      "別のタイトルを試すか、Atlasに直接質問してください — 検索は文書の全文を対象に行われます。",
    sourcePathLabel: "出典パス",
    sourceUrlLabel: "出典URL",
    licenseLabel: "ライセンス",
    retrievedOn: (date) => `取得日: ${date}`,
  },

  drugReference: {
    heroTitle: "根拠に基づく医薬品検索",
    heroSubtitle:
      "この画面はローカルの医療コーパスを直接検索します。医薬品に関する事実を捏造したり、調剤したり、薬局システムのように振る舞ったりすることはありません。",
    exampleQueries: ["経口補水液", "マラリア治療薬", "血圧の薬"],
    searchPlaceholder: "ローカルコーパスから医薬品、治療法、医療用語を検索...",
    searchButton: "ローカルの根拠を検索",
    waitingTitle: "Atlasランタイムを待機しています",
    waitingLoadingBody:
      "ローカルモデルとコーパスの読み込みが完了すると、医薬品の根拠検索が利用可能になります。",
    waitingUnavailableBody: (reason) => reason,
    waitingDisconnected: "Atlasランタイムは接続されていません。",
    noSearchTitle: "まだ検索していません",
    noSearchBody:
      "用語を入力すると、Atlasが読み込まれたコーパスから取得できる正確な医薬品関連の根拠を確認できます。",
    confidenceStrong: "検索根拠が十分です",
    confidenceWeak: "検索根拠が乏しいです",
    confidenceNoEvidence: "根拠が見つかりませんでした",
    matchingRecords: (count) => `${count} 件の一致する根拠`,
    noEvidenceTitle: "現在のコーパスには情報がありません",
    noEvidenceBody:
      "Atlasはこのリクエストに対して検証済みのローカル根拠を取得できませんでした。裏付けのない医薬品情報でこの空白を埋めることはありません。",
    licenseVerified: "ライセンス確認済み",
    localCorpus: "ローカルコーパス",
    lexicalBadge: "字句一致",
    semanticBadge: "意味一致",
    retrievedOn: (date) => `取得日: ${date}`,
    scoreLabel: (score) => `スコア ${score.toFixed(3)}`,
  },

  languagesScreen: {
    waitingTitle: "ランタイムを待機しています",
    waitingDisconnected: "Atlasランタイムは接続されていません。",
    heroTitle: "登録済みは完全な検証済みを意味しません",
    heroSubtitle:
      "この登録情報は実際のアプリケーションデータです。各言語に表示されるステータスは、単なる登録に基づく宣伝文句ではなく、実際に計測された評価結果を反映しています。",
    metricRegistered: "登録済み",
    metricValidated: "検索/生成 検証済み",
    metricPlausible: "流暢性は確認できた",
    metricPartialOrInconclusive: "部分的または不確定",
    banner: (validated, total) =>
      `このリストへの登録は単なるメタデータであり、機能の保証ではありません。2026-08-08にQwen3-4Bで実施した実際の生成テストでは、${total} 言語中 ${validated} 言語のみが信頼できる正しい出力を生成しました — 各言語の実際の測定結果は下記のステータス列をご確認ください。`,
    statusLabels: {
      validated: "検証済み",
      "plausible-fluent": "流暢性は確認できた",
      partial: "部分的",
      inconclusive: "不確定",
      garbled: "文意不明",
      failed: "失敗",
    },
  },

  runtimeBenchmark: {
    waitingTitle: "ランタイムを待機しています",
    waitingDisconnected: "Atlasランタイムは接続されていません。",
    heroTitle: "実際のローカルランタイム情報",
    heroSubtitle:
      "この画面は、デスクトップアプリでAtlasが実際に読み込み、計測した内容を示します。欠落した値は仮の数値で埋めるのではなく、未計測として表示されます。",
    sectionRuntimeStatus: "ランタイムの状態",
    sectionBenchmark: "ベンチマーク",
    sectionHardware: "ハードウェア(実行時に実際に検出)",
    sectionGenerationThroughput: "生成スループット",
    labelDocumentsLoaded: "読み込み済み文書数",
    labelLanguagesRegistered: "登録済み言語数",
    labelGenerationModel: "生成モデル",
    labelEmbeddingModel: "埋め込みモデル",
    labelKnowledgeBase: "知識ベース",
    labelWorkerState: "ワーカープロセスの状態",
    labelThreadCount: "スレッド数",
    labelWorkerUptime: "ワーカー稼働時間",
    labelRetrievalLatency: "検索レイテンシ",
    labelProcessMemory: "プロセスのメモリ使用量",
    workerStateLoaded: "生成モデルと埋め込みモデルの両方が読み込み済み",
    workerStatePartial: "一部のみ読み込み済み",
    workerUptimeSeconds: (seconds) => `${seconds} 秒`,
    benchmarkDescription: (docPath) =>
      `読み込み済みモデルに対して実際の生成リクエストを実行し、実際に計測されたスループットを報告します — 捏造された数値は決して使用しません。ここで再利用している完全な日付付き手法については ${docPath} をご覧ください。`,
    runBenchmarkButton: "今すぐベンチマークを実行",
    runningBenchmarkButton: "実際のベンチマークを実行中…",
    labelCpu: "CPU",
    labelCores: "コア数",
    labelTotalRam: "合計RAM",
    labelAvailableRam: "利用可能なRAM",
    labelRamTier: "選択されたRAM階層",
    physicalLogicalCores: (physical, logical) => `物理 ${physical} / 論理 ${logical}`,
    labelTokensPerSecond: "トークン/秒",
    labelGeneratedTokens: "生成トークン数",
    labelTotalDuration: "合計時間",
    noGenerationModel: "この実行では生成モデルは読み込まれませんでした。",
    devHardwareNotice:
      "これは開発用ハードウェアで実行されたものであり、競技会が定めるRAM 8GBの基準クラスではありません — これらの数値を提出資料で引用する前に、ADTCベンチマークスイートの「効率」セクションをご確認ください。",
  },

  accessibility: {
    openSettings: "アクセシビリティ設定を開く",
    closeSettings: "アクセシビリティ設定を閉じる",
    panelTitle: "アクセシビリティ",
    textSize: "文字サイズ",
    highContrast: "ハイコントラスト",
    reduceMotion: "アニメーションを減らす",
    alwaysShowFocus: "フォーカスリングを常に表示",
    resetDefaults: "初期設定に戻す",
  },
};

export default ja;
