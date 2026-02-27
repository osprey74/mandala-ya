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

import React from "react";

export default function Footer() {
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
      <div style={rowStyle}>
        {row2.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </footer>
  );
}
