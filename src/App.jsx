import * as d3 from "d3";
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
]

const transportation = [
  "移動目的",
  "移動手段"
]

const yearSelection = [
  "1990年度",
  "1995年度",
  "2000年度",
  "2005年度",
  "2010年度",
]

const circleSize = [
  100000,
  50000,
  10000,
  1000,
  "それ以外",
]

const coord = Object.keys(coords);

const createFavoriteState = () => {
  const init = {};

  yearSelection.forEach(y => {
    init[y] = {};

    transportation.forEach(t => {
      init[y][t] = Object.fromEntries(
        coord.map(name => [name, false])
      );
    });
  });

  return init;
};

export default function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const height = windowSize.height;
  
  const [userName, setUserName] = useState("");
  const [isFavorite, setIsFavorite] = useState(() => {
    const saved = localStorage.getItem("isFavorite");
    return saved ? JSON.parse(saved) : createFavoriteState();
  });
  const [isLogin, setIsLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [lineInformation, setLineInformation] = useState(null);
  const [isInformation, setIsInformation] = useState(null);
  const [legend_judge, setLegend_judge] = useState(true);
  const [mousePos, setMousePos] = useState({x:0,y:0});
  const [Scale , setScale] = useState(1);
  const [Map , setMap] = useState(MapName[0]);
  const [traffic, setTraffic] = useState(transportation[0]);
  const [year, setYear] = useState(yearSelection[0]);
  const [prefecture, setPrefecture] = useState(coord[0]);
  const [mapData, setMapData] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [favoriteArr, setFavoriteArr] = useState(() => {
    const saved = localStorage.getItem("favoriteArr");
    return saved ? JSON.parse(saved) : [];
  });
  const [active, setActive] = useState(() => {
    
    if(traffic === "移動目的") {
      return {
        代_全機関_仕事: false,
        代_全機関_観光: false,
        代_全機関_私用: false,
        代_全機関_その他: false,
        代_全機関_不明: false,
        代_全機関_全目的: false,
      };
    } else {
      if(year === "1990年度" || year === "1995年度" || year === "2000年度") {
        return {
          航空_全目的: false,
          鉄道_全目的: false,
          船_全目的: false,
          バス_全目的: false,
          乗用車_全目的: false,
          全機関_全目的: false,
        }
      } else {
        return {
          航空: false,
          鉄道: false,
          船: false,
          バス: false,
          乗用車等: false,
          全機関: false,
        }
      }
    }
  });

  const mapWidth = legend_judge
    ? windowSize.width - 200
    : windowSize.width;

  const handleReset = () => {
    if (traffic === "移動目的") {
      setActive({
        代_全機関_仕事: false,
        代_全機関_観光: false,
        代_全機関_私用: false,
        代_全機関_その他: false,
        代_全機関_不明: false,
        代_全機関_全目的: false,
      });
    } else {
      if (year === "1990年度" || year === "1995年度" || year === "2000年度") {
        setActive({
          航空_全目的: false,
          鉄道_全目的: false,
          船_全目的: false,
          バス_全目的: false,
          乗用車_全目的: false,
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


  let file = [];
  if(traffic === "移動目的") {
    if(year === "1990年度") {
      file = travelData1990;
    } 
    if(year === "1995年度") {
      file = travelData1995;
    }
    if(year === "2000年度") {
      file = travelData2000;
    }
    if(year === "2005年度") {
      file = travelData2005;
    }
    if(year === "2010年度") {
      file = travelData2010;
    }
  } else {
    if(year === "1990年度") {
      file = transportationData1990;
    } 
    if(year === "1995年度") {
      file = transportationData1995;
    }
    if(year === "2000年度") {
      file = trasnportationData2000;
    }
    if(year === "2005年度") {
      file = transportationData2005;
    }
    if(year === "2010年度") {
      file = transportationData2010;
    }
  }

  let dataColor = {};
  if (traffic === "移動目的") {  
    dataColor = {
      "代_全機関_仕事": "blue",
      "代_全機関_観光": "orange",
      "代_全機関_私用": "purple",
      "代_全機関_その他": "gray",
      "代_全機関_不明": "black",
      "代_全機関_全目的": "lightblue",
    }
  } else {
    if(year === "1990年度" || year === "1995年度" || year === "2000年度") {
      dataColor = {
        "航空_全目的": "blue",
        "鉄道_全目的": "red",
        "船_全目的": "lightblue",
        "バス_全目的": "yellow",
        "乗用車_全目的": "purple",
        "全機関_全目的": "gray",
      }
    } else {
      dataColor = {
        "航空": "blue",
        "鉄道": "red",
        "船": "lightblue",
        "バス": "yellow",
        "乗用車等": "purple",
        "全機関": "gray",
      }
    }
  };

  const judge = (people , judge) => {
    const size = Math.log10(people+1);
    if(people >= judge[0]) {
      return size*1.8;
    } else if (people >= judge[1]) {
      return size*1.5;
    } else if (people >= judge[2]) {
      return size*1.2;
    } else if (people >= judge[3]) {
      return size*0.8;
    } else {
      return size*0.5;
    }
  };

  const circleColor = (people) => {
    if(people >= 100000) {
      return "deeppink";
    } else if (people >= 50000) {
      return "pink";
    } else if (people >= 10000) {
      return "teal";
    } else if (people >= 1000) {
      return "maroon";
    } else {
      return "brown";
    }
  };

  const svgRef = useRef();
  const zoomRef = useRef();
  const resetRef = useRef();
  const layerRef = useRef();
  const projectionRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (Map === "日本地図") {
      fetch("/japan.geojson")
        .then(res => res.json())
        .then(setMapData);
    } else {
      fetch("/countries-110m.json")
        .then(res => res.json())
        .then(topology => {

          const geojson = feature(
            topology,
            topology.objects.countries
          );
          setMapData(geojson);
        });
    }
  }, [Map]);

  useEffect(() => {
    if (!mapData) return;

    const layer = d3.select(layerRef.current);
    layer.selectAll("path").remove();
    layer.selectAll(".world-copy").remove();

    const projection = 
    Map === "日本地図" 
    ? d3.geoMercator().fitSize([mapWidth,height], mapData)
    : d3.geoMercator().fitWidth(mapWidth, mapData);

    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const bound = path.bounds(mapData);

    setBounds(bound);

    if(Map === "日本地図") {
      layer.selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "lightgreen")
        .attr("stroke", "black");
    } else { 
      [-1, 0, 1].forEach(i => {
        layer.append("g")
          .attr("class","world-copy")
          .attr(
            "transform",
            `translate(${i*mapWidth},0)`
          )
          .selectAll("path")
          .data(mapData.features)
          .join("path")
          .attr("d", path)
          .attr("fill", "lightgreen")
          .attr("stroke", "black");
      });
    }
  }, [mapData, mapWidth]);

  useEffect(() => {
    if(!bounds) {
      return;
    }

    const svg = d3.select(svgRef.current);

    const imageLayer = svg.select("#imageLayer");

    const zoom = d3.zoom()
    .scaleExtent([0.5, 14])
    .on("zoom", (event) => {
      const {x,y,k} = event.transform;

      let displayX = x;
      let displayY = y;
      const displayMargin = (k>1) ? 300*k : 0; 

      const minX = -((bounds[1][0]+bounds[0][0])/2)*k-displayMargin;
      const maxX = mapWidth-((bounds[1][0]+bounds[0][0])/2)*k+displayMargin;

      const minY = -((bounds[1][1]+bounds[0][1])/2-45)*k-displayMargin;
      const maxY = height-((bounds[1][1]+bounds[0][1])/2)*k+displayMargin;

      displayX = Math.max(minX, Math.min(maxX, displayX));
      displayY = Math.max(minY, Math.min(maxY, displayY));
      

      imageLayer.attr(
        "transform",
        `translate(${displayX},${displayY}) scale(${k})`
      );
    })

    .on("end", (event) => {
      setScale(Number(event.transform.k.toFixed(1)));
    });

    zoomRef.current = zoom;
    resetRef.current = zoom;

    svg.call(zoom);

  }, [Map,bounds,mapWidth]);

  useEffect(() => {
    const login = localStorage.getItem("isLogin");
    const name = localStorage.getItem("userName");

    if (login === "true") {
      setIsLogin(true);
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "isFavorite",
      JSON.stringify(isFavorite)
    );
  }, [isFavorite]);

  useEffect(() => {
    localStorage.setItem(
      "favoriteArr",
      JSON.stringify(favoriteArr)
    );
  }, [favoriteArr]);

  const zoomIn = () => {
    const svg = d3.select(svgRef.current);

    svg.transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1.2);
  };

  const zoomOut = () => {
    const svg = d3.select(svgRef.current);

    svg.transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 0.8);
  };

  const Reset = () => {
    const svg = d3.select(svgRef.current);

    svg.call(resetRef.current.transform,d3.zoomIdentity);

  }

  const favoriteManagement = (year, traffic, name, nextFavorite) => {
    if(nextFavorite) {
      setFavoriteArr(prev => [
        ...prev,
        {
          年代: year,
          交通行動: traffic,
          県名: name,
          来客者数: `${destinationPoeple[name]}人`
        }
      ]);
    } else {
      setFavoriteArr(prev =>
        prev.filter(item => 
          !(
          item["年代"] === year &&
          item["交通行動"] === traffic &&
          item["県名"] === name  
          )
        )
      );
    }
  };

  const filterData = file.filter((item) => prefecture === item.from);

  const label=Array.from(new Set(filterData.map(({purpose})=>purpose)));

  const destinationPoeple = {};
  for(const item of file) {
    if(!destinationPoeple[item.to]) {
      destinationPoeple[item.to] = 0;
    }

    destinationPoeple[item.to] += item.people;
  }

  const login = () => {
    const name = prompt("ユーザー名を入力してください");

    if (name && name.trim() !== "") {
      setUserName(name);
      setIsLogin(true);

      localStorage.setItem("isLogin", "true");
      localStorage.setItem("userName", name);

      setShowMenu(false);
    }
  };

  const logout = () => {
    setUserName("");
    setIsLogin(false);

    localStorage.removeItem("isLogin");
    localStorage.removeItem("userName");

    setShowMenu(false);
    setFavoriteArr([]);
  };

  return (
    <div className="top">
      <div className="header">
        <h1>日本人の移動可視化サイトマップ</h1>

        <div className="account">
          <button
          className="accountButton"
          onClick={() => {
            setShowMenu(!showMenu);
            (showLegend ? setShowLegend(!showLegend) : "");
          }}
          >
            👤
          </button>

          {showMenu && (
            <div className="accountMenu"
            onMouseLeave={() => setShowMenu(!showMenu)}>
              {isLogin ? (
                <>
                <div>ようこそ!{userName}さん</div>
                <button onClick={() => {
                  logout();
                  setIsFavorite(createFavoriteState());}}>ログアウト</button>
                </>
              ) : (
                <>
                <button onClick={login}>ログイン</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="Legend">
          <button
          className="legendButton"
          onClick={() => {
            setShowLegend(!showLegend);
            (showMenu ? setShowMenu(!showMenu) : "");
          }}
          >
            ≡
          </button>

          {showLegend && (
            <div className="legendMenu"
            onMouseLeave={() => setShowLegend(!showLegend)}>
              <>
              <button onClick={() => {
                setLegend_judge(prev => !prev);
              }}>
                {!legend_judge ? "凡例を見る" : "凡例を閉じる"}
              </button>

              <button onClick={() => (window.open('./index2.html', '_blank'))}>
                使い方
              </button>

              <button 
              onClick={() => {
                localStorage.setItem("favoriteArr", JSON.stringify(favoriteArr));
                window.location.href = "./index3.html";
              }}
              >
                お気に入り一覧
              </button>

              <button onClick={() => (window.open('https://forms.gle/kSxSu3UmnEzXxabs8', '_blank'))}>
                問い合わせ
              </button>
              </>
            </div>
          )}
        </div>
      </div>

      <div className="image">
        <div className="Scale-Button">
          <div>現在の倍率 : {Scale}倍</div>
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomOut}>-</button>
        </div>

        <div className="legend_reset">
          <button 
          className={`Legend_all ${!legend_judge ? "hide" : ""}`}
          onClick={handleReset}
          >
            凡例をリセットする
          </button>
        </div>

        <div className="control">
          <div className="item">
            <label>年度選択</label>
            <select
                className="Select"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                }}
            >
                {yearSelection.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </div>

          <div className="item">
            <label>交通行動選択</label>
            <select
                className="Select"
                value={traffic}
                onChange={(e) => {
                  setTraffic(e.target.value);
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
          destinationPoeple={destinationPoeple}

          dataColor={dataColor}
          active={active}
          Scale={Scale}

          setMousePos={setMousePos}
          setPrefecture={setPrefecture}
          setIsInformation={setIsInformation}
          setLineInformation={setLineInformation}

          isInformation={isInformation}
          lineInformation={lineInformation}

          prefecture={prefecture}
        />

        {isInformation && (
          <div
          className="informationBox"
          onMouseEnter={() => setIsInformation(isInformation)}
          onMouseLeave={() => setIsInformation(null)}
          style={{
            left: mousePos.x+3,
            top: mousePos.y+3,
          }}
          >
            <div>
              {isInformation.includes("道") ? "道名" : "県名"} :
              {isInformation}
            </div>

            <div>
              来客者数 :{destinationPoeple[isInformation]}人
            </div>

            <button
            onClick={() => {
              if (!isLogin) {
                window.alert("アカウントログインを行ってください");
                return;
              }

              const nextFavorite = !isFavorite[year][traffic][isInformation];

              setIsFavorite(prev => ({
                ...prev,
                [year]: {
                  ...prev[year],
                  [traffic]: {
                    ...prev[year][traffic],
                    [isInformation]: nextFavorite,
                  },
                },
              }));

              favoriteManagement(year, traffic, isInformation, nextFavorite);
            }}
            >
              {!isFavorite[year][traffic][isInformation] ? "お気に入り登録する" : "お気に入り解除"}
            </button>
          </div>
        )}

        {lineInformation && (
          <div
          className="informationBox2"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
          >
            <div>
              移動方向: {lineInformation.from} ～ {lineInformation.to}
            </div>

            <div>
              移動人数: {lineInformation.people}人
            </div>

            <div>
              {traffic === "移動目的" ? `目的: ${lineInformation.purpose}` : `交通手段: ${lineInformation.purpose}`}
            </div>

            <button onClick={() => setLineInformation(null)}> ×</button>
          </div>
        )}


        <SvgLabel
        height={height}
        legend_judge={legend_judge}
        traffic={traffic}
        label={label}
        active={active}
        setActive={setActive}
        dataColor={dataColor}
        circleSize={circleSize}
        circleColor={circleColor}
        />

      </div>
    </div>
  );
}