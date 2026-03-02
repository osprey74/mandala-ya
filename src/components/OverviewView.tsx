import { memo, useState, useEffect, useRef, useCallback } from "react";
import type { MandalaCell, MandalaUnit } from "../types/mandala";
import type { Palette } from "../constants/palettes";
import { CENTER, PALETTES } from "../constants/palettes";
import UnitGrid from "./UnitGrid";

// 俯瞰ビューの UnitGrid に渡すダミーコールバック（安定した参照）
const noop = () => {};
const noopCell = (_cell: MandalaCell) => {};
const noopSwap = (_from: number, _to: number) => {};

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

interface OverviewViewProps {
  unit: MandalaUnit;
  palette: Palette;
  isTopLevel: boolean;
  currentDepth: number;
  onUpdate: (id: string, text: string) => void;
  onGridClick: (pos: number) => void;
}

function OverviewView({
  unit,
  isTopLevel,
  currentDepth,
  onUpdate,
  onGridClick,
}: OverviewViewProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, scrollX: 0, scrollY: 0 });
  const didDrag = useRef(false);

  // ── Zoom: Ctrl++ / Ctrl+0 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.code === "Equal" || e.code === "NumpadAdd") {
        e.preventDefault();
        setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 10) / 10));
      } else if (e.code === "Digit0" || e.code === "Numpad0") {
        e.preventDefault();
        setZoom(1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Zoom: Ctrl+wheel（non-passive で preventDefault） ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => {
        const next = Math.round((z + delta) * 10) / 10;
        return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
      });
    };
    container.addEventListener("wheel", handler, { passive: false });
    return () => container.removeEventListener("wheel", handler);
  }, []);

  // ── ズーム変更時にスクロール位置を中央へ ──
  useEffect(() => {
    const c = containerRef.current;
    if (!c || zoom <= 1) return;
    requestAnimationFrame(() => {
      c.scrollLeft = (c.scrollWidth - c.clientWidth) / 2;
      c.scrollTop = (c.scrollHeight - c.clientHeight) / 2;
    });
  }, [zoom]);

  // ── ドラッグスクロール ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      didDrag.current = false;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        scrollX: containerRef.current?.scrollLeft ?? 0,
        scrollY: containerRef.current?.scrollTop ?? 0,
      };
    },
    [zoom],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDrag.current = true;
      }
      const c = containerRef.current;
      if (!c) return;
      c.scrollLeft = dragStart.current.scrollX - dx;
      c.scrollTop = dragStart.current.scrollY - dy;
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // ドラッグ後のクリックを抑制
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.stopPropagation();
      didDrag.current = false;
    }
  }, []);

  const isZoomed = zoom > 1;

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflow: isZoomed ? "auto" : "hidden",
        cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect: isDragging ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: isZoomed ? `${zoom * 100}%` : undefined,
          minHeight: isZoomed ? `${zoom * 100}%` : undefined,
          height: isZoomed ? undefined : "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "8px",
            // 横幅と縦の利用可能領域のどちらか小さい方に合わせる（スクロール防止）
            // header(52) + breadcrumb(36) + footer(48) + grid padding(32) = 168px
            // ユニット表示と同じ比率: availableH × 6/4 = availableH × 1.5
            width: "min(calc(100vw - 40px), calc((100vh - 168px) * 1.5))",
            padding: "16px",
            transform: isZoomed ? `scale(${zoom})` : undefined,
          }}
        >
          {Array.from({ length: 9 }, (_, idx) => {
            const isCurrentCenter = idx === CENTER;
            const cellRef = isCurrentCenter ? null : unit.cells[idx];
            const childUnit = isCurrentCenter ? unit : cellRef?.children ?? null;
            const cellPalette = PALETTES[(isCurrentCenter ? 4 : idx) % PALETTES.length];

            const isEmpty = !isCurrentCenter && !cellRef?.text;
            const canClick = isCurrentCenter || !!cellRef?.text;

            return (
              <div
                key={idx}
                onClick={() => canClick && onGridClick(idx)}
                style={{
                  cursor: canClick ? "pointer" : "default",
                  borderRadius: "10px",
                  border: isCurrentCenter
                    ? `2px solid ${PALETTES[currentDepth % PALETTES.length].center}`
                    : "1px solid #e0e0e0",
                  padding: "4px",
                  backgroundColor: isCurrentCenter ? "#faf8ff" : "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "6/4",
                  overflow: "hidden",
                  opacity: isEmpty ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!canClick) return;
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                }}
              >
                {childUnit ? (
                  <UnitGrid
                    unit={
                      isCurrentCenter
                        ? childUnit
                        : {
                            ...childUnit,
                            cells: childUnit.cells.map((c, i) =>
                              i === CENTER
                                ? { ...c, text: cellRef?.text ?? c.text, image: cellRef?.image ?? c.image }
                                : c,
                            ),
                          }
                    }
                    palette={cellPalette}
                    isFocusView={false}
                    isTopLevel={isCurrentCenter && isTopLevel}
                    onUpdate={onUpdate}
                    onDrillDown={noop}
                    onDrillUp={noop}
                    onOpenModal={noopCell}
                    onSwap={noopSwap}
                    onImageAction={noopCell}
                    fontScale={1}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: cellRef?.text ? "#555" : "#ccc",
                      fontSize: cellRef?.text ? "13px" : "11px",
                      fontWeight: cellRef?.text ? "500" : "400",
                      fontStyle: cellRef?.text ? "normal" : "italic",
                      textAlign: "center",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor: cellRef?.text ? cellPalette.bg : "transparent",
                    }}
                  >
                    {cellRef?.text ?? ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(OverviewView);
