import { useRef, useCallback, memo } from "react";
import type { MandalaCell, MandalaUnit } from "../types/mandala";
import type { Palette } from "../constants/palettes";
import { CENTER } from "../constants/palettes";
import EditableCell from "./EditableCell";
import type { EditableCellHandle } from "./EditableCell";

interface UnitGridProps {
  unit: MandalaUnit;
  palette: Palette;
  isFocusView: boolean;
  isTopLevel: boolean;
  onUpdate: (id: string, text: string) => void;
  onDrillDown: (cell: MandalaCell) => void;
  onDrillUp: () => void;
  onOpenModal: (cell: MandalaCell) => void;
  onSwap: (fromPos: number, toPos: number) => void;
  onImageAction: (cell: MandalaCell) => void;
  fontScale: number;
  registerHandle?: (pos: number, handle: EditableCellHandle | null) => void;
}

function UnitGrid({
  unit,
  palette,
  isFocusView,
  isTopLevel,
  onUpdate,
  onDrillDown,
  onDrillUp,
  onOpenModal,
  onSwap,
  onImageAction,
  fontScale,
  registerHandle,
}: UnitGridProps) {
  const gap = isFocusView ? `${Math.max(4, Math.round(6 * fontScale))}px` : "2px";

  const internalRefs = useRef<Record<number, EditableCellHandle | null>>({});

  const makeRefCallback = useCallback(
    (pos: number) => (handle: EditableCellHandle | null) => {
      internalRefs.current[pos] = handle;
      registerHandle?.(pos, handle);
    },
    [registerHandle],
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap,
        aspectRatio: "6/4",
        width: "100%",
        height: "100%",
      }}
    >
      {unit.cells.map((cell) => (
        <EditableCell
          key={cell.id}
          ref={makeRefCallback(cell.position)}
          cell={cell}
          isCenter={cell.position === CENTER}
          palette={palette}
          isFocusView={isFocusView}
          isTopLevel={isTopLevel}
          onUpdate={onUpdate}
          onDrillDown={onDrillDown}
          onDrillUp={onDrillUp}
          onOpenModal={onOpenModal}
          onSwap={onSwap}
          onImageAction={onImageAction}
          fontScale={fontScale}
        />
      ))}
    </div>
  );
}

export default memo(UnitGrid);
