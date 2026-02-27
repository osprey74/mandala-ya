import { describe, it, expect } from "vitest";
import {
  createUnit,
  createChart,
  updateCellInUnit,
  swapCellsInUnit,
  ensureChildUnit,
  findUnitById,
  buildBreadcrumbs,
  chartToMarkdown,
  chartToOpml,
} from "../utils/mandalaHelpers";
import { CENTER } from "../constants/palettes";

// ─── createUnit ───────────────────────────────────────────────
describe("createUnit", () => {
  it("9セルを持つユニットを作成する", () => {
    const unit = createUnit("テーマ");
    expect(unit.cells).toHaveLength(9);
  });

  it("中心セル (position=4) にテキストを設定する", () => {
    const unit = createUnit("テーマ");
    expect(unit.cells[CENTER].text).toBe("テーマ");
  });

  it("中心以外のセルは空文字", () => {
    const unit = createUnit("テーマ");
    unit.cells.filter((c) => c.position !== CENTER).forEach((c) => {
      expect(c.text).toBe("");
    });
  });
});

// ─── createChart ──────────────────────────────────────────────
describe("createChart", () => {
  it("id と rootUnit を持つ", () => {
    const chart = createChart();
    expect(chart.id).toBeTruthy();
    expect(chart.rootUnit).toBeDefined();
  });

  it("rootUnit は 9 セルを持つ", () => {
    const chart = createChart();
    expect(chart.rootUnit.cells).toHaveLength(9);
  });
});

// ─── updateCellInUnit ─────────────────────────────────────────
describe("updateCellInUnit", () => {
  it("対象セルのテキストを更新する", () => {
    const unit = createUnit("主題");
    const target = unit.cells[0];
    const updated = updateCellInUnit(unit, target.id, "新しいテキスト");
    expect(updated.cells[0].text).toBe("新しいテキスト");
  });

  it("変更がない場合は同一参照を返す", () => {
    const unit = createUnit("主題");
    const target = unit.cells[0];
    const updated = updateCellInUnit(unit, target.id, target.text);
    expect(updated).toBe(unit);
  });

  it("子ユニットのセルも再帰的に更新する", () => {
    let unit = createUnit("主題");
    const cell = unit.cells[0];
    unit = ensureChildUnit(unit, cell.id);
    const childUnit = unit.cells[0].children!;
    const childCell = childUnit.cells[1];
    const updated = updateCellInUnit(unit, childCell.id, "子テキスト");
    const updatedChild = updated.cells[0].children!;
    expect(updatedChild.cells[1].text).toBe("子テキスト");
  });
});

// ─── swapCellsInUnit ──────────────────────────────────────────
describe("swapCellsInUnit", () => {
  it("同一ユニット内のセルを入れ替える", () => {
    let unit = createUnit("主題");
    const cellA = unit.cells[0];
    const cellB = unit.cells[1];
    // テキストを設定
    unit = updateCellInUnit(unit, cellA.id, "A");
    unit = updateCellInUnit(unit, cellB.id, "B");

    const swapped = swapCellsInUnit(unit, unit.id, 0, 1);
    expect(swapped.cells[0].text).toBe("B");
    expect(swapped.cells[1].text).toBe("A");
  });

  it("異なるユニット ID では変更しない", () => {
    const unit = createUnit("主題");
    const swapped = swapCellsInUnit(unit, "nonexistent-id", 0, 1);
    expect(swapped).toBe(unit);
  });
});

// ─── ensureChildUnit ──────────────────────────────────────────
describe("ensureChildUnit", () => {
  it("子ユニットが存在しない場合に作成する", () => {
    const unit = createUnit("主題");
    const cell = unit.cells[0];
    expect(cell.children).toBeNull();
    const updated = ensureChildUnit(unit, cell.id);
    expect(updated.cells[0].children).not.toBeNull();
  });

  it("既に子ユニットがある場合は子の内容を変更しない", () => {
    let unit = createUnit("主題");
    const cell = unit.cells[0];
    unit = ensureChildUnit(unit, cell.id);
    const childIdBefore = unit.cells[0].children!.id;
    const again = ensureChildUnit(unit, cell.id);
    expect(again.cells[0].children!.id).toBe(childIdBefore);
  });
});

// ─── findUnitById ─────────────────────────────────────────────
describe("findUnitById", () => {
  it("ルートユニットを見つける", () => {
    const unit = createUnit("主題");
    expect(findUnitById(unit, unit.id)).toBe(unit);
  });

  it("子ユニットを再帰的に見つける", () => {
    let unit = createUnit("主題");
    unit = ensureChildUnit(unit, unit.cells[0].id);
    const child = unit.cells[0].children!;
    expect(findUnitById(unit, child.id)).toBe(child);
  });

  it("存在しない ID は null を返す", () => {
    const unit = createUnit("主題");
    expect(findUnitById(unit, "nonexistent")).toBeNull();
  });
});

// ─── buildBreadcrumbs ─────────────────────────────────────────
describe("buildBreadcrumbs", () => {
  it("ルートのみの場合は 1 要素", () => {
    const unit = createUnit("主題");
    const crumbs = buildBreadcrumbs(unit, unit.id);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("主題");
  });

  it("テキスト空のルートは「主題」ラベル", () => {
    const unit = createUnit("");
    const crumbs = buildBreadcrumbs(unit, unit.id);
    expect(crumbs[0].label).toBe("主題");
  });

  it("子ユニットへのパスを返す", () => {
    let unit = createUnit("根");
    unit = updateCellInUnit(unit, unit.cells[0].id, "枝");
    unit = ensureChildUnit(unit, unit.cells[0].id);
    const child = unit.cells[0].children!;
    const crumbs = buildBreadcrumbs(unit, child.id);
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("根");
  });
});

// ─── chartToMarkdown ──────────────────────────────────────────
describe("chartToMarkdown", () => {
  it("H1 に主題を出力する", () => {
    const chart = createChart();
    chart.rootUnit = updateCellInUnit(chart.rootUnit, chart.rootUnit.cells[CENTER].id, "目標");
    chart.rootUnit = updateCellInUnit(chart.rootUnit, chart.rootUnit.cells[0].id, "行動1");
    const md = chartToMarkdown(chart);
    expect(md).toContain("# 目標");
    expect(md).toContain("## 行動1");
  });

  it("テキストが空のセルは出力しない", () => {
    const chart = createChart();
    chart.rootUnit = updateCellInUnit(chart.rootUnit, chart.rootUnit.cells[CENTER].id, "主題");
    const md = chartToMarkdown(chart);
    expect(md.split("\n").filter((l) => l.startsWith("##"))).toHaveLength(0);
  });
});

// ─── chartToOpml ──────────────────────────────────────────────
describe("chartToOpml", () => {
  it("OPML ヘッダーを含む", () => {
    const chart = createChart();
    const opml = chartToOpml(chart);
    expect(opml).toContain('<?xml version="1.0"');
    expect(opml).toContain("<opml");
  });

  it("& をエスケープする", () => {
    const chart = createChart();
    chart.rootUnit = updateCellInUnit(chart.rootUnit, chart.rootUnit.cells[CENTER].id, "A&B");
    const opml = chartToOpml(chart);
    expect(opml).toContain("A&amp;B");
  });
});
