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
    circleSize,
    destinationPoeple,

    dataColor,
    active,
    Scale,

    setMousePos,
    setPrefecture,
    setIsInformation,
    setLineInformation,

    selectedRange,
    setSelectedRange,
    hoverRange,
    setHoverRange,

    isInformation,
    lineInformation,

    prefecture,
    prefectureCenter,
    destination,
    selectedLabel,
}) {
    const columns = mapWidth > 900 ? 6 : 2;

    const gap = 20;

    const cardWidth = 120;

    const rows = Math.ceil(circleSize.length / columns);

    const legendHeight = rows * 50 + 20;
    return (
        <svg ref={svgRef} width={mapWidth} height={height}>

            <defs>
                <filter id="flowGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g id="imageLayer">

                <g ref={layerRef}></g>

                <g id="lineLayer">
                    {projectionRef.current && filterData.filter(item =>
                        item.from === prefecture &&
                        item.to === destination &&
                        item.purpose === selectedLabel
                    ).map((item, i) => {
                        const from = projectionRef.current(item.fromCoord);
                        const to = projectionRef.current(item.toCoord);

                        const line_judge = [5000, 2500, 1000, 100]

                        if (!from || !to) {
                            return null;
                        }

                        const mx = (from[0] + to[0]) / 2;
                        const my = (from[1] + to[1]) / 2;

                        const dx = to[0] - from[0];
                        const dy = to[1] - from[1];

                        const dist = Math.sqrt(dx * dx + dy * dy);

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
                                    id={`flow-path-${i}`}
                                    key={i}
                                    className="Number-of-people-moving-line"
                                    pointerEvents="none"
                                    d={d}
                                    fill="none"
                                    stroke={dataColor[item.purpose]}
                                    strokeWidth={3 / Scale}
                                    strokeLinecap="round"
                                />

                                {[0, 0.2, 0.4, 0.6, 0.8].map(delay => (
                                    <circle
                                        key={`flow-${delay}`}
                                        r={6 / Scale}
                                        fill="white"
                                        opacity="0.9"
                                        filter="url(#flowGlow)"
                                    >

                                        <animateMotion
                                            dur="2s"
                                            begin={`${delay}s`}
                                            repeatCount="indefinite"
                                            rotate="auto"
                                            keyPoints="1;0"
                                            keyTimes="0;1"
                                        >
                                            <mpath href={`#flow-path-${i}`} />
                                        </animateMotion>

                                        <animate
                                            attributeName="opacity"
                                            values="0;1;0"
                                            dur="2s"
                                            begin={`${delay}s`}
                                            repeatCount="indefinite"
                                        />

                                        <animate
                                            attributeName="r"
                                            values={`${3 / Scale};${8 / Scale};${3 / Scale}`}
                                            dur="2s"
                                            begin={`${delay}s`}
                                            repeatCount="indefinite"
                                        />

                                    </circle>
                                ))}
                            </>
                        );
                    })}

                    {projectionRef.current && selectedLabel && coord.filter(name =>
                        name === prefecture || name === destination
                    ).map((item, i) => {
                        const positionText = prefectureCenter[item];
                        const positionCircle = projectionRef.current(coords[item]);

                        if (!positionText) return null;
                        if (!positionCircle) return null;


                        const circle_judge = [100000, 50000, 10000, 1000];
                        return (
                            <g key={i}>
                                <circle
                                    className="Number-of-people-moving-circle"
                                    pointerEvents="none"
                                    cx={positionCircle[0]}
                                    cy={positionCircle[1]}
                                    r={5 / Scale}
                                    fill="black"
                                />

                                {Scale >= 2 && (
                                    <text
                                        className="prefecture"
                                        x={prefecture.includes("道") ? positionCircle[0] : positionText[0]}
                                        y={prefecture.includes("道") ? positionCircle[1] - 5 : positionText[1]}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize={8 / (Scale / 2)}
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

            {/*
        <g>
            <text
            x="0"
            y="130"
            fill="none"
            stroke="black"
            >
              選択地点名 : {prefecture}
            </text>
        </g>
        */}

            {circleSize.map((name, i) => {
                const col = i % columns;        // 列番号
                const row = Math.floor(i / columns); // 行番号

                const x = gap + col * (cardWidth + gap);
                const y = height - legendHeight - 40 + row * 50;

                return (
                    <g
                        key={i}
                        transform={`translate(${x}, ${y})`}
                        onMouseEnter={() => setHoverRange(name)}
                        onMouseLeave={() => setHoverRange(null)}
                        onClick={() =>
                            setSelectedRange(
                                selectedRange === name ? null : name
                            )
                        }
                    >

                        <rect
                            x={hoverRange === name ? -4 : 0}
                            y={hoverRange === name ? -3 : 0}
                            width={hoverRange === name ? cardWidth + 8 : cardWidth}
                            height={hoverRange === name ? 46 : 40}
                            rx="8"
                            fill="white"
                            stroke={
                                selectedRange === name
                                    ? (i === 5 ? "black" : circleColor(name))
                                    : "#999"
                            }
                            strokeWidth={
                                selectedRange === name
                                    ? 3
                                    : 1.5
                            }
                        />

                        <rect
                            x="15"
                            y="16"
                            width="10"
                            height="10"
                            fill={circleColor(name)}
                        />

                        <text
                            x="32"
                            y="25"
                            fontSize={12}
                        >
                            {i < 5 ? `${name}人以上` : `${name}`}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}