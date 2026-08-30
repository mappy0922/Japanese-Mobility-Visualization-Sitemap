import * as d3 from "d3";
import { useMemo, useState, useEffect, useRef } from "react";

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

import { coords } from "./coords";
import { feature } from "topojson-client";

import SvgMap from "./SvgMap";
import SvgLabel from "./SvgLabel";
import ComparePanel from "./ComparePanel";
import SearchableSelect from "./SearchableSelect";

const MapName = ["日本地図", "世界地図"];

const transportation = ["移動目的", "移動手段"];

const yearSelection = [
  "1995年度",
  "2000年度",
  "2005年度",
  "2010年度",
];

const circleSize = [200000, 100000, 50000, 10000];

const coord = Object.keys(coords);

/*
 * ============================================================
 * 北海道4地域（道北・道東・道央・道南）の統合・正規化
 * ============================================================
 */
const HOKKAIDO_SUBREGIONS = new Set(["道北", "道東", "道央", "道南"]);
const HOKKAIDO_COORD = coords["北海道"] || [142.5, 43.4];

const normalizeData = (rawData) => {
  if (!rawData) return [];
  const map = new Map();

  for (const item of rawData) {
    const isFromSub = HOKKAIDO_SUBREGIONS.has(item.from);
    const isToSub = HOKKAIDO_SUBREGIONS.has(item.to);

    const from = isFromSub ? "北海道" : item.from;
    const to = isToSub ? "北海道" : item.to;
    const fromCoord = isFromSub ? HOKKAIDO_COORD : item.fromCoord;
    const toCoord = isToSub ? HOKKAIDO_COORD : item.toCoord;

    const key = `${from}__${to}__${item.purpose}`;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.people += item.people;
    } else {
      map.set(key, {
        ...item,
        from,
        to,
        fromCoord,
        toCoord,
      });
    }
  }

  return Array.from(map.values());
};

const normTravel1990 = normalizeData(travelData1990);
const normTransport1990 = normalizeData(transportationData1990);

const normTravel1995 = normalizeData(travelData1995);
const normTransport1995 = normalizeData(transportationData1995);

const normTravel2000 = normalizeData(travelData2000);
const normTransport2000 = normalizeData(trasnportationData2000);

const normTravel2005 = normalizeData(travelData2005);
const normTransport2005 = normalizeData(transportationData2005);

const normTravel2010 = normalizeData(travelData2010);
const normTransport2010 = normalizeData(transportationData2010);

const travelDataMap = {
  "1990年度": normTravel1990,
  "1995年度": normTravel1995,
  "2000年度": normTravel2000,
  "2005年度": normTravel2005,
  "2010年度": normTravel2010,
};

const transportationDataMap = {
  "1990年度": normTransport1990,
  "1995年度": normTransport1995,
  "2000年度": normTransport2000,
  "2005年度": normTransport2005,
  "2010年度": normTransport2010,
};

const previousTravelDataMap = {
  "1990年度": null,
  "1995年度": normTravel1990,
  "2000年度": normTravel1995,
  "2005年度": normTravel2000,
  "2010年度": normTravel2005,
};

const previousTransportDataMap = {
  "1990年度": null,
  "1995年度": normTransport1990,
  "2000年度": normTransport1995,
  "2005年度": normTransport2000,
  "2010年度": normTransport2005,
};

/*
 * ============================================================
 * お気に入り初期状態
 * ============================================================
 */
const createFavoriteState = () => {
  const init = {};
  yearSelection.forEach((y) => {
    init[y] = {};
    transportation.forEach((t) => {
      init[y][t] = Object.fromEntries(coord.map((name) => [name, false]));
    });
  });
  return init;
};

