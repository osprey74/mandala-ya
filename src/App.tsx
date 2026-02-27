import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import "./App.css";
import type { MandalaCell, MandalaChart } from "./types/mandala";
import {
  useMandalaStore,
  useCurrentUnit,
  useIsTopLevel,
  useCurrentDepth,
  useCurrentUnitId,
  buildBreadcrumbs,
} from "./store/useMandalaStore";
import { useSaveStore } from "./store/useSaveStore";
import {
  loadSavedPath,
  persistSavePath,
  saveChart,
  loadChart,
  openChartFile,
  exportChartJson,
  exportChartMarkdown,
  exportChartOpml,
  chooseSavePath,
  addImageToCell,
} from "./utils/fileOperations";
import { PALETTES, CENTER, KEY_TO_POSITION } from "./constants/palettes";
import { createChart } from "./utils/mandalaHelpers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";
import FocusView from "./components/FocusView";
import OverviewView from "./components/OverviewView";
import ModalEditor from "./components/ModalEditor";
import SettingsModal from "./components/SettingsModal";
import Toast from "./components/Toast";
import type { ToastType } from "./components/Toast";
import { useSettingsStore } from "./store/useSettingsStore";
import { generateKeywords } from "./utils/claudeApi";

/** チャートの作成日から保存ダイアログのデフォルトファイル名を生成する */
function chartDefaultFilename(chart: MandalaChart): string {
  const date = new Date(chart.createdAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `mandala-ya_${y}${m}${d}.mandala`;
}

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
  const initFromFile = useMandalaStore((s) => s.initFromFile);

  // ── Save store ──
  const { savePath, isDirty, isSaving, setSavePath, setDirty, setIsSaving, bumpSaved, bumpExported } = useSaveStore();

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

  // ── AI assist state ──
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // ── Settings store ──
  const { apiKey, model, load: loadSettings } = useSettingsStore();

  // ── Dirty tracking: last-saved chart ref ──
  const savedChartRef = useRef(chart);

  // ── Startup: load from plugin-store ──
  useEffect(() => {
    (async () => {
      const storedPath = await loadSavedPath();
      if (!storedPath) return;
      try {
        const loaded = await loadChart(storedPath);
        initFromFile(loaded);
        useMandalaStore.temporal.getState().clear();
        savedChartRef.current = loaded;
        setSavePath(storedPath);
        setDirty(false);
      } catch (e) {
        console.warn("前回のファイルの読み込みに失敗しました:", e);
        await persistSavePath(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Startup: load AI settings ──
  useEffect(() => {
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset nav if current unit was removed by undo
  useEffect(() => {
    resetNavIfNeeded();
  }, [chart, resetNavIfNeeded]);

  // ── Dirty tracking ──
  useEffect(() => {
    if (chart !== savedChartRef.current) {
      setDirty(true);
    }
  }, [chart, setDirty]);

  // ── Auto-save (debounce 500ms) ──
  useEffect(() => {
    if (!savePath || !isDirty) return;
    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        await saveChart(chart, savePath);
        savedChartRef.current = chart;
        setDirty(false);
        bumpSaved();
      } catch (e) {
        console.error("自動保存に失敗しました:", e);
      } finally {
        setIsSaving(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      setIsSaving(false);
    };
  }, [chart, savePath, isDirty, setDirty, setIsSaving]);

  // ── File operations ──

  const handleSave = useCallback(async () => {
    let path = savePath;
    if (!path) {
      path = await chooseSavePath(chartDefaultFilename(chart));
      if (!path) return;
      setSavePath(path);
      await persistSavePath(path);
    }
    setIsSaving(true);
    try {
      await saveChart(chart, path);
      savedChartRef.current = chart;
      setDirty(false);
      bumpSaved();
    } catch (e) {
      console.error("保存に失敗しました:", e);
      alert("保存に失敗しました:\n" + e);
    } finally {
      setIsSaving(false);
    }
  }, [savePath, chart, setSavePath, setDirty, setIsSaving, bumpSaved]);

  const handleSaveAs = useCallback(async () => {
    const defaultName = savePath
      ? savePath.replace(/\\/g, "/").split("/").pop()
      : chartDefaultFilename(chart);
    const path = await chooseSavePath(defaultName);
    if (!path) return;
    setSavePath(path);
    await persistSavePath(path);
    setIsSaving(true);
    try {
      await saveChart(chart, path);
      savedChartRef.current = chart;
      setDirty(false);
      bumpSaved();
    } catch (e) {
      console.error("保存に失敗しました:", e);
      alert("保存に失敗しました:\n" + e);
    } finally {
      setIsSaving(false);
    }
  }, [savePath, chart, setSavePath, setDirty, setIsSaving, bumpSaved]);

  const handleOpen = useCallback(async () => {
    if (isDirty) {
      const ok = window.confirm("未保存の変更があります。別のファイルを開きますか？");
      if (!ok) return;
    }
    try {
      const result = await openChartFile();
      if (!result) return;
      initFromFile(result.chart);
      useMandalaStore.temporal.getState().clear();
      savedChartRef.current = result.chart;
      setSavePath(result.path);
      await persistSavePath(result.path);
      setDirty(false);
    } catch (e) {
      console.error("ファイルを開くのに失敗しました:", e);
      alert("ファイルを開くのに失敗しました:\n" + e);
    }
  }, [isDirty, initFromFile, setSavePath, setDirty]);

  const handleExport = useCallback(async () => {
    try {
      await exportChartJson(chart);
      bumpExported();
    } catch (e) {
      console.error("エクスポートに失敗しました:", e);
      alert("エクスポートに失敗しました:\n" + e);
    }
  }, [chart, bumpExported]);

  const handleExportMarkdown = useCallback(async () => {
    try {
      await exportChartMarkdown(chart, savePath);
      bumpExported();
    } catch (e) {
      console.error("Markdownエクスポートに失敗しました:", e);
      alert("Markdownエクスポートに失敗しました:\n" + e);
    }
  }, [chart, savePath, bumpExported]);

  const handleExportOpml = useCallback(async () => {
    try {
      await exportChartOpml(chart);
      bumpExported();
    } catch (e) {
      console.error("OPMLエクスポートに失敗しました:", e);
      alert("OPMLエクスポートに失敗しました:\n" + e);
    }
  }, [chart, bumpExported]);

  const handleNew = useCallback(async () => {
    // 未保存データがある場合は先に保存
    if (isDirty) {
      if (savePath) {
        // 既存パスに上書き保存
        setIsSaving(true);
        try {
          await saveChart(chart, savePath);
          savedChartRef.current = chart;
          setDirty(false);
          bumpSaved();
        } catch (e) {
          alert("保存に失敗しました:\n" + e);
          return;
        } finally {
          setIsSaving(false);
        }
      } else {
        // 保存先を選択して保存
        const path = await chooseSavePath(chartDefaultFilename(chart));
        if (!path) return; // キャンセル → 新規作成を中断
        setIsSaving(true);
        try {
          await saveChart(chart, path);
          savedChartRef.current = chart;
          setSavePath(path);
          await persistSavePath(path);
          setDirty(false);
          bumpSaved();
        } catch (e) {
          alert("保存に失敗しました:\n" + e);
          return;
        } finally {
          setIsSaving(false);
        }
      }
    }

    // 新しい空チャートを生成してストアに反映
    const newChart = createChart();
    initFromFile(newChart);
    useMandalaStore.temporal.getState().clear();
    savedChartRef.current = newChart;
    setSavePath(null);
    await persistSavePath(null);
    setDirty(false);

    // 新ファイルの保存先を選択
    const newPath = await chooseSavePath(chartDefaultFilename(newChart));
    if (newPath) {
      try {
        await saveChart(newChart, newPath);
        savedChartRef.current = newChart;
        setSavePath(newPath);
        await persistSavePath(newPath);
        setDirty(false);
        bumpSaved();
      } catch (e) {
        alert("保存に失敗しました:\n" + e);
      }
    }
  }, [isDirty, savePath, chart, initFromFile, setSavePath, setDirty, setIsSaving, bumpSaved]);

  // Image action handler
  const handleImageAction = useCallback(
    async (cell: MandalaCell) => {
      if (cell.image) {
        setCellImage(cell.id, null);
      } else {
        if (!savePath) {
          alert("画像を追加する前にファイルを保存してください。");
          return;
        }
        try {
          const filename = await addImageToCell(savePath);
          if (filename) setCellImage(cell.id, filename);
        } catch (e) {
          console.error("画像の追加に失敗しました:", e);
          alert("画像の追加に失敗しました:\n" + e);
        }
      }
    },
    [savePath, setCellImage],
  );

  // Swap handler (stable reference for FocusView memo)
  const handleSwap = useCallback(
    (fromPos: number, toPos: number) => swapCells(currentUnitId, fromPos, toPos),
    [swapCells, currentUnitId],
  );

  // AI assist handler
  const handleAiAssist = useCallback(async () => {
    if (!currentUnit) return;

    const centerCell = currentUnit.cells.find((c) => c.position === CENTER);
    if (!centerCell?.text.trim()) {
      setToast({ message: "主題セルにテキストを入力してください", type: "error" });
      return;
    }
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const keywords = await generateKeywords(centerCell.text.trim(), apiKey, model);
      const relatedCells = currentUnit.cells.filter((c) => c.position !== CENTER);
      relatedCells.forEach((cell, i) => {
        if (keywords[i] !== undefined) {
          updateCell(cell.id, keywords[i]);
        }
      });
      setToast({ message: "キーワードを生成しました", type: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setToast({ message: `生成に失敗しました:\n${msg}`, type: "error" });
    } finally {
      setIsAiLoading(false);
    }
  }, [currentUnit, apiKey, model, updateCell]);

  // Overview grid click handler
  const handleOverviewGridClick = useCallback(
    (pos: number) => {
      if (!currentUnit) return;
      if (pos === CENTER) {
        setView("unit");
        return;
      }
      const cell = currentUnit.cells[pos];
      if (cell.text.trim() || cell.image) drillDown(cell);
    },
    [currentUnit, drillDown, setView],
  );

  // ── Global key handlers ──

  // Alt+V, Ctrl+Z/Shift+Z
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

  // Ctrl+Shift+S (保存) / Ctrl+E (エクスポート) / Ctrl+N (新規作成)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyS") {
        e.preventDefault();
        handleSaveAs();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === "KeyE") {
        const isTextArea = document.activeElement?.tagName === "TEXTAREA";
        if (isTextArea) return;
        e.preventDefault();
        handleExport();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === "KeyN") {
        e.preventDefault();
        handleNew();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveAs, handleExport, handleNew]);

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
      if (cell?.text.trim() || cell?.image) {
        drillDown(cell);
      } else {
        setView("unit");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, currentUnit, drillDown, setView]);

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
        isDirty={isDirty}
        isSaving={isSaving}
        savePath={savePath}
        onSave={handleSave}
        onNew={handleNew}
        onOpen={handleOpen}
        onExport={handleExport}
        onExportMarkdown={handleExportMarkdown}
        onExportOpml={handleExportOpml}
        onOpenSettings={() => setShowSettings(true)}
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
            onSwap={handleSwap}
            onImageAction={handleImageAction}
            focusedPosition={focusedPosition}
            onSetFocusedPosition={setFocusedPosition}
            onAiAssist={handleAiAssist}
            isAiLoading={isAiLoading}
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

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
