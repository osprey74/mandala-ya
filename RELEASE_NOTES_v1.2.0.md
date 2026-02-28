# Maṇḍalāya v1.2.0 Release Notes

**Release Date:** 2026-02-28

---

## English

### What's New in v1.2.0

- **Fix**: Corrected the Windows Start Menu display name from "Mandalaya" to "Mandala-ya" (`productName` in Tauri config)
- **Change**: Renamed save file extension from `.mandala` to `.mandalaya` for better alignment with the app name
- **Improvement**: Updated macOS file icon
- **Maintenance**: Added Claude Code workflow skills and project configuration

> **Note for existing users:** Files saved with the previous `.mandala` extension will need to be renamed to `.mandalaya` manually, or opened via the "Open" dialog which also accepts JSON files.

### Full Feature List

- **Hierarchical Mandala chart** — create nested 3×3 units and drill down/up through the hierarchy
- **Focus view & Overview view** — toggle between single-unit editing and the full 9×9 chart
- **Drag & drop** — reorder cells within a unit
- **Modal editor** — rich text editing per cell (up to 1,024 characters, with `Intl.Segmenter`)
- **9 color palettes** — assign a color theme to each unit
- **Undo / Redo** — up to 64 steps (powered by [zundo](https://github.com/charkour/zundo))
- **Image support** — set background images per cell; unused images are automatically cleaned up on save
- **AI keyword generation** — generate branch keywords from the center theme using the Claude API (`Alt+G`)
- **Auto-save** — debounced save on every edit; manual save via `Ctrl+Shift+S`
- **Export** — save as JSON, Markdown, or OPML
- **File association** — double-click a `.mandalaya` file to launch Maṇḍalāya and open it directly (Windows)
- **Full keyboard navigation** — every action is reachable without a mouse

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt + 0–9 / Numpad` | Move focus to cell |
| `Tab` / `Shift+Tab` | Next / previous cell |
| `Alt + Ctrl + 0–9` | Drill down |
| `Alt + U` / `Alt + ←` | Drill up |
| `Alt + →` | Go forward (history) |
| `Alt + Shift + 0–9` | Swap cells |
| `Alt + V` | Toggle Focus / Overview |
| `Alt + E` | Open modal editor |
| `Alt + I` / `Alt+Shift+I` | Add / remove cell image |
| `Alt + G` | AI keyword generation |
| `Ctrl + Z` / `Ctrl + Shift + Z` | Undo / Redo |
| `Ctrl + Shift + S` | Save |
| `Ctrl + E` | Export |

### System Requirements

| | Windows | macOS |
| --- | --- | --- |
| OS | Windows 10 or later | macOS 10.15 (Catalina) or later |
| Architecture | x86_64 | x86_64, Apple Silicon (ARM) |

---

## 日本語

### v1.2.0 の変更点

- **修正**: Windows スタートメニューの表示名を「Mandalaya」から「Mandala-ya」に修正（Tauri 設定の `productName` を変更）
- **変更**: 保存ファイルの拡張子を `.mandala` から `.mandalaya` に変更（アプリ名との統一）
- **改善**: macOS ファイルアイコンを更新
- **メンテナンス**: Claude Code ワークフロースキルおよびプロジェクト設定を追加

> **既存ユーザーへの注意:** 以前の `.mandala` 拡張子で保存されたファイルは、手動で `.mandalaya` にリネームするか、「開く」ダイアログ（JSON ファイルも対応）からお開きください。

### 全機能一覧

- **階層型マンダラチャート** — 3×3 ユニットを入れ子構造でドリルダウン／アップ
- **フォーカスビュー & 俯瞰ビュー** — 単一ユニット編集と 9×9 全体表示を切り替え
- **ドラッグ＆ドロップ** — 同一ユニット内のセルを並び替え
- **モーダルエディタ** — セルごとに最大 1,024 文字の詳細テキストを編集（`Intl.Segmenter` 対応）
- **9 カラーパレット** — ユニットごとにカラーテーマを設定
- **アンドゥ／リドゥ** — 最大 64 ステップ
- **画像サポート** — セルに背景画像を設定。保存時に未参照画像を自動削除
- **AI キーワード生成** — Claude API でセンターテーマからブランチキーワードを生成（`Alt+G`）
- **自動保存** — 編集のたびに debounce 保存。`Ctrl+Shift+S` で手動保存も可能
- **エクスポート** — JSON / Markdown / OPML 形式に対応
- **ファイル関連付け** — `.mandalaya` ファイルをダブルクリックすると Maṇḍalāya が起動してそのファイルを直接開く（Windows）
- **フルキーボード操作** — 全操作をキーボードで実行可能

### キーボードショートカット

| ショートカット | 操作 |
| --- | --- |
| `Alt + 0–9 / テンキー` | セルへフォーカス & 編集開始 |
| `Tab` / `Shift+Tab` | 次 / 前のセルへ移動 |
| `Alt + Ctrl + 0–9` | 下階層へドリルダウン |
| `Alt + U` / `Alt + ←` | 上階層へドリルアップ |
| `Alt + →` | 直前の子階層へ戻る |
| `Alt + Shift + 0–9` | セルを入れ替え |
| `Alt + V` | フォーカス / 俯瞰ビュー切り替え |
| `Alt + E` | モーダルエディタを開く |
| `Alt + I` / `Alt+Shift+I` | 画像を追加 / 削除 |
| `Alt + G` | AI キーワード生成 |
| `Ctrl + Z` / `Ctrl + Shift + Z` | アンドゥ / リドゥ |
| `Ctrl + Shift + S` | 保存 |
| `Ctrl + E` | エクスポート |

### 動作環境

| | Windows | macOS |
| --- | --- | --- |
| OS | Windows 10 以降 | macOS 10.15 (Catalina) 以降 |
| アーキテクチャ | x86_64 | x86_64、Apple Silicon (ARM) |
