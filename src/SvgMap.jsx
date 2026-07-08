export default function SvgMap({
  svgRef,
  mapWidth,
  height,
  layerRef,
  projectionRef,

  filterData,
  coord,
  coords,

  judge,
  circleColor,
  destinationPoeple,

  dataColor,
  active,
  Scale,

  setMousePos,
  setPrefecture,
  setIsInformation,
  setLineInformation,

  isInformation,
  lineInformation,

  prefecture,
}) {
  return (
    <svg ref={svgRef} width={mapWidth} height={height}>
        <g  id="imageLayer">

            <g ref={layerRef}></g>
            
            <g id="lineLayer">
                {projectionRef.current && filterData.map((item,i) => {
                    const from = projectionRef.current(item.fromCoord);
                    const to = projectionRef.current(item.toCoord);

                    const line_judge = [5000, 2500, 1000, 100]

                    if(!from || !to) {
                        return null;
                    }

                    const mx = (from[0] + to[0]) / 2;
                    const my = (from[1] + to[1]) / 2;

                    const dx = to[0] - from[0];
                    const dy = to[1] - from[1];

                    const dist = Math.sqrt(dx*dx + dy*dy);

                    const nx = i % 2 == 0 ? dy / dist : -dy / dist;
                    const ny = i % 2 == 1 ? dx / dist : -dx / dist;

                    const curveHeight = dist * 2;

                    const cx = mx + nx * curveHeight;
                    const cy = my + ny * curveHeight;

                    const d = `
                    M ${from[0]} ${from[1]}
                    Q ${cx} ${cy}
                      ${to[0]} ${to[1]}
                    `;

                
                    return (
                        <>
                        <path
                        key={i}
                        className="Number-of-people-moving-line"
                        d={d}
                        fill="none"
                        stroke={dataColor[item.purpose]}
                        strokeWidth={judge(item.people, line_judge)/Scale}
                        strokeOpacity={active[item.purpose] ? 0 : 0.5}
                        onClick={(e) => {
                            setMousePos({
                                x:e.nativeEvent.offsetX,
                                y:e.nativeEvent.offsetY
                            });
                            setLineInformation(item);
                        }}
                        />


                        <path
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={15}   // 当たり判定だけ太く
                        pointerEvents="stroke"
                        onClick={(e) => {
                            setMousePos({
                                x: e.nativeEvent.offsetX,
                                y: e.nativeEvent.offsetY,
                            });
                            setLineInformation(item);
                        }}
                        />
                        </>
                    );
                })}

                {projectionRef.current && coord.map((item,i) => {
                    const position = projectionRef.current(coords[item]);
                    const circle_judge = [100000, 50000, 10000, 1000];
                    return (
                        <g key={i}>
                            <circle
                            className="Number-of-people-moving-circle"
                            cx={position[0]}
                            cy={position[1]}
                            r={judge(destinationPoeple[item], circle_judge)/Scale}
                            fill={circleColor(destinationPoeple[item])}
                            onClick={() => setPrefecture(item)}
                            onMouseMove={(e)=>{
                                setMousePos({
                                    x:e.nativeEvent.offsetX,
                                    y:e.nativeEvent.offsetY
                                });
                            }}
                            onMouseEnter={() => setIsInformation(item)}
                            onMouseLeave={() => setIsInformation(null)}
                            />

                            {Scale >= 2 && (
                                <text
                                className="prefecture"
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

        <g>
            <text
            x="0"
            y="130"
            fill="none"
            stroke="black"
            >
              表示出発地点名 : {prefecture}
            </text>
        </g>
    </svg>
  );
}