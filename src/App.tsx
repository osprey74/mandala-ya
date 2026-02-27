import { useEffect, useCallback, useState, useMemo } from "react";
import "./App.css";
import type { MandalaCell } from "./types/mandala";
import {
  useMandalaStore,
  useCurrentUnit,
  useIsTopLevel,
  useCurrentDepth,
  useCurrentUnitId,
  buildBreadcrumbs,
} from "./store/useMandalaStore";
import { PALETTES, CENTER, KEY_TO_POSITION } from "./constants/palettes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";
import FocusView from "./components/FocusView";
import OverviewView from "./components/OverviewView";
import ModalEditor from "./components/ModalEditor";

export default function App() {
  // ── State slices (stable references — only primitives or same-ref objects) ──
  const chart = useMandalaStore((s) => s.chart);
  const view = useMandalaStore((s) => s.view);
  const focusedPosition = useMandalaStore((s) => s.focusedPosition);

  // ── Actions (stable function references — safe without selector) ──
  const updateCell = useMandalaStore((s) => s.updateCell);
  const setCellImage = useMandalaStore((s) => s.setCellImage);
  const drillDown = useMandalaStore((s) => s.drillDown);
  const drillUp = useMandalaStore((s) => s.drillUp);
  const drillForward = useMandalaStore((s) => s.drillForward);
  const navigateBreadcrumb = useMandalaStore((s) => s.navigateBreadcrumb);
  const setView = useMandalaStore((s) => s.setView);
  const toggleView = useMandalaStore((s) => s.toggleView);
  const setFocusedPosition = useMandalaStore((s) => s.setFocusedPosition);
  const swapCells = useMandalaStore((s) => s.swapCells);
  const resetNavIfNeeded = useMandalaStore((s) => s.resetNavIfNeeded);

  // ── Derived state ──
  const currentUnit = useCurrentUnit();
  const isTopLevel = useIsTopLevel();
  const currentDepth = useCurrentDepth();
  const currentUnitId = useCurrentUnitId();

  // breadcrumbs は useMemo で計算（セレクター内で新規配列を作ると無限ループになる）
  const rootUnit = useMandalaStore((s) => s.chart.rootUnit);
  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(rootUnit, currentUnitId),
    [rootUnit, currentUnitId],
  );

  // ── Modal editor state ──
  const [modalCell, setModalCell] = useState<MandalaCell | null>(null);

  // Reset nav if current unit was removed by undo
  useEffect(() => {
    resetNavIfNeeded();
  }, [chart, resetNavIfNeeded]);

  // グローバルキーハンドラー（全ビューで有効）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isTextArea = document.activeElement?.tagName === "TEXTAREA";

      // Alt+V → ビュー切り替え（全ビュー共通）
      if (e.altKey && e.code === "KeyV" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        toggleView();
        return;
      }

      // Undo/Redo（テキストエリア編集中はOSに委譲）
      if (isTextArea) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useMandalaStore.temporal.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        useMandalaStore.temporal.getState().redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleView]);

  // 俯瞰ビュー: Alt+数字 → 該当ユニットへ移動
  useEffect(() => {
    if (view !== "overview") return;
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const pos = KEY_TO_POSITION[e.code];
      if (pos === undefined) return;
      e.preventDefault();
      if (pos === CENTER) {
        setView("unit");
        return;
      }
      const cell = currentUnit?.cells.find((c) => c.position === pos);
      if (cell?.text.trim()) {
        drillDown(cell);
      } else {
        setView("unit");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, currentUnit, drillDown, setView]);

  // Image action handler (Phase 3: Tauri file dialog)
  const handleImageAction = useCallback(
    (cell: MandalaCell) => {
      if (cell.image) {
        setCellImage(cell.id, null);
      } else {
        console.log("TODO: open Tauri file dialog for cell", cell.id);
      }
    },
    [setCellImage],
  );

  // Overview grid click handler
  const handleOverviewGridClick = useCallback(
    (pos: number) => {
      if (!currentUnit) return;
      if (pos === CENTER) {
        setView("unit");
        return;
      }
      const cell = currentUnit.cells[pos];
      if (cell.text.trim()) drillDown(cell);
    },
    [currentUnit, drillDown, setView],
  );

  const rootTheme = chart.rootUnit.cells[CENTER].text;
  const palette = PALETTES[currentDepth % PALETTES.length];

  if (!currentUnit) return null;

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#fafafa",
        fontFamily:
          "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'BIZ UDPGothic', 'Meiryo', sans-serif",
        color: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        rootTheme={rootTheme}
        currentDepth={currentDepth}
        view={view}
        onSetView={setView}
        onSave={() => alert("保存機能は Phase 3 で実装予定です")}
        onExport={() => {
          const data = JSON.stringify(chart, null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `mandala-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      />

      <Breadcrumbs path={breadcrumbs} onNavigate={navigateBreadcrumb} />

      <main style={{ flex: 1, overflow: "hidden", minHeight: 0, paddingBottom: "48px" }}>
        {view === "unit" && (
          <FocusView
            unit={currentUnit}
            palette={palette}
            isTopLevel={isTopLevel}
            onUpdate={updateCell}
            onDrillDown={drillDown}
            onDrillUp={drillUp}
            onDrillForward={drillForward}
            onOpenModal={setModalCell}
            onSwap={(fromPos, toPos) => swapCells(currentUnitId, fromPos, toPos)}
            onImageAction={handleImageAction}
            focusedPosition={focusedPosition}
            onSetFocusedPosition={setFocusedPosition}
          />
        )}
        {view === "overview" && (
          <OverviewView
            unit={currentUnit}
            palette={palette}
            isTopLevel={isTopLevel}
            currentDepth={currentDepth}
            onUpdate={updateCell}
            onGridClick={handleOverviewGridClick}
          />
        )}
      </main>

      <Footer />

      {modalCell && (
        <ModalEditor
          initialText={modalCell.text}
          onSave={(text) => updateCell(modalCell.id, text)}
          onClose={() => setModalCell(null)}
        />
      )}
    </div>
  );
}
