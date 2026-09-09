/**
 * 地域特性クラスタリング データ定義 & 分析モジュール
 * 「出発地 × 移動目的 × 交通手段 × 移動距離」に基づく5大地域特性分類
 */

export const CLUSTERS = {
  metropolitan: {
    id: "metropolitan",
    name: "大都市圏・通勤交流型",
    shortName: "大都市圏・通勤型",
    enName: "Metropolitan Commuter Hub",
    color: "#e11d48", // クリムゾンレッド (Toのパープルとの重複回避)
    bgColor: "rgba(225, 29, 72, 0.12)",
    borderColor: "#fda4af",
    icon: "🏙️",
    summary: "近隣都県からの通勤・通学および生活移動が膨大で、鉄道分担率が極めて高い大都市圏の中枢・通勤圏。",
  },
  tourism: {
    id: "tourism",
    name: "観光・広域交流型",
    shortName: "観光・広域型",
    enName: "Tourism & Long-Distance Destination",
    color: "#0284c7", // スカイブルー
    bgColor: "rgba(2, 132, 199, 0.12)",
    borderColor: "#7dd3fc",
    icon: "✈️",
    summary: "全国・遠隔地からの観光・レジャー目的の流入が多く、航空機や新幹線による長距離移動が主体の地域。",
  },
  industrial: {
    id: "industrial",
    name: "産業・中枢都市型",
    shortName: "産業・中枢型",
    enName: "Industrial & Regional Economic Hub",
    color: "#ea580c", // オレンジ
    bgColor: "rgba(234, 88, 12, 0.12)",
    borderColor: "#fdba74",
    icon: "🏭",
    summary: "周辺地域および全国からの業務・出張・物流移動が活発で、自動車や新幹線による産業移動が中心の拠点地域。",
  },
  resort: {
    id: "resort",
    name: "歴史・文化・リゾート型",
    shortName: "歴史・リゾート型",
    enName: "Cultural & Resort Gateway",
    color: "#059669", // エメラルドグリーン
    bgColor: "rgba(5, 150, 105, 0.12)",
    borderColor: "#6ee7b7",
    icon: "🏯",
    summary: "豊かな歴史・自然資源を有し、中長距離からの観光・私用客が年間を通じて多数訪れる文化・リゾート拠点。",
  },
  local: {
    id: "local",
    name: "地域内自立・生活圏型",
    shortName: "地域内自立型",
    enName: "Local Life & Regional Self-Sustained",
    color: "#64748b", // スレートグレー
    bgColor: "rgba(100, 116, 139, 0.12)",
    borderColor: "#cbd5e1",
    icon: "🌾",
    summary: "他県からの流入は限定的で、隣接県や圏域内での生活・私用移動および幹線道路による移動が主体の地域。",
  },
};

/**
 * 47都道府県（道北・道東・道央・道南含む50地点）のクラスタプロファイル定義
 * 各指標は 0〜100 のスコア（観光度、業務度、鉄道比率、遠距離流入比率）
 */
