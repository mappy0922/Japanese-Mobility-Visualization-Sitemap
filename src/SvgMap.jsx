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
     * 凡例のレイアウト (右側に配置)
     * ============================================================
     */

    const columns = mapWidth > 750 ? 4 : 2;

    const gap = 10;

    const cardWidth = 115;

    const rows = Math.ceil(
        circleSize.length / columns
    );

    const legendHeight =
        rows * 44 + 10;

    const numCols = Math.min(circleSize.length, columns);
    const totalLegendWidth = numCols * cardWidth + (numCols - 1) * gap;
    const startX = Math.max(20, mapWidth - totalLegendWidth - 20);


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
                    移動経路 (人数に応じた線の太さの変更処理)
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

                                // 人数（移動量）に応じた連続的かつ明確な線の太さの計算 (2.0px 〜 34.0px)
                                const people = Math.max(0, item.people || 0);
                                const normalized = Math.min(1.0, people / 200000);
                                const baseWidth = 2.0 + Math.pow(normalized, 0.52) * 32.0;
                                const strokeWidth = baseWidth / Scale;


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
                                                strokeWidth
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
                                                        keyPoints="0;1"
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


                                        {Scale >= 2 && (
                                            <text
                                                className="prefecture"
                                                x={positionCircle ? positionCircle[0] : positionText[0]}
                                                y={positionCircle ? positionCircle[1] - 5 : positionText[1]}
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
                    startX +
                    col *
                    (cardWidth + gap);


                const y =
                    height -
                    legendHeight -
                    40 +
                    row * 44;


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
                                    ? circleColor(name)
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