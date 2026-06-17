import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";
import { travelData } from "./travelData-purpose-of-travel";
import { transportationData } from "./travelData-transportation";
import { feature } from "topojson-client";

const MapName = [
  "日本地図",
  "世界地図",
]

const transportation = [
  "移動目的",
  "移動手段"
]

export default function App() {
  const width = window.innerWidth-200;
  const height = window.innerHeight;
  
  const [Scale , setScale] = useState(1);
  const [Map , setMap] = useState(MapName[0]);
  const [traffic, setTraffic] = useState(transportation[0]);
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
      return {
        代_航空: false,
        代_鉄道: false,
        代_船: false,
        代_バス: false,
        代_乗用車等: false,
        代_全機関: false,
      }
    }
  });

  const file = traffic === "移動目的" ? travelData : transportationData;

  const dataColor = 
  traffic === "移動目的" ? 
  {
    "代_全機関_仕事": "lightgreen",
    "代_全機関_観光": "plum",
    "代_全機関_私用": "lightsalmon",
    "代_全機関_その他": "pink",
    "代_全機関_不明": "black",
    "代_全機関_全目的": "lightblue",
  } : 
  {
    "代_航空": "red",
    "代_鉄道": "blue",
    "代_船": "green",
    "代_バス": "yellow",
    "代_乗用車等": "black",
    "代_全機関": "pink",
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

  const label=Array.from(new Set(file.map(({purpose})=>purpose)))

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

                return (
                  <line
                  key={i}
                  className="Number-of-people-moving"
                  x1={from[0]}
                  y1={from[1]}
                  x2={to[0]}
                  y2={to[1]}
                  stroke={dataColor[item.purpose]}
                  opacity={active[item.purpose] ? 0 : 1}
                  />
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
        </svg>

      </div>
    </div>
  );
}