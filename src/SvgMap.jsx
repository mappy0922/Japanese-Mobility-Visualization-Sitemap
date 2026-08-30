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
    /*
     * ============================================================
     * 凡例のレイアウト
     * ============================================================
     */

    const columns = mapWidth > 900 ? 6 : 2;

    const gap = 20;

    const cardWidth = 120;

    const rows = Math.ceil(
        circleSize.length / columns
    );

    const legendHeight =
        rows * 50 + 20;


    /*
     * ============================================================
     * 範囲が選択されているか
     *
     * selectedRange は配列
     *
     * 例：
     * [100000, 50000]
     * ============================================================
     */

    const isRangeSelected = (name) => {
        return selectedRange.includes(name);
    };


    /*
     * ============================================================
     * 範囲選択 / 解除
     * ============================================================
     */

    const toggleRange = (name) => {

        setSelectedRange(prev => {

            if (prev.includes(name)) {

                // すでに選択されていたら解除
                return prev.filter(
                    range => range !== name
                );

            } else {

                // 選択されていなければ追加
                return [
                    ...prev,
                    name
                ];
            }

        });
    };


    /*
     * ============================================================
     * SVG
     * ============================================================
     */

    return (
        <svg
            ref={svgRef}
            width={mapWidth}
            height={height}
        >

            <defs>

                <filter id="flowGlow">

                    <feGaussianBlur
                        stdDeviation="4"
                        result="blur"
                    />

                    <feMerge>

                        <feMergeNode in="blur" />

                        <feMergeNode
                            in="SourceGraphic"
                        />

                    </feMerge>

                </filter>

            </defs>


            <g id="imageLayer">

                <g ref={layerRef}></g>


                {/* ====================================================
                    移動経路
                   ==================================================== */}

                <g id="lineLayer">

                    {projectionRef.current &&

                        filterData
                            .filter(item =>
                                item.from === prefecture &&
                                item.to === destination &&
                                item.purpose === selectedLabel
                            )
                            .map((item, i) => {

                                const from =
                                    projectionRef.current(
                                        item.fromCoord
                                    );

                                const to =
                                    projectionRef.current(
                                        item.toCoord
                                    );

                                if (!from || !to) {
                                    return null;
                                }


                                const mx =
                                    (from[0] + to[0]) / 2;

                                const my =
                                    (from[1] + to[1]) / 2;


                                const dx =
                                    to[0] - from[0];

                                const dy =
                                    to[1] - from[1];


                                const dist =
                                    Math.sqrt(
                                        dx * dx +
                                        dy * dy
                                    );


                                if (dist === 0) {
                                    return null;
                                }


                                const nx =
                                    i % 2 === 0
                                        ? dy / dist
                                        : -dy / dist;

                                const ny =
                                    i % 2 === 1
                                        ? dx / dist
                                        : -dx / dist;


                                const curveHeight =
                                    dist * 2;


                                const cx =
                                    mx +
                                    nx *
                                    curveHeight;

                                const cy =
                                    my +
                                    ny *
                                    curveHeight;


                                const d = `
                                    M ${from[0]} ${from[1]}
                                    Q ${cx} ${cy}
                                      ${to[0]} ${to[1]}
                                `;


                                return (
                                    <g
                                        key={`flow-group-${i}`}
                                    >

                                        <path
                                            id={`flow-path-${i}`}
                                            className="Number-of-people-moving-line"
                                            pointerEvents="none"
                                            d={d}
                                            fill="none"
                                            stroke={
                                                dataColor[
                                                item.purpose
                                                ]
                                            }
                                            strokeWidth={
                                                3 / Scale
                                            }
                                            strokeLinecap="round"
                                        />


                                        {[0, 0.2, 0.4, 0.6, 0.8]
                                            .map(delay => (

                                                <circle
                                                    key={`flow-${i}-${delay}`}
                                                    r={
                                                        6 / Scale
                                                    }
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

                                                        <mpath
                                                            href={`#flow-path-${i}`}
                                                        />

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
                                                        values={`
                                                            ${3 / Scale};
                                                            ${8 / Scale};
                                                            ${3 / Scale}
                                                        `}
                                                        dur="2s"
                                                        begin={`${delay}s`}
                                                        repeatCount="indefinite"
                                                    />

                                                </circle>

                                            ))}

                                    </g>
                                );
                            })
                    }


                    {/* ====================================================
                        選択地点・目的地
                       ==================================================== */}

                    {projectionRef.current &&
                        selectedLabel &&
                        coord
                            .filter(name =>
                                name === prefecture ||
                                name === destination
                            )
                            .map((item, i) => {

                                const positionText =
                                    prefectureCenter[item];

                                const positionCircle =
                                    projectionRef.current(
                                        coords[item]
                                    );


                                if (!positionText) {
                                    return null;
                                }

                                if (!positionCircle) {
                                    return null;
                                }


                                return (
                                    <g
                                        key={i}
                                    >

                                        <circle
                                            className="Number-of-people-moving-circle"
                                            pointerEvents="none"
                                            cx={
                                                positionCircle[0]
                                            }
                                            cy={
                                                positionCircle[1]
                                            }
                                            r={
                                                5 / Scale
                                            }
                                            fill="black"
                                        />


                                        {Scale >= 2 && (

                                            <text
                                                className="prefecture"
                                                x={
                                                    prefecture.includes("道")
                                                        ? positionCircle[0]
                                                        : positionText[0]
                                                }
                                                y={
                                                    prefecture.includes("道")
                                                        ? positionCircle[1] - 5
                                                        : positionText[1]
                                                }
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize={
                                                    8 /
                                                    (Scale / 2)
                                                }
                                                fill="black"
                                            >
                                                {item}
                                            </text>

                                        )}

                                    </g>
                                );

                            })
                    }

                </g>

            </g>


            {/* ============================================================
                凡例
               ============================================================ */}

            {circleSize.map((name, i) => {

                const col =
                    i % columns;

                const row =
                    Math.floor(
                        i / columns
                    );


                const x =
                    gap +
                    col *
                    (cardWidth + gap);


                const y =
                    height -
                    legendHeight -
                    40 +
                    row * 50;


                const selected =
                    isRangeSelected(name);


                return (

                    <g
                        key={i}
                        transform={`translate(${x}, ${y})`}
                        onMouseEnter={() =>
                            setHoverRange(name)
                        }
                        onMouseLeave={() =>
                            setHoverRange(null)
                        }
                        onClick={() =>
                            toggleRange(name)
                        }
                        style={{
                            cursor: "pointer"
                        }}
                    >

                        {/* ====================================================
                            カード
                           ==================================================== */}

                        <rect
                            x={
                                hoverRange === name
                                    ? -4
                                    : 0
                            }
                            y={
                                hoverRange === name
                                    ? -3
                                    : 0
                            }
                            width={
                                hoverRange === name
                                    ? cardWidth + 8
                                    : cardWidth
                            }
                            height={
                                hoverRange === name
                                    ? 46
                                    : 40
                            }
                            rx="8"
                            fill="white"
                            stroke={
                                selected
                                    ? (
                                        i === 5
                                            ? "black"
                                            : circleColor(name)
                                    )
                                    : "#999"
                            }
                            strokeWidth={
                                selected
                                    ? 3
                                    : 1.5
                            }
                        />


                        {/* ====================================================
                            チェックボックス
                           ==================================================== */}

                        <rect
                            x="15"
                            y="15"
                            width="12"
                            height="12"
                            rx="2"
                            fill="white"
                            stroke={
                                circleColor(name)
                            }
                            strokeWidth="2"
                        />


                        {/* ====================================================
                            チェックマーク
                           ==================================================== */}

                        {selected && (

                            <path
                                d="M 18 21 L 21 24 L 25 18"
                                fill="none"
                                stroke={
                                    circleColor(name)
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                        )}


                        {/* ====================================================
                            テキスト
                           ==================================================== */}

                        <text
                            x="35"
                            y="25"
                            fontSize="12"
                        >
                            {i < 5
                                ? `${name}人以上`
                                : `${name}`
                            }
                        </text>

                    </g>

                );

            })}

        </svg>
    );
}