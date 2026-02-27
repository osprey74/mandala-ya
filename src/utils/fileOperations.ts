import {
  readTextFile,
  writeTextFile,
  mkdir,
  copyFile,
  remove,
  readDir,
  exists,
} from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import type { MandalaChart } from "../types/mandala";
import { chartToMarkdown, chartToOpml } from "./mandalaHelpers";

// ----------------------------------------------------------------
// 起動時ファイル取得
// ----------------------------------------------------------------

/**
 * ダブルクリック起動時に OS から渡された .mandala ファイルパスを返す。
 * 通常起動（ファイル指定なし）の場合は null を返す。
 */
export async function getStartupFile(): Promise<string | null> {
  try {
    return await invoke<string | null>("get_startup_file");
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
// 設定ストア
// ----------------------------------------------------------------

const STORE_FILE = "settings.json";
const STORE_KEY_SAVE_PATH = "savePath";

async function getSettingsStore(): Promise<Store> {
  return Store.load(STORE_FILE, { autoSave: false, defaults: {} });
}

export async function loadSavedPath(): Promise<string | null> {
  try {
    const store = await getSettingsStore();
    const path = await store.get<string>(STORE_KEY_SAVE_PATH);
    return path ?? null;
  } catch {
    return null;
  }
}

export async function persistSavePath(path: string | null): Promise<void> {
  try {
    const store = await getSettingsStore();
    if (path === null) {
      await store.delete(STORE_KEY_SAVE_PATH);
    } else {
      await store.set(STORE_KEY_SAVE_PATH, path);
    }
    await store.save();
  } catch (e) {
    console.error("設定の保存に失敗しました:", e);
  }
}

// ----------------------------------------------------------------
// パスユーティリティ
// ----------------------------------------------------------------

/** ファイルパスからディレクトリ部分を返す */
export function dirOf(filePath: string): string {
  const sep = filePath.includes("\\") ? "\\" : "/";
  const parts = filePath.split(sep);
  parts.pop();
  return parts.join(sep) || sep;
}

/** パスを結合する（Windows / Unix 両対応） */
function joinPath(dir: string, ...parts: string[]): string {
  const sep = dir.includes("\\") ? "\\" : "/";
  const segments = [dir, ...parts].join(sep);
  return sep === "/" ? segments.replace(/\/+/g, "/") : segments;
}

// ----------------------------------------------------------------
// 画像ディレクトリ管理
// ----------------------------------------------------------------

/**
 * 画像ディレクトリの絶対パスを返す。
 * 仕様: {保存先ディレクトリ}/{JSONファイル名（拡張子除く）}_images
 * 例: /path/to/目標設定2026.mandala → /path/to/目標設定2026_images
 */
export function imagesDir(savePath: string): string {
  const sep = savePath.includes("\\") ? "\\" : "/";
  const parts = savePath.split(sep);
  const filename = parts[parts.length - 1] ?? "";
  const dotIdx = filename.lastIndexOf(".");
  const base = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  const dir = parts.slice(0, -1).join(sep) || sep;
  return joinPath(dir, `${base}_images`);
}

export async function ensureImagesDir(savePath: string): Promise<void> {
  const dir = imagesDir(savePath);
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
}

// ----------------------------------------------------------------
// ガベージコレクション
// ----------------------------------------------------------------

/** chart 内で参照されている画像ファイル名を収集 */
function collectUsedImages(chart: MandalaChart): Set<string> {
  const used = new Set<string>();
  function traverse(unit: MandalaChart["rootUnit"]) {
    for (const cell of unit.cells) {
      if (cell.image) {
        // ファイル名のみ（パス区切りがある場合は末尾を取る）
        const sep = cell.image.includes("\\") ? "\\" : "/";
        const parts = cell.image.split(sep);
        used.add(parts[parts.length - 1]);
      }
      if (cell.children) traverse(cell.children);
    }
  }
  traverse(chart.rootUnit);
  return used;
}

export async function gcImages(
  chart: MandalaChart,
  savePath: string
): Promise<void> {
  const dir = imagesDir(savePath);
  if (!(await exists(dir))) return;

  const used = collectUsedImages(chart);
  const entries = await readDir(dir);

  for (const entry of entries) {
    if (!entry.isDirectory && entry.name && !used.has(entry.name)) {
      try {
        await remove(joinPath(dir, entry.name));
      } catch (e) {
        console.warn("画像GCでエラー:", entry.name, e);
      }
    }
  }
}

// ----------------------------------------------------------------
// ファイル保存 / 読み込み
// ----------------------------------------------------------------

export async function saveChart(
  chart: MandalaChart,
  filePath: string
): Promise<void> {
  await ensureImagesDir(filePath);

  const data: MandalaChart = { ...chart, updatedAt: new Date().toISOString() };
  await writeTextFile(filePath, JSON.stringify(data, null, 2));

  // 保存後に未参照画像を削除
  await gcImages(data, filePath);
}

export async function loadChart(filePath: string): Promise<MandalaChart> {
  const text = await readTextFile(filePath);
  const data = JSON.parse(text) as MandalaChart;
  return data;
}

// ----------------------------------------------------------------
// 保存ダイアログ（新規保存 / 別名保存）
// ----------------------------------------------------------------

const MANDALA_FILTER = [
  { name: "Maṇḍalāya ファイル", extensions: ["mandala"] },
  { name: "JSON", extensions: ["json"] },
];

/**
 * 保存先ダイアログを開いてパスを返す。
 * キャンセル時は null を返す。
 */
export async function chooseSavePath(
  defaultPath?: string
): Promise<string | null> {
  const result = await save({
    defaultPath: defaultPath ?? "マンダラチャート.mandala",
    filters: MANDALA_FILTER,
  });
  return result ?? null;
}

// ----------------------------------------------------------------
// 開くダイアログ
// ----------------------------------------------------------------

/**
 * ファイルを開くダイアログを表示してチャートを読み込む。
 * キャンセル時は null を返す。
 */
export async function openChartFile(): Promise<{
  chart: MandalaChart;
  path: string;
} | null> {
  const result = await open({
    multiple: false,
    filters: MANDALA_FILTER,
  });
  if (!result) return null;

  const filePath = typeof result === "string" ? result : result[0];
  const chart = await loadChart(filePath);
  return { chart, path: filePath };
}

// ----------------------------------------------------------------
// JSON エクスポート（Tauri ダイアログ）
// ----------------------------------------------------------------

export async function exportChartJson(chart: MandalaChart): Promise<void> {
  const defaultName = `mandala-${Date.now()}.json`;
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!filePath) return;

  await writeTextFile(filePath, JSON.stringify(chart, null, 2));
}

// ----------------------------------------------------------------
// Markdown / OPML エクスポート
// ----------------------------------------------------------------

/**
 * Markdown エクスポート。
 * savePath を渡すと画像参照（![text](imagesDirName/file.jpg)）も出力する。
 */
export async function exportChartMarkdown(
  chart: MandalaChart,
  savePath?: string | null
): Promise<void> {
  const filePath = await save({
    defaultPath: `mandala-${Date.now()}.md`,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (!filePath) return;

  // 画像ディレクトリ名（例: "目標設定2026_images"）を元の保存パスから導出
  let imagesDirName: string | undefined;
  if (savePath) {
    const fullDir = imagesDir(savePath);
    const sep = fullDir.includes("\\") ? "\\" : "/";
    imagesDirName = fullDir.split(sep).pop();
  }

  await writeTextFile(filePath, chartToMarkdown(chart, imagesDirName));
}

export async function exportChartOpml(chart: MandalaChart): Promise<void> {
  const filePath = await save({
    defaultPath: `mandala-${Date.now()}.opml`,
    filters: [{ name: "OPML", extensions: ["opml", "xml"] }],
  });
  if (!filePath) return;
  await writeTextFile(filePath, chartToOpml(chart));
}

// ----------------------------------------------------------------
// 画像追加
// ----------------------------------------------------------------

const IMAGE_FILTERS = [
  {
    name: "画像ファイル",
    extensions: ["png", "jpg", "jpeg"],
  },
];

/**
 * 画像ファイル選択ダイアログを開き、{ファイル名}_images/ にコピーしてファイル名を返す。
 * 仕様: JSON には画像ファイル名のみ記録（例: "cell-abc123.png"）
 * キャンセル時は null を返す。
 */
export async function addImageToCell(savePath: string): Promise<string | null> {
  const result = await open({
    multiple: false,
    filters: IMAGE_FILTERS,
  });
  if (!result) return null;

  const srcPath = typeof result === "string" ? result : result[0];

  // 拡張子を取得
  const srcSep = srcPath.includes("\\") ? "\\" : "/";
  const srcName = srcPath.split(srcSep).pop() ?? "image";
  const ext = srcName.includes(".")
    ? srcName.split(".").pop()!.toLowerCase()
    : "jpg";

  // ユニークなファイル名を生成
  const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const destName = `${uuid}.${ext}`;

  await ensureImagesDir(savePath);
  const destPath = joinPath(imagesDir(savePath), destName);
  await copyFile(srcPath, destPath);

  // JSON に保存するのはファイル名のみ（仕様 §3.5）
  return destName;
}

// ----------------------------------------------------------------
// 画像の表示 URL を解決
// ----------------------------------------------------------------

/**
 * cell.image（ファイル名のみ または data URL）を WebView で表示可能な URL に変換する。
 * 仕様: 画像のフルパス = {JSONの保存先}/{JSONファイル名}_images/{image}
 *
 * 旧形式 (_images/xxx.jpg) も後方互換で処理する。
 */
export function resolveImageUrl(
  image: string | null,
  savePath: string | null
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("data:")) return image; // base64 (legacy)
  if (!savePath) return undefined;

  const sep = savePath.includes("\\") ? "\\" : "/";

  // 旧形式: "_images/xxx.jpg" → {saveDir}/_images/xxx.jpg
  if (image.startsWith("_images/") || image.startsWith("_images\\")) {
    const saveDir = dirOf(savePath);
    const normalizedImage = image.replace(/[/\\]/g, sep);
    return convertFileSrc(joinPath(saveDir, normalizedImage));
  }

  // 新形式: "xxx.jpg" → {savePath の _images ディレクトリ}/xxx.jpg
  const absPath = joinPath(imagesDir(savePath), image.replace(/[/\\]/g, sep));
  return convertFileSrc(absPath);
}
