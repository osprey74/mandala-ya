import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import type { ModelId } from "../utils/claudeApi";

const STORE_FILE = "settings.json";
const KEY_API_KEY = "claudeApiKey";
const KEY_MODEL = "claudeModel";
const DEFAULT_MODEL: ModelId = "claude-haiku-4-5-20251001";

interface SettingsState {
  apiKey: string;
  model: ModelId;
  setApiKey: (key: string) => void;
  setModel: (model: ModelId) => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

async function getStore(): Promise<Store> {
  return Store.load(STORE_FILE, { autoSave: false, defaults: {} });
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: "",
  model: DEFAULT_MODEL,

  setApiKey: (key) => set({ apiKey: key }),
  setModel: (model) => set({ model }),

  load: async () => {
    try {
      const store = await getStore();
      const apiKey = (await store.get<string>(KEY_API_KEY)) ?? "";
      const model = (await store.get<ModelId>(KEY_MODEL)) ?? DEFAULT_MODEL;
      set({ apiKey, model });
    } catch {
      // 読み込み失敗はデフォルト値のまま継続
    }
  },

  save: async () => {
    const { apiKey, model } = get();
    try {
      const store = await getStore();
      await store.set(KEY_API_KEY, apiKey);
      await store.set(KEY_MODEL, model);
      await store.save();
    } catch (e) {
      console.error("AI設定の保存に失敗しました:", e);
    }
  },
}));
