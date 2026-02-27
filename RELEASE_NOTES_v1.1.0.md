# Maṇḍalāya v1.1.0 Release Notes

**Release Date:** 2026-02-27

---

## English

### What's New in v1.1.0

- **Fix**: Resolved ID collision bug that caused drill-down to open the wrong unit after loading a saved file
  - After loading a `.mandala` file, the internal ID counter was not synchronized with the IDs already present in the file. Subsequent drill-down operations generated IDs that collided with existing child units, causing `findUnitById` to return the wrong unit — making it appear as if the AI-generated keywords from a previous unit were shown instead of the new empty child.
  - Fixed by introducing `syncIdCounter()`, which scans the loaded chart for the highest existing ID and advances the counter past it.
- **Feature**: File association — double-clicking a `.mandala` file now launches Maṇḍalāya and opens that file directly (Windows)

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
- **File association** — double-click a `.mandala` file to launch Maṇḍalāya and open it directly (Windows)
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

### v1.1.0 の変更点

- **修正**: ファイル読み込み後のドリルダウンで誤ったユニットが表示されるバグを修正
  - 保存済みの `.mandala` ファイルを読み込んだ際、内部 ID カウンターがファイル内の既存 ID と同期されていなかった。その後のドリルダウンで生成される ID が既存の子ユニットの ID と衝突し、`findUnitById` が誤ったユニットを返す問題が発生していた。結果として、本来は空白であるべき新しい子ユニットの代わりに、以前のユニットに AI が生成したキーワードが表示されていた。
  - `syncIdCounter()` を導入し、読み込んだチャート内の最大 ID を検出してカウンターをその値以上に進めることで修正。
- **機能追加**: ファイル関連付けに対応 — `.mandala` ファイルをダブルクリックすると Maṇḍalāya が起動し、そのファイルを直接開く（Windows）

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
- **ファイル関連付け** — `.mandala` ファイルをダブルクリックすると Maṇḍalāya が起動してそのファイルを直接開く（Windows）
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
