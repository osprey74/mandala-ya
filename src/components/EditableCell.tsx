import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import type { MandalaCell } from "../types/mandala";
import type { Palette } from "../constants/palettes";
import { useSaveStore } from "../store/useSaveStore";
import { resolveImageUrl } from "../utils/fileOperations";

export interface EditableCellHandle {
  startEditing: () => void;
  commitEditing: () => void;
}

interface EditableCellProps {
  cell: MandalaCell;
  isCenter: boolean;
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
}

const EditableCell = forwardRef<EditableCellHandle, EditableCellProps>(
  (
    {
      cell,
      isCenter,
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
    },
    ref,
  ) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(cell.text);
    const [isDragOver, setIsDragOver] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const s = fontScale;

    // 画像URL解決
    const savePath = useSaveStore((state) => state.savePath);
    const imageUrl = resolveImageUrl(cell.image, savePath);

    useEffect(() => {
      setDraft(cell.text);
    }, [cell.text]);

    useEffect(() => {
      if (editing) {
        textareaRef.current?.focus();
        const len = textareaRef.current?.value.length ?? 0;
        textareaRef.current?.setSelectionRange(len, len);
      }
    }, [editing]);

    const commit = useCallback(() => {
      setEditing(false);
      if (draft !== cell.text) onUpdate(cell.id, draft);
    }, [draft, cell.text, cell.id, onUpdate]);

    useImperativeHandle(ref, () => ({
      startEditing: () => {
        if (!isCenterReadOnly) setEditing(true);
      },
      commitEditing: () => {
        if (editing) commit();
      },
    }));

    const isCenterReadOnly = isCenter && !isTopLevel && isFocusView;
    const hasChildren = !!cell.children;
    const canDrillDown = !isCenter && isFocusView && (cell.text.trim() !== "" || !!cell.image);
    const canDrillUp = isCenter && isFocusView && !isTopLevel;
    const showModalBtn = isFocusView && cell.text.trim() !== "";
    const showImageBtn = !isCenter && isFocusView;

    const fontSize = isFocusView ? `${Math.round(14 * s)}px` : "9px";
    const placeholderSize = isFocusView ? `${Math.round(11 * s)}px` : "7px";
    const btnSize = Math.round(22 * s);
    const btnFont = isFocusView ? `${Math.round(12 * s)}px` : "10px";
    const pad = isFocusView ? `${Math.round(6 * s)}px` : "3px";
    const radius = isFocusView ? `${Math.round(8 * s)}px` : "4px";

    const cellBg = isCenter ? palette.center : palette.bg;
    const cellColor = isCenter ? "#fff" : "#1a1a1a";

    const cellStyle: React.CSSProperties = {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "16/9",
      borderRadius: radius,
      padding: pad,
      cursor: isCenterReadOnly ? "default" : "text",
      transition: "box-shadow 0.15s ease",
      overflow: "hidden",
      border: isCenter
        ? `2px solid ${palette.center}`
        : `1px solid ${palette.border}55`,
      backgroundColor: isDragOver ? palette.border + "33" : cellBg,
      color: cellColor,
      fontWeight: isCenter ? "700" : "400",
      fontSize,
      lineHeight: "1.3",
      textAlign: "center",
      wordBreak: "break-word",
      boxShadow: isCenter
        ? `0 2px 10px ${palette.center}44`
        : "0 1px 3px rgba(0,0,0,0.04)",
      userSelect: "none",
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        setDraft(cell.text);
        setEditing(false);
      }
      // Alt+数字: commit and let global handler take over (no stopPropagation)
    };

    // ── Drag & Drop ──
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", String(cell.position));
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (isCenter) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isCenter) return;
      const fromPos = parseInt(e.dataTransfer.getData("text/plain"));
      if (!isNaN(fromPos) && fromPos !== cell.position) {
        onSwap(fromPos, cell.position);
      }
    };

    // Editing mode
    if (editing) {
      return (
        <div style={cellStyle}>
          {/* Background image layer */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />
          )}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              textAlign: "center",
              backgroundColor: "transparent",
              color: "inherit",
              fontWeight: "inherit",
              fontSize: "inherit",
              fontFamily: "inherit",
              lineHeight: "1.3",
              padding: "0",
            }}
          />
        </div>
      );
    }

    // Display mode
    return (
      <div
        style={cellStyle}
        draggable={!isCenter && isFocusView}
        onClick={() => {
          if (!isCenterReadOnly) setEditing(true);
        }}
        onMouseEnter={(e) => {
          if (isFocusView && !isCenter) {
            e.currentTarget.style.boxShadow = `0 2px 8px ${palette.border}33`;
          }
        }}
        onMouseLeave={(e) => {
          if (isFocusView && !isCenter) {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          }
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Background image layer */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
        )}

        {/* ↑ button — top-left of center cell, depth >= 1 */}
        {canDrillUp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDrillUp();
            }}
            title="上の階層へ戻る (Alt+U)"
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.5)",
              backgroundColor: "rgba(255,255,255,0.25)",
              color: "#fff",
              fontSize: btnFont,
              lineHeight: "1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontFamily: "inherit",
              zIndex: 2,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.45)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)")
            }
          >
            ↑
          </button>
        )}

        {/* ↗ button — top-right (modal editor), text-filled cells only */}
        {showModalBtn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(cell);
            }}
            title="テキストを全文編集 (Alt+E)"
            style={{
              position: "absolute",
              top: "3px",
              right: "3px",
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              borderRadius: "12px",
              border: isCenter
                ? "1px solid rgba(255,255,255,0.5)"
                : `1px solid ${palette.border}66`,
              backgroundColor: isCenter
                ? "rgba(255,255,255,0.25)"
                : "rgba(0,0,0,0.06)",
              color: isCenter ? "#fff" : palette.border,
              fontSize: btnFont,
              lineHeight: "1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontFamily: "inherit",
              zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isCenter
                ? "rgba(255,255,255,0.45)"
                : palette.border + "22";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isCenter
                ? "rgba(255,255,255,0.25)"
                : "rgba(0,0,0,0.06)";
            }}
          >
            ↗
          </button>
        )}

        {/* Cell text */}
        <span
          style={{
            position: "relative",
            zIndex: 1,
            opacity: cell.text ? 1 : 0.3,
            fontSize: cell.text ? fontSize : placeholderSize,
            padding: isCenter && canDrillUp ? `0 ${Math.round(btnSize / 2)}px` : "0",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
            wordBreak: "break-word",
          }}
        >
          {cell.text || (isFocusView && !isCenter ? "クリックして入力" : "")}
        </span>

        {/* ↓ button — bottom-right of related cells */}
        {canDrillDown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown(cell);
            }}
            title="下の階層へ展開 (Alt+Ctrl+数字)"
            style={{
              position: "absolute",
              bottom: "3px",
              right: "3px",
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              borderRadius: "12px",
              border: `1px solid ${palette.border}66`,
              backgroundColor: hasChildren ? palette.border : "rgba(0,0,0,0.06)",
              color: hasChildren ? "#fff" : palette.border,
              fontSize: btnFont,
              lineHeight: "1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontFamily: "inherit",
              zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = palette.border;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = hasChildren
                ? palette.border
                : "rgba(0,0,0,0.06)";
              e.currentTarget.style.color = hasChildren ? "#fff" : palette.border;
            }}
          >
            ↓
          </button>
        )}

        {/* 🖼 button — bottom-left of related cells */}
        {showImageBtn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageAction(cell);
            }}
            title={cell.image ? "画像を削除" : "画像を追加 (Alt+I)"}
            style={{
              position: "absolute",
              bottom: "3px",
              left: "3px",
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              borderRadius: "12px",
              border: `1px solid ${palette.border}66`,
              backgroundColor: "rgba(0,0,0,0.06)",
              color: palette.border,
              fontSize: Math.round(10 * s) + "px",
              lineHeight: "1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontFamily: "inherit",
              zIndex: 2,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = palette.border + "22")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)")
            }
          >
            {cell.image ? "✕" : "🖼"}
          </button>
        )}

        {/* Indicator dot (overview mode) */}
        {hasChildren && !isFocusView && (
          <div
            style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: palette.border,
              opacity: 0.6,
              zIndex: 1,
            }}
          />
        )}
      </div>
    );
  },
);

EditableCell.displayName = "EditableCell";

export default EditableCell;
