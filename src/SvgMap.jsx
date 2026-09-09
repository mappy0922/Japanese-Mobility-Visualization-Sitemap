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

    clusterViewMode = false,
    setClusterViewMode,
    selectedClusters = ["metropolitan", "tourism", "industrial", "resort", "local"],
    setSelectedClusters,
}) {
    /*
     * ============================================================
     * 凡例のレイアウト (右側に配置)
     * ============================================================
     */

    const clusterList = [
        { id: "metropolitan", name: "大都市圏・通勤型", color: "#e11d48" },
        { id: "tourism", name: "観光・広域型", color: "#0284c7" },
        { id: "industrial", name: "産業・中枢型", color: "#ea580c" },
        { id: "resort", name: "歴史・リゾート型", color: "#059669" },
        { id: "local", name: "地域内自立型", color: "#64748b" },
    ];

    const currentLegendItems = clusterViewMode ? clusterList : circleSize;
    const columns = mapWidth > 800 ? 3 : 2;
    const gap = 8;
    const cardWidth = 115;

    const rows = Math.ceil(
        currentLegendItems.length / columns
    );

    const legendHeight =
        rows * 44 + 10;

    const numCols = Math.min(currentLegendItems.length, columns);
    const totalLegendWidth = numCols * cardWidth + (numCols - 1) * gap;
    const startX = Math.max(20, mapWidth - Math.max(totalLegendWidth, 260) - 20);


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
     * 全選択 / 全解除
     * ============================================================
     */
    const handleSelectAll = () => {
        if (clusterViewMode) {
            setSelectedClusters(clusterList.map((c) => c.id));
        } else {
            setSelectedRange([...circleSize]);
        }
    };

    const handleDeselectAll = () => {
        if (clusterViewMode) {
            setSelectedClusters([]);
        } else {
            setSelectedRange([]);
        }
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
                    {!clusterViewMode &&
                        prefecture &&
                        destination &&
                        projectionRef.current &&
                        filterData
                            .filter(item =>
                                item.from === prefecture &&
                                item.to === destination &&
                                (!selectedLabel || item.purpose === selectedLabel)
                            )
                            .map((item, i) => {

                                const fromCoord = coords[item.from];
                                const toCoord = coords[item.to];

                                if (!fromCoord || !toCoord) {
                                    return null;
                                }

                                const from =
                                    projectionRef.current(fromCoord);

                                const to =
                                    projectionRef.current(toCoord);

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
                                    dist * 0.22;


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

                                // 人数が増えれば増えるほど連続的かつ明確に線が太くなる計算 (0.8px 〜 23.0px)
                                const people = Math.max(0, item.people || 0);
                                const baseWidth = Math.max(0.8, 0.6 + Math.pow(people, 0.37) * 0.032);
                                const strokeWidth = baseWidth / Scale;

                                // 距離（dist）に応じた円の個数の制御（近距離での密集・過度な発光を防止しつつ各距離帯で+2個）
                                let particleCount = 3;
                                if (dist >= 320) {
                                    particleCount = 6;
                                } else if (dist >= 180) {
                                    particleCount = 5;
                                } else if (dist >= 80) {
                                    particleCount = 4;
                                } else {
                                    particleCount = 3;
                                }

                                const delays = Array.from(
                                    { length: particleCount },
                                    (_, idx) => idx / particleCount
                                );

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
                                                ] || "#3b82f6"
                                            }
                                            strokeWidth={
                                                strokeWidth
                                            }
                                            strokeLinecap="round"
                                        />


                                        {delays.map(delay => (

                                            <circle
                                                key={`flow-${i}-${delay}`}
                                                r={
                                                    5 / Scale
                                                }
                                                fill="white"
                                                opacity="0.9"
                                                filter="url(#flowGlow)"
                                            >

                                                <animateMotion
                                                    dur="2.5s"
                                                    repeatCount="indefinite"
                                                    begin={`${delay * 2.5}s`}
                                                    path={d}
                                                />


                                                <animate
                                                    attributeName="opacity"
                                                    values="0.3;1;0.3"
                                                    dur="2.5s"
                                                    begin={`${delay * 2.5}s`}
                                                    repeatCount="indefinite"
                                                />


                                                <animate
                                                    attributeName="r"
                                                    values={`
                                                        ${2.5 / Scale};
                                                        ${5.5 / Scale};
                                                        ${2.5 / Scale}
                                                    `}
                                                    dur="2.5s"
                                                    begin={`${delay * 2.5}s`}
                                                    repeatCount="indefinite"
                                                />

                                            </circle>

                                        ))}

                                    </g>
                                );
                            })
                    }


                </g>

            </g>


            {/* ============================================================
                凡例ヘッダー・モード切り替え & 説明文
               ============================================================ */}
            <g transform={`translate(${startX}, ${height - legendHeight - 96})`}>
                {/* モード切り替えタブ */}
                <foreignObject x="-4" y="-6" width={Math.max(totalLegendWidth + 8, 250)} height="32">
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            display: "flex",
                            gap: "4px",
                            background: "rgba(255, 255, 255, 0.96)",
                            padding: "3px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            boxSizing: "border-box",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setClusterViewMode && setClusterViewMode(false)}
                            style={{
                                flex: 1,
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                border: "none",
                                borderRadius: "6px",
                                background: !clusterViewMode ? "#1e3a8a" : "transparent",
                                color: !clusterViewMode ? "#fff" : "#64748b",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            人流規模別
                        </button>
                        <button
                            type="button"
                            onClick={() => setClusterViewMode && setClusterViewMode(true)}
                            style={{
                                flex: 1,
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                border: "none",
                                borderRadius: "6px",
                                background: clusterViewMode ? "#1e3a8a" : "transparent",
                                color: clusterViewMode ? "#fff" : "#64748b",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            地域特性クラスタ
                        </button>
                    </div>
                </foreignObject>

                {/* 説明テキスト & 全選択・全解除ボタン */}
                <foreignObject
                    x="-4"
                    y="36"
                    width={Math.max(totalLegendWidth + 8, 250)}
                    height="36"
                >
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "6px",
                            background: "rgba(255, 255, 255, 0.95)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            boxSizing: "border-box",
                            height: "100%",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {clusterViewMode
                                    ? "地域特性クラスタ分類"
                                    : "都道府県の色分け（規模別）"}
                            </span>
                            <span
                                style={{
                                    fontSize: "9px",
                                    color: "#64748b",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                ※クリックで表示切替
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                style={{
                                    padding: "2px 6px",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    borderRadius: "4px",
                                    border: "1px solid #cbd5e1",
                                    background: "#f8fafc",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                                title="すべて選択"
                            >
                                全選択
                            </button>
                            <button
                                type="button"
                                onClick={handleDeselectAll}
                                style={{
                                    padding: "2px 6px",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    borderRadius: "4px",
                                    border: "1px solid #cbd5e1",
                                    background: "#f8fafc",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                                title="すべて解除"
                            >
                                全解除
                            </button>
                        </div>
                    </div>
                </foreignObject>
            </g>

            {/* ============================================================
                凡例アイテムカード
               ============================================================ */}

            {currentLegendItems.map((item, i) => {
                const col = i % columns;
                const row = Math.floor(i / columns);

                const x = startX + col * (cardWidth + gap);
                const y = height - legendHeight - 20 + row * 44;

                const isCluster = clusterViewMode;
                const itemId = isCluster ? item.id : item;
                const itemColor = isCluster ? item.color : circleColor(item);
                const itemLabel = isCluster
                    ? item.name
                    : typeof item === "number"
                    ? item >= 100000000
                        ? `${(item / 100000000).toLocaleString()}億人以上`
                        : item >= 10000
                        ? `${(item / 10000).toLocaleString()}万人以上`
                        : `${item.toLocaleString()}人以上`
                    : `${item}`;

                const selected = isCluster
                    ? selectedClusters.includes(itemId)
                    : isRangeSelected(itemId);

                const handleClick = () => {
                    if (isCluster) {
                        setSelectedClusters((prev) =>
                            prev.includes(itemId)
                                ? prev.filter((id) => id !== itemId)
                                : [...prev, itemId]
                        );
                    } else {
                        toggleRange(itemId);
                    }
                };

                return (
                    <g
                        key={i}
                        transform={`translate(${x}, ${y})`}
                        onMouseEnter={() => setHoverRange(itemId)}
                        onMouseLeave={() => setHoverRange(null)}
                        onClick={handleClick}
                        style={{ cursor: "pointer" }}
                    >
                        {/* カード背景 */}
                        <rect
                            x={hoverRange === itemId ? -3 : 0}
                            y={hoverRange === itemId ? -2 : 0}
                            width={hoverRange === itemId ? cardWidth + 6 : cardWidth}
                            height={hoverRange === itemId ? 44 : 40}
                            rx="8"
                            fill="white"
                            stroke={selected ? itemColor : "transparent"}
                            strokeWidth={selected ? 2.5 : 0}
                        />

                        {/* チェックボックス */}
                        <rect
                            x="10"
                            y="14"
                            width="12"
                            height="12"
                            rx="2"
                            fill="white"
                            stroke={itemColor}
                            strokeWidth="2"
                        />

                        {/* チェックマーク */}
                        {selected && (
                            <path
                                d="M 13 20 L 16 23 L 20 17"
                                fill="none"
                                stroke={itemColor}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* テキスト */}
                        <text
                            x="27"
                            y="23"
                            fontSize="11"
                            fontWeight="600"
                            fill="#1e293b"
                        >
                            {itemLabel}
                        </text>

                    </g>

                );

            })}

        </svg>
    );
}