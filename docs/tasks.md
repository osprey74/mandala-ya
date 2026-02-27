# Maṇḍalāya — タスク管理表

> 最終更新: 2026-02-27（Phase 7 完了）
> 凡例: ✅ 完了 / ⚠️ 部分実装 / ⬜ 未着手

---

## Phase 1: プロジェクト初期設定

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 1-1 | GitHub リポジトリ作成 | ✅ | [osprey74/mandala-ya](https://github.com/osprey74/mandala-ya) |
| 1-2 | Tauri v2 + React + TypeScript + Vite プロジェクト初期化 | ✅ | `create-tauri-app` 済み |
| 1-3 | プロトタイプを `docs/prototype/` に格納 | ✅ | `mandala-chart-v2.jsx` 配置済み |
| 1-4 | 状態管理ライブラリ導入（Zustand + zundo） | ✅ | `zustand` + `zundo` インストール済み |
| 1-5 | ディレクトリ構成の策定 | ✅ | `src/types`, `components`, `store`, `constants`, `utils` 構成済み |

---

## Phase 2: コアUIの移植

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 2-1 | `MandalaCell` / `MandalaUnit` / `MandalaChart` 型定義 | ✅ | `src/types/mandala.ts` |
| 2-2 | `EditableCell` コンポーネント | ✅ | `src/components/EditableCell.tsx` |
| 2-3 | `UnitGrid` コンポーネント | ✅ | `src/components/UnitGrid.tsx` |
| 2-4 | `FocusView`（ユニットビュー） | ✅ | `src/components/FocusView.tsx` |
| 2-5 | `OverviewView`（俯瞰ビュー） | ✅ | `src/components/OverviewView.tsx` |
| 2-6 | `Breadcrumbs` コンポーネント | ✅ | `src/components/Breadcrumbs.tsx` |
| 2-7 | レスポンシブサイズ計算ロジック（短辺追従） | ✅ | `FocusView` 内 `calcSize()` |
| 2-8 | カラーパレットシステム（9色） | ✅ | `src/constants/palettes.ts` |
| 2-9 | Undo/Redo（zundo temporal、64ステップ） | ✅ | `useMandalaStore.ts` の `temporal` ミドルウェア |
| 2-10 | ドラッグ&ドロップ（同一ユニット内の関連セル入れ替え） | ✅ | `EditableCell` の D&D ハンドラ |
| 2-11 | セルのレイヤー構造（テキスト上レイヤー＋画像下レイヤー） | ✅ | `EditableCell` の z-index 2層構造 |
| 2-12 | 🖼 画像追加ボタン（UIのみ） | ✅ | Tauri ファイルダイアログ実装済み |
| 2-13 | ↗ モーダルエディタ（1,024文字、`Intl.Segmenter`） | ✅ | `src/components/ModalEditor.tsx` |

---

## Phase 3: データ管理

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 3-1 | 再帰ツリーの CRUD ヘルパー関数 | ✅ | `src/utils/mandalaHelpers.ts` |
| 3-2 | 親子テキスト同期ロジック | ✅ | `syncCenterText` in store |
| 3-3 | Tauri fs API によるファイル保存/読み込み | ✅ | `src/utils/fileOperations.ts` |
| 3-4 | `tauri-plugin-store` による保存先パスの永続化 | ✅ | `settings.json` に `savePath` を保存 |
| 3-5 | 自動保存（commit 時、debounce 500ms） | ✅ | `App.tsx` useEffect |
| 3-6 | 起動時の保存先チェック＆ファイル読み込みフロー | ✅ | `App.tsx` startup useEffect |
| 3-7 | 💾 保存ボタン（ファイルダイアログで保存先設定/変更） | ✅ | `handleSave` in `App.tsx` |
| 3-8 | `_images/` フォルダ管理（作成・画像コピー） | ✅ | `ensureImagesDir` + `addImageToCell` |
| 3-9 | 画像ガベージコレクション（保存時に未参照画像削除） | ✅ | `gcImages` in `fileOperations.ts` |
| 3-10 | JSON インポート機能 | ✅ | 「開く」ボタン（`handleOpen`）として実装 |

---

## Phase 4: キーボード操作

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 4-1 | `Alt + 数字/テンキー` → セルフォーカス & 編集開始 | ✅ | `FocusView` キーハンドラ |
| 4-2 | `Alt + Ctrl + 数字` → ドリルダウン | ✅ | `FocusView` キーハンドラ |
| 4-3 | `Alt + U` / `Alt + ←` → ドリルアップ | ✅ | `FocusView` キーハンドラ |
| 4-4 | `Alt + →` → 直前の子階層へ戻る（履歴ナビゲーション） | ✅ | `drillForward` アクション |
| 4-5 | `Alt + Shift + 数字` → セル入れ替え | ✅ | `FocusView` キーハンドラ |
| 4-6 | `Alt + V` → ビュー切り替え（全画面） | ✅ | `App.tsx` グローバルハンドラ |
| 4-7 | `Alt + E` → モーダルエディタ起動 | ✅ | `FocusView` キーハンドラ |
| 4-8 | `Alt + 数字`（俯瞰ビュー）→ 該当ユニットへ移動 | ✅ | `App.tsx` 俯瞰ハンドラ |
| 4-9 | `Alt + I` → 画像追加（ファイルダイアログ） | ✅ | Tauri ダイアログで実装 |
| 4-10 | `Alt + Shift + I` → 画像削除 | ✅ | `FocusView.tsx` キーハンドラ |
| 4-11 | `Ctrl + Shift + S` → 保存（ファイルダイアログ） | ✅ | `App.tsx` グローバルハンドラ |
| 4-12 | `Ctrl + E` → エクスポート（ファイルダイアログ） | ✅ | Tauri save ダイアログで実装 |
| 4-13 | `Ctrl + Z` / `Ctrl + Shift + Z` → Undo / Redo | ✅ | `App.tsx` グローバルハンドラ |
| 4-14 | `Enter` → 編集確定 / `Esc` → キャンセル | ✅ | `EditableCell` キーハンドラ |
| 4-15 | `Ctrl + Enter` → モーダル保存 / `Esc` → モーダルキャンセル | ✅ | `ModalEditor` キーハンドラ |
| 4-16 | 編集中ショートカット伝播処理（commit → 次セル編集） | ✅ | `EditableCell` → blur → commit |
| 4-17 | `Tab` / `Shift+Tab` → セル順移動（0→1→2→3→5→6→7→8→0…、逆順） | ✅ | 中心セル(4)をスキップ |

---

## Phase 5: エクスポート

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 5-1 | 📤 エクスポートボタン（JSON） | ✅ | Tauri save ダイアログ実装済み |
| 5-2 | JSON エクスポート（単一ファイル） | ✅ | 上記に同じ |
| 5-3 | Markdown エクスポート（単一ファイル） | ✅ | `chartToMarkdown` in `mandalaHelpers.ts`, ドロップダウンメニューから選択 |
| 5-4 | OPML エクスポート（単一ファイル） | ✅ | `chartToOpml` in `mandalaHelpers.ts`, ドロップダウンメニューから選択 |

---

## Phase 6: AIアシスト

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 6-1 | 設定画面（プロバイダー選択・APIキー入力・モデル選択） | ✅ | `SettingsModal.tsx` + `useSettingsStore.ts` |
| 6-2 | `Alt + G` → キーワード生成（条件チェック→API→セル配置） | ✅ | `claudeApi.ts` + `FocusView` キーハンドラ |
| 6-3 | ローディング UI（オーバーレイ＋スピナー） | ✅ | `FocusView` 内オーバーレイ |
| 6-4 | エラーハンドリング（トースト通知） | ✅ | `Toast.tsx` |

---

## Phase 7: 仕上げ

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 7-1 | アプリアイコン設定 | ✅ | `npm run tauri icon` で生成済み |
| 7-2 | ウィンドウタイトル設定（`Maṇḍalāya — 曼荼羅盤`） | ✅ | `tauri.conf.json` + `index.html` 更新済み |
| 7-3 | ウィンドウの最小サイズ設定 | ✅ | `minWidth: 640`, `minHeight: 500` |
| 7-4 | エラーハンドリング（`ErrorBoundary`） | ✅ | `main.tsx` で `<ErrorBoundary>` がアプリ全体を包む |
| 7-5 | パフォーマンス最適化（`React.memo` 等） | ✅ | `EditableCell`/`UnitGrid`/`OverviewView`/`Header`/`Breadcrumbs`/`Footer` を `memo` 化。`handleSwap`/`noop` を安定参照化。`updateCellInUnit` に同一テキスト時の参照保持最適化を追加 |
| 7-6 | テスト | ✅ | Vitest 導入。`mandalaHelpers.ts` の 22 テスト（`npm test`） |
| 7-7 | クロスプラットフォームビルド（macOS / Windows / Linux） | ⬜ | `npm run tauri build` — 各 OS 環境で実行。GitHub Actions 等の CI で対応可 |

---

## 進捗サマリー

| フェーズ | 完了 | 部分実装 | 未着手 | 合計 |
|---------|------|---------|--------|------|
| Phase 1 | 5 | 0 | 0 | 5 |
| Phase 2 | 13 | 0 | 0 | 13 |
| Phase 3 | 10 | 0 | 0 | 10 |
| Phase 4 | 17 | 0 | 0 | 17 |
| Phase 5 | 4 | 0 | 0 | 4 |
| Phase 6 | 4 | 0 | 0 | 4 |
| Phase 7 | 6 | 0 | 1 | 7 |
| **合計** | **59** | **0** | **1** | **60** |
