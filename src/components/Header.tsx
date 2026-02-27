import { useState, useRef, useEffect } from "react";
import type { ViewMode } from "../store/useMandalaStore";

interface HeaderProps {
  rootTheme: string;
  currentDepth: number;
  view: ViewMode;
  onSetView: (v: ViewMode) => void;
  isDirty: boolean;
  isSaving: boolean;
  savePath: string | null;
  onSave: () => void;
  onNew: () => void;
  onOpen: () => void;
  onExport: () => void;
  onExportMarkdown: () => void;
  onExportOpml: () => void;
}

export default function Header({
  rootTheme,
  currentDepth,
  view,
  onSetView,
  isDirty,
  isSaving,
  savePath,
  onSave,
  onNew,
  onOpen,
  onExport,
  onExportMarkdown,
  onExportOpml,
}: HeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExportMenu]);

  const fileName = savePath
    ? savePath.replace(/\\/g, "/").split("/").pop()
    : null;

  const exportItems = [
    { label: "JSON (.json)", action: onExport },
    { label: "Markdown (.md)", action: onExportMarkdown },
    { label: "OPML (.opml)", action: onExportOpml },
  ];

  return (
    <header
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #e8e8e8",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        minHeight: "52px",
        flexShrink: 0,
      }}
    >
      {/* Left: logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #512DA8, #1565C0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "700",
            flexShrink: 0,
          }}
        >
          曼
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "0.02em", fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Maṇḍalāya
          </span>
          {rootTheme && (
            <>
              <span style={{ color: "#ccc", fontSize: "14px" }}>｜</span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#555",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {rootTheme}
              </span>
            </>
          )}
          {/* 未保存マーカー */}
          {isDirty && !isSaving && (
            <span
              title="未保存の変更があります"
              style={{ color: "#e67e22", fontSize: "14px", lineHeight: "1" }}
            >
              ●
            </span>
          )}
          {isSaving && (
            <span style={{ fontSize: "11px", color: "#aaa" }}>
              保存中…
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: "10px",
            color: "#aaa",
            backgroundColor: "#f5f5f5",
            padding: "2px 7px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          階層 {currentDepth + 1}
        </span>
        {/* ファイル名表示 */}
        {fileName && (
          <span
            title={savePath ?? ""}
            style={{
              fontSize: "10px",
              color: "#bbb",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fileName}
          </span>
        )}
      </div>

      {/* Right: controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* View toggle */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            padding: "3px",
          }}
        >
          {(["overview", "unit"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onSetView(v)}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: view === v ? "600" : "400",
                backgroundColor: view === v ? "#fff" : "transparent",
                color: view === v ? "#1a1a1a" : "#888",
                cursor: "pointer",
                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              {v === "overview" ? "俯瞰" : "ユニット"}
            </button>
          ))}
        </div>

        {/* New */}
        <button
          onClick={onNew}
          title="新規作成 (Ctrl+N)"
          style={{
            padding: "5px 10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            fontSize: "12px",
            color: "#555",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#999")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
        >
          🆕 新規作成
        </button>

        {/* Open */}
        <button
          onClick={onOpen}
          title="開く"
          style={{
            padding: "5px 10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            fontSize: "12px",
            color: "#555",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#999")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
        >
          📂 開く
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          title="上書き保存 / 初回保存ダイアログ"
          style={{
            padding: "5px 10px",
            borderRadius: "6px",
            border: isDirty ? "1px solid #e67e22" : "1px solid #ddd",
            backgroundColor: isDirty ? "#fff8f4" : "#fff",
            fontSize: "12px",
            color: isDirty ? "#e67e22" : "#555",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: isDirty ? "600" : "400",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = isDirty ? "#c0392b" : "#999")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDirty ? "#e67e22" : "#ddd")}
        >
          💾 保存
        </button>

        {/* Export dropdown */}
        <div ref={exportMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            title="エクスポート (Ctrl+E = JSON)"
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              backgroundColor: showExportMenu ? "#f5f5f5" : "#fff",
              fontSize: "12px",
              color: "#555",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#999")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = showExportMenu ? "#999" : "#ddd")}
          >
            📤 エクスポート
            <span style={{ fontSize: "9px", color: "#888", lineHeight: "1" }}>▾</span>
          </button>

          {showExportMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                minWidth: "160px",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {exportItems.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={() => {
                    setShowExportMenu(false);
                    action();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 14px",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "12px",
                    color: "#333",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