export default function App() {
  /*
   * ============================================================
   * ウィンドウサイズ
   * ============================================================
   */
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const height = windowSize.height - 45;

  /*
   * ============================================================
   * ユーザー
   * ============================================================
   */
  const [userName, setUserName] = useState("");

  const [isFavorite, setIsFavorite] = useState(() => {
    const saved = localStorage.getItem("isFavorite");
    return saved ? JSON.parse(saved) : createFavoriteState();
  });

  const [isLogin, setIsLogin] = useState(false);
  const [tab, setTab] = useState("graph");
  const [selectMode, setSelectMode] = useState("from");

  /*
   * ============================================================
   * メニュー・ラベル選択
   * ============================================================
   */
  const [selectedLabel, setSelectedLabel] = useState("代_全機関_観光");
  const [showMenu, setShowMenu] = useState(false);

  /*
   * ============================================================
   * 地図関連
   * ============================================================
   */
  const [prefectureCenter, setPrefectureCenter] = useState({});

  /*
   * ============================================================
   * チュートリアル
   * ============================================================
   */
  const [guideStep, setGuideStep] = useState(() => {
    const seen = localStorage.getItem("guideSeen");
    return seen ? -1 : 0;
  });

  /*
   * ============================================================
   * 凡例・選択範囲
   * ============================================================
   */
  const [showLegend, setShowLegend] = useState(false);
  const [lineInformation, setLineInformation] = useState(null);
  const [isInformation, setIsInformation] = useState(null);
  const [selectedRange, setSelectedRange] = useState([...circleSize]);
  const [hoverRange, setHoverRange] = useState(null);
  const [legend_judge, setLegend_judge] = useState(false);

  /*
   * ============================================================
   * マウス位置・ズーム
   * ============================================================
   */
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [Scale, setScale] = useState(1);

  /*
   * ============================================================
   * 地図・交通・年度・地点
   * ============================================================
   */
  const [Map, setMap] = useState(MapName[0]);
  const [traffic, setTraffic] = useState(transportation[0]);
  const [year, setYear] = useState(yearSelection[0]);
  const [prefecture, setPrefecture] = useState("東京");
  const [destination, setDestination] = useState("大阪");

  /*
   * ============================================================
   * 地図データ
   * ============================================================
   */
  const [mapData, setMapData] = useState(null);
  const [bounds, setBounds] = useState(null);

  /*
   * ============================================================
   * お気に入り
   * ============================================================
   */
  const [favoriteArr, setFavoriteArr] = useState(() => {
    const saved = localStorage.getItem("favoriteArr");
    return saved ? JSON.parse(saved) : [];
  });

  /*
   * ============================================================
   * 選択中の移動目的・交通手段
   * ============================================================
   */
  const [active, setActive] = useState(() => {
    if (traffic === "移動目的") {
      return {
        代_全機関_仕事: false,
        代_全機関_観光: false,
        代_全機関_私用: false,
        代_全機関_その他: false,
        代_全機関_不明: false,
        代_全機関_全目的: false,
      };
    } else {
      if (year === "1990年度" || year === "1995年度" || year === "2000年度") {
        return {
          航空_全目的: false,
          鉄道_全目的: false,
          船_全目的: false,
          バス_全目的: false,
          自動車_全目的: false,
          全機関_全目的: false,
        };
      } else {
        return {
          航空: false,
          鉄道: false,
          船: false,
          バス: false,
          乗用車等: false,
          全機関: false,
        };
      }
    }
  });

  const mapWidth =
    legend_judge ? windowSize.width : windowSize.width - 300;

  const closeGuide = () => {
    localStorage.setItem("guideSeen", "true");
    setGuideStep(-1);
  };

  /*
   * ============================================================
   * データ選択
   * ============================================================
   */
  const travelData = travelDataMap[year] || [];
  const transportationData = transportationDataMap[year] || [];
  const file = traffic === "移動目的" ? travelData : transportationData;

  const previousFile =
    traffic === "移動目的"
      ? previousTravelDataMap[year]
      : previousTransportDataMap[year];

  /*
   * ============================================================
   * データカラー
   * ============================================================
   */
  let dataColor = {};
  if (traffic === "移動目的") {
    dataColor = {
      代_全機関_仕事: "#4E79A7",
      代_全機関_観光: "#F28E2B",
      代_全機関_私用: "#E15759",
      代_全機関_その他: "#76B7B2",
      代_全機関_不明: "#59A14F",
      代_全機関_全目的: "#BAB0AC",
    };
  } else {
    if (year === "1990年度" || year === "1995年度" || year === "2000年度") {
      dataColor = {
        航空_全目的: "#4E79A7",
        鉄道_全目的: "#F28E2B",
        船_全目的: "#76B7B2",
        バス_全目的: "#E15759",
        自動車_全目的: "#59A14F",
        全機関_全目的: "#BAB0AC",
      };
    } else {
      dataColor = {
        航空: "#4E79A7",
        鉄道: "#F28E2B",
        船: "#76B7B2",
        バス: "#E15759",
        乗用車等: "#59A14F",
        全機関: "#BAB0AC",
      };
    }
  }

  /*
   * ============================================================
   * 円の大きさ・色・範囲判定
   * ============================================================
   */
  const judge = (people, judgeLimits) => {
    const size = Math.log10(people + 1);
    if (people >= judgeLimits[0]) return size * 1.8;
    if (people >= judgeLimits[1]) return size * 1.5;
    if (people >= judgeLimits[2]) return size * 1.2;
    if (people >= judgeLimits[3]) return size * 0.8;
    return size * 0.5;
  };

  const RANGE_COLORS = {
    200000: "#1b5e20", // ディープフォレスト (20万人以上 - 濃い緑)
    100000: "#2e7d32", // エメラルドグリーン (10万人〜20万人 - 中濃緑)
    50000: "#4caf50",  // リーフグリーン (5万人〜10万人 - 明るい緑)
    10000: "#81c784",  // ペールミント (1万人〜5万人 - 薄い緑)
  };

  const circleColor = (val) => {
    if (val >= 200000) return RANGE_COLORS[200000];
    if (val >= 100000) return RANGE_COLORS[100000];
    if (val >= 50000) return RANGE_COLORS[50000];
    if (val >= 10000) return RANGE_COLORS[10000];
    return "#e2e8f0";
  };

  const isInRange = (people, level) => {
    switch (level) {
      case 200000:
        return people >= 200000;
      case 100000:
        return people >= 100000 && people < 200000;
      case 50000:
        return people >= 50000 && people < 100000;
      case 10000:
        return people >= 10000 && people < 50000;
      case 1000:
        return people >= 1000 && people < 10000;
      default:
        return people < 1000;
    }
  };

  const svgRef = useRef();
  const zoomRef = useRef();
  const resetRef = useRef();
  const layerRef = useRef();
  const projectionRef = useRef();

  /*
   * ============================================================
   * ウィンドウサイズ変更
   * ============================================================
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*
   * ============================================================
   * 地図データ取得
   * ============================================================
   */
  useEffect(() => {
    if (Map === "日本地図") {
      fetch("/japan.geojson")
        .then((res) => res.json())
        .then(setMapData);
    } else {
      fetch("/countries-110m.json")
        .then((res) => res.json())
        .then((topology) => {
          const geojson = feature(topology, topology.objects.countries);
          setMapData(geojson);
        });
    }
  }, [Map]);

  /*
   * ============================================================
   * 全目的地人数 (destinationPeople)
   * ============================================================
   */
  const createTotalDestinationPeople = (purposeData, transportData) => {
    const obj = {};
    [...(purposeData || []), ...(transportData || [])].forEach((item) => {
      obj[item.to] = (obj[item.to] || 0) + item.people;
    });
    return obj;
  };

  const currentDestinationPeople = useMemo(() => {
    return createTotalDestinationPeople(travelData, transportationData);
  }, [travelData, transportationData]);

  const previousDestinationPeople = useMemo(() => {
    const prevTravel = previousTravelDataMap[year];
    const prevTransport = previousTransportDataMap[year];
    if (!prevTravel && !prevTransport) return {};
    return createTotalDestinationPeople(prevTravel, prevTransport);
  }, [year]);

  const destinationPoeple = useMemo(() => {
    const obj = {};
    for (const item of file) {
      obj[item.to] = (obj[item.to] || 0) + item.people;
    }
    return obj;
  }, [file]);

  /*
   * ============================================================
   * 前年度比較 計算
   * ============================================================
   */
  const currentPeople = currentDestinationPeople[destination] || 0;
  const previousPeople = previousDestinationPeople[destination] || 0;
  const diff = currentPeople - previousPeople;
  const rate =
    previousPeople === 0
      ? null
      : ((diff / previousPeople) * 100).toFixed(1);

  /*
   * ============================================================
   * ラベル比較 計算
   * ============================================================
   */
  const getLabelPeople = (data) => {
    if (!selectedLabel || !data) return 0;
    return data
      .filter(
        (item) =>
          item.from === prefecture &&
          item.to === destination &&
          item.purpose === selectedLabel
      )
      .reduce((sum, item) => sum + item.people, 0);
  };

  const currentLabelPeople = getLabelPeople(file);
  const previousLabelPeople = getLabelPeople(previousFile);
  const labelDiff = currentLabelPeople - previousLabelPeople;
  const labelRate =
    previousLabelPeople === 0
      ? currentLabelPeople === 0
        ? "0.0"
        : "新規"
      : ((labelDiff / previousLabelPeople) * 100).toFixed(1);

  /*
   * ============================================================
   * 使用するデータ & ラベルリスト
   * ============================================================
   */
  const filterData = file.filter((item) => prefecture === item.from);

  const label = Array.from(
    new Set(filterData.map(({ purpose }) => purpose))
  );

  const getPeople = (geoName) => {
    const name = geoName.replace(/(都|府|県)$/, "");
    return destinationPoeple[name] || 0;
  };

  /*
   * ============================================================
   * 地図描画
   * ============================================================
   */
  useEffect(() => {
    if (!mapData) return;

    const layer = d3.select(layerRef.current);
    layer.selectAll("path").remove();
    layer.selectAll(".world-copy").remove();
    layer.select("defs").remove();

    const projection =
      Map === "日本地図"
        ? d3.geoMercator().fitSize([mapWidth, height], mapData)
        : d3.geoMercator().fitWidth(mapWidth, mapData);

    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const bound = path.bounds(mapData);
    const center = {};

    mapData.features.forEach((feat) => {
      let name = feat.properties.nam_ja.replace(/(都|府|県)$/, "");
      center[name] = path.centroid(feat);
    });

    setPrefectureCenter(center);
    setBounds(bound);

    if (Map === "日本地図") {
      // ① 下地
      layer
        .selectAll("path.base")
        .data(mapData.features)
        .join("path")
        .attr("class", "base")
        .attr("d", path)
        .attr("fill", "#e5e7eb")
        .attr("stroke", "black")
        .style("cursor", "pointer");

      // ② 色分けオーバーレイ
      layer
        .selectAll(".overlay")
        .data(mapData.features)
        .join("path")
        .attr("class", "overlay")
        .attr("d", path)
        .attr("fill", (d) => {
          const people = getPeople(d.properties.nam_ja);
          if (selectedRange.length === 0) return "transparent";
          const matched = selectedRange.some((range) =>
            isInRange(people, range)
          );
          return matched ? circleColor(people) : "#eeeeee";
        })
        .attr("fill-opacity", (d) => {
          const people = getPeople(d.properties.nam_ja);
          if (selectedRange.length === 0) return 0;
          const matched = selectedRange.some((range) =>
            isInRange(people, range)
          );
          return matched ? 0.78 : 0.2;
        })
        .attr("stroke", (d) => {
          const name = d.properties.nam_ja.replace(/(都|府|県)$/, "");
          if (name === prefecture) return "#e53935";
          if (name === destination) return "#1e88e5";
          return "none";
        })
        .attr("stroke-width", (d) => {
          const name = d.properties.nam_ja.replace(/(都|府|県)$/, "");
          if (name === prefecture || name === destination) return 3.5;
          return 0;
        });

      // ③ クリック用透明パス
      layer
        .selectAll(".stripe")
        .data(mapData.features)
        .join("path")
        .attr("class", "stripe")
        .attr("d", path)
        .attr("pointer-events", "all")
        .attr("fill", "transparent")
        .attr("stroke", "none")
        .style("cursor", "pointer")
        .on("mousemove", (event, d) => {
          setMousePos({ x: event.offsetX, y: event.offsetY });
          setIsInformation(d.properties.nam_ja);
        })
        .on("mouseleave", () => {
          setIsInformation(null);
        })
        .on("click", (event, d) => {
          const name = d.properties.nam_ja.replace(/(都|府|県)$/, "");
          if (selectMode === "from") {
            if (name === destination) {
              alert("出発地と目的地に同じ地点は選択できません");
              return;
            }
            setPrefecture(name);
          } else {
            if (name === prefecture) {
              alert("出発地と目的地に同じ地点は選択できません");
              return;
            }
            setDestination(name);
          }
        });
    }
  }, [
    mapData,
    mapWidth,
    height,
    destinationPoeple,
    selectedRange,
    prefecture,
    destination,
    selectMode,
    legend_judge,
  ]);

  /*
   * ============================================================
   * ズーム制御
   * ============================================================
   */
  useEffect(() => {
    if (!bounds) return;

    const svg = d3.select(svgRef.current);
    const imageLayer = svg.select("#imageLayer");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 14])
      .on("zoom", (event) => {
        const { x, y, k } = event.transform;
        let displayX = x;
        let displayY = y;
        const displayMargin = k > 1 ? 300 * k : 0;

        const minX =
          -((bounds[1][0] + bounds[0][0]) / 2) * k - displayMargin;
        const maxX =
          mapWidth -
          ((bounds[1][0] + bounds[0][0]) / 2) * k +
          displayMargin;
        const minY =
          -((bounds[1][1] + bounds[0][1]) / 2 - 45) * k - displayMargin;
        const maxY =
          height -
          ((bounds[1][1] + bounds[0][1]) / 2) * k +
          displayMargin;

        displayX = Math.max(minX, Math.min(maxX, displayX));
        displayY = Math.max(minY, Math.min(maxY, displayY));

        imageLayer.attr(
          "transform",
          `translate(${displayX}, ${displayY}) scale(${k})`
        );
      })
      .on("end", (event) => {
        setScale(Number(event.transform.k.toFixed(1)));
      });

    zoomRef.current = zoom;
    resetRef.current = zoom;
    svg.call(zoom);
  }, [Map, bounds, mapWidth, height]);

  /*
   * ============================================================
   * ログイン・お気に入り保存
   * ============================================================
   */
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    const name = localStorage.getItem("userName");
    if (loginStatus === "true") {
      setIsLogin(true);
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isFavorite", JSON.stringify(isFavorite));
  }, [isFavorite]);

  useEffect(() => {
    localStorage.setItem("favoriteArr", JSON.stringify(favoriteArr));
  }, [favoriteArr]);

  return (
    <div className="top">
      <div className="header">
        <h1>日本人の移動可視化サイトマップ</h1>

        <div className="Legend">
          <button
            className="legendButton"
            onClick={() => setShowLegend(!showLegend)}
          >
            ≡
          </button>

          {showLegend && (
            <div
              className="legendMenu"
              onMouseLeave={() => setShowLegend(false)}
            >
              <button onClick={() => setGuideStep(0)}>チュートリアル</button>
              <button
                onClick={() => window.open("./index2.html", "_blank")}
              >
                使い方
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(
                    "favoriteArr",
                    JSON.stringify(favoriteArr)
                  );
                  window.location.href = "./index3.html";
                }}
              >
                お気に入り一覧
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://forms.gle/kSxSu3UmnEzXxabs8",
                    "_blank"
                  )
                }
              >
                問い合わせ
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="image">
        {/* ============================================================
            左側統合コントロールパネル (自然な縦並び・スクロール対応)
           ============================================================ */}
        <div className="leftPanel">
          {/* ① From -> To 地点選択バー (検索機能付きプルダウン) */}
          <div className="routeSelector">
            <SearchableSelect
              label="From"
              value={prefecture}
              onChange={(name) => setPrefecture(name)}
              type="from"
              options={coord}
              isActiveMode={selectMode === "from"}
              onSelectMode={() => setSelectMode("from")}
            />

            <span className="routeArrow">➔</span>

            <SearchableSelect
              label="To"
              value={destination}
              onChange={(name) => setDestination(name)}
              type="to"
              options={coord}
              isActiveMode={selectMode === "to"}
              onSelectMode={() => setSelectMode("to")}
            />
          </div>

          {/* ② 年度選択・交通行動選択 (独立カード) */}
          <div className="controlCard">
            <div className="controlItem">
              <label className="controlLabel">年度選択</label>
              <select
                className="controlSelect"
                value={year}
                onChange={(e) => {
                  const nextYear = e.target.value;
                  setYear(nextYear);
                  if (traffic === "移動手段") {
                    setSelectedLabel(
                      nextYear === "2005年度" || nextYear === "2010年度"
                        ? "鉄道"
                        : "鉄道_全目的"
                    );
                  }
                }}
              >
                {yearSelection.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="controlItem">
              <label className="controlLabel">交通行動選択</label>
              <select
                className="controlSelect"
                value={traffic}
                onChange={(e) => {
                  const nextTraffic = e.target.value;
                  setTraffic(nextTraffic);
                  if (nextTraffic === "移動目的") {
                    setSelectedLabel("代_全機関_観光");
                  } else {
                    setSelectedLabel(
                      year === "2005年度" || year === "2010年度"
                        ? "鉄道"
                        : "鉄道_全目的"
                    );
                  }
                }}
              >
                {transportation.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ③ 比較・分析パネル（前年度比較 ➔ ラベル比較＆2x3ラベルボタン） */}
          <ComparePanel
            year={year}
            currentPeople={currentPeople}
            previousPeople={previousPeople}
            diff={diff}
            rate={rate}
            label={label}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            currentLabelPeople={currentLabelPeople}
            previousLabelPeople={previousLabelPeople}
            labelDiff={labelDiff}
            labelRate={labelRate}
          />
        </div>

        {/* ============================================================
            地図エリア
           ============================================================ */}
        <div className={`mapArea ${legend_judge ? "full" : "shrink"}`}>
          <SvgMap
            svgRef={svgRef}
            mapWidth={mapWidth}
            height={height}
            layerRef={layerRef}
            projectionRef={projectionRef}
            filterData={filterData}
            coord={coord}
            coords={coords}
            judge={judge}
            circleColor={circleColor}
            circleSize={circleSize}
            destinationPoeple={destinationPoeple}
            dataColor={dataColor}
            active={active}
            Scale={Scale}
            setMousePos={setMousePos}
            setPrefecture={setPrefecture}
            setIsInformation={setIsInformation}
            setLineInformation={setLineInformation}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            hoverRange={hoverRange}
            setHoverRange={setHoverRange}
            isInformation={isInformation}
            lineInformation={lineInformation}
            prefecture={prefecture}
            prefectureCenter={prefectureCenter}
            destination={destination}
            selectedLabel={selectedLabel}
          />
        </div>

        {/* ============================================================
            右側情報パネル (SvgLabel)
           ============================================================ */}
        <div className={`legendPanel ${legend_judge ? "close" : "open"}`}>
          <SvgLabel
            height={height}
            legend_judge={legend_judge}
            setLegend_judge={setLegend_judge}
            traffic={traffic}
            prefecture={prefecture}
            destination={destination}
            coord={coord}
            year={year}
            travelData={travelData}
            transportationData={transportationData}
            file={file}
            previousFile={previousFile}
            tab={tab}
            setTab={setTab}
          />
        </div>
      </div>

      {/* ============================================================
          チュートリアルモーダル
         ============================================================ */}
      {guideStep >= 0 && (
        <div className="guideOverlay">
          <div className="guideModal">
            <button
              onClick={closeGuide}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "32px",
                height: "32px",
                border: "none",
                borderRadius: "50%",
                background: "#f0f0f0",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              ×
            </button>

            {guideStep === 0 && (
              <>
                <h2>🚄 日本人の移動可視化サイトへようこそ！</h2>
                <p>
                  このサイトでは、日本国内の人の移動データを地図上で可視化しています。
                </p>
                <img
                  src="/guide2.png"
                  alt="説明画像"
                  className="guideImage"
                />
              </>
            )}

            {guideStep === 1 && (
              <>
                <h2>🗺 地図の操作方法</h2>
                <ul>
                  <li>県をクリックすると選択地点を変更できます。</li>
                  <li>
                    下のボタンで条件を満たす来客者数ごとの絞り込みが出来ます
                  </li>
                  <li>
                    それぞれの都道府県をタップすることで、その詳細を見ることが出来ます
                  </li>
                </ul>
                <img
                  src="/guide1.png"
                  alt="操作方法"
                  className="guideImage"
                />
              </>
            )}

            {guideStep === 2 && (
              <>
                <h2>📊 データの見方</h2>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    overflowX: "hidden",
                  }}
                >
                  <ul
                    style={{
                      paddingLeft: "20px",
                      lineHeight: "1.8",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    <li>
                      選択地点への来訪人数を前年度と比較できます。
                    </li>
                    <li>
                      移動目的・交通手段ごとの来訪人数を前年度と比較できます。
                    </li>
                    <li>
                      対象地点から選択地点への移動目的・交通手段の割合を確認できます。
                    </li>
                    <li>選択地点へ来る人数ランキングを確認できます。</li>
                  </ul>
                  <img
                    src="/guide3.png"
                    alt="データの見方"
                    className="guideImage"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      marginTop: "10px",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </>
            )}

            <div className="guideButtons">
              {guideStep > 0 && (
                <button onClick={() => setGuideStep(guideStep - 1)}>
                  ← 戻る
                </button>
              )}

              {guideStep < 2 ? (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  style={{ marginLeft: "auto" }}
                >
                  次へ →
                </button>
              ) : (
                <button onClick={closeGuide}>はじめる</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
