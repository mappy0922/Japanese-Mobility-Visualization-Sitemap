import React from "react";

/*
 * ============================================================
 * 全年度時系列折れ線グラフ (YearlyTrendChart)
 * ============================================================
 */
function YearlyTrendChart({ data = [], currentYear }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 236;
  const height = 74;
  const paddingLeft = 20;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 16;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // 各ポイントの座標計算
  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * plotWidth;
    const y = paddingTop + (1 - item.value / maxVal) * plotHeight;
    const isSelected = item.fullYear === currentYear;
    return { ...item, x, y, isSelected };
  });

  // 折れ線パス (d)
  const linePath = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // エリア塗りパス (d)
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z`;

  return (
    <div className="trendChartWrapper">
      <div className="trendChartHeader">
        <span className="trendChartTitle">全年度推移 (1990〜2010年)</span>
      </div>

      <div className="trendLineChartContainer">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trendLineSvg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* 背景グリッド破線 */}
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight * 0.5}
            x2={width - paddingRight}
            y2={paddingTop + plotHeight * 0.5}
            stroke="#e2e8f0"
            strokeDasharray="2,2"
            strokeWidth="1"
          />
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* グラデーションエリア塗り */}
          <path d={areaPath} fill="url(#trendAreaGradient)" />

          {/* 折れ線 */}
          <path
            d={linePath}
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 各年度のデータポイント ＆ 数値ラベル ＆ 年度ラベル */}
          {points.map((p) => {
            const formattedVal =
              p.value >= 100000000
                ? `${(p.value / 100000000).toFixed(1)}億`
                : p.value >= 10000
                ? `${Math.round(p.value / 10000).toLocaleString()}万`
                : p.value > 0
                ? p.value.toLocaleString()
                : "0";

            return (
              <g key={p.year}>
                {/* 数値ラベル */}
                <text
                  x={p.x}
                  y={Math.max(10, p.y - 5)}
                  textAnchor="middle"
                  fontSize={p.isSelected ? "8.5" : "7.5"}
                  fontWeight={p.isSelected ? "bold" : "600"}
                  fill={p.isSelected ? "#1e3a8a" : "#64748b"}
                >
                  {formattedVal}
                </text>

                {/* 選択年度の外側ハイライトリング */}
                {p.isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="6.5"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                    opacity="0.25"
                  />
                )}

                {/* データポイント円 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.isSelected ? "4" : "2.8"}
                  fill={p.isSelected ? "#1e3a8a" : "#ffffff"}
                  stroke={p.isSelected ? "#ffffff" : "#64748b"}
                  strokeWidth={p.isSelected ? "1.5" : "1.5"}
                />

                {/* 年度テキスト */}
                <text
                  x={p.x}
                  y={height - 2}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight={p.isSelected ? "bold" : "500"}
                  fill={p.isSelected ? "#1e3a8a" : "#64748b"}
                >
                  {p.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * テキスト比較コンポーネント (今年度と5年前の差分)
 * ============================================================
 */
function TextOnlyComparison({ current, previous, diff, rate }) {
  const curVal = current ?? 0;
  const prevVal = previous ?? 0;

  // 倍率・増減情報の生成
  let diffBadgeText = "";
  let diffBadgeColor = "#475569";

  if (prevVal === 0) {
    if (curVal === 0) {
      diffBadgeText = "0人 (変動なし)";
      diffBadgeColor = "#64748b";
    } else {
      diffBadgeText = `▲ +${curVal.toLocaleString()}人 (5年前なし/新規)`;
      diffBadgeColor = "#e53935";
    }
  } else {
    const multiplier = (curVal / prevVal).toFixed(1);
    const diffNum = curVal - prevVal;
    if (diffNum > 0) {
      const pct = rate ?? ((diffNum / prevVal) * 100).toFixed(1);
      diffBadgeText = `▲ +${diffNum.toLocaleString()}人 (+${pct}% / ${multiplier}倍)`;
      diffBadgeColor = "#e53935";
    } else if (diffNum < 0) {
      const pct = rate ?? ((diffNum / prevVal) * 100).toFixed(1);
      diffBadgeText = `▼ ${diffNum.toLocaleString()}人 (${pct}% / ${multiplier}倍)`;
      diffBadgeColor = "#1e88e5";
    } else {
      diffBadgeText = "● ±0人 (5年前同水準)";
      diffBadgeColor = "#64748b";
    }
  }

  return (
    <div className="textCompareContainer">
      <div className="textCompareHeroRow">
        <div className="currentPeopleHero">
          <span className="currentHeroLabel">今年度</span>
          <div className="currentHeroNumberWrapper">
            <span className="currentHeroNumber">{curVal.toLocaleString()}</span>
            <span className="currentHeroUnit">人</span>
          </div>
        </div>

        <div className="previousPeopleSubRight">
          <span className="prevSubLabel">5年前:</span>
          <span className="prevSubNumber">{prevVal.toLocaleString()} 人</span>
        </div>
      </div>

      <div className="textDiffBadge" style={{ color: diffBadgeColor }}>
        <span className="textDiffLabel">5年前比:</span>
        <span className="textDiffValue">{diffBadgeText}</span>
      </div>
    </div>
  );
}

export default function ComparePanel({
  traffic,
  setTraffic,
  year,
  prefecture = "東京",
  destination = "大阪",
  currentPeople,
  previousPeople,
  diff,
  rate,
  label = [],
  selectedLabel,
  setSelectedLabel,
  currentLabelPeople,
  previousLabelPeople,
  labelDiff,
  labelRate,
  yearlyDestinationTrend = [],
  yearlyLabelTrend = [],
}) {
  const selectedLabelDisplayName = selectedLabel
    ? selectedLabel.replace("代_全機関_", "").replace("_全目的", "")
    : "";

  return (
    <div className="comparePanel">
      {/* 1. 5年間隔比較 & 全年度推移 カード */}
      <div className="compareCard">
        <div className="compareHeaderTopRow">
          <span className="compareTitle">5年間隔比較</span>
          <span className="compareFlowBadge">
            他都道府県→{destination || "未選択"}
          </span>
        </div>
        <div className="compareBody">
          {!destination ? (
            <div className="compareNotice">目的地を選択してください</div>
          ) : (
            <>
              {year === "1990年度" ? (
                <div className="compareNotice">比較対象の5年前データはありません</div>
              ) : (
                <TextOnlyComparison
                  current={currentPeople}
                  previous={previousPeople}
                  diff={diff}
                  rate={rate}
                />
              )}

              {/* 全年度時系列折れ線グラフ */}
              {yearlyDestinationTrend.length > 0 && (
                <YearlyTrendChart
                  data={yearlyDestinationTrend}
                  currentYear={year}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. ラベル比較 & 全年度推移 カード */}
      <div className="compareCard">
        <div className="labelCompareHeader">
          <div className="compareHeaderTopRow">
            <span className="compareTitle">ラベル比較</span>
            <span className="compareFlowBadge">
              {prefecture}({selectedLabelDisplayName || "選択中"})→{destination}
            </span>
          </div>

          {/* 交通目的別 / 交通手段別 切り替えボタングループ */}
          <div className="trafficModeSwitch">
            <button
              type="button"
              className={`trafficModeBtn ${traffic === "移動目的" ? "active" : ""}`}
              onClick={() => {
                if (setTraffic) {
                  setTraffic("移動目的");
                  setSelectedLabel && setSelectedLabel("代_全機関_観光");
                }
              }}
            >
              <span>交通目的別で見る</span>
            </button>
            <button
              type="button"
              className={`trafficModeBtn ${traffic === "移動手段" ? "active" : ""}`}
              onClick={() => {
                if (setTraffic) {
                  setTraffic("移動手段");
                  setSelectedLabel &&
                    setSelectedLabel(
                      year === "2005年度" || year === "2010年度"
                        ? "鉄道"
                        : "鉄道_全目的"
                    );
                }
              }}
            >
              <span>交通手段別で見る</span>
            </button>
          </div>

          {/* ラベル項目ボタングリッド */}
          {label && label.length > 0 && (
            <div
              className={`labelGridInCard ${
                traffic === "移動目的" ? "purposeGrid" : "transportGrid"
              }`}
            >
              {label.map((name) => {
                const displayName = name
                  .replace("代_全機関_", "")
                  .replace("_全目的", "");

                return (
                  <button
                    key={name}
                    type="button"
                    className={`labelButtonInCard ${selectedLabel === name ? "active" : ""}`}
                    onClick={() => setSelectedLabel && setSelectedLabel(name)}
                  >
                    <span className="labelBtnText">{displayName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="compareBody">
          {!prefecture || !destination ? (
            <div className="compareNotice">出発地と目的地を選択してください</div>
          ) : !selectedLabel ? (
            <div className="compareNotice">ラベルを選択してください</div>
          ) : (
            <>
              {year === "1990年度" ? (
                <div className="compareNotice">比較対象の5年前データはありません</div>
              ) : (
                <TextOnlyComparison
                  current={currentLabelPeople}
                  previous={previousLabelPeople}
                  diff={labelDiff}
                  rate={labelRate === "新規" ? null : labelRate}
                />
              )}

              {/* 全年度時系列折れ線グラフ */}
              {yearlyLabelTrend.length > 0 && (
                <YearlyTrendChart
                  data={yearlyLabelTrend}
                  currentYear={year}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
