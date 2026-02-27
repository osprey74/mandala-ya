import { create } from "zustand";
import { temporal } from "zundo";
import type { MandalaChart, MandalaCell } from "../types/mandala";
import {
  createChart,
  updateCellInUnit,
  setCellImageInUnit,
  ensureChildUnit,
  syncCenterText,
  findUnitById,
  buildBreadcrumbs,
  swapCellsInUnit,
  findChildUnitId,
} from "../utils/mandalaHelpers";
export type { BreadcrumbItem } from "../utils/mandalaHelpers";

export type ViewMode = "unit" | "overview";

export interface MandalaState {
  chart: MandalaChart;
  navStack: string[];
  forwardStack: string[];
  view: ViewMode;
  focusedPosition: number | null;
  // Actions
  updateCell: (cellId: string, text: string) => void;
  setCellImage: (cellId: string, image: string | null) => void;
  drillDown: (cell: MandalaCell) => void;
  drillUp: () => void;
  drillForward: () => void;
  navigateBreadcrumb: (index: number) => void;
  setView: (view: ViewMode) => void;
  toggleView: () => void;
  setFocusedPosition: (pos: number | null) => void;
  swapCells: (unitId: string, posA: number, posB: number) => void;
  resetNavIfNeeded: () => void;
  /** ファイル読み込み時にチャートをセットし、ナビゲーション状態をリセットする */
  initFromFile: (chart: MandalaChart) => void;
}

const initialChart = createChart();

export const useMandalaStore = create<MandalaState>()(
  temporal(
    (set, get) => ({
      chart: initialChart,
      navStack: [initialChart.rootUnit.id],
      forwardStack: [] as string[],
      view: "unit" as ViewMode,
      focusedPosition: null as number | null,

      updateCell: (cellId: string, text: string) => {
        set((state) => {
          const newRoot = updateCellInUnit(state.chart.rootUnit, cellId, text);
          const synced = syncCenterText(newRoot);
          return {
            chart: {
              ...state.chart,
              rootUnit: synced,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      setCellImage: (cellId: string, image: string | null) => {
        set((state) => {
          const newRoot = setCellImageInUnit(state.chart.rootUnit, cellId, image);
          return {
            chart: {
              ...state.chart,
              rootUnit: newRoot,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      drillDown: (cell: MandalaCell) => {
        set((state) => {
          const newRoot = ensureChildUnit(state.chart.rootUnit, cell.id);
          const synced = syncCenterText(newRoot);
          const childId = findChildUnitId(synced, cell.id);
          if (!childId) return { chart: { ...state.chart, rootUnit: synced } };
          return {
            chart: {
              ...state.chart,
              rootUnit: synced,
              updatedAt: new Date().toISOString(),
            },
            navStack: [...state.navStack, childId],
            forwardStack: [],
            view: "unit" as ViewMode,
          };
        });
      },

      drillUp: () => {
        const state = get();
        if (state.navStack.length <= 1) return;
        const currentId = state.navStack[state.navStack.length - 1];
        set({
          navStack: state.navStack.slice(0, -1),
          forwardStack: [currentId, ...state.forwardStack],
        });
      },

      drillForward: () => {
        const state = get();
        if (state.forwardStack.length === 0) return;
        const [nextId, ...rest] = state.forwardStack;
        if (!findUnitById(state.chart.rootUnit, nextId)) return;
        set({
          navStack: [...state.navStack, nextId],
          forwardStack: rest,
        });
      },

      navigateBreadcrumb: (index: number) => {
        set((state) => ({
          navStack: state.navStack.slice(0, index + 1),
          forwardStack: [],
        }));
      },

      setView: (view: ViewMode) => set({ view }),

      toggleView: () =>
        set((state) => ({
          view: state.view === "unit" ? "overview" : "unit",
        })),

      setFocusedPosition: (pos: number | null) => set({ focusedPosition: pos }),

      swapCells: (unitId: string, posA: number, posB: number) => {
        set((state) => {
          const newRoot = swapCellsInUnit(state.chart.rootUnit, unitId, posA, posB);
          const synced = syncCenterText(newRoot);
          return {
            chart: {
              ...state.chart,
              rootUnit: synced,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      resetNavIfNeeded: () => {
        const state = get();
        const currentId = state.navStack[state.navStack.length - 1];
        if (!findUnitById(state.chart.rootUnit, currentId)) {
          set({ navStack: [state.chart.rootUnit.id], forwardStack: [] });
        }
      },

      initFromFile: (chart: MandalaChart) => {
        set({
          chart,
          navStack: [chart.rootUnit.id],
          forwardStack: [],
          view: "unit" as ViewMode,
          focusedPosition: null,
        });
      },
    }),
    {
      limit: 64,
      partialize: (state) => ({ chart: state.chart }),
    },
  ),
);

// Selector hooks
export function useCurrentUnit() {
  return useMandalaStore((state) => {
    const currentId = state.navStack[state.navStack.length - 1];
    return findUnitById(state.chart.rootUnit, currentId);
  });
}

export function useIsTopLevel() {
  return useMandalaStore((state) => state.navStack.length === 1);
}

export function useCurrentDepth() {
  return useMandalaStore((state) => state.navStack.length - 1);
}

export function useCurrentUnitId() {
  return useMandalaStore(
    (state) => state.navStack[state.navStack.length - 1],
  );
}

// useBreadcrumbs はセレクター内で新規配列を生成するため無限ループになる。
// App 側で useMemo + buildBreadcrumbs を使うこと。
export { buildBreadcrumbs };
