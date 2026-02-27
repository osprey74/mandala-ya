# Maṇḍalāya — 曼荼羅盤

大谷翔平選手が活用したことで知られる **マンダラチャート**（9×9 の目標展開ツール）を作成・管理するデスクトップアプリです。

**Tauri v2 + React + TypeScript + Vite** で構築しています。

---

## 機能

- **階層型マンダラチャート** — 3×3 ユニットをドリルダウン／アップして入れ子構造を編集
- **フォーカスビュー & 俯瞰ビュー** — 単一ユニット編集と 9×9 全体表示を切り替え
- **ドラッグ＆ドロップ** — 同一ユニット内でセルを並び替え
- **モーダルエディタ** — 最大 1,024 文字（`Intl.Segmenter` による文字数カウント）
- **9 カラーパレット** — ユニットごとにカラーテーマを設定
- **アンドゥ／リドゥ** — 最大 64 ステップ（[zundo](https://github.com/charkour/zundo) 使用）
- **画像サポート** — セルごとに背景画像を設定。保存時に未参照画像を自動削除
- **AI キーワード生成** — Claude API を使ってセンターテーマからブランチキーワードを生成（`Alt+G`）
- **フルキーボード操作** — 全操作をキーボードで実行可能（下記ショートカット参照）
- **自動保存** — 編集のたびに debounce 保存。`Ctrl+Shift+S` で手動保存も可能
- **エクスポート** — JSON / Markdown / OPML 形式に対応

---

## キーボードショートカット

| ショートカット | 操作 |
| --- | --- |
| `Alt + 数字 / テンキー` | セルへフォーカス & 編集開始 |
| `Tab` / `Shift+Tab` | 次 / 前のセルへ移動（中心セルをスキップ） |
| `Alt + Ctrl + 数字` | 下階層へドリルダウン |
| `Alt + U` / `Alt + ←` | 上階層へドリルアップ |
| `Alt + →` | 直前の子階層へ戻る（履歴） |
| `Alt + Shift + 数字` | セルを入れ替え |
| `Alt + V` | フォーカスビュー / 俯瞰ビュー切り替え |
| `Alt + E` | モーダルエディタを開く |
| `Alt + I` | フォーカスセルに画像を追加 |
| `Alt + Shift + I` | フォーカスセルの画像を削除 |
| `Alt + G` | AI キーワード生成（Claude API） |
| `Ctrl + Z` / `Ctrl + Shift + Z` | アンドゥ / リドゥ |
| `Ctrl + Shift + S` | 保存（ファイルダイアログ） |
| `Ctrl + E` | エクスポート（JSON / Markdown / OPML） |
| `Enter` | 編集確定 |
| `Esc` | 編集キャンセル |

---

## 技術スタック

| レイヤー | ライブラリ／ツール |
| --- | --- |
| デスクトップランタイム | [Tauri v2](https://tauri.app/) |
| UI | React 19 + TypeScript |
| ビルド | Vite |
| 状態管理 | [Zustand](https://github.com/pmndrs/zustand) + [zundo](https://github.com/charkour/zundo) |
| アイコン | [Material Symbols Rounded](https://fonts.google.com/icons)（npm、オフライン） |
| テスト | [Vitest](https://vitest.dev/) |

---

## 開発

```bash
# 依存パッケージのインストール
npm install

# ユニットテストの実行
npm test

# 開発サーバー起動（Tauri ウィンドウ）
npm run tauri dev

# プロダクションビルド
npm run tauri build
```

---

## 進捗

タスク一覧は [docs/tasks.md](docs/tasks.md) を参照してください。

---

## ライセンス

MIT
