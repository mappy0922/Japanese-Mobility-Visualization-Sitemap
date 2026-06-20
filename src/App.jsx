import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";
import { travelData1990 } from "./PurposeTravel1990"
import { transportationData1990 } from "./TransportationTravel1990"
import { travelData2010 } from "./PurposeTravel2010";
import { transportationData2010 } from "./TransportationTravel2010";
import { coords } from "./coords"
import { feature } from "topojson-client";

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

const coord = Object.keys(coords);

export default function App() {
  const width = window.innerWidth-200;
  const height = window.innerHeight;
  
  const [Scale , setScale] = useState(1);
  const [Map , setMap] = useState(MapName[0]);
  const [traffic, setTraffic] = useState(transportation[0]);
  const [year, setYear] = useState(yearSelection[0]);
  const [prefecture, setPrefecture] = useState(coord[0]);
  const [mapData, setMapData] = useState(null);
  const [bounds, setBounds] = useState(null);
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
      if(year === "1990年度") {
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

  let file = [];
  if(traffic === "移動目的") {
    if(year === "1990年度") {
      file = travelData1990;
    } 
    if(year === "2010年度") {
      file = travelData2010;
    }
  } else {
    if(year === "1990年度") {
      file = transportationData1990;
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
    if(year === "1990年度") {
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

  const svgRef = useRef();
  const zoomRef = useRef();
  const resetRef = useRef();
  const layerRef = useRef();
  const projectionRef = useRef();

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
    ? d3.geoMercator().fitSize([width,height], mapData)
    : d3.geoMercator().fitWidth(width, mapData);

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
            `translate(${i*width},0)`
          )
          .selectAll("path")
          .data(mapData.features)
          .join("path")
          .attr("d", path)
          .attr("fill", "lightgreen")
          .attr("stroke", "black");
      });
    }
  }, [mapData]);

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
      const maxX = width-((bounds[1][0]+bounds[0][0])/2)*k+displayMargin;

      const minY = -((bounds[1][1]+bounds[0][1])/2-45)*k-displayMargin;
      const maxY = height-((bounds[1][1]+bounds[0][1])/2)*k+displayMargin;

      displayX = Math.max(minX, Math.min(maxX, displayX));
      displayY = Math.max(minY, Math.min(maxY, displayY));
      

      imageLayer.attr(
        "transform",
        `translate(${displayX},${displayY}) scale(${k})`
      );
      setScale(Number(k.toFixed(1)));
    });

    zoomRef.current = zoom;
    resetRef.current = zoom;

    svg.call(zoom);

  }, [Map,bounds]);

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

  const label=Array.from(new Set(file.map(({purpose})=>purpose)));

  const destinationPoeple = {};
  for(const item of file) {
    if(!destinationPoeple[item.to]) {
      destinationPoeple[item.to] = 0;
    }

    destinationPoeple[item.to] += item.people;
  }

  console.log(destinationPoeple);

  return (
    <div className="top">
      <h1>日本人の移動可視化サイトマップ</h1>
      <div className="image">
        <div className="Scale-Button">
          <div>現在の倍率 : {Scale}倍</div>
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomOut}>-</button>
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
            <label>地図選択</label>
            <select
                className="Select"
                value={Map}
                onChange={(e) => {
                  setMap(e.target.value);
                  Reset();
                }}
            >
                {MapName.map((p) => (
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

        <svg ref={svgRef} width={width} height={height} >
          <g  id="imageLayer">
            <g ref={layerRef}></g>
            
            <g id="lineLayer">
              {projectionRef.current && file.map((item,i) => {
                const from = projectionRef.current(item.fromCoord);
                const to = projectionRef.current(item.toCoord);

                if(!from || !to) {
                  return null;
                }

                const mx = (from[0] + to[0]) / 2;
                const my = (from[1] + to[1]) / 2;

                const dx = to[0] - from[0];
                const dy = to[1] - from[1];

                const dist = Math.sqrt(dx*dx + dy*dy);

                const nx = dy / dist;
                const ny = dx / dist;

                const curveHeight = dist * 2;

                const cx = mx + nx * curveHeight;
                const cy = my + ny * curveHeight;

                const d = `
                M ${from[0]} ${from[1]}
                Q ${cx} ${cy}
                  ${to[0]} ${to[1]}
                `;

                if(prefecture === item.from) {
                  return (
                    <path
                    key={i}
                    className="Number-of-people-moving-line"
                    d={d}
                    fill="none"
                    stroke={dataColor[item.purpose]}
                    strokeWidth={Math.log10(item.people+1)/Scale}
                    strokeOpacity={active[item.purpose] ? 0 : 0.5}
                    />
                  );
                }
              })}

              {projectionRef.current && coord.map((item,i) => {
                const position = projectionRef.current(coords[item]);
                const people = destinationPoeple[item] || 0;
                return (
                  <g>
                    <circle
                    key={i}
                    className="Number-of-people-moving-circle"
                    cx={position[0]}
                    cy={position[1]}
                    r={Math.log10(people+1)/Scale}
                    fill="black"
                    onClick={() => setPrefecture(item)}
                    />

                    {Scale >= 2 && (
                      <text
                      key={i}
                      x={position[0]+2}
                      y={position[1]-2}
                      fontSize={8/(Scale/2)}
                      fill="black"
                      >
                        {item}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        <svg width="200" height={height} >
          {label.map((name, i) => (
            <g 
            transform={`translate(0, ${35*i+30})`}
            className={active[name] ? "fade" : ""}
            onClick={() => setActive({
                ...active,//スプレッド構文(上書き処理に利用できる)
                [name]: !active[name]
            })}
            >
              <rect
              x="10"
              width="9"
              height="9"
              fill={dataColor[name]}
              />

              <text 
              className = "legend"
              x="30"
              y="8"
              >
                  {name}
              </text>
            </g>
          ))}

          <g>
            <text
            x="10"
            y="300"
            >
              表示出発地点名 : {prefecture}
            </text>
          </g>

        </svg>

      </div>
    </div>
  );
}