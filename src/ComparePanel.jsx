export default function ComparePanel({
  year,
  currentPeople,
  previousPeople,
  diff,
  rate,
  selectedLabel,
  currentLabelPeople,
  previousLabelPeople,
  labelDiff,
  labelRate,
}) {
  const MAX_RATE = 100;
  const center = 100; // ゲージ全体の横幅200pxの中央 (100px)

  const gaugeRate =
    rate === null
      ? 0
      : Math.max(-MAX_RATE, Math.min(MAX_RATE, Number(rate)));

  const barWidth = (Math.abs(gaugeRate) / MAX_RATE) * center;

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

  const labelBarWidth = (Math.abs(labelGaugeRate) / MAX_RATE) * center;

  return (
    <div className="comparePanel">
      {/* 前年度比較 カード */}
      <div className="compareCard">
        <div className="compareTitle">前年度比較</div>
        <div className="compareBody">
          {year === "1990年度" ? (
            <div className="compareNotice">比較対象の前年度はありません</div>
          ) : (
            <>
              <div className="compareRow">
                <span>前年度：</span>
                <span className="compareValue">
                  {(previousPeople ?? 0).toLocaleString()} 人
                </span>
              </div>

              <div className="compareRow">
                <span>今年度：</span>
                <span className="compareValue">
                  {(currentPeople ?? 0).toLocaleString()} 人
                </span>
              </div>

              <div className="gaugeContainer">
                <div className="gaugeCenterLine" />
                {gaugeRate > 0 && (
                  <div
                    className="gaugeBar positive"
                    style={{
                      left: `${center}px`,
                      width: `${barWidth}px`,
                    }}
                  />
                )}
                {gaugeRate < 0 && (
                  <div
                    className="gaugeBar negative"
                    style={{
                      left: `${center - barWidth}px`,
                      width: `${barWidth}px`,
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
                      ? "#e53935"
                      : diff < 0
                        ? "#1e88e5"
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

      {/* ラベル比較 カード */}
      <div className="compareCard">
        <div className="compareTitle">ラベル比較</div>
        <div className="compareBody">
          {year === "1990年度" ? (
            <div className="compareNotice">比較対象の前年度はありません</div>
          ) : !selectedLabel ? (
            <div className="compareNotice">ラベルを選択してください</div>
          ) : (
            <>
              <div className="selectedLabelBadge" title={selectedLabel}>
                {selectedLabel}
              </div>

              <div className="compareRow">
                <span>前年度：</span>
                <span className="compareValue">
                  {(previousLabelPeople ?? 0).toLocaleString()} 人
                </span>
              </div>

              <div className="compareRow">
                <span>今年度：</span>
                <span className="compareValue">
                  {(currentLabelPeople ?? 0).toLocaleString()} 人
                </span>
              </div>

              <div className="gaugeContainer">
                <div className="gaugeCenterLine" />
                {labelGaugeRate > 0 && (
                  <div
                    className="gaugeBar positive"
                    style={{
                      left: `${center}px`,
                      width: `${labelBarWidth}px`,
                    }}
                  />
                )}
                {labelGaugeRate < 0 && (
                  <div
                    className="gaugeBar negative"
                    style={{
                      left: `${center - labelBarWidth}px`,
                      width: `${labelBarWidth}px`,
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
                      ? "#e53935"
                      : labelDiff < 0
                        ? "#1e88e5"
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
