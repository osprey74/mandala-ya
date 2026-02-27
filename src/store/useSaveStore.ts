import { create } from "zustand";

interface SaveState {
  /** 現在の保存ファイルパス（未保存なら null） */
  savePath: string | null;
  /** 未保存変更フラグ */
  isDirty: boolean;
  /** 自動保存 / 保存処理中フラグ */
  isSaving: boolean;
  /** 最後に保存が完了した時刻（ms）。保存通知のトリガーに使う */
  lastSavedAt: number | null;
  /** 最後にエクスポートが完了した時刻（ms）。エクスポート通知のトリガーに使う */
  lastExportedAt: number | null;
}

interface SaveActions {
  setSavePath: (path: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  /** 保存完了時に呼ぶ。lastSavedAt を現在時刻で更新する */
  bumpSaved: () => void;
  /** エクスポート完了時に呼ぶ。lastExportedAt を現在時刻で更新する */
  bumpExported: () => void;
}

export const useSaveStore = create<SaveState & SaveActions>((set) => ({
  savePath: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  lastExportedAt: null,

  setSavePath: (path) => set({ savePath: path }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  bumpSaved: () => set({ lastSavedAt: Date.now() }),
  bumpExported: () => set({ lastExportedAt: Date.now() }),
}));

/** 保存ディレクトリを返す（savePath が null なら null） */
export function getSaveDir(savePath: string | null): string | null {
  if (!savePath) return null;
  // Windows / Unix 両対応
  const sep = savePath.includes("\\") ? "\\" : "/";
  const parts = savePath.split(sep);
  parts.pop();
  return parts.join(sep) || sep;
}
