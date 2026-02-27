import { useState, useEffect, useRef, useCallback } from "react";
import type { MandalaCell, MandalaUnit } from "../types/mandala";
import type { Palette } from "../constants/palettes";
import { KEY_TO_POSITION, CENTER } from "../constants/palettes";
import UnitGrid from "./UnitGrid";
import type { EditableCellHandle } from "./EditableCell";

interface FocusViewProps {
  unit: MandalaUnit;
  palette: Palette;
  isTopLevel: boolean;
  onUpdate: (id: string, text: string) => void;
  onDrillDown: (cell: MandalaCell) => void;
  onDrillUp: () => void;
  onDrillForward: () => void;
  onOpenModal: (cell: MandalaCell) => void;
  onSwap: (fromPos: number, toPos: number) => void;
  onImageAction: (cell: MandalaCell) => void;
  focusedPosition: number | null;
  onSetFocusedPosition: (pos: number | null) => void;
}

export default function FocusView({
  unit,
  palette,
  isTopLevel,
  onUpdate,
  onDrillDown,
  onDrillUp,
  onDrillForward,
  onOpenModal,
  onSwap,
  onImageAction,
  focusedPosition,
  onSetFocusedPosition,
}: FocusViewProps) {
  // 16:9 グリッドサイズ（幅・高さを独立管理）
  const [gridWidth, setGridWidth] = useState(498);
  const [gridHeight, setGridHeight] = useState(280);
  const cellHandles = useRef<Record<number, EditableCellHandle | null>>({});

  const registerHandle = useCallback(
    (pos: number, handle: EditableCellHandle | null) => {
      cellHandles.current[pos] = handle;
    },
    [],
  );

  // Responsive size calculation (16:9)
  useEffect(() => {
    const calcSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerHeight = 52;
      const breadcrumbHeight = 36;
      const footerHeight = 48;
      const padding = 16;
      const availableW = vw - 40;
      const availableH = vh - headerHeight - breadcrumbHeight - footerHeight - padding;
      // 幅は availableW と availableH*(16/9) の小さい方
      const w = Math.max(498, Math.min(availableW, availableH * 16 / 9));
      setGridWidth(Math.round(w));
      setGridHeight(Math.round(w * 9 / 16));
    };
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, []);

  // scale はグリッド高さ基準（セル縦サイズが基準）
  const scale = gridHeight / 400;

  // Keyboard shortcut handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      // Alt+U or Alt+ArrowLeft → drill up
      if (
        (e.code === "KeyU" || e.code === "ArrowLeft") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        onDrillUp();
        return;
      }

      // Alt+ArrowRight → drill forward
      if (e.code === "ArrowRight" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        onDrillForward();
        return;
      }

      // Alt+V は App.tsx のグローバルハンドラーで処理

      // Alt+E → open modal for focused cell
      if (e.code === "KeyE" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (focusedPosition !== null) {
          const cell = unit.cells.find((c) => c.position === focusedPosition);
          if (cell && cell.text.trim()) onOpenModal(cell);
        }
        return;
      }

      // Alt+I → image action for focused cell (add/remove)
      if (e.code === "KeyI" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (focusedPosition !== null && focusedPosition !== CENTER) {
          const cell = unit.cells.find((c) => c.position === focusedPosition);
          if (cell) onImageAction(cell);
        }
        return;
      }

      // Alt+Shift+I → 画像削除（画像がある場合のみ）
      if (e.code === "KeyI" && !e.ctrlKey && !e.metaKey && e.shiftKey) {
        e.preventDefault();
        if (focusedPosition !== null && focusedPosition !== CENTER) {
          const cell = unit.cells.find((c) => c.position === focusedPosition);
          if (cell?.image) onImageAction(cell);
        }
        return;
      }

      const pos = KEY_TO_POSITION[e.code];
      if (pos === undefined) return;

      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Alt+Ctrl+数字 → drill down
        if (pos === CENTER) return;
        const cell = unit.cells.find((c) => c.position === pos);
        if (cell && (cell.text.trim() || cell.image)) {
          onDrillDown(cell);
        }
      } else if (e.shiftKey) {
        // Alt+Shift+数字 → swap cells
        if (pos === CENTER) return;
        if (focusedPosition !== null && focusedPosition !== CENTER && focusedPosition !== pos) {
          onSwap(focusedPosition, pos);
        }
      } else {
        // Alt+数字 → focus/start editing cell
        onSetFocusedPosition(pos);
        // Commit any currently editing cell first (handled by blur in EditableCell)
        const handle = cellHandles.current[pos];
        handle?.startEditing();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    unit,
    focusedPosition,
    onDrillDown,
    onDrillUp,
    onDrillForward,
    onOpenModal,
    onSwap,
    onImageAction,
    onSetFocusedPosition,
  ]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px 16px",
        height: "100%",
      }}
    >
      <div style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}>
        <UnitGrid
          unit={unit}
          palette={palette}
          isFocusView={true}
          isTopLevel={isTopLevel}
          onUpdate={onUpdate}
          onDrillDown={onDrillDown}
          onDrillUp={onDrillUp}
          onOpenModal={onOpenModal}
          onSwap={onSwap}
          onImageAction={onImageAction}
          fontScale={scale}
          registerHandle={registerHandle}
        />
      </div>
    </div>
  );
}
