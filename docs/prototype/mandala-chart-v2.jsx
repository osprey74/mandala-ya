import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ── Constants ─────────────────────────────────────────────
const POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const CENTER = 4;
const SURROUNDING = [0, 1, 2, 3, 5, 6, 7, 8];

// Color palette for grids by position
const PALETTES = [
  { bg: "#FFF3E0", border: "#EF6C00", accent: "#E65100", center: "#EF6C00" },
  { bg: "#E8F5E9", border: "#2E7D32", accent: "#1B5E20", center: "#2E7D32" },
  { bg: "#E3F2FD", border: "#1565C0", accent: "#0D47A1", center: "#1565C0" },
  { bg: "#FCE4EC", border: "#C2185B", accent: "#880E4F", center: "#C2185B" },
  { bg: "#EDE7F6", border: "#512DA8", accent: "#311B92", center: "#512DA8" },
  { bg: "#E0F2F1", border: "#00796B", accent: "#004D40", center: "#00796B" },
  { bg: "#FFF8E1", border: "#F9A825", accent: "#F57F17", center: "#F9A825" },
  { bg: "#F3E5F5", border: "#7B1FA2", accent: "#4A148C", center: "#7B1FA2" },
  { bg: "#EFEBE9", border: "#5D4037", accent: "#3E2723", center: "#5D4037" },
];

// ── Data Model (Recursive) ───────────────────────────────
let _idCounter = 0;
const genId = () => `cell-${++_idCounter}`;
const genUnitId = () => `unit-${++_idCounter}`;

function createUnit(centerText = "") {
  const unitId = genUnitId();
  const cells = POSITIONS.map((pos) => ({
    id: genId(),
    text: pos === CENTER ? centerText : "",
    position: pos,
    children: null, // MandalaUnit | null — recursive
  }));
  return { id: unitId, cells };
}

