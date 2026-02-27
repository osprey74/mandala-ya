import type { MandalaCell, MandalaUnit, MandalaChart } from "../types/mandala";
import { CENTER } from "../constants/palettes";

let _idCounter = 0;
const genId = () => `cell-${++_idCounter}`;
const genUnitId = () => `unit-${++_idCounter}`;

export function createUnit(centerText = ""): MandalaUnit {
  const unitId = genUnitId();
  const cells: MandalaCell[] = Array.from({ length: 9 }, (_, pos) => ({
    id: genId(),
    text: pos === CENTER ? centerText : "",
    position: pos,
    children: null,
    image: null,
  }));
  return { id: unitId, cells };
}

export function createChart(): MandalaChart {
  return {
    id: `chart-${Date.now()}`,
    title: "マンダラチャート",
    rootUnit: createUnit(""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateCellInUnit(
  unit: MandalaUnit,
  cellId: string,
  newText: string,
): MandalaUnit {
  let changed = false;
  const newCells = unit.cells.map((cell) => {
    if (cell.id === cellId) {
      if (cell.text === newText) return cell;
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

export function setCellImageInUnit(
  unit: MandalaUnit,
  cellId: string,
  image: string | null,
): MandalaUnit {
  let changed = false;
  const newCells = unit.cells.map((cell) => {
    if (cell.id === cellId) {
      changed = true;
      return { ...cell, image };
    }
    if (cell.children) {
      const newChild = setCellImageInUnit(cell.children, cellId, image);
      if (newChild !== cell.children) {
        changed = true;
        return { ...cell, children: newChild };
      }
    }
    return cell;
  });
  return changed ? { ...unit, cells: newCells } : unit;
}

export function ensureChildUnit(unit: MandalaUnit, cellId: string): MandalaUnit {
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

export function syncCenterText(unit: MandalaUnit): MandalaUnit {
  const newCells = unit.cells.map((cell) => {
    if (cell.children) {
      const childCells = cell.children.cells.map((cc, i) =>
        i === CENTER ? { ...cc, text: cell.text, image: cell.image } : cc,
      );
      const syncedChild = syncCenterText({ ...cell.children, cells: childCells });
      return { ...cell, children: syncedChild };
    }
    return cell;
  });
  return { ...unit, cells: newCells };
}

export function findUnitById(
  unit: MandalaUnit,
  targetUnitId: string,
): MandalaUnit | null {
  if (unit.id === targetUnitId) return unit;
  for (const cell of unit.cells) {
    if (cell.children) {
      const found = findUnitById(cell.children, targetUnitId);
      if (found) return found;
    }
  }
  return null;
}

export function findUnitPath(
  unit: MandalaUnit,
  targetUnitId: string,
  path: MandalaUnit[] = [],
): MandalaUnit[] | null {
  if (unit.id === targetUnitId) return [...path, unit];
  for (const cell of unit.cells) {
    if (cell.children) {
      const result = findUnitPath(cell.children, targetUnitId, [...path, unit]);
      if (result) return result;
    }
  }
  return null;
}

export interface BreadcrumbItem {
  unitId: string;
  label: string;
}

export function buildBreadcrumbs(
  rootUnit: MandalaUnit,
  currentUnitId: string,
): BreadcrumbItem[] {
  const path = findUnitPath(rootUnit, currentUnitId) ?? [rootUnit];
  return path.map((u, i) => ({
    unitId: u.id,
    label:
      i === 0
        ? u.cells[CENTER].text || "主題"
        : u.cells[CENTER].text || "未入力",
  }));
}

export function swapCellsInUnit(
  unit: MandalaUnit,
  unitId: string,
  posA: number,
  posB: number,
): MandalaUnit {
  if (unit.id === unitId) {
    const newCells = unit.cells.map((cell) => {
      if (cell.position === posA) {
        const other = unit.cells.find((c) => c.position === posB)!;
        return { ...cell, text: other.text, children: other.children, image: other.image };
      }
      if (cell.position === posB) {
        const other = unit.cells.find((c) => c.position === posA)!;
        return { ...cell, text: other.text, children: other.children, image: other.image };
      }
      return cell;
    });
    return { ...unit, cells: newCells };
  }
  let changed = false;
  const newCells = unit.cells.map((cell) => {
    if (cell.children) {
      const newChild = swapCellsInUnit(cell.children, unitId, posA, posB);
      if (newChild !== cell.children) {
        changed = true;
        return { ...cell, children: newChild };
      }
    }
    return cell;
  });
  return changed ? { ...unit, cells: newCells } : unit;
}

export function findChildUnitId(unit: MandalaUnit, cellId: string): string | null {
  for (const cell of unit.cells) {
    if (cell.id === cellId && cell.children) return cell.children.id;
    if (cell.children) {
      const r = findChildUnitId(cell.children, cellId);
      if (r) return r;
    }
  }
  return null;
}

// ----------------------------------------------------------------
// エクスポート用変換
// ----------------------------------------------------------------

/**
 * Markdown 形式に変換（H1=主題, H2=ブランチ, H3=サブブランチ）
 * @param imagesDirName 画像ディレクトリ名（例: "目標設定2026_images"）。指定時は画像参照を出力
 */
export function chartToMarkdown(chart: MandalaChart, imagesDirName?: string): string {
  const root = chart.rootUnit;
  const rootTheme = root.cells[CENTER].text || chart.title;
  const lines: string[] = [`# ${rootTheme}`, ""];

  for (const cell of root.cells) {
    if (cell.position === CENTER) continue;
    if (!cell.text.trim() && !cell.image) continue;

    if (cell.text.trim()) {
      lines.push(`## ${cell.text}`);
    }
    if (cell.image && imagesDirName) {
      lines.push(`![${cell.text.trim() || "image"}](${imagesDirName}/${cell.image})`);
    }
    lines.push("");

    if (cell.children) {
      for (const child of cell.children.cells) {
        if (child.position === CENTER) continue;
        if (!child.text.trim() && !child.image) continue;

        if (child.text.trim()) {
          lines.push(`### ${child.text}`);
        }
        if (child.image && imagesDirName) {
          lines.push(`![${child.text.trim() || "image"}](${imagesDirName}/${child.image})`);
        }
      }
      lines.push("");
    }
  }
  return lines.join("\n").trimEnd();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** OPML 形式に変換 */
export function chartToOpml(chart: MandalaChart): string {
  const root = chart.rootUnit;
  const rootTheme = root.cells[CENTER].text || chart.title;
  const ind = (n: number) => "  ".repeat(n);
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    `${ind(1)}<head><title>${escapeXml(rootTheme)}</title></head>`,
    `${ind(1)}<body>`,
    `${ind(2)}<outline text="${escapeXml(rootTheme)}">`,
  ];

  for (const cell of root.cells) {
    if (cell.position === CENTER) continue;
    if (!cell.text.trim()) continue;
    const subItems =
      cell.children?.cells.filter(
        (c) => c.position !== CENTER && c.text.trim(),
      ) ?? [];
    if (subItems.length > 0) {
      lines.push(`${ind(3)}<outline text="${escapeXml(cell.text)}">`);
      for (const child of subItems) {
        lines.push(`${ind(4)}<outline text="${escapeXml(child.text)}"/>`);
      }
      lines.push(`${ind(3)}</outline>`);
    } else {
      lines.push(`${ind(3)}<outline text="${escapeXml(cell.text)}"/>`);
    }
  }

  lines.push(`${ind(2)}</outline>`);
  lines.push(`${ind(1)}</body>`);
  lines.push("</opml>");
  return lines.join("\n");
}