export const PREFECTURE_PROFILES = {
  // --- 北海道・東北 ---
  "道央": {
    clusterId: "tourism",
    features: [
      "札幌・新千歳空港を擁し、全国からの航空による観光・出張流入が集中",
      "観光目的比率が約50%超と極めて高い",
      "道内他地域（道北・道東・道南）からの人口吸引中枢",
    ],
    scores: { tourism: 85, business: 45, rail: 20, longDist: 88 },
  },
  "道北": {
    clusterId: "tourism",
    features: [
      "旭川・富良野エリアなど広域観光の目的地",
      "道央（札幌圏）および道外からの観光流入が中心",
      "航空・自動車による移動が主体",
    ],
    scores: { tourism: 78, business: 30, rail: 15, longDist: 75 },
  },
  "道東": {
    clusterId: "tourism",
    features: [
      "知床・阿寒・十勝など自然観光資源への全国からの観光流入",
      "空港（帯広・釧路・女満別）経由の航空利用比率が高い",
      "道内他地域からの長距離ドライブ移動が多い",
    ],
    scores: { tourism: 82, business: 25, rail: 10, longDist: 80 },
  },
  "道南": {
    clusterId: "tourism",
    features: [
      "函館を中心とした歴史・景観観光地への流入",
      "北海道新幹線・フェリー・航空による本州（東北・首都圏）との接続",
      "観光・私用目的が8割以上を占める",
    ],
    scores: { tourism: 80, business: 28, rail: 35, longDist: 72 },
  },
  "青森": {
    clusterId: "local",
    features: [
      "隣接県（岩手・秋田）および道南との生活・私用移動が中心",
      "東北新幹線による首都圏からのビジネス・観光も一定数存在",
      "自動車・幹線道路を利用した移動比率が高い",
    ],
    scores: { tourism: 40, business: 35, rail: 28, longDist: 42 },
  },
  "岩手": {
    clusterId: "local",
    features: [
      "東北新幹線沿線を中心とした宮城・青森との地域間移動",
      "内陸部の業務移動と三陸沿岸の生活移動が主体",
      "隣接県からの自動車移動が多数を占める",
    ],
    scores: { tourism: 38, business: 38, rail: 32, longDist: 38 },
  },
  "宮城": {
    clusterId: "industrial",
    features: [
      "東北地方の中枢都市（仙台）として周辺各県からの業務・買物流入が集中",
      "東北新幹線を利用した首都圏との強固なビジネスパイプライン",
      "仕事・業務目的の流入比率が高い",
    ],
    scores: { tourism: 45, business: 65, rail: 55, longDist: 58 },
  },
  "秋田": {
    clusterId: "local",
    features: [
      "他県からの長距離流入は比較的少なく、近隣県との生活移動が主",
      "秋田新幹線および高速道路経由の移動が中心",
      "私用・帰省目的の比率が高い",
    ],
    scores: { tourism: 35, business: 30, rail: 25, longDist: 35 },
  },
  "山形": {
    clusterId: "local",
    features: [
      "仙台都市圏（宮城）との間で極めて活発な通勤・通学・買物移動",
      "山形新幹線および高速バスによる首都圏との交流",
      "温泉・果樹等の観光流入も一部存在",
    ],
    scores: { tourism: 42, business: 36, rail: 30, longDist: 36 },
  },
  "福島": {
    clusterId: "industrial",
    features: [
      "首都圏および東北各県を結ぶ交通結節点",
      "製造業拠点が多く、周辺県からの業務・通勤移動が活発",
      "新幹線および東北自動車道の利用比率が高い",
    ],
    scores: { tourism: 38, business: 58, rail: 45, longDist: 48 },
  },

  // --- 関東 ---
  "茨城": {
    clusterId: "industrial",
    features: [
      "つくば・日立・鹿島など研究開発・臨海工業拠点への業務流入",
      "首都圏（東京・千葉）との鉄道・常磐道経由の活発な移動",
      "業務・生活目的がバランス良く存在",
    ],
    scores: { tourism: 35, business: 62, rail: 48, longDist: 40 },
  },
  "栃木": {
    clusterId: "resort",
    features: [
      "日光・那須など全国有数の観光リゾート地への観光流入が膨大",
      "宇都宮周辺の製造業・内陸工業へのビジネス流入も共存",
      "東武鉄道・新幹線および東北道による首都圏からの流入が中心",
    ],
    scores: { tourism: 72, business: 48, rail: 52, longDist: 55 },
  },
  "群馬": {
    clusterId: "industrial",
    features: [
      "自動車・機械産業の集積による北関東・首都圏からの業務流入",
      "草津・伊香保など温泉観光地への自家用車・高速バス流入",
      "関越道・上越新幹線沿線の拠点都市機能",
    ],
    scores: { tourism: 55, business: 58, rail: 40, longDist: 46 },
  },
  "埼玉": {
    clusterId: "metropolitan",
    features: [
      "東京都との間で数億人規模の通勤・通学・生活相互流動",
      "鉄道分担率が80%超と極めて高い",
      "首都圏北部のベッドタウンおよび交通ハブとして機能",
    ],
    scores: { tourism: 20, business: 45, rail: 88, longDist: 25 },
  },
  "千葉": {
    clusterId: "metropolitan",
    features: [
      "東京との強力な通勤・通学流動および浦安エリアへの巨大観光流入",
      "成田空港・東京湾アクアラインを介した広域交通結節点",
      "鉄道利用が中心で、臨海部・房総へのレジャー移動も共存",
    ],
    scores: { tourism: 48, business: 42, rail: 82, longDist: 45 },
  },
  "東京": {
    clusterId: "metropolitan",
    features: [
      "日本最大の都市中枢として、神奈川・埼玉・千葉から毎日数百万人規模が流入",
      "新幹線・航空・高速道路の全幹線が結節し、全国からのビジネス・観光が集中",
      "鉄道分担率が圧倒的で、通勤・通学・業務・私用が全般に極大",
    ],
    scores: { tourism: 55, business: 75, rail: 92, longDist: 65 },
  },
  "神奈川": {
    clusterId: "metropolitan",
    features: [
      "東京都との相互通勤・通学流動が極めて膨大（首都圏通勤圏）",
      "横浜・鎌倉・箱根など全国区の観光地への流入も高水準",
      "鉄道網が極めて発達し、近隣都県との短距離移動が約8割を占める",
    ],
    scores: { tourism: 45, business: 48, rail: 86, longDist: 32 },
  },

  // --- 中部・北陸 ---
  "新潟": {
    clusterId: "industrial",
    features: [
      "日本海側最大の中枢都市として北陸・東北・関東との経済交流拠点",
      "上越新幹線・関越道による首都圏との直結ビジネス流動",
      "越後湯沢などスキー・温泉観光の流入も活発",
    ],
    scores: { tourism: 48, business: 58, rail: 52, longDist: 52 },
  },
  "富山": {
    clusterId: "industrial",
    features: [
      "薬品・電子・重化学工業が集積し、近隣県および中京・関西からの業務流入",
      "立山黒部アルペンルートなど山岳観光への長距離流入",
      "北陸新幹線・北陸道沿線の産業拠点",
    ],
    scores: { tourism: 45, business: 60, rail: 42, longDist: 48 },
  },
  "石川": {
    clusterId: "resort",
    features: [
      "金沢・能登・加賀温泉など歴史・文化観光への全国からの流入が中心",
      "北陸新幹線・特急による関西・中京・首都圏からの観光客比率が高い",
      "観光・私用目的が過半数を占める北陸の文化中枢",
    ],
    scores: { tourism: 78, business: 42, rail: 62, longDist: 68 },
  },
  "福井": {
    clusterId: "local",
    features: [
      "関西圏（滋賀・京都・大阪）および中京圏との結びつきが強い",
      "特急・北陸道を利用した近隣府県との移動が中心",
      "恐竜博物館や越前海岸など特定目的の観光客も流入",
    ],
    scores: { tourism: 45, business: 40, rail: 45, longDist: 42 },
  },
  "山梨": {
    clusterId: "resort",
    features: [
      "富士五湖・八ヶ岳・勝沼など首都圏からのリゾート・レジャー流入が圧倒的",
      "中央道・中央線を利用した東京・神奈川からの週末・観光流動が主体",
      "観光目的比率が7割超と極めて高い",
    ],
    scores: { tourism: 82, business: 32, rail: 38, longDist: 50 },
  },
  "長野": {
    clusterId: "resort",
    features: [
      "軽井沢・上高地・白馬など日本有数の高原リゾート・スキー観光地",
      "首都圏および中京圏双方からの広域観光・私用流入が集中",
      "北陸新幹線・中央線・高速道路によるアクセスが中心",
    ],
    scores: { tourism: 80, business: 38, rail: 48, longDist: 62 },
  },
  "岐阜": {
    clusterId: "industrial",
    features: [
      "愛知県（名古屋都市圏）との強固な通勤・通学・産業連携",
      "飛騨高山・白川郷など世界的な観光資源への遠距離流入も併せ持つ",
      "東海道新幹線・名神・東海北陸道による自動車・鉄道の複合移動",
    ],
    scores: { tourism: 52, business: 55, rail: 46, longDist: 48 },
  },
  "静岡": {
    clusterId: "industrial",
    features: [
      "東海道ベルト地帯の製造業中枢（自動車・楽器・機械）として業務流入が極めて多い",
      "東海道新幹線・東名高速を利用した首都圏・中京圏との往来が日常的",
      "伊豆・熱海など東部エリアの温泉観光流入も共存",
    ],
    scores: { tourism: 48, business: 65, rail: 60, longDist: 54 },
  },
  "愛知": {
    clusterId: "industrial",
    features: [
      "日本最大の自動車産業中枢（名古屋圏）として全国からビジネス・通勤流入が集中",
      "岐阜・三重・静岡との間で自動車および近郊鉄道による膨大な産業流動",
      "東海道新幹線による東京・大阪との超高頻度ビジネス往来",
    ],
    scores: { tourism: 32, business: 78, rail: 65, longDist: 62 },
  },

  // --- 近畿 ---
  "三重": {
    clusterId: "industrial",
    features: [
      "中京圏（愛知）および近畿圏双方に接続する産業・臨海工業拠点",
      "伊勢志摩など全国区の神社・リゾート観光への流入",
      "近鉄・東名阪道を利用した自動車・鉄道移動が中心",
    ],
    scores: { tourism: 52, business: 56, rail: 48, longDist: 46 },
  },
  "滋賀": {
    clusterId: "metropolitan",
    features: [
      "京都・大阪都市圏へのベッドタウンとしてJR東海道線（琵琶湖線）の通勤流動が中心",
      "京阪神との間で毎日数十万人の相互流動",
      "琵琶湖周辺へのレジャー・ドライブ流入も共存",
    ],
    scores: { tourism: 38, business: 42, rail: 76, longDist: 32 },
  },
  "京都": {
    clusterId: "resort",
    features: [
      "日本を代表する歴史・文化観光都市として全国・全世界から観光客が殺到",
      "大阪・滋賀・奈良との通勤・通学流動（京阪神都市圏）も極めて活発",
      "東海道新幹線・JR・私鉄が密集し、鉄道分担率が高い",
    ],
    scores: { tourism: 85, business: 45, rail: 82, longDist: 75 },
  },
  "大阪": {
    clusterId: "metropolitan",
    features: [
      "西日本最大の経済中枢として、兵庫・京都・奈良・和歌山から膨大な通勤・業務流入",
      "新幹線・航空（伊丹・関空）・高速網が集中し、全国からのビジネス・観光客を吸引",
      "鉄道利用率が非常に高く、多核都市圏の中心を形成",
    ],
    scores: { tourism: 52, business: 74, rail: 88, longDist: 66 },
  },
  "兵庫": {
    clusterId: "metropolitan",
    features: [
      "神戸・阪神間を中心に大阪都市圏との通勤・業務・買物流動が膨大",
      "姫路城・有馬温泉・城崎など広域観光資源への流入も豊富",
      "山陽新幹線・JR・阪急・阪神等の高密度鉄道網が移動の骨格",
    ],
    scores: { tourism: 45, business: 52, rail: 82, longDist: 48 },
  },
  "奈良": {
    clusterId: "resort",
    features: [
      "古都の歴史・寺社仏閣観光への全国からの観光流入",
      "大阪・京都への通勤率が日本一高いベッドタウン特性も併せ持つ",
      "近鉄電車を中心とした近隣府県との鉄道移動が主流",
    ],
    scores: { tourism: 70, business: 35, rail: 75, longDist: 50 },
  },
  "和歌山": {
    clusterId: "local",
    features: [
      "大阪南部との生活・通勤移動および阪和道・南海本線経由の移動が中心",
      "白浜・高野山・熊野古道など特定観光地への長距離流入",
      "自家用車・特急列車による移動が主体",
    ],
    scores: { tourism: 52, business: 35, rail: 48, longDist: 42 },
  },

  // --- 中国・四国 ---
  "鳥取": {
    clusterId: "local",
    features: [
      "隣接する島根・岡山・兵庫との生活・私用移動が中心",
      "鳥取砂丘・水木しげるロードなどへの観光客が一部流入",
      "自動車・幹線道路への依存度が高い",
    ],
    scores: { tourism: 48, business: 32, rail: 22, longDist: 38 },
  },
  "島根": {
    clusterId: "local",
    features: [
      "県内および隣接県（鳥取・広島）との地域内生活移動が主流",
      "出雲大社・松江など歴史観光への全国からの航空・特急流入",
      "他県からの流入総数は全国でも比較的限定的",
    ],
    scores: { tourism: 50, business: 30, rail: 20, longDist: 40 },
  },
  "岡山": {
    clusterId: "industrial",
    features: [
      "山陽新幹線・瀬戸大橋線・高速道路が交差する中国・四国の巨大交通結節点",
      "四国4県および広島・兵庫からの通勤・通学・業務流入が多数",
      "水島臨海工業地帯を中心とした活発な産業移動",
    ],
    scores: { tourism: 42, business: 65, rail: 58, longDist: 55 },
  },
  "広島": {
    clusterId: "industrial",
    features: [
      "中国地方の政治・経済中枢として周辺県からのビジネス流入が集中",
      "自動車・鉄鋼などの製造業拠点への全国からの業務移動",
      "原爆ドーム・宮島など世界遺産観光への広域・新幹線流入も共存",
    ],
    scores: { tourism: 55, business: 68, rail: 60, longDist: 64 },
  },
  "山口": {
    clusterId: "industrial",
    features: [
      "関門海峡を挟んで福岡（北九州都市圏）との一体的な通勤・業務移動",
      "瀬戸内沿岸の石油化学・重化学コンビナートへの産業流入",
      "山陽新幹線・中国道による東西交通路の要衝",
    ],
    scores: { tourism: 38, business: 60, rail: 45, longDist: 45 },
  },
  "徳島": {
    clusterId: "local",
    features: [
      "明石海峡大橋・大鳴門橋を通じて関西（兵庫・大阪）との高速バス移動が極めて活発",
      "鉄道よりも高速道路・自家用車による移動分担率が圧倒的",
      "阿波おどり・鳴門観光の特定時期集中流動",
    ],
    scores: { tourism: 48, business: 38, rail: 10, longDist: 42 },
  },
  "香川": {
    clusterId: "industrial",
    features: [
      "瀬戸大橋を介して本州（岡山）と直結し、四国の玄関口として機能",
      "四国他県および岡山からの通勤・業務・ショッピング流入が集中",
      "JR瀬戸大橋線および高松港フェリーによる活発な交流",
    ],
    scores: { tourism: 45, business: 60, rail: 42, longDist: 48 },
  },
  "愛媛": {
    clusterId: "industrial",
    features: [
      "松山を中心に四国最大の人口を抱え、紙・タオル・機械などの産業集積",
      "しまなみ海道・松山空港による本州・首都圏との接続",
      "道後温泉など観光資源への全国からの航空・特急流入",
    ],
    scores: { tourism: 52, business: 55, rail: 30, longDist: 52 },
  },
  "高知": {
    clusterId: "local",
    features: [
      "四国山地に囲まれ、他県からの日常流入は限定的で自立型生活圏を形成",
      "高知空港および土讃線特急による東京・関西からの観光・出張",
      "県内移動および香川・愛媛との幹線移動が中心",
    ],
    scores: { tourism: 50, business: 32, rail: 18, longDist: 45 },
  },

  // --- 九州・沖縄 ---
  "福岡": {
    clusterId: "industrial",
    features: [
      "九州最大の経済・交通中枢として、九州全域および全国からビジネス流入が集中",
      "山陽新幹線・福岡空港・高速バス網による超高密度な流動ハブ",
      "仕事・業務目的の割合が高く、ショッピングや医療・教育の吸引力も極大",
    ],
    scores: { tourism: 42, business: 76, rail: 65, longDist: 72 },
  },
  "佐賀": {
    clusterId: "local",
    features: [
      "隣接する福岡都市圏および長崎との通勤・通学・生活移動が中心",
      "長崎本線・長崎道による短距離移動分担率が高い",
      "有田・伊万里や唐津など伝統工芸・観光流入も一部存在",
    ],
    scores: { tourism: 38, business: 42, rail: 42, longDist: 30 },
  },
  "長崎": {
    clusterId: "tourism",
    features: [
      "ハウステンボス・軍艦島・世界遺産巡りなど全国からの観光流入が豊富",
      "長崎空港およびJR特急・西九州新幹線による遠距離アクセス",
      "観光・レジャー目的の比率が6割超",
    ],
    scores: { tourism: 78, business: 35, rail: 45, longDist: 70 },
  },
  "熊本": {
    clusterId: "industrial",
    features: [
      "九州中央部の拠点都市として、半導体関連産業などへのビジネス流入が急増",
      "九州新幹線・熊本空港による関西・首都圏・福岡との強力なパイプライン",
      "阿蘇・黒川温泉など全国区の自然観光流入も共存",
    ],
    scores: { tourism: 55, business: 62, rail: 50, longDist: 62 },
  },
  "大分": {
    clusterId: "resort",
    features: [
      "別府・由布院など日本一の温泉湧出量を誇る国際観光リゾート",
      "福岡・北九州からのドライブ・特急客および大分空港経由の首都圏観光客",
      "観光目的比率が極めて高く、リゾート型移動が主体",
    ],
    scores: { tourism: 82, business: 38, rail: 40, longDist: 65 },
  },
  "宮崎": {
    clusterId: "tourism",
    features: [
      "青島・高千穂・日南海岸など南国リゾート観光への全国からの流入",
      "宮崎空港を通じた航空利用比率が極めて高い",
      "遠距離・観光主体の流動プロファイル",
    ],
    scores: { tourism: 76, business: 32, rail: 18, longDist: 78 },
  },
  "鹿児島": {
    clusterId: "tourism",
    features: [
      "九州新幹線終着駅および鹿児島空港・離島航路の南九州ゲートウェイ",
      "桜島・指宿・屋久島・奄美など観光資源への全国からの長距離流入",
      "航空・新幹線による遠距離観光客が多数を占める",
    ],
    scores: { tourism: 75, business: 42, rail: 48, longDist: 76 },
  },
  "沖縄": {
    clusterId: "tourism",
    features: [
      "日本屈指の海洋リゾートとして、流入の98%以上が航空機利用",
      "全国（東京・大阪・愛知・福岡等）からの長距離観光目的が圧倒的（85%超）",
      "陸路接続がないため、純粋な長距離観光・交流型特性が最も顕著",
    ],
    scores: { tourism: 95, business: 20, rail: 5, longDist: 98 },
  },
};

/**
 * 指定した都道府県のクラスタ情報を取得
 */
export function getPrefectureCluster(prefName) {
  const profile = PREFECTURE_PROFILES[prefName] || {
    clusterId: "local",
    features: ["生活・私用目的を中心とした地域間移動が主"],
    scores: { tourism: 40, business: 40, rail: 40, longDist: 40 },
  };
  const cluster = CLUSTERS[profile.clusterId] || CLUSTERS.local;
  return {
    ...profile,
    cluster,
  };
}

/**
 * クラスタIDからクラスタ情報を取得
 */
export function getClusterMeta(clusterId) {
  return CLUSTERS[clusterId] || CLUSTERS.local;
}

/**
 * 特定のクラスタに属する都道府県名リストを取得
 */
export function getPrefecturesInCluster(clusterId) {
  return Object.keys(PREFECTURE_PROFILES).filter(
    (name) => PREFECTURE_PROFILES[name].clusterId === clusterId
  );
}

/**
 * 全クラスタ一覧
 */
export function getAllClusters() {
  return Object.values(CLUSTERS);
}
