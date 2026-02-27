import type { MandalaUnit } from "../types/mandala";
import type { Palette } from "../constants/palettes";
import { CENTER, PALETTES } from "../constants/palettes";
import UnitGrid from "./UnitGrid";

interface OverviewViewProps {
  unit: MandalaUnit;
  palette: Palette;
  isTopLevel: boolean;
  currentDepth: number;
  onUpdate: (id: string, text: string) => void;
  onGridClick: (pos: number) => void;
}

export default function OverviewView({
  unit,
  isTopLevel,
  currentDepth,
  onUpdate,
  onGridClick,
}: OverviewViewProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        width: "min(calc(100vw - 40px), calc(100vh - 168px), 700px)",
        padding: "16px",
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
              aspectRatio: "16/9",
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
                onDrillDown={() => {}}
                onDrillUp={() => {}}
                onOpenModal={() => {}}
                onSwap={() => {}}
                onImageAction={() => {}}
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
  );
}
