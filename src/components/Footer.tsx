import React, { useEffect, useState, useRef } from "react";
import { useSaveStore } from "../store/useSaveStore";

const row1 = [
  "Alt+数字→セル移動",
  "Enter→確定",
  "Esc→取消",
  "Alt+Shift+数字→入替",
  "Alt+E→エディタ",
];

const row2 = [
  "Alt+Ctrl+数字→下階層",
  "Alt+U→上階層",
  "Alt+V→ビュー切替",
  "Alt+G→AI",
  "Ctrl+Z/Shift+Z→戻す/やり直す",
];

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  flexWrap: "nowrap",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

export default function Footer() {
  const lastSavedAt = useSaveStore((s) => s.lastSavedAt);
  const lastExportedAt = useSaveStore((s) => s.lastExportedAt);

  const [visible, setVisible] = useState(false);
  const [notifMsg, setNotifMsg] = useState("保存しました");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotif = (msg: string) => {
    setNotifMsg(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2000);
  };

  useEffect(() => {
    if (!lastSavedAt) return;
    showNotif("保存しました");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSavedAt]);

  useEffect(() => {
    if (!lastExportedAt) return;
    showNotif("エクスポートしました");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastExportedAt]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "5px 20px",
        backgroundColor: "#fff",
        borderTop: "1px solid #eee",
        fontSize: "10px",
        color: "#aaa",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        zIndex: 100,
      }}
    >
      <div style={rowStyle}>
        {row1.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <div style={rowStyle}>
          {row2.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        {/* 保存 / エクスポート完了通知 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            color: "#4caf50",
            fontSize: "11px",
            fontWeight: "500",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: "14px", lineHeight: 1 }}
          >
            check_circle
          </span>
          {notifMsg}
        </div>
      </div>
    </footer>
  );
}
