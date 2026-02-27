import { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { AVAILABLE_MODELS } from "../utils/claudeApi";
import type { ModelId } from "../utils/claudeApi";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { apiKey, model, setApiKey, setModel, save } = useSettingsStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState<ModelId>(model);
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    setApiKey(localApiKey.trim());
    setModel(localModel);
    await save();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const btnBase: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "420px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700" }}>
          AI アシスト設定
        </h2>

        {/* API キー */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "6px",
            }}
          >
            Claude API キー
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type={showKey ? "text" : "password"}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#512DA8")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              style={{
                ...btnBase,
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                color: "#555",
                minWidth: "52px",
              }}
            >
              {showKey ? "隠す" : "表示"}
            </button>
          </div>
        </div>

        {/* モデル選択 */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "6px",
            }}
          >
            モデル
          </label>
          <select
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value as ModelId)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: "#fff",
              fontFamily: "inherit",
            }}
          >
            {AVAILABLE_MODELS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              color: "#555",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              ...btnBase,
              border: "none",
              backgroundColor: "#512DA8",
              color: "#fff",
              fontWeight: "600",
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
