import type { ViewMode } from "../store/useMandalaStore";

interface HeaderProps {
  rootTheme: string;
  currentDepth: number;
  view: ViewMode;
  onSetView: (v: ViewMode) => void;
  onSave: () => void;
  onExport: () => void;
}

export default function Header({
  rootTheme,
  currentDepth,
  view,
  onSetView,
  onSave,
  onExport,
}: HeaderProps) {
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

        {/* Save */}
        <button
          onClick={onSave}
          title="保存 (Ctrl+Shift+S)"
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
          💾 保存
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          title="エクスポート (Ctrl+E)"
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
          📤 エクスポート
        </button>
      </div>
    </header>
  );
}
