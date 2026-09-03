export default function SvgLabel({
  height,
  legend_judge,
  setLegend_judge,
  traffic,
  prefecture,
  destination,
  coord,
  year,
  travelData = [],
  transportationData = [],
  file = [],
  previousFile = null,
  tab = "graph",
  setTab,
}) {
  const svgHeight = height;

  return (
    <div
      style={{
        width: "300px",
        height: `${height}px`,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <svg width="300" height={svgHeight}>
        {/* 背景 */}
        <rect
          x="0"
          y="0"
          width="300"
          height={svgHeight}
          fill="white"
          stroke="#dcdcdc"
        />

        {/* 1. 上部タブ切り替えボタン */}
        <foreignObject x="10" y="8" width="240" height="34">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              gap: "5px",
              height: "100%",
            }}
          >
            <button
              onClick={() => setTab("graph")}
              style={{
                flex: 1,
                padding: "4px 0",
                fontSize: "13px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "1.5px solid #d0d7de",
                background: tab === "graph" ? "#1e88e5" : "white",
                color: tab === "graph" ? "white" : "#333",
                cursor: "pointer",
                boxShadow:
                  tab === "graph"
                    ? "0 2px 5px rgba(30, 136, 229, 0.25)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              割合
            </button>
            <button
              onClick={() => setTab("rank")}
              style={{
                flex: 1,
                padding: "4px 0",
                fontSize: "13px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "1.5px solid #d0d7de",
                background: tab === "rank" ? "#1e88e5" : "white",
                color: tab === "rank" ? "white" : "#333",
                cursor: "pointer",
                boxShadow:
                  tab === "rank"
                    ? "0 2px 5px rgba(30, 136, 229, 0.25)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              順位
            </button>
          </div>
        </foreignObject>

        {/* 2. 閉じるボタン */}
        <foreignObject x="256" y="8" width="34" height="34">
          <button
            onClick={() => setLegend_judge(true)}
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid #dcdcdc",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.9)",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            title="閉じる"
          >
            ✕
          </button>
        </foreignObject>

        {/* ============================================================
            割合表示 (tab === "graph") - 拡大＆存在感のあるゲージ
           ============================================================ */}
        {tab === "graph" && (
          <foreignObject x="10" y="46" width="280" height={svgHeight - 50}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                height: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* 移動目的割合セクション */}
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "4px",
                    borderBottom: "1.5px solid #e0d8b0",
                    paddingBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#222",
                    }}
                  >
                    移動目的割合
                  </span>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>
                    他都道府県 ➔ {destination}
                  </span>
                </div>

                {(() => {
                  const purposes = [
                    "代_全機関_仕事",
                    "代_全機関_観光",
                    "代_全機関_私用",
                    "代_全機関_その他",
                    "代_全機関_不明",
                  ];

                  const data = travelData.filter(
                    (item) =>
                      item.to === destination && item.from !== destination
                  );

                  const total = data.reduce(
                    (sum, item) => sum + item.people,
                    0
                  );

                  if (total === 0) {
                    return (
                      <div
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          padding: "8px 0",
                          textAlign: "center",
                        }}
                      >
                        該当データはありません
                      </div>
                    );
                  }

                  return purposes.map((purpose) => {
                    const people = data
                      .filter((d) => d.purpose === purpose)
                      .reduce((sum, d) => sum + d.people, 0);

                    const percentage =
                      total === 0
                        ? "0.0"
                        : ((people / total) * 100).toFixed(1);

                    return (
                      <div
                        key={purpose}
                        style={{
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12.5px",
                            marginBottom: "2px",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#333" }}>
                            {purpose.replace("代_全機関_", "")}
                          </span>
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "#d9534f",
                              fontSize: "12px",
                            }}
                          >
                            {percentage}% ({people.toLocaleString()}人)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "13px",
                            background: "#f1f5f9",
                            borderRadius: "6.5px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "13px",
                              background: "#ef4444",
                              borderRadius: "6.5px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* 交通手段割合セクション */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginTop: "10px",
                    marginBottom: "4px",
                    borderBottom: "1.5px solid #e0d8b0",
                    paddingBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#222",
                    }}
                  >
                    交通手段割合
                  </span>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>
                    他都道府県 ➔ {destination}
                  </span>
                </div>

                {(() => {
                  const methods =
                    year === "2005年度" || year === "2010年度"
                      ? ["航空", "鉄道", "船", "バス", "乗用車等"]
                      : [
                        "航空_全目的",
                        "鉄道_全目的",
                        "船_全目的",
                        "バス_全目的",
                        "乗用車等_全目的",
                      ];

                  const data = transportationData.filter(
                    (item) =>
                      item.to === destination && item.from !== destination
                  );

                  const totalPurpose =
                    year === "2005年度" || year === "2010年度"
                      ? "全機関"
                      : "全機関_全目的";

                  const totalFromData = data
                    .filter((item) => item.purpose === totalPurpose)
                    .reduce((sum, item) => sum + item.people, 0);

                  const methodSum = methods.reduce((acc, m) => {
                    return (
                      acc +
                      data
                        .filter((d) => d.purpose === m)
                        .reduce((sum, d) => sum + d.people, 0)
                    );
                  }, 0);

                  const total = totalFromData > 0 ? totalFromData : methodSum;

                  if (total === 0) {
                    return (
                      <div
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          padding: "8px 0",
                          textAlign: "center",
                        }}
                      >
                        該当データはありません
                      </div>
                    );
                  }

                  return methods.map((method) => {
                    const people = data
                      .filter((d) => d.purpose === method)
                      .reduce((sum, d) => sum + d.people, 0);

                    const percentage =
                      total === 0
                        ? "0.0"
                        : ((people / total) * 100).toFixed(1);

                    return (
                      <div
                        key={method}
                        style={{
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12.5px",
                            marginBottom: "2px",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#333" }}>
                            {method.replace("_全目的", "")}
                          </span>
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "#0288d1",
                              fontSize: "12px",
                            }}
                          >
                            {percentage}% ({people.toLocaleString()}人)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "13px",
                            background: "#f1f5f9",
                            borderRadius: "6.5px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "13px",
                              background: "#1e88e5",
                              borderRadius: "6.5px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </foreignObject>
        )}

        {/* ============================================================
            順位表示 (tab === "rank") - 拡大＆存在感のあるゲージ
           ============================================================ */}
        {tab === "rank" && (
          <foreignObject x="10" y="46" width="280" height={svgHeight - 50}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                height: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                  paddingBottom: "3px",
                  borderBottom: "1.5px solid #e0d8b0",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#1e293b",
                    }}
                  >
                    {destination}へ来る人数ランキング TOP10
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                    各都道府県からの年間来訪者数
                  </span>
                </div>
              </div>

              {(() => {
                const ranking = [];

                coord.forEach((from) => {
                  if (from === destination) {
                    return;
                  }

                  const people = file
                    .filter(
                      (item) =>
                        item.from === from && item.to === destination
                    )
                    .reduce((sum, item) => sum + item.people, 0);

                  ranking.push({
                    from,
                    people,
                  });
                });

                ranking.sort((a, b) => b.people - a.people);
                const top10 = ranking.slice(0, 10);
                const maxPeople =
                  top10.length > 0 && top10[0].people > 0
                    ? top10[0].people
                    : 1;

                let previousRanking = [];
                if (previousFile && previousFile.length > 0) {
                  coord.forEach((from) => {
                    if (from === destination) {
                      return;
                    }

                    const people = previousFile
                      .filter(
                        (item) =>
                          item.from === from && item.to === destination
                      )
                      .reduce((sum, item) => sum + item.people, 0);

                    previousRanking.push({
                      from,
                      people,
                    });
                  });

                  previousRanking.sort((a, b) => b.people - a.people);
                }

                if (top10.length === 0) {
                  return (
                    <div
                      style={{
                        color: "#888",
                        textAlign: "center",
                        padding: "20px 0",
                        fontSize: "12px",
                      }}
                    >
                      来訪者データがありません
                    </div>
                  );
                }

                return (
                  <div>
                    {top10.map((item, index) => {
                      const previousIndex = previousRanking.findIndex(
                        (p) => p.from === item.from
                      );

                      let rankText = "";
                      let rankColor = "#777";

                      if (!previousFile || previousFile.length === 0) {
                        rankText = "";
                      } else if (previousIndex === -1) {
                        rankText = "NEW";
                        rankColor = "#2e7d32";
                      } else {
                        const rankDiff = previousIndex - index;
                        if (rankDiff > 0) {
                          rankText = `↑${rankDiff}`;
                          rankColor = "#e53935";
                        } else if (rankDiff < 0) {
                          rankText = `↓${Math.abs(rankDiff)}`;
                          rankColor = "#1e88e5";
                        } else {
                          rankText = "→";
                          rankColor = "#777";
                        }
                      }

                      return (
                        <div
                          key={item.from}
                          style={{
                            marginBottom: "4px",
                            background: "rgba(255, 255, 255, 0.8)",
                            padding: "4px 8px",
                            borderRadius: "7px",
                            border: "1px solid #ede4bc",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "12.5px",
                              fontWeight: "bold",
                              marginBottom: "2px",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "20px",
                                  height: "20px",
                                  lineHeight: "20px",
                                  textAlign: "center",
                                  borderRadius: "50%",
                                  background:
                                    index === 0
                                      ? "#ffd700"
                                      : index === 1
                                        ? "#c0c0c0"
                                        : index === 2
                                          ? "#cd7f32"
                                          : "#e0e0e0",
                                  color: index === 2 ? "white" : "#333",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                {index + 1}
                              </span>
                              <span>{item.from}</span>
                              {previousFile &&
                                previousFile.length > 0 &&
                                rankText && (
                                  <span
                                    style={{
                                      fontSize: "10.5px",
                                      fontWeight: "bold",
                                      color: rankColor,
                                      marginLeft: "2px",
                                    }}
                                  >
                                    ({rankText})
                                  </span>
                                )}
                            </span>

                            <span
                              style={{
                                color: "#00796b",
                                fontSize: "12.5px",
                              }}
                            >
                              {item.people.toLocaleString()} 人
                            </span>
                          </div>

                          <div
                            style={{
                              height: "9px",
                              background: "#f1f5f9",
                              borderRadius: "4.5px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(item.people / maxPeople) * 100}%`,
                                height: "9px",
                                background: "#0d9488",
                                borderRadius: "4.5px",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
