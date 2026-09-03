import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  label,
  value,
  onChange,
  type = "from", // "from" | "to"
  options = [],
  isActiveMode = false,
  onSelectMode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const isFrom = type === "from";

  // 外部クリック/タップおよびEscapeキーでプルダウンを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideInteraction = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    // キャプチャフェーズで登録することで、地図等の子要素で伝播停止されても確実に検知
    document.addEventListener("pointerdown", handleOutsideInteraction, true);
    document.addEventListener("touchstart", handleOutsideInteraction, true);
    document.addEventListener("mousedown", handleOutsideInteraction, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideInteraction, true);
      document.removeEventListener("touchstart", handleOutsideInteraction, true);
      document.removeEventListener("mousedown", handleOutsideInteraction, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 開いた時に入力欄へフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 検索語句による絞り込み
  const filteredOptions = options.filter((name) =>
    name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleSelect = (name) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (onSelectMode) onSelectMode();
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div
      className={`searchableSelectContainer ${isFrom ? "fromContainer" : "toContainer"} ${
        isOpen ? "open" : ""
      }`}
      ref={containerRef}
    >
      {/* 選択トリガーボタン */}
      <button
        type="button"
        className={`searchableSelectTrigger ${isFrom ? "fromTrigger" : "toTrigger"} ${
          isOpen || isActiveMode ? "activeTrigger" : ""
        }`}
        onClick={toggleDropdown}
        title={`${label}を選択（クリックで検索・選択プルダウンを表示）`}
      >
        <span
          className={`searchableDot ${isFrom ? "fromDot" : "toDot"}`}
        />
        <span className="searchableLabel">{label}:</span>
        <span className="searchableValue">{value || "未選択"}</span>
        <span className={`searchableArrow ${isOpen ? "open" : ""}`}>▼</span>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="searchableDropdownMenu">
          <div className="searchableInputWrapper">
            <input
              ref={inputRef}
              type="text"
              className="searchableInput"
              placeholder="🔍 都道府県名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="searchableClearBtn"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="searchableOptionsList">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((name) => (
                <div
                  key={name}
                  className={`searchableOptionItem ${
                    name === value ? "selectedOption" : ""
                  }`}
                  onClick={() => handleSelect(name)}
                >
                  <span className="optionName">{name}</span>
                  {name === value && <span className="optionCheck">✓</span>}
                </div>
              ))
            ) : (
              <div className="searchableNoResult">見つかりません</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
