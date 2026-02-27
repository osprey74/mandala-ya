# Maṇḍalāya — タスク管理表

> 最終更新: 2026-02-27
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
| 2-12 | 🖼 画像追加ボタン（UIのみ） | ⚠️ | ボタン表示・削除は動作。**ファイルダイアログ未実装**（Phase 3） |
| 2-13 | ↗ モーダルエディタ（1,024文字、`Intl.Segmenter`） | ✅ | `src/components/ModalEditor.tsx` |

---

## Phase 3: データ管理

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 3-1 | 再帰ツリーの CRUD ヘルパー関数 | ✅ | `src/utils/mandalaHelpers.ts` |
| 3-2 | 親子テキスト同期ロジック | ✅ | `syncCenterText` in store |
| 3-3 | Tauri fs API によるファイル保存/読み込み | ⬜ | |
| 3-4 | `tauri-plugin-store` による保存先パスの永続化 | ⬜ | |
| 3-5 | 自動保存（commit 時、debounce 500ms） | ⬜ | |
| 3-6 | 起動時の保存先チェック＆ファイル読み込みフロー | ⬜ | |
| 3-7 | 💾 保存ボタン（ファイルダイアログで保存先設定/変更） | ⬜ | 現在は `alert()` のみ |
| 3-8 | `_images/` フォルダ管理（作成・画像コピー） | ⬜ | |
| 3-9 | 画像ガベージコレクション（保存時に未参照画像削除） | ⬜ | |
| 3-10 | JSON インポート機能 | ⬜ | |

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
| 4-9 | `Alt + I` → 画像追加（ファイルダイアログ） | ⚠️ | キー入力は拾うが**ダイアログ未実装** |
| 4-10 | `Alt + Shift + I` → 画像削除 | ⬜ | |
| 4-11 | `Ctrl + Shift + S` → 保存（ファイルダイアログ） | ⬜ | |
| 4-12 | `Ctrl + E` → エクスポート（ファイルダイアログ） | ⚠️ | blob ダウンロードのみ。**Tauri ファイルダイアログ未実装** |
| 4-13 | `Ctrl + Z` / `Ctrl + Shift + Z` → Undo / Redo | ✅ | `App.tsx` グローバルハンドラ |
| 4-14 | `Enter` → 編集確定 / `Esc` → キャンセル | ✅ | `EditableCell` キーハンドラ |
| 4-15 | `Ctrl + Enter` → モーダル保存 / `Esc` → モーダルキャンセル | ✅ | `ModalEditor` キーハンドラ |
| 4-16 | 編集中ショートカット伝播処理（commit → 次セル編集） | ✅ | `EditableCell` → blur → commit |

---

## Phase 5: エクスポート

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 5-1 | 📤 エクスポートボタン（JSON） | ⚠️ | blob ダウンロード方式で動作。**Tauri ファイルダイアログ未使用** |
| 5-2 | JSON エクスポート（単一ファイル） | ⚠️ | 上記に同じ |
| 5-3 | Markdown エクスポート（単一ファイル） | ⬜ | |
| 5-4 | OPML エクスポート（単一ファイル） | ⬜ | MD変換ロジックを流用予定 |

---

## Phase 6: AIアシスト

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 6-1 | 設定画面（プロバイダー選択・APIキー入力・モデル選択） | ⬜ | |
| 6-2 | `Alt + G` → キーワード生成（条件チェック→API→セル配置） | ⬜ | |
| 6-3 | ローディング UI（オーバーレイ＋スピナー） | ⬜ | |
| 6-4 | エラーハンドリング（トースト通知） | ⬜ | |

---

## Phase 7: 仕上げ

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 7-1 | アプリアイコン設定 | ✅ | `npm run tauri icon` で生成済み |
| 7-2 | ウィンドウタイトル設定（`Maṇḍalāya — 曼荼羅盤`） | ✅ | `tauri.conf.json` + `index.html` 更新済み |
| 7-3 | ウィンドウの最小サイズ設定 | ⬜ | `tauri.conf.json` に `minWidth`/`minHeight` 追加予定 |
| 7-4 | エラーハンドリング（`ErrorBoundary`） | ⚠️ | `ErrorBoundary` コンポーネント実装済み。Tauri エラー処理は未実装 |
| 7-5 | パフォーマンス最適化（`React.memo` 等） | ⬜ | |
| 7-6 | テスト | ⬜ | |
| 7-7 | クロスプラットフォームビルド（macOS / Windows / Linux） | ⬜ | |

---

## 進捗サマリー

| フェーズ | 完了 | 部分実装 | 未着手 | 合計 |
|---------|------|---------|--------|------|
| Phase 1 | 5 | 0 | 0 | 5 |
| Phase 2 | 12 | 1 | 0 | 13 |
| Phase 3 | 2 | 0 | 8 | 10 |
| Phase 4 | 11 | 2 | 3 | 16 |
| Phase 5 | 0 | 2 | 2 | 4 |
| Phase 6 | 0 | 0 | 4 | 4 |
| Phase 7 | 2 | 1 | 4 | 7 |
| **合計** | **32** | **6** | **21** | **59** |
