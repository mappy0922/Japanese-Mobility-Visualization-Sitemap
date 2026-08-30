import * as d3 from "d3";
import { useMemo } from "react";
import { useState, useEffect, useRef } from "react";

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


const MapName = [
  "日本地図",
  "世界地図",
];


const transportation = [
  "移動目的",
  "移動手段"
];


const yearSelection = [
  "1990年度",
  "1995年度",
  "2000年度",
  "2005年度",
  "2010年度",
];


const circleSize = [
  200000,
  100000,
  50000,
  10000,
];


const coord = Object.keys(coords);

console.log(coord);


/*
 * ============================================================
 * お気に入り初期状態
 * ============================================================
 */

const createFavoriteState = () => {

  const init = {};

  yearSelection.forEach(y => {

    init[y] = {};

    transportation.forEach(t => {

      init[y][t] =
        Object.fromEntries(
          coord.map(name => [
            name,
            false
          ])
        );

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

  const [windowSize, setWindowSize] =
    useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });


  const height =
    windowSize.height;


  /*
   * ============================================================
   * ユーザー
   * ============================================================
   */

  const [userName, setUserName] =
    useState("");


  const [isFavorite, setIsFavorite] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "isFavorite"
        );

      return saved
        ? JSON.parse(saved)
        : createFavoriteState();

    });


  const [isLogin, setIsLogin] =
    useState(false);


  /*
   * ============================================================
   * 北海道メニュー
   * ============================================================
   */

  const [showHokkaidoMenu, setShowHokkaidoMenu] =
    useState(false);


  const [hokkaidoMenuPos, setHokkaidoMenuPos] =
    useState({
      x: 0,
      y: 0
    });


  /*
   * ============================================================
   * メニュー
   * ============================================================
   */

  const [selectedLabel, setSelectedLabel] =
    useState("");


  const [showMenu, setShowMenu] =
    useState(false);


  /*
   * ============================================================
   * 地図関連
   * ============================================================
   */

  const [prefectureCenter, setPrefectureCenter] =
    useState({});


  /*
   * ============================================================
   * チュートリアル
   * ============================================================
   */

  const [guideStep, setGuideStep] =
    useState(() => {

      const seen =
        localStorage.getItem(
          "guideSeen"
        );

      return seen
        ? -1
        : 0;

    });


  /*
   * ============================================================
   * 凡例
   * ============================================================
   */

  const [showLegend, setShowLegend] =
    useState(false);


  const [lineInformation, setLineInformation] =
    useState(null);


  const [isInformation, setIsInformation] =
    useState(null);


  /*
   * ============================================================
   * ★ ここが今回の変更点
   *
   * selectedRange は複数選択するため配列にする
   *
   * 例：
   *
   * []
   *
   * [50000]
   *
   * [50000, 10000]
   *
   * ============================================================
   */

  const [selectedRange, setSelectedRange] =
    useState([]);


  const [hoverRange, setHoverRange] =
    useState(null);


  const [legend_judge, setLegend_judge] =
    useState(true);


  /*
   * ============================================================
   * マウス位置
   * ============================================================
   */

  const [mousePos, setMousePos] =
    useState({
      x: 0,
      y: 0
    });


  /*
   * ============================================================
   * ズーム
   * ============================================================
   */

  const [Scale, setScale] =
    useState(1);


  /*
   * ============================================================
   * 地図・交通・年度
   * ============================================================
   */

  const [Map, setMap] =
    useState(MapName[0]);


  const [traffic, setTraffic] =
    useState(
      transportation[0]
    );


  const [year, setYear] =
    useState(
      yearSelection[0]
    );


  /*
   * ============================================================
   * 都道府県
   * ============================================================
   */

  const [prefecture, setPrefecture] =
    useState(coord[0]);


  const [destination, setDestination] =
    useState(coord[1]);


  /*
   * ============================================================
   * 地図データ
   * ============================================================
   */

  const [mapData, setMapData] =
    useState(null);


  const [bounds, setBounds] =
    useState(null);


  /*
   * ============================================================
   * お気に入り
   * ============================================================
   */

  const [favoriteArr, setFavoriteArr] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "favoriteArr"
        );

      return saved
        ? JSON.parse(saved)
        : [];

    });


  /*
   * ============================================================
   * 選択中の移動目的・交通手段
   * ============================================================
   */

  const [active, setActive] =
    useState(() => {

      if (
        traffic === "移動目的"
      ) {

        return {

          代_全機関_仕事: false,
          代_全機関_観光: false,
          代_全機関_私用: false,
          代_全機関_その他: false,
          代_全機関_不明: false,
          代_全機関_全目的: false,

        };

      } else {

        if (
          year === "1990年度" ||
          year === "1995年度" ||
          year === "2000年度"
        ) {

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


  const LEGEND_WIDTH = 300;


  const mapWidth =
    legend_judge
      ? windowSize.width
      : windowSize.width - LEGEND_WIDTH;


  /*
   * ============================================================
   * チュートリアル終了
   * ============================================================
   */

  const closeGuide = () => {

    localStorage.setItem(
      "guideSeen",
      "true"
    );

    setGuideStep(-1);

  };


  /*
   * ============================================================
   * リセット
   * ============================================================
   */

  const handleReset = () => {

    /*
     * ★ 凡例の複数選択もリセット
     */

    setSelectedRange([]);


    if (
      traffic === "移動目的"
    ) {

      setActive({

        代_全機関_仕事: false,
        代_全機関_観光: false,
        代_全機関_私用: false,
        代_全機関_その他: false,
        代_全機関_不明: false,
        代_全機関_全目的: false,

      });

    } else {

      if (
        year === "1990年度" ||
        year === "1995年度" ||
        year === "2000年度"
      ) {

        setActive({

          航空_全目的: false,
          鉄道_全目的: false,
          船_全目的: false,
          バス_全目的: false,
          自動車_全目的: false,
          全機関_全目的: false,

        });

      } else {

        setActive({

          航空: false,
          鉄道: false,
          船: false,
          バス: false,
          乗用車等: false,
          全機関: false,

        });

      }

    }

  };


  /*
   * ============================================================
   * 年度別データ
   * ============================================================
   */

  let travelData = [];

  let transportationData = [];


  switch (year) {

    case "1990年度":

      travelData =
        travelData1990;

      transportationData =
        transportationData1990;

      break;


    case "1995年度":

      travelData =
        travelData1995;

      transportationData =
        transportationData1995;

      break;


    case "2000年度":

      travelData =
        travelData2000;

      transportationData =
        trasnportationData2000;

      break;


    case "2005年度":

      travelData =
        travelData2005;

      transportationData =
        transportationData2005;

      break;


    case "2010年度":

      travelData =
        travelData2010;

      transportationData =
        transportationData2010;

      break;

  }


  /*
   * ============================================================
   * 使用するファイル
   * ============================================================
   */

  let file = [];


  if (
    traffic === "移動目的"
  ) {

    if (
      year === "1990年度"
    ) {
      file =
        travelData1990;
    }

    if (
      year === "1995年度"
    ) {
      file =
        travelData1995;
    }

    if (
      year === "2000年度"
    ) {
      file =
        travelData2000;
    }

    if (
      year === "2005年度"
    ) {
      file =
        travelData2005;
    }

    if (
      year === "2010年度"
    ) {
      file =
        travelData2010;
    }

  } else {

    if (
      year === "1990年度"
    ) {
      file =
        transportationData1990;
    }

    if (
      year === "1995年度"
    ) {
      file =
        transportationData1995;
    }

    if (
      year === "2000年度"
    ) {
      file =
        trasnportationData2000;
    }

    if (
      year === "2005年度"
    ) {
      file =
        transportationData2005;
    }

    if (
      year === "2010年度"
    ) {
      file =
        transportationData2010;
    }

  }


  /*
   * ============================================================
   * データカラー
   * ============================================================
   */

  let dataColor = {};


  if (
    traffic === "移動目的"
  ) {

    dataColor = {

      "代_全機関_仕事":
        "#4E79A7",

      "代_全機関_観光":
        "#F28E2B",

      "代_全機関_私用":
        "#E15759",

      "代_全機関_その他":
        "#76B7B2",

      "代_全機関_不明":
        "#59A14F",

      "代_全機関_全目的":
        "#BAB0AC",

    };

  } else {

    if (
      year === "1990年度" ||
      year === "1995年度" ||
      year === "2000年度"
    ) {

      dataColor = {

        "航空_全目的":
          "#4E79A7",

        "鉄道_全目的":
          "#F28E2B",

        "船_全目的":
          "#76B7B2",

        "バス_全目的":
          "#E15759",

        "自動車_全目的":
          "#59A14F",

        "全機関_全目的":
          "#BAB0AC",

      };

    } else {

      dataColor = {

        "航空":
          "#4E79A7",

        "鉄道":
          "#F28E2B",

        "船":
          "#76B7B2",

        "バス":
          "#E15759",

        "乗用車等":
          "#59A14F",

        "全機関":
          "#BAB0AC",

      };

    }

  }


  /*
   * ============================================================
   * 円の大きさ
   * ============================================================
   */

  const judge = (
    people,
    judge
  ) => {

    const size =
      Math.log10(
        people + 1
      );


    if (
      people >= judge[0]
    ) {

      return size * 1.8;

    } else if (
      people >= judge[1]
    ) {

      return size * 1.5;

    } else if (
      people >= judge[2]
    ) {

      return size * 1.2;

    } else if (
      people >= judge[3]
    ) {

      return size * 0.8;

    } else {

      return size * 0.5;

    }

  };


  /*
   * ============================================================
   * 円の色
   * ============================================================
   */

  const circleColor =
    d3.scaleLinear()
      .domain([
        0,
        200000
      ])
      .range([
        "#ffe5e5",
        "#b30000"
      ])
      .clamp(true);


  /*
   * ============================================================
   * 範囲判定
   * ============================================================
   */

  const isInRange = (
    people,
    level
  ) => {

    switch (level) {

      case 200000:

        return people >= 200000;


      case 100000:

        return (
          people >= 100000 &&
          people < 200000
        );


      case 50000:

        return (
          people >= 50000 &&
          people < 100000
        );


      case 10000:

        return (
          people >= 10000 &&
          people < 50000
        );


      case 1000:

        return (
          people >= 1000 &&
          people < 10000
        );


      default:

        return people < 1000;

    }

  };


  /*
   * ============================================================
   * SVG Ref
   * ============================================================
   */

  const svgRef =
    useRef();

  const zoomRef =
    useRef();

  const resetRef =
    useRef();

  const layerRef =
    useRef();

  const projectionRef =
    useRef();


  /*
   * ============================================================
   * ウィンドウサイズ変更
   * ============================================================
   */

  useEffect(() => {

    const handleResize = () => {

      setWindowSize({

        width:
          window.innerWidth,

        height:
          window.innerHeight,

      });

    };


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

    };

  }, []);


  /*
   * ============================================================
   * 地図データ取得
   * ============================================================
   */

  useEffect(() => {

    if (
      Map === "日本地図"
    ) {

      fetch(
        "/japan.geojson"
      )
        .then(res =>
          res.json()
        )
        .then(setMapData);

    } else {

      fetch(
        "/countries-110m.json"
      )
        .then(res =>
          res.json()
        )
        .then(topology => {

          const geojson =
            feature(
              topology,
              topology.objects.countries
            );

          setMapData(
            geojson
          );

        });

    }

  }, [Map]);


  /*
   * ============================================================
   * 全目的地人数
   * ============================================================
   */

  const createTotalDestinationPeople = (
    purposeData,
    transportData
  ) => {

    const obj = {};


    [
      ...purposeData,
      ...transportData
    ].forEach(item => {

      obj[item.to] =
        (
          obj[item.to] || 0
        ) +
        item.people;

    });


    obj["北海道"] =
      (obj["道北"] || 0) +
      (obj["道央"] || 0) +
      (obj["道東"] || 0) +
      (obj["道南"] || 0);


    return obj;

  };


  /*
   * ============================================================
   * 前年度
   * ============================================================
   */

  const previousDestinationPeople =
    useMemo(() => {

      switch (year) {

        case "1995年度":

          return createTotalDestinationPeople(
            travelData1990,
            transportationData1990
          );


        case "2000年度":

          return createTotalDestinationPeople(
            travelData1995,
            transportationData1995
          );


        case "2005年度":

          return createTotalDestinationPeople(
            travelData2000,
            trasnportationData2000
          );


        case "2010年度":

          return createTotalDestinationPeople(
            travelData2005,
            transportationData2005
          );


        default:

          return {};

      }

    }, [year]);


  /*
   * ============================================================
   * 現年度
   * ============================================================
   */

  const currentDestinationPeople =
    useMemo(() => {

      switch (year) {

        case "1990年度":

          return createTotalDestinationPeople(
            travelData1990,
            transportationData1990
          );


        case "1995年度":

          return createTotalDestinationPeople(
            travelData1995,
            transportationData1995
          );


        case "2000年度":

          return createTotalDestinationPeople(
            travelData2000,
            trasnportationData2000
          );


        case "2005年度":

          return createTotalDestinationPeople(
            travelData2005,
            transportationData2005
          );


        case "2010年度":

          return createTotalDestinationPeople(
            travelData2010,
            transportationData2010
          );


        default:

          return {};

      }

    }, [year]);


  /*
   * ============================================================
   * destinationPoeple
   * ============================================================
   */

  const destinationPoeple =
    useMemo(() => {

      const obj = {};


      for (
        const item of file
      ) {

        if (
          !obj[item.to]
        ) {

          obj[item.to] =
            0;

        }


        obj[item.to] +=
          item.people;

      }


      obj["北海道"] =
        (obj["道北"] || 0) +
        (obj["道央"] || 0) +
        (obj["道東"] || 0) +
        (obj["道南"] || 0);


      return obj;

    }, [file]);


  /*
   * ============================================================
   * 選択地点の人数
   * ============================================================
   */

  const currentPeople =
    currentDestinationPeople[
    prefecture
    ] || 0;


  const previousPeople =
    previousDestinationPeople[
    prefecture
    ] || 0;


  const diff =
    currentPeople -
    previousPeople;


  const rate =
    previousPeople === 0
      ? null
      : (
        diff /
        previousPeople *
        100
      ).toFixed(1);


  /*
   * ============================================================
   * 選択した移動目的・交通手段の人数
   * ============================================================
   */

  const getLabelPeople = (
    data
  ) => {

    if (
      !selectedLabel
    ) {

      return 0;

    }


    return data
      .filter(item =>
        item.from === destination &&
        item.to === prefecture &&
        item.purpose === selectedLabel
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.people,
        0
      );

  };


  const currentLabelPeople =
    getLabelPeople(
      file
    );


  /*
   * ============================================================
   * 前年度データ
   * ============================================================
   */

  let previousFile = [];


  switch (year) {

    case "1995年度":

      previousFile =
        traffic === "移動目的"
          ? travelData1990
          : transportationData1990;

      break;


    case "2000年度":

      previousFile =
        traffic === "移動目的"
          ? travelData1995
          : transportationData1995;

      break;


    case "2005年度":

      previousFile =
        traffic === "移動目的"
          ? travelData2000
          : trasnportationData2000;

      break;


    case "2010年度":

      previousFile =
        traffic === "移動目的"
          ? travelData2005
          : transportationData2005;

      break;

  }


  const previousLabelPeople =
    getLabelPeople(
      previousFile
    );


  const labelDiff =
    currentLabelPeople -
    previousLabelPeople;


  const labelRate =
    previousLabelPeople === 0

      ? (
        currentLabelPeople === 0
          ? "0.0"
          : "新規"
      )

      : (
        labelDiff /
        previousLabelPeople *
        100
      ).toFixed(1);


  /*
   * ============================================================
   * 使用するデータ
   * ============================================================
   */

  const filterData =
    file.filter(
      item =>
        prefecture ===
        item.from
    );


  const label =
    Array.from(
      new Set(
        filterData.map(
          ({ purpose }) =>
            purpose
        )
      )
    );


  /*
   * ============================================================
   * 都道府県ごとの人数
   *
   * ★ 地図描画のuseEffectより前に定義
   * ============================================================
   */

  const getPeople = (
    geoName
  ) => {

    if (
      geoName === "北海道"
    ) {

      return (
        (destinationPoeple["道北"] || 0) +
        (destinationPoeple["道央"] || 0) +
        (destinationPoeple["道東"] || 0) +
        (destinationPoeple["道南"] || 0)
      );

    }


    const name =
      geoName.replace(
        /(都|府|県)$/,
        ""
      );


    return (
      destinationPoeple[name] ||
      0
    );

  };


  /*
   * ============================================================
   * 地図描画
   * ============================================================
   */

  useEffect(() => {

    if (
      !mapData
    ) {

      return;

    }


    const layer =
      d3.select(
        layerRef.current
      );


    layer
      .selectAll("path")
      .remove();


    layer
      .selectAll(".world-copy")
      .remove();


    layer
      .select("defs")
      .remove();


    const projection =
      Map === "日本地図"

        ? d3.geoMercator()
          .fitSize(
            [
              mapWidth,
              height
            ],
            mapData
          )

        : d3.geoMercator()
          .fitWidth(
            mapWidth,
            mapData
          );


    projectionRef.current =
      projection;


    const path =
      d3.geoPath()
        .projection(
          projection
        );


    const bound =
      path.bounds(
        mapData
      );


    const center = {};


    mapData.features.forEach(
      feature => {

        let name =
          feature.properties.nam_ja;


        if (
          name !== "北海道"
        ) {

          name =
            name.replace(
              /(都|府|県)$/,
              ""
            );


          center[name] =
            path.centroid(
              feature
            );

        } else {

          const [
            x,
            y
          ] =
            path.centroid(
              feature
            );


          center["道北"] =
            [
              x,
              y - 60
            ];


          center["道東"] =
            [
              x + 60,
              y
            ];


          center["道央"] =
            [
              x,
              y
            ];


          center["道南"] =
            [
              x - 20,
              y + 60
            ];

        }

      }
    );


    setPrefectureCenter(
      center
    );


    setBounds(
      bound
    );


    if (
      Map === "日本地図"
    ) {

      /*
       * ========================================================
       * ① 地図の下地
       * ========================================================
       */

      layer
        .selectAll(
          "path.base"
        )
        .data(
          mapData.features
        )
        .join("path")
        .attr(
          "class",
          "base"
        )
        .attr(
          "d",
          path
        )
        .attr(
          "fill",
          "#e5e7eb"
        )
        .attr(
          "stroke",
          "black"
        )
        .style(
          "cursor",
          "pointer"
        );


      /*
       * ========================================================
       * ② 色分け overlay
       *
       * ★ 複数選択対応
       * ========================================================
       */

      layer
        .selectAll(
          ".overlay"
        )
        .data(
          mapData.features
        )
        .join("path")
        .attr(
          "class",
          "overlay"
        )
        .attr(
          "d",
          path
        )


        /*
         * --------------------------------------------------------
         * 色
         * --------------------------------------------------------
         */

        .attr(
          "fill",
          d => {

            const people =
              getPeople(
                d.properties.nam_ja
              );


            /*
             * 何も選択されていない
             */

            if (
              selectedRange.length === 0
            ) {

              return "transparent";

            }


            /*
             * 複数選択
             *
             * どれか1つでも該当すれば
             * その県を表示
             */

            const matched =
              selectedRange.some(
                range =>
                  isInRange(
                    people,
                    range
                  )
              );


            return matched
              ? circleColor(
                people
              )
              : "#eeeeee";

          }
        )


        /*
         * --------------------------------------------------------
         * 透明度
         * --------------------------------------------------------
         */

        .attr(
          "fill-opacity",
          d => {

            const people =
              getPeople(
                d.properties.nam_ja
              );


            /*
             * 何も選択されていない
             */

            if (
              selectedRange.length === 0
            ) {

              return 0;

            }


            /*
             * 複数選択
             */

            const matched =
              selectedRange.some(
                range =>
                  isInRange(
                    people,
                    range
                  )
              );


            return matched
              ? 1
              : 0.2;

          }
        )


        /*
         * --------------------------------------------------------
         * 選択地点の枠
         * --------------------------------------------------------
         */

        .attr(
          "stroke",
          d => {

            let name =
              d.properties.nam_ja;


            name =
              name.replace(
                /(都|府|県)$/,
                ""
              );


            if (
              name === prefecture
            ) {

              return "black";

            }


            return "none";

          }
        )


        .attr(
          "stroke-width",
          d => {

            let name =
              d.properties.nam_ja;


            name =
              name.replace(
                /(都|府|県)$/,
                ""
              );


            if (
              name === prefecture
            ) {

              return 3;

            }


            return 0;

          }
        );


      /*
       * ========================================================
       * ③ クリック用
       * ========================================================
       */

      layer
        .selectAll(
          ".stripe"
        )
        .data(
          mapData.features
        )
        .join("path")
        .attr(
          "class",
          "stripe"
        )
        .attr(
          "d",
          path
        )
        .attr(
          "pointer-events",
          "all"
        )
        .attr(
          "fill",
          "transparent"
        )
        .attr(
          "stroke",
          "none"
        )
        .style(
          "cursor",
          "pointer"
        )


        .on(
          "mousemove",
          (
            event,
            d
          ) => {

            setMousePos({

              x:
                event.offsetX,

              y:
                event.offsetY,

            });


            setIsInformation(
              d.properties.nam_ja
            );

          }
        )


        .on(
          "mouseleave",
          () => {

            setIsInformation(
              null
            );

          }
        )


        .on(
          "click",
          (
            event,
            d
          ) => {

            let name =
              d.properties.nam_ja;


            /*
             * 北海道
             */

            if (
              name === "北海道"
            ) {

              setHokkaidoMenuPos({

                x:
                  event.offsetX,

                y:
                  event.offsetY,

              });


              setShowHokkaidoMenu(
                true
              );


              if (
                legend_judge
              ) {

                setLegend_judge(
                  false
                );

              }


              return;

            }


            setShowHokkaidoMenu(
              false
            );


            name =
              name.replace(
                /(都|府|県)$/,
                ""
              );


            setPrefecture(
              name
            );


            if (
              legend_judge
            ) {

              setLegend_judge(
                false
              );

            }

          }
        );

    }

  }, [
    mapData,
    mapWidth,
    height,
    destinationPoeple,
    selectedRange,
    prefecture,
    legend_judge,
    setMousePos,
    setIsInformation,
    setPrefecture
  ]);


  /*
   * ============================================================
   * ズーム
   * ============================================================
   */

  useEffect(() => {

    if (
      !bounds
    ) {

      return;

    }


    const svg =
      d3.select(
        svgRef.current
      );


    const imageLayer =
      svg.select(
        "#imageLayer"
      );


    const zoom =
      d3.zoom()
        .scaleExtent([
          0.5,
          14
        ])


        .on(
          "zoom",
          event => {

            const {
              x,
              y,
              k
            } =
              event.transform;


            let displayX =
              x;


            let displayY =
              y;


            const displayMargin =
              k > 1
                ? 300 * k
                : 0;


            const minX =
              -(
                (
                  bounds[1][0] +
                  bounds[0][0]
                ) /
                2
              ) *
              k -
              displayMargin;


            const maxX =
              mapWidth -
              (
                (
                  bounds[1][0] +
                  bounds[0][0]
                ) /
                2
              ) *
              k +
              displayMargin;


            const minY =
              -(
                (
                  bounds[1][1] +
                  bounds[0][1]
                ) /
                2 -
                45
              ) *
              k -
              displayMargin;


            const maxY =
              height -
              (
                (
                  bounds[1][1] +
                  bounds[0][1]
                ) /
                2
              ) *
              k +
              displayMargin;


            displayX =
              Math.max(
                minX,
                Math.min(
                  maxX,
                  displayX
                )
              );


            displayY =
              Math.max(
                minY,
                Math.min(
                  maxY,
                  displayY
                )
              );


            imageLayer.attr(
              "transform",
              `
translate(
  ${displayX},
  ${displayY}
)
scale(${k})
              `
            );

          }
        )


        .on(
          "end",
          event => {

            setScale(
              Number(
                event.transform.k.toFixed(
                  1
                )
              )
            );

          }
        );


    zoomRef.current =
      zoom;


    resetRef.current =
      zoom;


    svg.call(
      zoom
    );

  }, [
    Map,
    bounds,
    mapWidth,
    height
  ]);


  /*
   * ============================================================
   * ログイン情報取得
   * ============================================================
   */

  useEffect(() => {

    const login =
      localStorage.getItem(
        "isLogin"
      );


    const name =
      localStorage.getItem(
        "userName"
      );


    if (
      login === "true"
    ) {

      setIsLogin(
        true
      );

      setUserName(
        name
      );

    }

  }, []);


  /*
   * ============================================================
   * お気に入り保存
   * ============================================================
   */

  useEffect(() => {

    localStorage.setItem(
      "isFavorite",
      JSON.stringify(
        isFavorite
      )
    );

  }, [
    isFavorite
  ]);


  useEffect(() => {

    localStorage.setItem(
      "favoriteArr",
      JSON.stringify(
        favoriteArr
      )
    );

  }, [
    favoriteArr
  ]);


  /*
   * ============================================================
   * ズームボタン
   * ============================================================
   */

  const zoomIn = () => {

    const svg =
      d3.select(
        svgRef.current
      );


    svg
      .transition()
      .duration(300)
      .call(
        zoomRef.current.scaleBy,
        1.2
      );

  };


  const zoomOut = () => {

    const svg =
      d3.select(
        svgRef.current
      );


    svg
      .transition()
      .duration(300)
      .call(
        zoomRef.current.scaleBy,
        0.8
      );

  };


  const Reset = () => {

    const svg =
      d3.select(
        svgRef.current
      );


    svg.call(
      resetRef.current.transform,
      d3.zoomIdentity
    );

  };


  /*
   * ============================================================
   * お気に入り管理
   * ============================================================
   */

  const favoriteManagement = (
    year,
    traffic,
    name,
    nextFavorite
  ) => {

    if (
      nextFavorite
    ) {

      setFavoriteArr(
        prev => [
          ...prev,

          {

            年代:
              year,

            交通行動:
              traffic,

            県名:
              name,

            来客者数:
              `${destinationPoeple[name]} 人`

          }
        ]
      );

    } else {

      setFavoriteArr(
        prev =>
          prev.filter(
            item =>
              !(
                item["年代"] ===
                year &&

                item["交通行動"] ===
                traffic &&

                item["県名"] ===
                name
              )
          )
      );

    }

  };


  /*
   * ============================================================
   * ログイン
   * ============================================================
   */

  const login = () => {

    const name =
      prompt(
        "ユーザー名を入力してください"
      );


    if (
      name &&
      name.trim() !== ""
    ) {

      setUserName(
        name
      );


      setIsLogin(
        true
      );


      localStorage.setItem(
        "isLogin",
        "true"
      );


      localStorage.setItem(
        "userName",
        name
      );


      setShowMenu(
        false
      );

    }

  };


  const logout = () => {

    setUserName(
      ""
    );


    setIsLogin(
      false
    );


    localStorage.removeItem(
      "isLogin"
    );


    localStorage.removeItem(
      "userName"
    );


    setShowMenu(
      false
    );


    setFavoriteArr(
      []
    );

  };


  /*
   * ============================================================
   * JSX
   * ============================================================
   */

  return (

    <div className="top">

      <div className="header">

        <h1>
          日本人の移動可視化サイトマップ
        </h1>


        <div className="Legend">

          <button
            className="legendButton"
            onClick={() => {

              setShowLegend(
                !showLegend
              );


              (
                showMenu
                  ? setShowMenu(
                    !showMenu
                  )
                  : ""
              );

            }}
          >
            ≡
          </button>


          {showLegend && (

            <div
              className="legendMenu"
              onMouseLeave={() =>
                setShowLegend(
                  !showLegend
                )
              }
            >

              <>

                <button
                  onClick={() =>
                    setGuideStep(
                      0
                    )
                  }
                >
                  チュートリアル
                </button>


                <button
                  onClick={() =>
                    window.open(
                      "./index2.html",
                      "_blank"
                    )
                  }
                >
                  使い方
                </button>


                <button
                  onClick={() => {

                    localStorage.setItem(
                      "favoriteArr",
                      JSON.stringify(
                        favoriteArr
                      )
                    );


                    window.location.href =
                      "./index3.html";

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

              </>

            </div>

          )}

        </div>

      </div>


      <div className="image">

        <div className="control">

          <div className="item">

            <label>
              年度選択
            </label>


            <select
              className="Select"
              value={year}
              onChange={e =>
                setYear(
                  e.target.value
                )
              }
            >

              {yearSelection.map(
                p => (

                  <option
                    key={p}
                    value={p}
                  >
                    {p}
                  </option>

                )
              )}

            </select>

          </div>


          <div className="item">

            <label>
              交通行動選択
            </label>


            <select
              className="Select"
              value={traffic}
              onChange={e =>
                setTraffic(
                  e.target.value
                )
              }
            >

              {transportation.map(
                p => (

                  <option
                    key={p}
                    value={p}
                  >
                    {p}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        <div
          className={
            `mapArea ${legend_judge
              ? "full"
              : "shrink"
            } `
          }
        >

          <SvgMap

            svgRef={
              svgRef
            }

            mapWidth={
              mapWidth
            }

            height={
              height
            }

            layerRef={
              layerRef
            }

            projectionRef={
              projectionRef
            }


            filterData={
              filterData
            }

            coord={
              coord
            }

            coords={
              coords
            }


            judge={
              judge
            }

            circleColor={
              circleColor
            }

            circleSize={
              circleSize
            }

            destinationPoeple={
              destinationPoeple
            }


            dataColor={
              dataColor
            }

            active={
              active
            }

            Scale={
              Scale
            }


            setMousePos={
              setMousePos
            }

            setPrefecture={
              setPrefecture
            }

            setIsInformation={
              setIsInformation
            }

            setLineInformation={
              setLineInformation
            }


            /*
             * ★ 複数選択
             */

            selectedRange={
              selectedRange
            }

            setSelectedRange={
              setSelectedRange
            }


            hoverRange={
              hoverRange
            }

            setHoverRange={
              setHoverRange
            }


            isInformation={
              isInformation
            }

            lineInformation={
              lineInformation
            }


            prefecture={
              prefecture
            }

            prefectureCenter={
              prefectureCenter
            }

            destination={
              destination
            }

            selectedLabel={
              selectedLabel
            }

          />

        </div>


        <div
          className={
            `legendPanel ${legend_judge
              ? "close"
              : "open"
            } `
          }
        >

          <SvgLabel

            height={
              height
            }

            legend_judge={
              legend_judge
            }

            setLegend_judge={
              setLegend_judge
            }


            traffic={
              traffic
            }

            label={
              label
            }

            active={
              active
            }

            setActive={
              setActive
            }

            dataColor={
              dataColor
            }

            circleSize={
              circleSize
            }

            circleColor={
              circleColor
            }


            prefecture={
              prefecture
            }

            coord={
              coord
            }

            setPrefecture={
              setPrefecture
            }


            destination={
              destination
            }

            setDestination={
              setDestination
            }


            selectedLabel={
              selectedLabel
            }

            setSelectedLabel={
              setSelectedLabel
            }


            year={
              year
            }


            currentPeople={
              currentPeople
            }

            previousPeople={
              previousPeople
            }

            diff={
              diff
            }

            rate={
              rate
            }


            destinationPeople={
              destinationPoeple
            }


            currentLabelPeople={
              currentLabelPeople
            }

            previousLabelPeople={
              previousLabelPeople
            }

            labelDiff={
              labelDiff
            }

            labelRate={
              labelRate
            }


            travelData={
              travelData
            }

            transportationData={
              transportationData
            }

            file={
              file
            }

          />

        </div>

      </div>


      {/* ============================================================
          北海道メニュー
         ============================================================ */}

      {showHokkaidoMenu && (

        <div
          style={{

            position:
              "absolute",

            left:
              hokkaidoMenuPos.x,

            top:
              hokkaidoMenuPos.y,

            background:
              "white",

            border:
              "1px solid black",

            borderRadius:
              "8px",

            padding:
              "10px",

            zIndex:
              1000,

          }}
        >

          <div
            style={{
              marginBottom:
                "8px"
            }}
          >
            北海道の地域を選択
          </div>


          {[
            "道北",
            "道央",
            "道東",
            "道南"
          ].map(
            area => (

              <button
                key={area}
                style={{

                  display:
                    "block",

                  width:
                    "100%",

                  marginBottom:
                    "5px",

                }}

                onClick={() => {

                  setPrefecture(
                    area
                  );

                  setShowHokkaidoMenu(
                    false
                  );

                }}
              >
                {area}
              </button>

            )
          )}


          <button
            style={{
              width:
                "100%"
            }}

            onClick={() =>
              setShowHokkaidoMenu(
                false
              )
            }
          >
            閉じる
          </button>

        </div>

      )}


      {/* ============================================================
          チュートリアル
         ============================================================ */}

      {guideStep >= 0 && (

        <div className="guideOverlay">

          <div className="guideModal">

            <button
              onClick={
                closeGuide
              }

              style={{

                position:
                  "absolute",

                top:
                  "12px",

                right:
                  "12px",

                width:
                  "32px",

                height:
                  "32px",

                border:
                  "none",

                borderRadius:
                  "50%",

                background:
                  "#f0f0f0",

                cursor:
                  "pointer",

                fontSize:
                  "18px",

                fontWeight:
                  "bold",

              }}
            >
              ×
            </button>


            {guideStep === 0 && (

              <>

                <h2>
                  🚄 日本人の移動可視化サイトへようこそ！
                </h2>


                <p>
                  このサイトでは、日本国内の人の移動データを
                  地図上で可視化しています。
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

                <h2>
                  🗺 地図の操作方法
                </h2>


                <ul>

                  <li>
                    県をクリックすると選択地点を変更できます。
                  </li>

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

                <h2>
                  📊 データの見方
                </h2>


                <div
                  style={{
                    width:
                      "100%",

                    maxWidth:
                      "100%",

                    overflowX:
                      "hidden",

                  }}
                >

                  <ul
                    style={{

                      paddingLeft:
                        "20px",

                      lineHeight:
                        "1.8",

                      wordBreak:
                        "break-word",

                      overflowWrap:
                        "break-word",

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

                    <li>
                      選択地点へ来る人数ランキングを確認できます。
                    </li>

                  </ul>


                  <img
                    src="/guide3.png"
                    alt="データの見方"
                    className="guideImage"

                    style={{

                      width:
                        "100%",

                      maxWidth:
                        "100%",

                      height:
                        "auto",

                      display:
                        "block",

                      marginTop:
                        "10px",

                      borderRadius:
                        "8px",

                    }}
                  />

                </div>

              </>

            )}


            <div className="guideButtons">

              {guideStep > 0 && (

                <button
                  onClick={() =>
                    setGuideStep(
                      guideStep - 1
                    )
                  }
                >
                  ← 戻る
                </button>

              )}


              {guideStep < 2 ? (

                <button
                  onClick={() =>
                    setGuideStep(
                      guideStep + 1
                    )
                  }

                  style={{
                    marginLeft:
                      "auto"
                  }}
                >
                  次へ →
                </button>

              ) : (

                <button
                  onClick={
                    closeGuide
                  }
                >
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
