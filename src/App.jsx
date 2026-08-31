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

const travelDataMap = {
  "1990年度": travelData1990,
  "1995年度": travelData1995,
  "2000年度": travelData2000,
  "2005年度": travelData2005,
  "2010年度": travelData2010,
};

const transportationDataMap = {
  "1990年度": transportationData1990,
  "1995年度": transportationData1995,
  "2000年度": trasnportationData2000,
  "2005年度": transportationData2005,
  "2010年度": transportationData2010,
};

const previousTravelDataMap = {
  "1990年度": null,
  "1995年度": travelData1990,
  "2000年度": travelData1995,
  "2005年度": travelData2000,
  "2010年度": travelData2005,
};

const previousTransportDataMap = {
  "1990年度": null,
  "1995年度": transportationData1990,
  "2000年度": trasnportationData2000,
  "2005年度": transportationData2005,
  "2010年度": transportationData2010,
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
        .then((japanRaw) => {
          // Identify Hokkaido feature
          const hokkaidoFeature =
            japanRaw.features.find(
              (f) =>
                (f.properties &&
                  (f.properties.nam_ja === "北海道" ||
                    (f.properties.nam &&
                      f.properties.nam.toLowerCase().includes("hokkaido")))) ||
                f.id === 1 ||
                f.properties?.id === 1
            ) ||
            japanRaw.features.find((f) => {
              const geom = f.geometry;
              if (!geom || !geom.coordinates || !geom.coordinates[0]) return false;
              const c =
                geom.type === "Polygon"
                  ? geom.coordinates[0][0]
                  : geom.coordinates[0]?.[0]?.[0];
              return c && c[0] > 139.0 && c[1] > 41.5;
            });

          if (!hokkaidoFeature) {
            setMapData(japanRaw);
            return;
          }

          const hokkaidoGeom = hokkaidoFeature.geometry;
          const hokkaidoMultiPoly =
            hokkaidoGeom.type === "Polygon"
              ? [hokkaidoGeom.coordinates]
              : hokkaidoGeom.coordinates;

          // High-Density Official Jagged Municipal Border Polylines from N03 administrative boundaries
          // 1. Donan / Doo Municipal Border (Setana -> Kuromatsunai -> Oshamambe)
          const DONAN_BORDER = [
            [139.50, 42.68],
            [139.72, 42.56], [139.77, 42.59], [139.81, 42.63], [139.84, 42.66],
            [139.88, 42.64], [139.92, 42.62], [139.95, 42.61], [139.99, 42.64],
            [140.03, 42.67], [140.08, 42.68], [140.12, 42.65], [140.15, 42.63],
            [140.18, 42.64], [140.22, 42.69], [140.25, 42.72], [140.28, 42.72],
            [140.32, 42.70], [140.35, 42.68], [140.38, 42.68], [140.42, 42.64],
            [140.45, 42.61], [140.48, 42.59], [140.52, 42.56], [140.56, 42.54],
            [140.60, 42.52],
            [140.80, 42.50]
          ];

          // 2. Doto West Official Jagged Municipal Border (Cape Erimo/Hiroo -> Hidaka Range -> Daisetsuzan -> Kitami Range -> Okhotsk)
          const DOTO_BORDER = [
            [143.40, 41.80],
            [143.28, 41.95], [143.26, 42.01], [143.24, 42.06], [143.21, 42.11],
            [143.18, 42.15], [143.16, 42.20], [143.13, 42.26], [143.09, 42.32],
            [143.06, 42.38], [143.03, 42.44], [142.99, 42.51], [142.95, 42.57],
            [142.91, 42.63], [142.87, 42.68], [142.84, 42.74], [142.80, 42.80],
            [142.76, 42.86], [142.72, 42.92], [142.69, 42.98], [142.72, 43.04],
            [142.75, 43.10], [142.79, 43.16], [142.83, 43.22], [142.87, 43.28],
            [142.91, 43.34], [142.94, 43.41], [142.95, 43.48], [142.98, 43.54],
            [143.02, 43.60], [143.06, 43.66], [143.11, 43.72], [143.14, 43.78],
            [143.11, 43.84], [143.07, 43.89], [143.04, 43.95], [143.01, 44.01],
            [142.98, 44.07], [142.95, 44.13], [142.92, 44.19], [142.89, 44.25],
            [142.86, 44.31], [142.87, 44.38], [142.90, 44.44], [142.94, 44.51],
            [142.97, 44.57], [143.01, 44.64], [143.05, 44.71], [143.08, 44.80],
            [143.15, 45.00]
          ];

          // 3. Dohoku / Doo Official Jagged Municipal Border (Mashike -> Shokanbetsu -> Kabato -> Sorachi/Kamikawa -> Daisetsuzan)
          const DOHOKU_BORDER = [
            [141.10, 43.88],
            [141.30, 43.85], [141.36, 43.83], [141.42, 43.81], [141.48, 43.78],
            [141.53, 43.75], [141.59, 43.73], [141.65, 43.70], [141.71, 43.68],
            [141.77, 43.65], [141.83, 43.63], [141.89, 43.60], [141.95, 43.58],
            [142.01, 43.56], [142.07, 43.53], [142.13, 43.51], [142.19, 43.49],
            [142.25, 43.47], [142.32, 43.45], [142.39, 43.43], [142.46, 43.43],
            [142.53, 43.44], [142.60, 43.46], [142.67, 43.47], [142.74, 43.48],
            [142.82, 43.49], [142.89, 43.50], [142.95, 43.51],
            [143.30, 43.51]
          ];

          // Exact Polyline-based Polygon Splitter that embeds EVERY single jagged vertex of the municipal boundary
          const splitMultiByPolyline = (multiPoly, cutPolyline, isSideA) => {
            const sideA = [];
            const sideB = [];

            const lineSegIntersect = (p1, p2, p3, p4) => {
              const d =
                (p2[0] - p1[0]) * (p4[1] - p3[1]) -
                (p2[1] - p1[1]) * (p4[0] - p3[0]);
              if (Math.abs(d) < 1e-12) return null;
              const t =
                ((p3[0] - p1[0]) * (p4[1] - p3[1]) -
                  (p3[1] - p1[1]) * (p4[0] - p3[0])) /
                d;
              const u =
                ((p3[0] - p1[0]) * (p2[1] - p1[1]) -
                  (p3[1] - p1[1]) * (p2[0] - p1[0])) /
                d;
              if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return {
                  pt: [
                    p1[0] + t * (p2[0] - p1[0]),
                    p1[1] + t * (p2[1] - p1[1]),
                  ],
                  t,
                  u,
                };
              }
              return null;
            };

            for (const poly of multiPoly) {
              for (const ring of poly) {
                if (!ring || ring.length < 3) continue;

                const hits = [];
                for (let i = 0; i < ring.length - 1; i++) {
                  const r1 = ring[i];
                  const r2 = ring[i + 1];
                  for (let j = 0; j < cutPolyline.length - 1; j++) {
                    const c1 = cutPolyline[j];
                    const c2 = cutPolyline[j + 1];
                    const hit = lineSegIntersect(r1, r2, c1, c2);
                    if (hit) {
                      hits.push({
                        ringIdx: i,
                        cutIdx: j,
                        cutDist: j + hit.u,
                        pt: hit.pt,
                      });
                    }
                  }
                }

                if (hits.length < 2) {
                  const samplePt = ring[0];
                  if (isSideA(samplePt)) {
                    sideA.push([ring]);
                  } else {
                    sideB.push([ring]);
                  }
                  continue;
                }

                // Identify the two main intersection points across the ring
                hits.sort((a, b) => a.cutDist - b.cutDist);
                let hitA = hits[0];
                let hitB = hits[hits.length - 1];

                if (hitA.ringIdx > hitB.ringIdx) {
                  [hitA, hitB] = [hitB, hitA];
                }

                const rIdxA = hitA.ringIdx;
                const rIdxB = hitB.ringIdx;

                // Arc 1: along the ring from hitA to hitB
                const arc1 = [hitA.pt, ...ring.slice(rIdxA + 1, rIdxB + 1), hitB.pt];

                // Arc 2: along the ring from hitB to end, then start to hitA
                const arc2 = [
                  hitB.pt,
                  ...ring.slice(rIdxB + 1),
                  ...ring.slice(1, rIdxA + 1),
                  hitA.pt,
                ];

                // Jagged path from hitA to hitB along cutPolyline
                let jaggedAtoB;
                if (hitA.cutDist <= hitB.cutDist) {
                  jaggedAtoB = [
                    hitA.pt,
                    ...cutPolyline.slice(hitA.cutIdx + 1, hitB.cutIdx + 1),
                    hitB.pt,
                  ];
                } else {
                  jaggedAtoB = [
                    hitA.pt,
                    ...cutPolyline.slice(hitB.cutIdx + 1, hitA.cutIdx + 1).reverse(),
                    hitB.pt,
                  ];
                }

                const jaggedBtoA = [...jaggedAtoB].reverse();

                // Closed polygon 1: hitA -> Arc 1 -> hitB -> jaggedBtoA -> hitA
                const poly1 = [...arc1, ...jaggedBtoA.slice(1)];

                // Closed polygon 2: hitB -> Arc 2 -> hitA -> jaggedAtoB -> hitB
                const poly2 = [...arc2, ...jaggedAtoB.slice(1)];

                // Determine side for each polygon
                const testPt1 = arc1[Math.floor(arc1.length / 2)] || poly1[0];
                if (isSideA(testPt1)) {
                  sideA.push([poly1]);
                  sideB.push([poly2]);
                } else {
                  sideA.push([poly2]);
                  sideB.push([poly1]);
                }
              }
            }

            return { sideA, sideB };
          };

          // Side-check helper functions
          const getPolylineY = (pts, x) => {
            if (x <= pts[0][0]) return pts[0][1];
            if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
            for (let i = 0; i < pts.length - 1; i++) {
              const p1 = pts[i], p2 = pts[i + 1];
              if ((x >= p1[0] && x <= p2[0]) || (x >= p2[0] && x <= p1[0])) {
                const t = (x - p1[0]) / (p2[0] - p1[0] || 1e-9);
                return p1[1] + t * (p2[1] - p1[1]);
              }
            }
            return pts[pts.length - 1][1];
          };

          const getPolylineX = (pts, y) => {
            if (y <= pts[0][1]) return pts[0][0];
            if (y >= pts[pts.length - 1][1]) return pts[pts.length - 1][0];
            for (let i = 0; i < pts.length - 1; i++) {
              const p1 = pts[i], p2 = pts[i + 1];
              if ((y >= p1[1] && y <= p2[1]) || (y >= p2[1] && y <= p1[1])) {
                const t = (y - p1[1]) / (p2[1] - p1[1] || 1e-9);
                return p1[0] + t * (p2[0] - p1[0]);
              }
            }
            return pts[pts.length - 1][0];
          };

          const isDonan = (p) => p[1] <= getPolylineY(DONAN_BORDER, p[0]);
          const isDoto = (p) => p[0] >= getPolylineX(DOTO_BORDER, p[1]);
          const isDohoku = (p) => p[1] >= getPolylineY(DOHOKU_BORDER, p[0]);

          // Perform Partition with Guaranteed Jagged Borders
          // 1. Separate Donan from Hokkaido
          const { sideA: donanPoly, sideB: hokkaidoNorth } = splitMultiByPolyline(
            hokkaidoMultiPoly,
            DONAN_BORDER,
            isDonan
          );

          // 2. Separate Doto from Hokkaido North
          const { sideA: dotoPoly, sideB: hokkaidoWest } = splitMultiByPolyline(
            hokkaidoNorth,
            DOTO_BORDER,
            isDoto
          );

          // 3. Separate Dohoku and Doo from Hokkaido West
          const { sideA: dohokuPoly, sideB: dooPoly } = splitMultiByPolyline(
            hokkaidoWest,
            DOHOKU_BORDER,
            isDohoku
          );

          const officialFeatures = [
            {
              type: "Feature",
              properties: { id: 101, nam: "Doo", nam_ja: "道央" },
              geometry: { type: "MultiPolygon", coordinates: dooPoly },
            },
            {
              type: "Feature",
              properties: { id: 102, nam: "Donan", nam_ja: "道南" },
              geometry: { type: "MultiPolygon", coordinates: donanPoly },
            },
            {
              type: "Feature",
              properties: { id: 103, nam: "Dohoku", nam_ja: "道北" },
              geometry: { type: "MultiPolygon", coordinates: dohokuPoly },
            },
            {
              type: "Feature",
              properties: { id: 104, nam: "Doto", nam_ja: "道東" },
              geometry: { type: "MultiPolygon", coordinates: dotoPoly },
            },
          ];

          const nonHokkaido = japanRaw.features.filter(
            (f) =>
              !(
                (f.properties &&
                  (f.properties.nam_ja === "北海道" ||
                    f.properties.nam_ja === "道北" ||
                    f.properties.nam_ja === "道東" ||
                    f.properties.nam_ja === "道央" ||
                    f.properties.nam_ja === "道南" ||
                    (f.properties.nam &&
                      f.properties.nam.toLowerCase().includes("hokkaido")))) ||
                f.id === 1 ||
                f.properties?.id === 1
              )
          );

          setMapData({
            ...japanRaw,
            features: [...nonHokkaido, ...officialFeatures],
          });
        })
        .catch((err) => {
          console.error("Failed to load map data:", err);
        });
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
              return; // Silently ignore same location
            }
            setPrefecture(name);
          } else {
            if (name === prefecture) {
              return; // Silently ignore same location
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
              onChange={(name) => {
                if (name !== destination) {
                  setPrefecture(name);
                }
              }}
              type="from"
              options={coord.filter((c) => c !== destination)}
              isActiveMode={selectMode === "from"}
              onSelectMode={() => setSelectMode("from")}
            />

            <button
              type="button"
              className="routeSwapBtn"
              onClick={() => {
                const prevPref = prefecture;
                const prevDest = destination;
                setPrefecture(prevDest);
                setDestination(prevPref);
              }}
              title="出発地と目的地を入れ替える"
              aria-label="出発地と目的地を入れ替える"
            >
              ⇄
            </button>

            <SearchableSelect
              label="To"
              value={destination}
              onChange={(name) => {
                if (name !== prefecture) {
                  setDestination(name);
                }
              }}
              type="to"
              options={coord.filter((c) => c !== prefecture)}
              isActiveMode={selectMode === "to"}
              onSelectMode={() => setSelectMode("to")}
            />
          </div>

          {/* ② 年度選択 (スマートカード) */}
          <div className="controlCard">
            <div className="controlItem">
              <div className="controlLabelWrapper">
                <label className="controlLabel">分析年度</label>
                <span className="controlLabelHint">調査年を選択</span>
              </div>
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
          </div>

          {/* ③ 比較・分析パネル（全体前年度比較 ➔ 目的別/手段別詳細比較） */}
          <ComparePanel
            traffic={traffic}
            setTraffic={setTraffic}
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

            {/* 上部プログレスゲージ */}
            <div className="guideGaugeTrack">
              <div
                className="guideGaugeFill"
                style={{ width: `${((guideStep + 1) / 4) * 100}%` }}
              />
            </div>

            {guideStep === 0 && (
              <div className="guideStepContent">
                <h2>日本人の移動可視化サイトへようこそ！</h2>
                <p className="guideIntro">
                  このサイトでは、日本国内の都道府県間における人流データを地図やグラフ上で視覚的に分析できます。
                </p>
                <div className="guideFeatureList">
                  <div className="guideFeatureItem">
                    <strong>1. 出発地（From）と目的地（To）の選択</strong>
                    <p>左上の検索付きプルダウンから、分析したい出発地と目的地を選択できます。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>2. 「⇄」入れ替えボタン</strong>
                    <p>中央の入れ替えボタンを押すと、ワンクリックで出発地と目的地が入れ替わります。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>3. 分析年度の切り替え</strong>
                    <p>年度選択カードから調査年（1990年度〜2021年度）を切り替えて過去データと比較できます。</p>
                  </div>
                </div>
              </div>
            )}

            {guideStep === 1 && (
              <div className="guideStepContent">
                <h2>地図の操作と人流・ハイライトの見方</h2>
                <p className="guideIntro">
                  地図上では、視覚的なアニメーションや色分けにより全国の人流を把握できます。
                </p>
                <div className="guideFeatureList">
                  <div className="guideFeatureItem">
                    <strong>1. 人流光線アニメーション</strong>
                    <p>出発地から目的地へ向かって流れる光の線で、人の移動の向きと繋がりを直感的に表示します。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>2. 都道府県のクリック選択</strong>
                    <p>地図上の都道府県を直接クリックすることで、選択地点（出発地／目的地）を素早く切り替えられます。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>3. 都道府県の色分け（凡例ハイライト）</strong>
                    <p>画面右下の凡例ボタンをクリックすると、指定した来訪者数範囲の都道府県のみをハイライトして絞り込めます。</p>
                  </div>
                </div>
              </div>
            )}

            {guideStep === 2 && (
              <div className="guideStepContent">
                <h2>前年度比較と目的・手段別の詳細分析</h2>
                <p className="guideIntro">
                  左側の比較パネルでは、来訪人数の増減や交通行動ごとの詳細な内訳を調査できます。
                </p>
                <div className="guideFeatureList">
                  <div className="guideFeatureItem">
                    <strong>1. 前年度比較</strong>
                    <p>今年度と前年度の人数、および前年比（増減数・増減率・前年比倍率）をテキストで即座に確認できます。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>2. 交通目的別で見る</strong>
                    <p>「観光」「仕事」「私用」などの目的ボタンを押すと、目的別の来訪人数と前年比に切り替わります。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>3. 交通手段別で見る</strong>
                    <p>「鉄道」「自動車」「航空」「船舶」などの手段ボタンを押すと、利用手段ごとの来訪人数と前年比に切り替わります。</p>
                  </div>
                </div>
              </div>
            )}

            {guideStep === 3 && (
              <div className="guideStepContent">
                <h2>割合グラフと来訪者ランキングTOP10</h2>
                <p className="guideIntro">
                  右側の情報パネルでは、詳細な構成比率や来訪者の多い都道府県ランキングを確認できます。
                </p>
                <div className="guideFeatureList">
                  <div className="guideFeatureItem">
                    <strong>1. 割合タブ</strong>
                    <p>出発地から目的地への「移動目的割合」や「交通手段割合」をバーグラフとパーセントで確認できます。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>2. 順位タブ（来訪者ランキング TOP10）</strong>
                    <p>選択した目的地へ来る人数の多い上位10都道府県のランキングと、前年からの順位変動を確認できます。</p>
                  </div>
                  <div className="guideFeatureItem">
                    <strong>3. メニュー（≡）</strong>
                    <p>右上のメニューから、いつでもこのチュートリアルや詳しい使い方ページを開くことができます。</p>
                  </div>
                </div>
              </div>
            )}

            <div className="guideButtons">
              {guideStep > 0 && (
                <button onClick={() => setGuideStep(guideStep - 1)}>
                  ← 戻る
                </button>
              )}

              {guideStep < 3 ? (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  style={{ marginLeft: "auto" }}
                >
                  次へ →
                </button>
              ) : (
                <button onClick={closeGuide} style={{ marginLeft: "auto" }}>
                  はじめる
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
