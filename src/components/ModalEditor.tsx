import { useState, useEffect, useRef, useCallback } from "react";

interface ModalEditorProps {
  initialText: string;
  onSave: (text: string) => void;
  onClose: () => void;
}

const MAX_CHARS = 1024;

function countGraphemes(text: string): number {
  const segmenter = new Intl.Segmenter();
  return [...segmenter.segment(text)].length;
}

export default function ModalEditor({ initialText, onSave, onClose }: ModalEditorProps) {
  const [draft, setDraft] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = countGraphemes(draft);
  const isOverLimit = charCount > MAX_CHARS;

  useEffect(() => {
    textareaRef.current?.focus();
    const len = textareaRef.current?.value.length ?? 0;
    textareaRef.current?.setSelectionRange(len, len);
  }, []);

  const handleSave = useCallback(() => {
    if (isOverLimit) return;
    onSave(draft);
    onClose();
  }, [draft, isOverLimit, onSave, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newCount = countGraphemes(newText);
    if (newCount <= MAX_CHARS) {
      setDraft(newText);
    } else {
      // Still allow update to let user see current state but show red counter
      setDraft(newText);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          width: "480px",
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
            セルテキスト編集
          </span>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              fontSize: "16px",
              cursor: "pointer",
              color: "#888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ✕
          </button>
        </div>

        {/* Textarea */}
        <div style={{ padding: "16px 16px 8px" }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              height: "180px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              color: "#1a1a1a",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#1565C0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px 16px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: isOverLimit ? "#e53935" : "#aaa",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {charCount} / {MAX_CHARS}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                fontSize: "13px",
                cursor: "pointer",
                color: "#555",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isOverLimit}
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                border: "none",
                backgroundColor: isOverLimit ? "#ccc" : "#1565C0",
                fontSize: "13px",
                cursor: isOverLimit ? "not-allowed" : "pointer",
                color: "#fff",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                if (!isOverLimit) e.currentTarget.style.backgroundColor = "#0D47A1";
              }}
              onMouseLeave={(e) => {
                if (!isOverLimit) e.currentTarget.style.backgroundColor = "#1565C0";
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
