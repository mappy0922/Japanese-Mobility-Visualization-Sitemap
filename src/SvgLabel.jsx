import { useState } from "react";
import { travelData1990 } from "./PurposeTravel1990";
import { transportationData1990 } from "./TransportationTravel1990";
import { travelData1995 } from "./PurposeTravel1995";
import { transportationData1995 } from "./TransportationTravel1995";
import { travelData2000 } from "./PurposeTravel2000";
import { trasnportationData2000 } from "./TransportationTravel2000";
import { travelData2005 } from "./PurposeTravel2005";
import { transportationData2005 } from "./TransportationTravel2005";
import { travelData2010 } from "./PurposeTravel2010";
import { transportationData2010 } from "./TransportationTravel2010";

export default function SvgLabel({
  height,
  legend_judge,
  setLegend_judge,
  traffic,
  label,
  active,
  setActive,
  dataColor,
  circleSize,
  circleColor,
  prefecture,
  destination,
  setDestination,
  coord,
  selectedLabel,
  setSelectedLabel,
  year,
  currentPeople,
  previousPeople,
  diff,
  rate,
  currentLabelPeople,
  previousLabelPeople,
  labelDiff,
  labelRate,
  travelData,
  transportationData,
  file,

  // ★ Appから受け取る
  tab,
  setTab,
}) {

  const [searchName, setSearchName] = useState("");

  // 前年度データ
  const previousFileMap = {
    "1990年度": null,

    "1995年度":
      traffic === "移動目的"
        ? travelData1990
        : transportationData1990,

    "2000年度":
      traffic === "移動目的"
        ? travelData1995
        : transportationData1995,

    "2005年度":
      traffic === "移動目的"
        ? travelData2000
        : trasnportationData2000,

    "2010年度":
      traffic === "移動目的"
        ? travelData2005
        : transportationData2005,
  };

  const previousFile = previousFileMap[year];

  const margin = 15;

  const svgHeight = height;

  const searchDestination = () => {

    const target = coord.find(name =>
      name.includes(searchName)
    );

    if (target) {

      const element =
        document.getElementById(`destination-${target}`);

      if (element) {

        element.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    } else {

      alert("該当する地点がありません");

    }
  };

  // ===== 前年度比ゲージ =====
  const MAX_RATE = 100;

  const gaugeRate =
    rate === null
      ? 0
      : Math.max(
        -MAX_RATE,
        Math.min(MAX_RATE, Number(rate))
      );

  const center = 110;

  const barWidth =
    Math.abs(gaugeRate) /
    MAX_RATE *
    center;

  const labelGaugeRate =
    previousLabelPeople === 0
      ? 0
      : Math.max(
        -100,
        Math.min(
          (
            (currentLabelPeople - previousLabelPeople) /
            previousLabelPeople
          ) * 100,
          100
        )
      );

  const labelBarWidth =
    Math.abs(labelGaugeRate) * 1.1;

  return (

    <div
      style={{
        width: "300px",
        height: `${height}px`,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >

      <svg
        width="300"
        height={svgHeight}
      >

        {/* 背景 */}
        <rect
          x="0"
          y="0"
          width="300"
          height={svgHeight}
          fill="#fff2ae"
          stroke="black"
        />

        <foreignObject
          x="250"
          y="8"
          width="70"
          height="30"
        >

          <button
            onClick={() => setLegend_judge(true)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>

        </foreignObject>

        <foreignObject
          x="5"
          y="40"
          width="290"
          height="35"
        >

          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              gap: "4px"
            }}
          >

            <button
              onClick={() => setTab("basic")}
              style={{
                flex: 1,
                background:
                  tab === "basic"
                    ? "#87CEFA"
                    : "white"
              }}
            >
              基本
            </button>

            <button
              onClick={() => setTab("compare")}
              style={{
                flex: 1,
                background:
                  tab === "compare"
                    ? "#87CEFA"
                    : "white"
              }}
            >
              比較
            </button>

            <button
              onClick={() => setTab("graph")}
              style={{
                flex: 1,
                background:
                  tab === "graph"
                    ? "#87CEFA"
                    : "white"
              }}
            >
              割合
            </button>

            <button
              onClick={() => setTab("rank")}
              style={{
                flex: 1,
                background:
                  tab === "rank"
                    ? "#87CEFA"
                    : "white"
              }}
            >
              順位
            </button>

          </div>

        </foreignObject>

        {/* ========================= */}
        {/* 基本 */}
        {/* ========================= */}

        {tab === "basic" && (

          <>

            {/* 対象地点変更 */}
            <g transform="translate(10,90)">

              <rect
                width="280"
                height="220"
                fill="#f1e2cc"
                stroke="black"
                strokeWidth="0.5"
                rx="15"
              />

              <text
                x="15"
                y="25"
                fontSize="16"
                fontWeight="bold"
              >
                対象地点変更
              </text>

              <foreignObject
                x="10"
                y="35"
                width="260"
                height="170"
              >

                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >

                  <input
                    value={searchName}
                    placeholder="目的地点を検索"
                    onChange={(e) =>
                      setSearchName(e.target.value)
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        searchDestination();
                      }

                    }}
                    style={{
                      width: "90%",
                      padding: "5px",
                      marginBottom: "5px",
                    }}
                  />

                  <div
                    style={{
                      height: "125px",
                      overflowY: "auto",
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid #bbb",
                    }}
                  >

                    {coord
                      .filter(
                        (name) =>
                          name !== prefecture
                      )
                      .map((name) => (

                        <div
                          key={name}
                          id={`destination-${name}`}
                          onClick={() =>
                            setDestination(name)
                          }
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom:
                              "1px solid #ddd",
                            background:
                              destination === name
                                ? "#87CEFA"
                                : "white",
                          }}

                          onMouseEnter={(e) => {

                            if (
                              destination !== name
                            ) {
                              e.currentTarget.style.background =
                                "#eeeeee";
                            }

                          }}

                          onMouseLeave={(e) => {

                            if (
                              destination !== name
                            ) {
                              e.currentTarget.style.background =
                                "white";
                            }

                          }}
                        >
                          {name}
                        </div>

                      ))}

                  </div>

                </div>

              </foreignObject>

            </g>

            {/* ラベル変更 */}
            <g transform="translate(10,325)">

              <rect
                width="280"
                height="220"
                fill="#f1e2cc"
                stroke="black"
                strokeWidth="0.5"
                rx="15"
              />

              <text
                x="15"
                y="25"
                fontSize="16"
                fontWeight="bold"
              >
                ラベル変更
              </text>

              <foreignObject
                x="10"
                y="35"
                width="260"
                height="170"
              >

                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: "100%",
                    height: "100%",
                    overflowY: "auto",
                    background: "white",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                  }}
                >

                  {label.map((name) => (

                    <div
                      key={name}
                      onClick={() =>
                        setSelectedLabel(name)
                      }
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom:
                          "1px solid #ddd",
                        background:
                          selectedLabel === name
                            ? "#87CEFA"
                            : "white",
                      }}

                      onMouseEnter={(e) => {

                        if (
                          selectedLabel !== name
                        ) {
                          e.currentTarget.style.background =
                            "#eeeeee";
                        }

                      }}

                      onMouseLeave={(e) => {

                        if (
                          selectedLabel !== name
                        ) {
                          e.currentTarget.style.background =
                            "white";
                        }

                      }}
                    >
                      {name}
                    </div>

                  ))}

                </div>

              </foreignObject>

            </g>

          </>

        )}

        {/* ========================= */}
        {/* 比較 */}
        {/* ========================= */}

        {tab === "compare" && (

          <>

            {/* 前年度比較 */}
            <g transform="translate(10,90)">

              <rect
                width="280"
                height="190"
                fill="#f1e2cc"
                stroke="black"
                strokeWidth="0.5"
                rx="15"
              />

              <text
                x="15"
                y="25"
                fontSize="16"
                fontWeight="bold"
              >
                前年度比較
              </text>

              <foreignObject
                x="10"
                y="35"
                width="260"
                height="150"
              >

                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8"
                  }}
                >

                  {year === "1990年度" ? (

                    <div>
                      比較対象の前年度はありません
                    </div>

                  ) : (

                    <>

                      <div>
                        前年度：
                        {previousPeople.toLocaleString()}
                        人
                      </div>

                      <div>
                        今年度：
                        {currentPeople.toLocaleString()}
                        人
                      </div>

                      <div
                        style={{
                          position: "relative",
                          width: "220px",
                          height: "18px",
                          background: "#eeeeee",
                          borderRadius: "9px",
                          marginTop: "10px",
                          marginBottom: "10px"
                        }}
                      >

                        <div
                          style={{
                            position: "absolute",
                            left: "110px",
                            width: "2px",
                            height: "18px",
                            background: "#333"
                          }}
                        />

                        {gaugeRate > 0 && (

                          <div
                            style={{
                              position: "absolute",
                              left: "110px",
                              width: `${barWidth}px`,
                              height: "18px",
                              background: "#ff6666",
                            }}
                          />

                        )}

                        {gaugeRate < 0 && (

                          <div
                            style={{
                              position: "absolute",
                              left:
                                `${110 - barWidth}px`,
                              width: `${barWidth}px`,
                              height: "18px",
                              background: "#6699ff",
                            }}
                          />

                        )}

                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          width: "220px",
                          fontSize: "11px",
                          color: "#666",
                          marginTop: "-6px",
                          marginBottom: "8px"
                        }}
                      >

                        <span>-100%</span>
                        <span>0%</span>
                        <span>+100%</span>

                      </div>

                      <div
                        style={{
                          color:
                            diff > 0
                              ? "red"
                              : diff < 0
                                ? "blue"
                                : "black",
                          fontWeight: "bold"
                        }}
                      >

                        {diff > 0
                          ? "▲"
                          : diff < 0
                            ? "▼"
                            : "●"}

                        {Math.abs(diff).toLocaleString()}
                        人

                        {rate !== null &&
                          ` (${diff >= 0 ? "+" : ""}${rate}%)`}

                      </div>

                    </>

                  )}

                </div>

              </foreignObject>

            </g>

            {/* ラベル前年度比較 */}
            <g transform="translate(10,295)">

              <rect
                width="280"
                height="180"
                fill="#f1e2cc"
                stroke="black"
                strokeWidth="0.5"
                rx="15"
              />

              <text
                x="15"
                y="25"
                fontSize="16"
                fontWeight="bold"
              >
                ラベル比較
              </text>

              <foreignObject
                x="10"
                y="35"
                width="260"
                height="150"
              >

                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8"
                  }}
                >

                  {year === "1990年度" ? (

                    <div>
                      比較対象の前年度はありません
                    </div>

                  ) : selectedLabel === "" ? (

                    <div>
                      ラベルを選択してください
                    </div>

                  ) : (

                    <>

                      <div>
                        前年度：
                        {previousLabelPeople.toLocaleString()}
                        人
                      </div>

                      <div>
                        今年度：
                        {currentLabelPeople.toLocaleString()}
                        人
                      </div>

                      <div
                        style={{
                          position: "relative",
                          width: "220px",
                          height: "18px",
                          background: "#eeeeee",
                          borderRadius: "9px",
                          marginTop: "10px",
                          marginBottom: "10px"
                        }}
                      >

                        <div
                          style={{
                            position: "absolute",
                            left: "110px",
                            width: "2px",
                            height: "18px",
                            background: "#333"
                          }}
                        />

                        {labelGaugeRate > 0 && (

                          <div
                            style={{
                              position: "absolute",
                              left: "110px",
                              width: `${labelBarWidth}px`,
                              height: "18px",
                              background: "#ff6666",
                            }}
                          />

                        )}

                        {labelGaugeRate < 0 && (

                          <div
                            style={{
                              position: "absolute",
                              left:
                                `${110 - labelBarWidth}px`,
                              width: `${labelBarWidth}px`,
                              height: "18px",
                              background: "#6699ff",
                            }}
                          />

                        )}

                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          width: "220px",
                          fontSize: "11px",
                          color: "#666",
                          marginTop: "-6px",
                          marginBottom: "8px"
                        }}
                      >

                        <span>-100%</span>
                        <span>0%</span>
                        <span>+100%</span>

                      </div>

                      <div
                        style={{
                          color:
                            labelDiff > 0
                              ? "red"
                              : labelDiff < 0
                                ? "blue"
                                : "black",
                          fontWeight: "bold"
                        }}
                      >

                        {labelDiff > 0
                          ? "▲"
                          : labelDiff < 0
                            ? "▼"
                            : "●"}

                        {Math.abs(
                          labelDiff
                        ).toLocaleString()}
                        人

                        {labelRate === "新規"
                          ? " (新規)"
                          : ` (${labelDiff >= 0 ? "+" : ""}${labelRate}%)`}

                      </div>

                    </>

                  )}

                </div>

              </foreignObject>

            </g>

          </>

        )}

        {/* ========================= */}
        {/* 割合 */}
        {/* ========================= */}

        {tab === "graph" && (

          <g transform="translate(10, 90)">

            <rect
              width="280"
              height="550"
              fill="#f1e2cc"
              stroke="black"
              strokeWidth="0.5"
              rx="15"
            />

            <text
              x="15"
              y="25"
              fontSize="16"
              fontWeight="bold"
            >
              移動目的・交通手段割合
            </text>

            <foreignObject
              x="10"
              y="35"
              width="260"
              height="500"
            >

              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontSize: "13px",
                  overflowY: "auto",
                  height: "500px",
                }}
              >

                <h4>
                  移動目的割合
                </h4>

                {(() => {

                  const purposes = [
                    "代_全機関_仕事",
                    "代_全機関_観光",
                    "代_全機関_私用",
                    "代_全機関_その他",
                    "代_全機関_不明",
                  ];

                  const data =
                    travelData.filter(
                      item =>
                        item.from === destination &&
                        item.to === prefecture
                    );

                  const total =
                    data.reduce(
                      (sum, item) =>
                        sum + item.people,
                      0
                    );

                  return purposes.map(
                    purpose => {

                      const people =
                        data
                          .filter(
                            d =>
                              d.purpose ===
                              purpose
                          )
                          .reduce(
                            (sum, d) =>
                              sum + d.people,
                            0
                          );

                      const rate =
                        total === 0
                          ? 0
                          : (
                            people /
                            total *
                            100
                          ).toFixed(1);

                      return (

                        <div
                          key={purpose}
                          style={{
                            marginBottom:
                              "10px"
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between"
                            }}
                          >

                            <span>
                              {purpose.replace(
                                "代_全機関_",
                                ""
                              )}
                            </span>

                            <span>
                              {rate}%
                            </span>

                          </div>

                          <div
                            style={{
                              height: "12px",
                              background: "#ddd",
                              borderRadius: "6px",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  `${rate}%`,
                                height: "12px",
                                background:
                                  "#ff9966",
                                borderRadius:
                                  "6px",
                              }}
                            />

                          </div>

                        </div>

                      );
                    }
                  );

                })()}

                <h4
                  style={{
                    marginTop: "20px"
                  }}
                >
                  交通手段割合
                </h4>

                {(() => {

                  const methods =
                    year === "2005年度" ||
                      year === "2010年度"
                      ? [
                        "航空",
                        "鉄道",
                        "船",
                        "バス",
                        "乗用車等",
                      ]
                      : [
                        "航空_全目的",
                        "鉄道_全目的",
                        "船_全目的",
                        "バス_全目的",
                        "乗用車等_全目的",
                      ];

                  const data =
                    transportationData.filter(
                      item =>
                        item.from === destination &&
                        item.to === prefecture
                    );

                  const totalItem =
                    data.find(
                      item =>
                        item.purpose ===
                        (
                          year === "2005年度" ||
                            year === "2010年度"
                            ? "全機関"
                            : "全機関_全目的"
                        )
                    );

                  const total =
                    totalItem
                      ? totalItem.people
                      : 0;

                  return methods.map(
                    method => {

                      const people =
                        data
                          .filter(
                            d =>
                              d.purpose ===
                              method
                          )
                          .reduce(
                            (sum, d) =>
                              sum + d.people,
                            0
                          );

                      const rate =
                        total === 0
                          ? 0
                          : (
                            people /
                            total *
                            100
                          ).toFixed(1);

                      return (

                        <div
                          key={method}
                          style={{
                            marginBottom:
                              "10px"
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between"
                            }}
                          >

                            <span>
                              {method.replace(
                                "_全目的",
                                ""
                              )}
                            </span>

                            <span>
                              {rate}%
                            </span>

                          </div>

                          <div
                            style={{
                              height: "12px",
                              background: "#ddd",
                              borderRadius: "6px",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  `${rate}%`,
                                height: "12px",
                                background:
                                  "#6699ff",
                                borderRadius:
                                  "6px",
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  );

                })()}

              </div>

            </foreignObject>

          </g>

        )}

        {/* ========================= */}
        {/* 順位 */}
        {/* ========================= */}

        {tab === "rank" && (

          <g transform="translate(10, 90)">

            <rect
              width="280"
              height="420"
              fill="#f1e2cc"
              stroke="black"
              strokeWidth="0.5"
              rx="15"
            />

            <text
              x="15"
              y="25"
              fontSize="16"
              fontWeight="bold"
            >
              来訪者ランキング TOP10
            </text>

            <text
              x="15"
              y="45"
              fontSize="13"
            >
              {prefecture}へ来る人数
            </text>

            <foreignObject
              x="10"
              y="55"
              width="260"
              height="350"
            >

              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  height: "340px",
                  overflowY: "auto",
                  fontSize: "13px",
                }}
              >

                {(() => {

                  const ranking = [];

                  coord.forEach(from => {

                    if (
                      from === prefecture
                    ) {
                      return;
                    }

                    const people =
                      file
                        .filter(
                          item =>
                            item.from === from &&
                            item.to === prefecture
                        )
                        .reduce(
                          (sum, item) =>
                            sum + item.people,
                          0
                        );

                    ranking.push({
                      from,
                      people,
                    });

                  });

                  ranking.sort(
                    (a, b) =>
                      b.people - a.people
                  );

                  const top10 =
                    ranking.slice(0, 10);

                  const maxPeople =
                    top10.length > 0
                      ? top10[0].people
                      : 1;

                  let previousRanking = [];

                  if (previousFile) {

                    coord.forEach(from => {

                      if (
                        from === prefecture
                      ) {
                        return;
                      }

                      const people =
                        previousFile
                          .filter(
                            item =>
                              item.from === from &&
                              item.to === prefecture
                          )
                          .reduce(
                            (sum, item) =>
                              sum + item.people,
                            0
                          );

                      previousRanking.push({
                        from,
                        people,
                      });

                    });

                    previousRanking.sort(
                      (a, b) =>
                        b.people -
                        a.people
                    );

                  }

                  return top10.map(
                    (item, index) => {

                      const previousIndex =
                        previousRanking.findIndex(
                          p =>
                            p.from ===
                            item.from
                        );

                      let rankText = "";

                      if (!previousFile) {

                        rankText = "";

                      } else if (
                        previousIndex === -1
                      ) {

                        rankText = "NEW";

                      } else {

                        const diff =
                          previousIndex -
                          index;

                        if (diff > 0) {

                          rankText =
                            `↑${diff}`;

                        } else if (
                          diff < 0
                        ) {

                          rankText =
                            `↓${Math.abs(diff)}`;

                        } else {

                          rankText = "→";

                        }
                      }

                      return (

                        <div
                          key={item.from}
                          style={{
                            marginBottom:
                              "12px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              marginBottom:
                                "3px",
                              fontWeight:
                                "bold",
                            }}
                          >

                            <span>
                              {index + 1}位
                              {item.from}
                            </span>

                            <span>
                              {item.people.toLocaleString()}
                              人
                            </span>

                          </div>

                          {previousFile && (

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  rankText.startsWith(
                                    "↑"
                                  )
                                    ? "red"
                                    : rankText.startsWith(
                                      "↓"
                                    )
                                      ? "blue"
                                      : rankText ===
                                        "NEW"
                                        ? "green"
                                        : "#666",
                                marginBottom:
                                  "3px",
                              }}
                            >

                              前回：

                              {previousIndex ===
                                -1
                                ? "圏外"
                                : `${previousIndex + 1}位`}

                              {" → "}

                              {index + 1}位

                              {"　"}

                              {rankText}

                            </div>

                          )}

                          <div
                            style={{
                              height: "12px",
                              background:
                                "#dddddd",
                              borderRadius:
                                "6px",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  `${item.people / maxPeople * 100}%`,
                                height:
                                  "12px",
                                background:
                                  "#009688",
                                borderRadius:
                                  "6px",
                                transition:
                                  "0.4s",
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  );

                })()}

              </div>

            </foreignObject>

          </g>

        )}

        {/* 出発地点・目的地点表示 */}
        <text
          x="150"
          y="28"
          fontSize="22"
          fontWeight="bold"
          textAnchor="middle"
        >
          {prefecture.includes("道")
            ? prefecture
            : prefecture.includes("東京")
              ? `${prefecture}都`
              : prefecture.includes("大阪") ||
                prefecture.includes("京都")
                ? `${prefecture}府`
                : `${prefecture}県`}
        </text>

      </svg>

    </div>
  );
}