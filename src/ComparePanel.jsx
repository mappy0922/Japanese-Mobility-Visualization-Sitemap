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
}) {
  const selectedLabelDisplayName = selectedLabel
    ? selectedLabel.replace("代_全機関_", "").replace("_全目的", "")
    : "";

  return (
    <div className="comparePanel">
      {/* 1. 5年間隔比較 カード */}
      <div className="compareCard">
        <div className="compareHeaderTopRow">
          <span className="compareTitle">5年間隔比較</span>
          <span className="compareFlowBadge">他都道府県→{destination}</span>
        </div>
        <div className="compareBody">
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
        </div>
      </div>

      {/* 2. ラベル比較 カード */}
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
                    title={displayName}
                  >
                    <span className="labelBtnText">{displayName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="compareBody">
          {year === "1990年度" ? (
            <div className="compareNotice">比較対象の5年前データはありません</div>
          ) : !selectedLabel ? (
            <div className="compareNotice">ラベルを選択してください</div>
          ) : (
            <TextOnlyComparison
              current={currentLabelPeople}
              previous={previousLabelPeople}
              diff={labelDiff}
              rate={labelRate === "新規" ? null : labelRate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