function createChart() {
  return {
    id: "chart-1",
    title: "マンダラチャート",
    rootUnit: createUnit(""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Deep clone helper
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Find & Update Helpers (immutable) ────────────────────
function updateCellInUnit(unit, cellId, newText) {
  let changed = false;
  const newCells = unit.cells.map((cell) => {
    if (cell.id === cellId) {
      changed = true;
      return { ...cell, text: newText };
    }
    if (cell.children) {
      const newChild = updateCellInUnit(cell.children, cellId, newText);
      if (newChild !== cell.children) {
        changed = true;
        return { ...cell, children: newChild };
      }
    }
    return cell;
  });
  return changed ? { ...unit, cells: newCells } : unit;
}

function ensureChildUnit(unit, cellId) {
  const newCells = unit.cells.map((cell) => {
    if (cell.id === cellId && !cell.children) {
      return { ...cell, children: createUnit(cell.text) };
    }
    if (cell.children) {
      const newChild = ensureChildUnit(cell.children, cellId);
      if (newChild !== cell.children) return { ...cell, children: newChild };
    }
    return cell;
  });
  return { ...unit, cells: newCells };
}

// Sync: when parent cell text changes, update child unit's center cell text
function syncCenterText(unit) {
  const newCells = unit.cells.map((cell) => {
    if (cell.children) {
      const childCells = cell.children.cells.map((cc, i) =>
        i === CENTER ? { ...cc, text: cell.text } : cc
      );
      const syncedChild = syncCenterText({ ...cell.children, cells: childCells });
      return { ...cell, children: syncedChild };
    }
    return cell;
  });
  return { ...unit, cells: newCells };
}

// Get the path to a unit for navigation
function findUnitPath(unit, targetUnitId, path = []) {
  if (unit.id === targetUnitId) return [...path, unit];
  for (const cell of unit.cells) {
    if (cell.children) {
      const result = findUnitPath(cell.children, targetUnitId, [...path, unit]);
      if (result) return result;
    }
  }
  return null;
}

// ── Editable Cell Component ──────────────────────────────
function EditableCell({
  cell,
  isCenter,
  palette,
  isFocusView,
  isTopLevel,
  onUpdate,
  onDrillDown,
  onDrillUp,
  currentDepth,
  registerCellRef,
  fontScale,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cell.text);
  const inputRef = useRef(null);
  const cellElRef = useRef(null);

  const s = fontScale || 1; // scale factor

  useEffect(() => { setDraft(cell.text); }, [cell.text]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  // Register cell DOM element for keyboard shortcut targeting
  useEffect(() => {
    if (registerCellRef && isFocusView && cellElRef.current) {
      registerCellRef(cell.position, cellElRef.current);
    }
  }, [registerCellRef, cell.position, isFocusView]);

  const commit = () => {
    setEditing(false);
    if (draft !== cell.text) onUpdate(cell.id, draft);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setDraft(cell.text); setEditing(false); }
    // Alt+key: commit current edit and let the global handler move focus
    if (e.altKey && KEY_TO_POSITION[e.code] !== undefined) {
      commit();
    }
  };

  const hasChildren = !!cell.children;
  const canDrillDown = !isCenter && isFocusView && cell.text.trim() !== "";
  const canDrillUp = isCenter && isFocusView && !isTopLevel;
  const isCenterReadOnly = isCenter && !isTopLevel && isFocusView;

  const fontSize = isFocusView ? `${Math.round(14 * s)}px` : "9px";
  const placeholderSize = isFocusView ? `${Math.round(11 * s)}px` : "7px";
  const btnSize = isFocusView ? `${Math.round(22 * s)}px` : "16px";
  const btnFont = isFocusView ? `${Math.round(12 * s)}px` : "10px";
  const pad = isFocusView ? `${Math.round(6 * s)}px` : "3px";

  const cellStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1",
    borderRadius: isFocusView ? `${Math.round(8 * s)}px` : "4px",
    padding: pad,
    cursor: isCenterReadOnly ? "default" : "text",
    transition: "all 0.2s ease, box-shadow 0.15s ease",
    overflow: "hidden",
    border: isCenter
      ? `2px solid ${palette.center}`
      : `1px solid ${palette.border}55`,
    backgroundColor: isCenter ? palette.center : palette.bg,
    color: isCenter ? "#fff" : "#1a1a1a",
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

  // ── Editing mode ──
  if (editing) {
    return (
      <div style={cellStyle} ref={cellElRef}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%", height: "100%", border: "none", outline: "none",
            resize: "none", textAlign: "center", backgroundColor: "transparent",
            color: "inherit", fontWeight: "inherit", fontSize: "inherit",
            fontFamily: "inherit", lineHeight: "1.3", padding: "0",
          }}
          maxLength={60}
        />
      </div>
    );
  }

  // ── Display mode ──
  return (
    <div
      ref={cellElRef}
      style={cellStyle}
      onClick={() => { if (!isCenterReadOnly) setEditing(true); }}
      onMouseEnter={(e) => {
        if (isFocusView && !isCenter)
          e.currentTarget.style.boxShadow = `0 2px 8px ${palette.border}33`;
      }}
      onMouseLeave={(e) => {
        if (isFocusView && !isCenter)
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      {/* ↑ button — top-left of center cell, depth >= 1 */}
      {canDrillUp && (
        <button
          onClick={(e) => { e.stopPropagation(); onDrillUp(); }}
          title="上の階層へ戻る (Alt+U)"
          style={{
            position: "absolute", top: "3px", left: "3px",
            width: btnSize, height: btnSize, borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.5)",
            backgroundColor: "rgba(255,255,255,0.25)",
            color: "#fff", fontSize: btnFont, lineHeight: "1",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 0, fontFamily: "inherit",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.45)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"}
        >↑</button>
      )}

      {/* Cell text */}
      <span style={{
        opacity: cell.text ? 1 : 0.3,
        fontSize: cell.text ? fontSize : placeholderSize,
        padding: isCenter && canDrillUp ? `0 ${Math.round(parseInt(btnSize) / 2)}px` : "0",
      }}>
        {cell.text || (isFocusView ? (isCenter ? "" : "クリックして入力") : "")}
      </span>

      {/* ↓ button — bottom-right of related cells (focus view only) */}
      {canDrillDown && isFocusView && (
        <button
          onClick={(e) => { e.stopPropagation(); onDrillDown(cell); }}
          title="下の階層へ展開 (Alt+Ctrl+数字)"
          style={{
            position: "absolute", bottom: "3px", right: "3px",
            width: btnSize, height: btnSize, borderRadius: "4px",
            border: `1px solid ${palette.border}66`,
            backgroundColor: hasChildren ? palette.border : "rgba(0,0,0,0.06)",
            color: hasChildren ? "#fff" : palette.border,
            fontSize: btnFont, lineHeight: "1",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 0, fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = palette.border;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = hasChildren ? palette.border : "rgba(0,0,0,0.06)";
            e.currentTarget.style.color = hasChildren ? "#fff" : palette.border;
          }}
        >↓</button>
      )}

      {/* Indicator dot for cells with children (overview) */}
      {hasChildren && !isFocusView && (
        <div style={{
          position: "absolute", bottom: "2px", right: "2px",
          width: "5px", height: "5px", borderRadius: "50%",
          backgroundColor: palette.border, opacity: 0.6,
        }} />
      )}
    </div>
  );
}

// ── Unit Grid (3×3) ──────────────────────────────────────
function UnitGrid({
  unit, palette, isFocusView, isTopLevel, onUpdate,
  onDrillDown, onDrillUp, currentDepth, registerCellRef, fontScale,
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      gap: isFocusView ? `${Math.max(4, 6 * (fontScale || 1))}px` : "2px",
      aspectRatio: "1",
      width: "100%",
      height: "100%",
    }}>
      {unit.cells.map((cell) => (
        <EditableCell
          key={cell.id}
          cell={cell}
          isCenter={cell.position === CENTER}
          palette={palette}
          isFocusView={isFocusView}
          isTopLevel={isTopLevel}
          onUpdate={onUpdate}
          onDrillDown={onDrillDown}
          onDrillUp={onDrillUp}
          currentDepth={currentDepth}
          registerCellRef={registerCellRef}
          fontScale={fontScale}
        />
      ))}
    </div>
  );
}

// ── Overview View ────────────────────────────────────────
// Shows current unit (center) + child units of each related cell
function OverviewView({ unit, palette, onUpdate, onGridClick, isTopLevel, currentDepth }) {
  const grids = POSITIONS.map((pos) => {
    if (pos === CENTER) {
      return { unit, isCurrent: true, palette: PALETTES[4], cellRef: null };
    }
    const cell = unit.cells[pos];
    const childUnit = cell.children;
    return {
      unit: childUnit,
      isCurrent: false,
      palette: PALETTES[pos % PALETTES.length],
      cellRef: cell,
    };
  });

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      gap: "8px",
      maxWidth: "700px",
      margin: "0 auto",
      padding: "16px",
    }}>
      {grids.map((g, idx) => (
        <div
          key={idx}
          onClick={() => onGridClick(idx)}
          style={{
            cursor: "pointer",
            borderRadius: "10px",
            border: g.isCurrent
              ? `2px solid ${PALETTES[4].center}`
              : `1px solid #e0e0e0`,
            padding: "4px",
            backgroundColor: g.isCurrent ? "#faf8ff" : "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "1",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
          }}
        >
          {g.unit ? (
            <UnitGrid
              unit={g.isCurrent ? g.unit : {
                ...g.unit,
                cells: g.unit.cells.map((c, i) =>
                  i === CENTER ? { ...c, text: g.cellRef?.text || c.text } : c
                ),
              }}
              palette={g.palette}
              isFocusView={false}
              isTopLevel={g.isCurrent && isTopLevel}
              onUpdate={onUpdate}
              onDrillDown={() => {}}
              onDrillUp={() => {}}
              currentDepth={currentDepth}
            />
          ) : (
            // No child unit: show cell text as clickable placeholder
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: g.cellRef?.text ? "#555" : "#ccc",
              fontSize: g.cellRef?.text ? "13px" : "11px",
              fontWeight: g.cellRef?.text ? "500" : "400",
              fontStyle: g.cellRef?.text ? "normal" : "italic",
              textAlign: "center", padding: "12px",
              borderRadius: "6px",
              backgroundColor: g.cellRef?.text ? `${g.palette.bg}` : "transparent",
              transition: "background-color 0.15s",
            }}>
              {g.cellRef?.text || ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Focus (Unit) View ────────────────────────────────────
// Key → cell position mapping
// Layout mirrors 3×3 grid (7=top-left, 5=center, 3=bottom-right)
// Supports both numpad and regular digit keys for laptop compatibility
const KEY_TO_POSITION = {
  "Numpad7": 0, "Numpad8": 1, "Numpad9": 2,
  "Numpad4": 3, "Numpad5": 4, "Numpad6": 5,
  "Numpad1": 6, "Numpad2": 7, "Numpad3": 8,
  "Digit7": 0, "Digit8": 1, "Digit9": 2,
  "Digit4": 3, "Digit5": 4, "Digit6": 5,
  "Digit1": 6, "Digit2": 7, "Digit3": 8,
};

function FocusView({ unit, palette, onUpdate, onDrillDown, onDrillUp, isTopLevel, currentDepth }) {
  const cellRefs = useRef({});

  const registerCellRef = useCallback((position, ref) => {
    cellRefs.current[position] = ref;
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;

      // Alt + U → drill up
      if (e.code === "KeyU" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        onDrillUp();
        return;
      }

      const pos = KEY_TO_POSITION[e.code];
      if (pos === undefined) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Alt + Ctrl + number → drill down into that cell
        if (pos === CENTER) return; // Can't drill down into center
        const cell = unit.cells[pos];
        if (cell && cell.text.trim()) {
          onDrillDown(cell);
        }
      } else {
        // Alt + number → focus cell (start editing)
        const cellEl = cellRefs.current[pos];
        if (cellEl) cellEl.click();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [unit, onDrillDown, onDrillUp]);

  // Calculate unit size based on viewport shorter edge
  const [unitSize, setUnitSize] = useState(400);

  useEffect(() => {
    const calcSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerHeight = 52;
      const breadcrumbHeight = 36;
      const footerHeight = 40;
      const padding = 40; // top + bottom padding
      const availableW = vw - 40; // horizontal padding
      const availableH = vh - headerHeight - breadcrumbHeight - footerHeight - padding;
      const size = Math.min(availableW, availableH);
      setUnitSize(Math.max(280, size)); // minimum 280px
    };
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, []);

  // Font scale factor relative to base size (400px)
  const scale = unitSize / 400;

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "8px 16px",
      minHeight: `${unitSize + 16}px`,
    }}>
      <div style={{ width: `${unitSize}px`, height: `${unitSize}px` }}>
        <UnitGrid
          unit={unit}
          palette={palette}
          isFocusView={true}
          isTopLevel={isTopLevel}
          onUpdate={onUpdate}
          onDrillDown={onDrillDown}
          onDrillUp={onDrillUp}
          currentDepth={currentDepth}
          registerCellRef={registerCellRef}
          fontScale={scale}
        />
      </div>
    </div>
  );
}

// ── Breadcrumb ───────────────────────────────────────────
function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav style={{
      padding: "10px 20px",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      flexWrap: "wrap",
      minHeight: "36px",
    }}>
      {path.map((crumb, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {i > 0 && <span style={{ color: "#ccc", fontSize: "11px" }}>›</span>}
          <span
            onClick={() => onNavigate(i)}
            style={{
              cursor: "pointer",
              color: i === path.length - 1 ? "#1a1a1a" : "#1565C0",
              fontWeight: i === path.length - 1 ? "600" : "400",
              textDecoration: i < path.length - 1 ? "underline" : "none",
              textDecorationColor: "#1565C044",
              textUnderlineOffset: "2px",
              padding: "2px 4px",
              borderRadius: "4px",
              transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (i < path.length - 1) e.currentTarget.style.backgroundColor = "#e3f2fd";
            }}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            {crumb.label || "（未入力）"}
          </span>
        </span>
      ))}
    </nav>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function MandalaChartApp() {
  const [chart, setChart] = useState(createChart);
  const [view, setView] = useState("unit"); // "unit" | "overview"
  // Navigation: stack of unit IDs
  const [navStack, setNavStack] = useState(() => [chart.rootUnit.id]);

  // Get current unit by walking the tree
  const getCurrentUnit = useCallback((root, unitId) => {
    if (root.id === unitId) return root;
    for (const cell of root.cells) {
      if (cell.children) {
        const found = getCurrentUnit(cell.children, unitId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const currentUnitId = navStack[navStack.length - 1];
  const currentUnit = useMemo(
    () => getCurrentUnit(chart.rootUnit, currentUnitId),
    [chart.rootUnit, currentUnitId, getCurrentUnit]
  );
  const isTopLevel = navStack.length === 1;
  const currentDepth = navStack.length - 1;

  // Build breadcrumb path
  const breadcrumbs = useMemo(() => {
    const path = findUnitPath(chart.rootUnit, currentUnitId) || [chart.rootUnit];
    return path.map((u, i) => ({
      unitId: u.id,
      label: i === 0
        ? (u.cells[CENTER].text || "主題")
        : (u.cells[CENTER].text || "未入力"),
    }));
  }, [chart.rootUnit, currentUnitId]);

  // ── Actions ──
  const updateCell = useCallback((cellId, text) => {
    setChart((prev) => {
      const newRoot = updateCellInUnit(prev.rootUnit, cellId, text);
      const synced = syncCenterText(newRoot);
      return { ...prev, rootUnit: synced, updatedAt: new Date().toISOString() };
    });
  }, []);

  const drillDown = useCallback((cell) => {
    setChart((prev) => {
      const newRoot = ensureChildUnit(prev.rootUnit, cell.id);
      const synced = syncCenterText(newRoot);
      // Find the child unit ID
      const findChildId = (unit, targetCellId) => {
        for (const c of unit.cells) {
          if (c.id === targetCellId && c.children) return c.children.id;
          if (c.children) {
            const r = findChildId(c.children, targetCellId);
            if (r) return r;
          }
        }
        return null;
      };
      const childId = findChildId(synced, cell.id);
      if (childId) {
        setNavStack((s) => [...s, childId]);
        setView("unit");
      }
      return { ...prev, rootUnit: synced, updatedAt: new Date().toISOString() };
    });
  }, []);

  const drillUp = useCallback(() => {
    if (navStack.length > 1) {
      setNavStack((s) => s.slice(0, -1));
    }
  }, [navStack]);

  const navigateBreadcrumb = useCallback((index) => {
    setNavStack((s) => s.slice(0, index + 1));
  }, []);

  const handleOverviewGridClick = useCallback((gridIndex) => {
    if (!currentUnit) return;
    if (gridIndex === CENTER) {
      setView("unit");
      return;
    }
    const cell = currentUnit.cells[gridIndex];
    if (cell.children) {
      // 子ユニットが既にある → そのまま遷移
      setNavStack((s) => [...s, cell.children.id]);
      setView("unit");
    } else if (cell.text.trim()) {
      // テキストはあるが子ユニット未作成 → 作成して遷移
      drillDown(cell);
    }
  }, [currentUnit, drillDown]);

  const resetChart = () => {
    if (confirm("チャートをリセットしますか？すべてのデータが失われます。")) {
      _idCounter = 0;
      const newChart = createChart();
      setChart(newChart);
      setNavStack([newChart.rootUnit.id]);
      setView("unit");
    }
  };

  const exportJSON = () => {
    const data = JSON.stringify(chart, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mandala-chart-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Current palette based on depth
  const unitPalette = PALETTES[currentDepth % PALETTES.length];

  if (!currentUnit) {
    setNavStack([chart.rootUnit.id]);
    return null;
  }

  // ── Render ──
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fafafa",
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', sans-serif",
      color: "#1a1a1a",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Header ── */}
      <header style={{
        padding: "12px 20px",
        borderBottom: "1px solid #e8e8e8",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "7px",
            background: "linear-gradient(135deg, #512DA8, #1565C0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "14px", fontWeight: "700",
          }}>曼</div>
          <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, letterSpacing: "0.02em" }}>
            マンダラチャート
          </h1>
          <span style={{
            fontSize: "10px", color: "#aaa", backgroundColor: "#f5f5f5",
            padding: "2px 6px", borderRadius: "4px",
          }}>
            階層: {currentDepth + 1}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* View Switcher */}
          <div style={{
            display: "flex", gap: "2px",
            backgroundColor: "#f0f0f0", borderRadius: "8px", padding: "3px",
          }}>
            {[
              { key: "overview", label: "俯瞰" },
              { key: "unit", label: "ユニット" },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                style={{
                  padding: "5px 14px", borderRadius: "6px", border: "none",
                  fontSize: "12px", fontWeight: view === v.key ? "600" : "400",
                  backgroundColor: view === v.key ? "#fff" : "transparent",
                  color: view === v.key ? "#1a1a1a" : "#888",
                  cursor: "pointer",
                  boxShadow: view === v.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={exportJSON}
            title="JSONエクスポート"
            style={{
              padding: "5px 10px", borderRadius: "6px",
              border: "1px solid #ddd", backgroundColor: "#fff",
              fontSize: "11px", color: "#666", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#999"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#ddd"}
          >📤 JSON</button>

          {/* Reset */}
          <button
            onClick={resetChart}
            style={{
              padding: "5px 10px", borderRadius: "6px",
              border: "1px solid #ddd", backgroundColor: "#fff",
              fontSize: "11px", color: "#999", cursor: "pointer",
            }}
          >リセット</button>
        </div>
      </header>

      {/* ── Breadcrumbs ── */}
      <Breadcrumbs path={breadcrumbs} onNavigate={navigateBreadcrumb} />

      {/* ── Content ── */}
      <main style={{ flex: 1, paddingBottom: "56px" }}>
        {view === "unit" && (
          <FocusView
            unit={currentUnit}
            palette={unitPalette}
            onUpdate={updateCell}
            onDrillDown={drillDown}
            onDrillUp={drillUp}
            isTopLevel={isTopLevel}
            currentDepth={currentDepth}
          />
        )}
        {view === "overview" && (
          <OverviewView
            unit={currentUnit}
            palette={unitPalette}
            onUpdate={updateCell}
            onGridClick={handleOverviewGridClick}
            isTopLevel={isTopLevel}
            currentDepth={currentDepth}
          />
        )}
      </main>

      {/* ── Footer Help ── */}
      <footer style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "8px 20px",
        backgroundColor: "#fff",
        borderTop: "1px solid #eee",
        fontSize: "11px", color: "#aaa",
        display: "flex", justifyContent: "center",
        gap: "20px", flexWrap: "wrap",
      }}>
        <span>クリック → 編集</span>
        <span>Enter → 確定</span>
        <span>Esc → キャンセル</span>
        <span>Alt+数字 → セル移動</span>
        <span>Alt+Ctrl+数字 → 下階層へ</span>
        <span>Alt+U → 上階層へ</span>
      </footer>
    </div>
  );
}
