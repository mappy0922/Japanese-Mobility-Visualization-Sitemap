export default function ComparePanel({
  year,
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
  const MAX_RATE = 100;

  const gaugeRate =
    rate === null
      ? 0
      : Math.max(-MAX_RATE, Math.min(MAX_RATE, Number(rate)));

  const barPercent = (Math.abs(gaugeRate) / MAX_RATE) * 50;

  const labelGaugeRate =
    previousLabelPeople === 0
      ? 0
      : Math.max(
          -100,
          Math.min(
            ((currentLabelPeople - previousLabelPeople) /
              previousLabelPeople) *
              100,
            100
          )
        );

  const labelBarPercent = (Math.abs(labelGaugeRate) / MAX_RATE) * 50;

  return (
    <div className="comparePanel">
      {/* 1. 前年度比較 カード */}
      <div className="compareCard">
        <div className="compareTitle">前年度比較</div>
        <div className="compareBody">
          {year === "1990年度" ? (
            <div className="compareNotice">比較対象の前年度はありません</div>
          ) : (
            <>
              <div className="compareMainDisplay">
                <div className="currentPeopleWrapper">
                  <span className="currentPeopleLabel">今年度</span>
                  <span className="currentPeopleNumber">
                    {(currentPeople ?? 0).toLocaleString()}
                  </span>
                  <span className="currentPeopleUnit">人</span>
                </div>
                <div className="previousPeopleSub">
                  <span className="prevLabel">前年:</span>
                  <span className="prevNumber">
                    {(previousPeople ?? 0).toLocaleString()} 人
                  </span>
                </div>
              </div>

              <div className="gaugeContainer">
                <div className="gaugeCenterLine" />
                {gaugeRate > 0 && (
                  <div
                    className="gaugeBar positive"
                    style={{
                      left: "50%",
                      width: `${barPercent}%`,
                    }}
                  />
                )}
                {gaugeRate < 0 && (
                  <div
                    className="gaugeBar negative"
                    style={{
                      left: `${50 - barPercent}%`,
                      width: `${barPercent}%`,
                    }}
                  />
                )}
              </div>

              <div className="gaugeLabels">
                <span>-100%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>

              <div
                className="diffText"
                style={{
                  color:
                    diff > 0
                      ? "#d9534f"
                      : diff < 0
                        ? "#0288d1"
                        : "#333",
                }}
              >
                {diff > 0 ? "▲ " : diff < 0 ? "▼ " : "● "}
                {Math.abs(diff ?? 0).toLocaleString()} 人
                {rate !== null && ` (${diff >= 0 ? "+" : ""}${rate}%)`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. ラベル比較 カード (タイトル横に2x3ラベル選択ボタンを配置) */}
      <div className="compareCard">
        <div className="labelCompareHeader">
          <div className="compareTitle inlineTitle">ラベル比較</div>
          {label && label.length > 0 && (
            <div className="labelGridInCard">
              {label.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`labelButtonInCard ${selectedLabel === name ? "active" : ""}`}
                  onClick={() => setSelectedLabel && setSelectedLabel(name)}
                  title={name}
                >
                  {name.replace("代_全機関_", "").replace("_全目的", "")}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="compareBody">
          {year === "1990年度" ? (
            <div className="compareNotice">比較対象の前年度はありません</div>
          ) : !selectedLabel ? (
            <div className="compareNotice">ラベルを選択してください</div>
          ) : (
            <>
              <div className="compareMainDisplay">
                <div className="currentPeopleWrapper">
                  <span className="currentPeopleLabel">今年度</span>
                  <span className="currentPeopleNumber">
                    {(currentLabelPeople ?? 0).toLocaleString()}
                  </span>
                  <span className="currentPeopleUnit">人</span>
                </div>
                <div className="previousPeopleSub">
                  <span className="prevLabel">前年:</span>
                  <span className="prevNumber">
                    {(previousLabelPeople ?? 0).toLocaleString()} 人
                  </span>
                </div>
              </div>

              <div className="gaugeContainer">
                <div className="gaugeCenterLine" />
                {labelGaugeRate > 0 && (
                  <div
                    className="gaugeBar positive"
                    style={{
                      left: "50%",
                      width: `${labelBarPercent}%`,
                    }}
                  />
                )}
                {labelGaugeRate < 0 && (
                  <div
                    className="gaugeBar negative"
                    style={{
                      left: `${50 - labelBarPercent}%`,
                      width: `${labelBarPercent}%`,
                    }}
                  />
                )}
              </div>

              <div className="gaugeLabels">
                <span>-100%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>

              <div
                className="diffText"
                style={{
                  color:
                    labelDiff > 0
                      ? "#d9534f"
                      : labelDiff < 0
                        ? "#0288d1"
                        : "#333",
                }}
              >
                {labelDiff > 0 ? "▲ " : labelDiff < 0 ? "▼ " : "● "}
                {Math.abs(labelDiff ?? 0).toLocaleString()} 人
                {labelRate === "新規"
                  ? " (新規)"
                  : ` (${labelDiff >= 0 ? "+" : ""}${labelRate}%)`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
