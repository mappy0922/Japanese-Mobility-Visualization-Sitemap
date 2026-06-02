import * as d3 from "d3";
import { useState , useEffect, useRef } from "react";

export default function App() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const MapName = [
    {
      name: "日本地図",
    },
    {
      name: "世界地図",
      position: {X: [0, width, -width], Y: [-13, height-13, -height-13]
      },
    },
  ]

  const [Scale , setScale] = useState(1);
  const [Map , setMap] = useState(MapName[0].name);

  const MapId = Map === "日本地図" ? "/日本地図.jpeg" : "/世界地図.png"

  const svgRef = useRef();
  const zoomRef = useRef();
  const resetRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const imageLayer = svg.select("#imageLayer");

    const zoom = d3.zoom()
    .scaleExtent([1, 14])
    .on("zoom", (event) => {
      imageLayer.attr(
        "transform",
        event.transform
      );
      setScale(Number(event.transform.k.toFixed(1)));
    });

    zoomRef.current = zoom;
    resetRef.current = zoom;

    svg.call(zoom);

  }, []);

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

  return (
    <div className="top">
      <h1>日本人の移動可視化サイトマップ</h1>
      <div className="image">
        <div className="Scale-Button">
          <span>現在の倍率 : {Scale}倍</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomOut}>-</button>
        </div>

        <div className="Map-Button">
          <button 
          className="Reset"
          onClick={() => {
            setMap(MapName[0].name);
            Reset();
          }}
          >日本地図
          </button>

          <button 
          className="Reset"
          onClick={() => {
            setMap(MapName[1].name);
            Reset();
          }}
          >世界地図
          </button>
        </div>

        <svg ref={svgRef} width={width} height={height} >
          <g id="imageLayer">
            <>
            <image
            className="mapName"
            href={MapId}
            x="0"
            y="-13"
            width={width}
            height={height}
            />
            {Map === "世界地図" && 
            MapName[1].position.Y.map((y) => 
              MapName[1].position.X.map((x) => (
              <image
              key={`${x}-${y}`}
              href={MapId}
              x={x}
              y={y}
              width={width}
              height={height}
              preserveAspectRatio="none"
              />
            )))}

            <line
            className="Number-of-people-moving"
            x1="500"
            y1="700"
            x2="500"
            y2="500"
            stroke="black"
            />
            </>
          </g>
        </svg>

      </div>
    </div>
  );
}