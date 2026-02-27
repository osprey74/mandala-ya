# Maṇḍalāya v1.0.0 Release Notes

**Release Date:** 2026-02-27

---

## English

### 🎉 Initial Release

Maṇḍalāya v1.0.0 is the first public release of this desktop Mandala chart application.
Available for **Windows** and **macOS**.

### Features

- **Hierarchical Mandala chart** — create nested 3×3 units and drill down/up through the hierarchy
- **Focus view & Overview view** — toggle between single-unit editing and the full 9×9 chart
- **Drag & drop** — reorder cells within a unit
- **Modal editor** — rich text editing per cell (up to 1,024 characters)
- **9 color palettes** — assign a color theme to each unit
- **Undo / Redo** — up to 64 steps
- **Image support** — set background images per cell; unused images are automatically cleaned up on save
- **AI keyword generation** — generate branch keywords from the center theme using the Claude API (`Alt+G`)
- **Auto-save** — debounced save on every edit; manual save via `Ctrl+Shift+S`
- **Export** — save as JSON, Markdown, or OPML
- **File association** — `.mandala` files open directly in Maṇḍalāya
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

### 🎉 初回リリース

Maṇḍalāya v1.0.0 は、マンダラチャート作成デスクトップアプリの初公開バージョンです。
**Windows** および **macOS** に対応しています。

### 機能

- **階層型マンダラチャート** — 3×3 ユニットを入れ子構造でドリルダウン／アップ
- **フォーカスビュー & 俯瞰ビュー** — 単一ユニット編集と 9×9 全体表示を切り替え
- **ドラッグ＆ドロップ** — 同一ユニット内のセルを並び替え
- **モーダルエディタ** — セルごとに最大 1,024 文字の詳細テキストを編集
- **9 カラーパレット** — ユニットごとにカラーテーマを設定
- **アンドゥ／リドゥ** — 最大 64 ステップ
- **画像サポート** — セルに背景画像を設定。保存時に未参照画像を自動削除
- **AI キーワード生成** — Claude API でセンターテーマからブランチキーワードを生成（`Alt+G`）
- **自動保存** — 編集のたびに debounce 保存。`Ctrl+Shift+S` で手動保存も可能
- **エクスポート** — JSON / Markdown / OPML 形式に対応
- **ファイル関連付け** — `.mandala` ファイルを直接 Maṇḍalāya で開く
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
