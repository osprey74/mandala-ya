# Maṇḍalāya（曼荼羅盤）— システム仕様書

> **文書バージョン:** 1.0
> **対象アプリバージョン:** 1.2.1
> **作成日:** 2026-03-03
> **ステータス:** 現行実装の記録

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構成](#3-ディレクトリ構成)
4. [データモデル](#4-データモデル)
5. [状態管理](#5-状態管理)
6. [コンポーネント仕様](#6-コンポーネント仕様)
7. [キーボード操作仕様](#7-キーボード操作仕様)
8. [ファイル操作仕様](#8-ファイル操作仕様)
9. [エクスポート仕様](#9-エクスポート仕様)
10. [AIアシスト仕様](#10-aiアシスト仕様)
11. [Tauriバックエンド仕様](#11-tauriバックエンド仕様)
12. [カラーパレット](#12-カラーパレット)
13. [ビルド・リリース](#13-ビルドリリース)

---

## 1. プロジェクト概要

### 1.1 アプリ名

| 用途 | 表記 |
|------|------|
| 表示名（正式名称） | Maṇḍalāya |
| プロジェクト名 / ファイル名 / リポジトリ名 | mandala-ya |
| 日本語愛称 / サブタイトル | 曼荼羅盤 |
| ウィンドウタイトル | `Maṇḍalāya — 曼荼羅盤` |
| バンドルID | `com.mandala-ya.app` |
| ファイル拡張子 | `.mandalaya` |

語源: maṇḍala（曼荼羅）+ ālaya（サンスクリットで「住処・蔵・場所」）= 曼荼羅の在り処

### 1.2 概要

マンダラート手法（3×3グリッドを再帰的に展開して思考を深める手法）を実現するデスクトップアプリケーション。キーボード操作を重視した高速思考入力ツール。

### 1.3 主要機能

- 3×3グリッド（ユニット）の再帰的な階層構造によるマンダラチャート作成・編集
- フォーカスビュー（1ユニット表示）と俯瞰ビュー（3×3の9ユニット表示）の切り替え
- 各セルへの画像背景の設定
- Claude APIによるAIキーワード自動生成
- JSON / Markdown / OPML 形式でのエクスポート
- 64ステップのUndo/Redo
- `.mandalaya`ファイルとのファイル関連付け（ダブルクリック起動）

### 1.4 対応プラットフォーム

| プラットフォーム | アーキテクチャ |
|-----------------|--------------|
| Windows | x86_64 |
| macOS | Universal（x86_64 + Apple Silicon） |

---

## 2. 技術スタック

### 2.1 ランタイム・フレームワーク

| レイヤー | 技術 | バージョン |
|----------|------|-----------|
| デスクトップランタイム | Tauri | v2 |
| UIフレームワーク | React | 19.1.0 |
| 言語 | TypeScript | ~5.8.3 |
| ビルドツール | Vite | 7.0.4 |
| Rustビルドシステム | Cargo | — |

### 2.2 主要ライブラリ

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| zustand | グローバル状態管理 | 5.0.11 |
| zundo | Undo/Redo（temporalミドルウェア） | 2.3.0 |
| material-symbols | アイコンフォント（オフライン） | — |

### 2.3 Tauriプラグイン

| プラグイン | 用途 |
|-----------|------|
| tauri-plugin-fs | ファイル読み書き |
| tauri-plugin-dialog | ファイル選択ダイアログ |
| tauri-plugin-store | 設定の永続化（JSON） |
| tauri-plugin-http | HTTPリクエスト（Claude API呼び出し） |
| tauri-plugin-opener | 外部URL・ファイルのオープン |

### 2.4 テスト

| ツール | 用途 | バージョン |
|-------|------|-----------|
| Vitest | ユニットテスト | 4.0.18 |

---

## 3. ディレクトリ構成

```
mandala-ya/
├── src/                          # フロントエンドソース
│   ├── main.tsx                  # Reactエントリーポイント
│   ├── App.tsx                   # ルートコンポーネント（グローバルキーハンドラ、ファイルI/O）
│   ├── App.css                   # グローバルスタイル（App.tsxにインポート必須）
│   ├── components/               # UIコンポーネント
│   │   ├── Header.tsx            # ヘッダー（ファイルメニュー、エクスポートメニュー、設定ボタン）
│   │   ├── Footer.tsx            # フッター（ショートカット一覧、2行固定）
│   │   ├── Breadcrumbs.tsx       # パンくずナビゲーション
│   │   ├── FocusView.tsx         # フォーカスビュー（1ユニット編集画面）
│   │   ├── OverviewView.tsx      # 俯瞰ビュー（9ユニット表示、ズーム・ドラッグ対応）
│   │   ├── UnitGrid.tsx          # 3×3グリッドコンポーネント（memo最適化）
│   │   ├── EditableCell.tsx      # 編集可能セルコンポーネント
│   │   ├── ModalEditor.tsx       # モーダルテキストエディタ（1,024文字上限）
│   │   ├── SettingsModal.tsx     # Claude API設定モーダル
│   │   ├── Toast.tsx             # トースト通知
│   │   └── ErrorBoundary.tsx     # エラーバウンダリ
│   ├── store/                    # Zustand状態管理
│   │   ├── useMandalaStore.ts    # チャートデータ＋ナビゲーション状態
│   │   ├── useSaveStore.ts       # ファイル保存状態
│   │   └── useSettingsStore.ts   # AI設定（APIキー、モデル）
│   ├── types/
│   │   └── mandala.ts            # コアType定義
│   ├── constants/
│   │   └── palettes.ts           # カラーパレット9種 + KEY_TO_POSITIONマッピング
│   └── utils/
│       ├── mandalaHelpers.ts     # チャート操作ヘルパー関数群
│       ├── fileOperations.ts     # ファイルI/O・エクスポート・画像管理
│       └── claudeApi.ts          # Claude API呼び出しラッパー
├── src-tauri/                    # Tauriバックエンド（Rust）
│   ├── src/
│   │   ├── lib.rs                # Tauriコマンド定義（get_startup_file）
│   │   └── main.rs               # Rustエントリーポイント
│   ├── Cargo.toml                # Rust依存関係
│   ├── Cargo.lock                # Rustロックファイル
│   └── tauri.conf.json           # Tauri設定（ウィンドウ、バージョン、ファイル関連付け）
├── docs/
│   ├── spec/
│   │   ├── mandala-ya-spec.md    # 要件定義書（実装前）
│   │   └── mandala-ya-system-spec.md  # 本ファイル（システム仕様書）
│   ├── tasks.md                  # フェーズ別タスクトラッカー
│   └── prototype/
│       └── mandala-chart-v2.jsx  # 初期プロトタイプ（参考）
├── package.json                  # フロントエンド依存関係・バージョン（1.2.1）
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── index.html
├── README.md                     # 英語README
└── README.ja.md                  # 日本語README
```

---

## 4. データモデル

### 4.1 型定義

```typescript
// src/types/mandala.ts

interface MandalaCell {
  id: string;                    // 一意識別子（例: "cell-1706123456789"）
  text: string;                  // セルのテキスト内容（最大1,024書記素クラスタ）
  position: number;              // ユニット内の位置 0–8
  children: MandalaUnit | null;  // 子ユニット（関連セルのみ。主題セルはnull）
  image: string | null;          // 画像ファイル名（例: "1706123456789-abc.png"）
}

interface MandalaUnit {
  id: string;                    // 一意識別子（例: "unit-1706123456789"）
  cells: MandalaCell[];          // 必ず9要素（position 0–8）
}

interface MandalaChart {
  id: string;                    // チャートID（例: "chart-1706123456789"）
  title: string;                 // チャートタイトル
  rootUnit: MandalaUnit;         // ルートユニット
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}
```

### 4.2 ポジションマッピング

```
ユニット内のセル配置（position番号）:

  ┌─────┬─────┬─────┐
  │  0  │  1  │  2  │
  ├─────┼─────┼─────┤
  │  3  │  4  │  5  │  ← 4 = 主題セル（Center Cell）
  ├─────┼─────┼─────┤
  │  6  │  7  │  8  │
  └─────┴─────┴─────┘
```

### 4.3 再帰構造

チャート全体は `rootUnit` を頂点とする再帰ツリー。各 `MandalaCell` が `children: MandalaUnit | null` を持つことで任意の深さへ展開可能。

### 4.4 データ同期ルール

- **親→子のテキスト同期**: 親ユニットの関連セルのテキスト（または画像）を変更すると、対応する子ユニットの主題セル（position: 4）のテキスト（または画像）が自動同期される
- **主題セルの編集制限**: 2階層目以降の主題セルは親から継承されるため直接編集不可
- **子ユニットの生成タイミング**: ドリルダウン操作時に子ユニットが未作成の場合のみ自動生成

### 4.5 ID採番

`mandalaHelpers.ts` 内のカウンタで連番管理。起動時にチャートデータから最大IDを読み取り、衝突を防ぐために同期する。

### 4.6 永続化フォーマット

`.mandalaya` ファイルの実体はJSON。`MandalaChart` オブジェクトをそのままシリアライズ。

```
{保存先}/
├── 目標設定2026.mandalaya      ← チャートデータ（JSON）
└── 目標設定2026_images/        ← 画像ファイル格納ディレクトリ
    ├── 1706123456789-abc.png
    └── ...
```

画像ファイル名の形式: `{timestamp}-{random6chars}.{ext}`

---

## 5. 状態管理

### 5.1 ストア一覧

| ストアファイル | 管理対象 | Undo対象 |
|--------------|---------|---------|
| `useMandalaStore.ts` | チャートデータ＋ナビゲーション | chartのみ |
| `useSaveStore.ts` | ファイル保存状態 | なし |
| `useSettingsStore.ts` | AI設定（APIキー、モデル） | なし |

### 5.2 useMandalaStore

#### State

```typescript
{
  chart: MandalaChart;           // チャートデータ全体（Undo対象）
  navStack: string[];            // ナビゲーション履歴スタック（ユニットIDの配列）
  forwardStack: string[];        // 「進む」履歴スタック（Alt+→用）
  view: "unit" | "overview";    // 現在のビューモード
  focusedPosition: number | null; // フォーカス中のセルのposition
}
```

#### ナビゲーション動作

| 操作 | navStack | forwardStack |
|------|----------|-------------|
| ドリルダウン | 子ユニットIDをpush | クリア |
| ドリルアップ | 現在IDをpopしてforwardStackへ | 現在IDをpush |
| Alt+→（進む） | forwardStackからpopしてnavStackへ | pop |
| パンくず任意階層クリック | 指定IDまでtrimする | クリア |

#### Undo/Redo

- **ライブラリ**: zundo（Zustandのtemporalミドルウェア）
- **履歴上限**: 64ステップ
- **Undo対象**: `chart`のみ（`navStack`等は除外）
- **スナップショット記録タイミング**: セル編集のcommit時、画像操作時、AI生成時、セル入れ替え時

#### カスタムセレクタフック

```typescript
useCurrentUnit()    // 現在表示中のMandalaUnitを返す
useIsTopLevel()     // ルートユニットを表示中かどうか
useCurrentDepth()   // 現在の階層深度（0 = ルート）
useCurrentUnitId()  // 現在のユニットID
```

### 5.3 useSaveStore

```typescript
{
  savePath: string | null;       // 現在の保存先ファイルパス
  isDirty: boolean;              // 未保存の変更あり
  isSaving: boolean;             // 自動保存処理中
  lastSavedAt: Date | null;      // 最終保存日時
  lastExportedAt: Date | null;   // 最終エクスポート日時
}
```

### 5.4 useSettingsStore

```typescript
{
  apiKey: string;                // Claude APIキー
  model: string;                 // 使用モデル（デフォルト: claude-haiku-4-5-20251001）
}
```

`tauri-plugin-store` を通じて `settings.json` に永続化。

---

## 6. コンポーネント仕様

### 6.1 コンポーネント階層

```
App.tsx
├── Header.tsx
├── Breadcrumbs.tsx
├── main（flex layout）
│   ├── FocusView.tsx（view === "unit"）
│   │   └── UnitGrid.tsx（memo）
│   │       └── EditableCell.tsx × 9
│   └── OverviewView.tsx（view === "overview"）
│       └── UnitGrid.tsx × 9（memo、読み取り専用）
├── Footer.tsx（fixed）
├── ModalEditor.tsx（条件付きレンダリング）
├── SettingsModal.tsx（条件付きレンダリング）
└── Toast.tsx
```

### 6.2 App.tsx

役割: ルートコンポーネント。グローバルキーボードハンドラ、ファイルI/O処理、起動フローを担う。

**起動フロー:**
1. `get_startup_file()`（Tauriコマンド）でCLI引数から `.mandalaya` ファイルパスを取得
2. ファイルが指定されていれば読み込み、なければ `tauri-plugin-store` から前回の保存先を復元
3. 保存先のファイルが存在すれば読み込み、なければ新規チャートで開始
4. IDカウンタをチャートデータと同期
5. Undo履歴をリセット（`temporal.clear()`）

**グローバルキーハンドラ（`keydown`イベント）:**
- `Ctrl+Z / Ctrl+Shift+Z`: Undo/Redo
- `Ctrl+Shift+S`: 名前を付けて保存（ファイルダイアログ）
- `Alt+V`: ビュー切り替え
- `Alt+G`: AIキーワード生成
- `Alt+U / Alt+←`: ドリルアップ
- `Alt+→`: ドリルフォワード（履歴ナビゲーション）
- `Ctrl+N`: 新規チャート

**自動保存:** `chart` が変化するたびにdebounce（500ms）して自動保存。`savePath`が設定済みの場合のみ発動。

### 6.3 Header.tsx

- ファイルメニュー（新規、開く、上書き保存、名前を付けて保存）
- エクスポートメニュー（JSON、Markdown、OPML）
- 設定ボタン（SettingsModalを開く）
- 未保存インジケータ（isDirtyフラグ表示）

### 6.4 Breadcrumbs.tsx

- `navStack` と `chart` から各階層の主題セルテキストを取得
- クリックで任意階層へジャンプ（`navStack`をその階層までtrimし、`forwardStack`をクリア）
- 現在階層は太字表示

### 6.5 FocusView.tsx

- 1ユニット（3×3）を表示・編集するメインビュー
- `UnitGrid` コンポーネントをレンダリング
- セルのフォーカス管理、Tab/Shift+Tabによるフォーカス移動（主題セルをスキップ）
- `Alt+数字` / `Alt+Numpad数字` によるセルフォーカス
- `Alt+Ctrl+数字` によるドリルダウン
- `Alt+Shift+数字` によるセル入れ替え
- `Alt+E` によるモーダルエディタ起動
- `Alt+I` / `Alt+Shift+I` による画像追加・削除

### 6.6 OverviewView.tsx

- 9つの `UnitGrid` を3×3に配置（中央が現在のユニット、周囲が各関連セルの子ユニット）
- 読み取り専用（編集不可）
- クリックでドリルダウンまたはユニットビューへ切り替え
- **ズーム機能**: `Ctrl++` / `Ctrl+-` / `Ctrl+0` / `Ctrl+ホイール` でズーム倍率変更
- **ドラッグスクロール**: ズーム時にドラッグでパン操作
- サイズ計算: `min(calc(100vw - 40px), calc(100vh - 168px), 700px)`

### 6.7 UnitGrid.tsx

- 3×3の `EditableCell` をレンダリングする純粋なグリッドコンポーネント
- `React.memo` で最適化
- 編集可能か否かをpropsで制御

### 6.8 EditableCell.tsx

- セル1マスの表示・編集コンポーネント
- **レイヤー構造:**
  - 下レイヤー（z-index: 0）: 背景画像（`object-fit: cover`）
  - 上レイヤー（z-index: 1）: テキスト表示エリア（背景透過）
- **画像背景時のテキスト色**: 画像の輝度を計算して白/黒を自動選択
- **文字数制限**: `Intl.Segmenter` による書記素クラスタ単位で最大1,024文字
- **ボタン表示:**
  - 🔼（ドリルアップ）: 主題セル左上、2階層目以降のみ
  - ↗（モーダルエディタ起動）: テキスト入力済みセルの右上
  - ↓（ドリルダウン）: テキスト入力済みの関連セルの右下
  - 🖼（画像追加・削除）: 関連セルの左下
- **インラインテキスト編集**: フォーカス時にtextareaを表示。確定（Enter）で `updateCell()` を呼び、Undo履歴を記録
- **ref API**: 親から `startEditing()` を命令的に呼び出せる

### 6.9 ModalEditor.tsx

- セルの全テキストを広いテキストエリアで編集するモーダルダイアログ
- `Ctrl+Enter` で保存・閉じる / `Esc` でキャンセル
- 文字数カウンター（右下）: `{現在文字数} / 1,024`。上限超過時は赤色表示
- `Enter` は改行入力（保存ではない）

### 6.10 SettingsModal.tsx

- Claude APIキー入力（`tauri-plugin-store` に永続化）
- 使用モデルの選択（Haiku / Sonnet / Opus）

### 6.11 Toast.tsx

- 操作結果・エラーのフィードバック通知
- 自動的に消える

### 6.12 Footer.tsx

- 画面下部に固定（`position: fixed`）
- 2行レイアウト、高さ: `footerHeight = 48px`
- ショートカット一覧を表示
- `main` コンテンツには `paddingBottom: 48px` でセーフゾーンを確保
- `React.memo` で最適化

---

## 7. キーボード操作仕様

### 7.1 ナビゲーション

| ショートカット | 動作 | 有効画面 | 備考 |
|--------------|------|---------|------|
| `Alt + 0–9` / `Alt + Numpad0–9` | 指定番号のセルにフォーカス | フォーカスビュー | KEY_TO_POSITIONマッピング参照 |
| `Tab` | 次のセルにフォーカス（主題セルをスキップ） | フォーカスビュー | |
| `Shift + Tab` | 前のセルにフォーカス | フォーカスビュー | |
| `Alt + Ctrl + 0–9` | 指定セルの子ユニットへドリルダウン | フォーカスビュー | 主題セル(5)は無効、空セルは無効 |
| `Alt + U` / `Alt + ←` | 親ユニットへドリルアップ | フォーカスビュー | ルートでは無動作 |
| `Alt + →` | 直前のドリルアップで離れた子ユニットへ戻る | フォーカスビュー | forwardStack使用 |

### 7.2 セル編集

| ショートカット | 動作 | 備考 |
|--------------|------|------|
| `Enter`（編集中） | テキストを確定 | Undo履歴記録＋自動保存 |
| `Esc`（編集中） | 編集をキャンセル | 変更を破棄 |
| `Alt + E` | モーダルエディタを起動 | フォーカス中のセル |
| `Alt + Shift + 0–9` | フォーカス中のセルと指定セルを入れ替え | 関連セル同士のみ |
| `Alt + I` | フォーカス中のセルに画像を追加 | ファイルダイアログ |
| `Alt + Shift + I` | フォーカス中のセルの画像を削除 | |

### 7.3 ビュー・ファイル操作

| ショートカット | 動作 |
|--------------|------|
| `Alt + V` | フォーカスビュー ⇔ 俯瞰ビュー 切り替え |
| `Ctrl + N` | 新規チャート（確認ダイアログあり） |
| `Ctrl + Shift + S` | 名前を付けて保存（ファイルダイアログ） |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Alt + G` | AIキーワード生成 |

### 7.4 俯瞰ビュー（ズーム）

| ショートカット | 動作 |
|--------------|------|
| `Ctrl + =` / `Ctrl + ホイール↑` | ズームイン |
| `Ctrl + -` / `Ctrl + ホイール↓` | ズームアウト |
| `Ctrl + 0` | ズームリセット |
| ドラッグ | パン（ズーム時のみ） |

### 7.5 モーダルエディタ内

| ショートカット | 動作 |
|--------------|------|
| `Ctrl + Enter` | 保存して閉じる |
| `Esc` | キャンセルして閉じる |
| `Enter` | 改行 |

### 7.6 数字キーとグリッド位置の対応

```
数字キー / テンキー → セルposition:

  ┌─────────┬─────────┬─────────┐
  │  7 → [0]│  8 → [1]│  9 → [2]│
  ├─────────┼─────────┼─────────┤
  │  4 → [3]│  5 → [4]│  6 → [5]│
  ├─────────┼─────────┼─────────┤
  │  1 → [6]│  2 → [7]│  3 → [8]│
  └─────────┴─────────┴─────────┘
```

```typescript
// src/constants/palettes.ts
const KEY_TO_POSITION: Record<string, number> = {
  "Numpad7": 0, "Numpad8": 1, "Numpad9": 2,
  "Numpad4": 3, "Numpad5": 4, "Numpad6": 5,
  "Numpad1": 6, "Numpad2": 7, "Numpad3": 8,
  "Digit7": 0,  "Digit8": 1,  "Digit9": 2,
  "Digit4": 3,  "Digit5": 4,  "Digit6": 5,
  "Digit1": 6,  "Digit2": 7,  "Digit3": 8,
};
```

### 7.7 セル編集中のショートカット伝播

セル編集中（textarea表示中）に `Alt + 数字` が押された場合:
1. 現在の編集内容を確定（commit）
2. グローバルハンドラにイベントを伝播
3. 指定セルの編集を開始

---

## 8. ファイル操作仕様

### 8.1 ファイル形式

| 項目 | 仕様 |
|------|------|
| 拡張子 | `.mandalaya` |
| 内容 | `MandalaChart` オブジェクトのJSON（UTF-8） |
| 画像 | `{ファイル名（拡張子除く）}_images/` ディレクトリに格納 |

### 8.2 新規作成フロー

```
Ctrl+N → 確認ダイアログ
  → OK: createChart() で新規MandalaChartを生成
       → useMandalaStore をリセット
       → useSaveStore.savePath = null, isDirty = false
       → Undo履歴クリア
  → キャンセル: 無動作
```

### 8.3 保存フロー

#### 自動保存

```
chartデータ変更
  → isDirty = true
  → debounce 500ms
  → savePath が設定済み？
      → Yes: saveChart(chart, savePath) を呼び出し
             → JSON書き込み
             → gcImages() 実行（未参照画像を削除）
             → isDirty = false, lastSavedAt = now
      → No: 何もしない
```

#### 名前を付けて保存（Ctrl+Shift+S）

```
ファイルダイアログ（.mandalaya フィルタ）
  → パス選択後: savePath を更新して saveChart() 実行
  → キャンセル: 無動作
```

### 8.4 起動フロー

```
アプリ起動
  ├→ get_startup_file() でCLI引数チェック
  │   └→ .mandalayaファイルのパスが取得できた
  │       → loadChart(path) で読み込み
  │       → savePath = path
  └→ CLI引数なし
      └→ tauri-plugin-store から前回の savePath を取得
          ├→ ファイルが存在する → loadChart() で読み込み
          └→ ファイルが存在しない / 未設定 → 新規チャートで開始
```

### 8.5 画像管理

#### 画像追加（Alt+I または 🖼ボタン）

1. ファイルダイアログで JPG / PNG を選択
2. `{savePath}_images/` ディレクトリが存在しなければ作成
3. 選択した画像を `{timestamp}-{random6chars}.{ext}` の名前で `_images/` にコピー
4. `cell.image = {コピーされたファイル名}` を更新
5. Undo履歴記録 → 自動保存発動

#### 画像削除（Alt+Shift+I または ✕ボタン）

1. `cell.image = null` を更新
2. Undo履歴記録 → 自動保存発動（保存時にGCが実行され、ファイルが削除される）

#### 画像URL解決

Tauri WebView では `file://` プロトコルに制限があるため、`convertFileSrc()` を使用してアクセス可能なURLに変換。

#### 画像ガベージコレクション（gcImages）

チャート保存時に実行:
1. `_images/` ディレクトリ内の全ファイルをリストアップ
2. チャート全体を再帰探索し、参照されている画像ファイル名を収集
3. どのセルからも参照されていないファイルを削除

---

## 9. エクスポート仕様

### 9.1 エクスポート形式一覧

| 形式 | 拡張子 | ファイル数 | 実装状況 |
|------|-------|-----------|---------|
| JSON | `.json` | 単一 | 実装済み |
| Markdown | `.md` | 単一 | 実装済み |
| OPML | `.opml` | 単一 | 実装済み |

※エクスポートは `savePath`（自動保存先）を変更しない。

### 9.2 JSON エクスポート

`MandalaChart` オブジェクトをそのまま出力。再帰ネスト構造で全階層を1ファイルに包含。インポート時はこのJSONをそのまま読み込める（`.mandalaya` ファイルと同一フォーマット）。

### 9.3 Markdown エクスポート

見出しレベル（`#`, `##`, `###`...）で階層を表現。

```markdown
# {ルート主題}

## {関連キーワード1}
- {孫キーワード1}
- {孫キーワード2}
...

## {関連キーワード2}
...
```

実装: `mandalaHelpers.ts` の `chartToMarkdown()` 関数。

### 9.4 OPML エクスポート

アウトラインプロセッサ（OmniOutliner, WorkFlowy等）との連携用。

```xml
<opml version="2.0">
  <head><title>{チャートタイトル}</title></head>
  <body>
    <outline text="{ルート主題}">
      <outline text="{関連キーワード1}">
        <outline text="{孫キーワード1}"/>
        ...
      </outline>
    </outline>
  </body>
</opml>
```

実装: `mandalaHelpers.ts` の `chartToOpml()` 関数。

---

## 10. AIアシスト仕様

### 10.1 概要

現在のユニットの主題セルテキストをもとに、Claude APIが関連キーワードを8つ生成し各関連セルに自動配置する機能。

### 10.2 実行条件

- 主題セル（position: 4）にテキストが入力済みであること
- APIキーが設定済みであること（未設定時はトーストで通知）

※ v1.2.1時点では関連セルが空かどうかは厳密にはチェックしない実装になっている可能性あり。仕様については要確認。

### 10.3 動作フロー

```
Alt + G
  → 実行条件チェック
  → ローディング表示
  → Claude API へリクエスト
      プロンプト: "{主題キーワード}" に関連するキーワードを8つ挙げてください。
                 JSON配列で返してください。例: ["キーワード1", ...]
  → レスポンス受信・パース
  → position 0,1,2,3,5,6,7,8 に順次配置（updateCell）
  → Undo履歴記録 → 自動保存
```

### 10.4 APIリクエスト仕様

| 項目 | 値 |
|------|-----|
| エンドポイント | `https://api.anthropic.com/v1/messages` |
| HTTPクライアント | `tauri-plugin-http` |
| デフォルトモデル | `claude-haiku-4-5-20251001` |
| 選択可能モデル | Haiku 4.5 / Sonnet 4.6 / Opus 4.6 |
| レスポンス期待形式 | JSON配列文字列 |

### 10.5 設定管理

`useSettingsStore` で管理。`tauri-plugin-store` を通じて `settings.json` に永続化。設定画面（SettingsModal）からAPIキーとモデルを変更可能。

### 10.6 エラーハンドリング

| エラー | 対応 |
|-------|------|
| APIキー未設定 | トースト通知でSettingsModalへ誘導 |
| API通信エラー | トースト通知（ネットワーク確認を促す） |
| APIキー無効（401） | トースト通知 |
| レスポンスのパース失敗 | トースト通知 |

---

## 11. Tauriバックエンド仕様

### 11.1 ウィンドウ設定

| 項目 | 値 |
|------|-----|
| タイトル | `Maṇḍalāya — 曼荼羅盤` |
| デフォルトサイズ | 800 × 600 px |
| 最小サイズ | 640 × 500 px |

### 11.2 ファイル関連付け

| 項目 | 値 |
|------|-----|
| 拡張子 | `.mandalaya` |
| MIMEタイプ | `application/x-mandalaya` |
| ロール | Editor |

ダブルクリックで起動した場合、CLIに引数としてファイルパスが渡される。

### 11.3 Rustコマンド

#### `get_startup_file() -> Option<String>`

**用途:** アプリ起動時にCLI引数から `.mandalaya` ファイルのパスを取得する。

**動作:**
1. `std::env::args()` からコマンドライン引数を取得
2. `--` から始まらない引数を抽出
3. `file://` URLの場合はデコードしてファイルパスに変換
4. 取得できた場合は `Some(path)` を返す

**ソース:** `src-tauri/src/lib.rs`

### 11.4 機能フラグ

`tauri.conf.json` の `features`:
- `protocol-asset`: `asset://` プロトコルによるローカルファイルアクセスを有効化（画像表示に使用）

---

## 12. カラーパレット

### 12.1 ユニットカラーパレット（9種）

階層深度や位置に応じて異なるパレットを使用。

| Index | テーマ | bg（淡色） | border / center（濃色） |
|-------|-------|-----------|------------------------|
| 0 | オレンジ | `#FFF3E0` | `#EF6C00` |
| 1 | グリーン | `#E8F5E9` | `#2E7D32` |
| 2 | ブルー | `#E3F2FD` | `#1565C0` |
| 3 | ピンク | `#FCE4EC` | `#C2185B` |
| 4 | パープル | `#EDE7F6` | `#512DA8` |
| 5 | ティール | `#E0F2F1` | `#00796B` |
| 6 | イエロー | `#FFF8E1` | `#F9A825` |
| 7 | ディープパープル | `#F3E5F5` | `#7B1FA2` |
| 8 | ブラウン | `#EFEBE9` | `#5D4037` |

### 12.2 UIカラー

| 要素 | 色 |
|------|-----|
| 背景 | `#fafafa` |
| テキスト | `#1a1a1a` |
| ヘッダー背景 | `#ffffff` |
| ヘッダーボーダー | `#e8e8e8` |
| ロゴグラデーション | `linear-gradient(135deg, #512DA8, #1565C0)` |
| パンくずリンク | `#1565C0` |
| フッターテキスト | `#aaaaaa` |

---

## 13. ビルド・リリース

### 13.1 バージョン管理ファイル

バージョン番号は以下3ファイルを同期して更新する:

| ファイル | フィールド |
|---------|----------|
| `package.json` | `version` |
| `src-tauri/Cargo.toml` | `[package].version` |
| `src-tauri/tauri.conf.json` | `version` |

`Cargo.lock` はバージョンアップ時に `cargo build` で自動更新。

### 13.2 ビルドコマンド

```bash
# 開発サーバー起動
npm run tauri dev

# プロダクションビルド
npm run tauri build

# フロントエンドのみビルド（Vite）
npm run build

# テスト実行
npm run test
```

### 13.3 CI/CD

| 項目 | 内容 |
|------|------|
| プラットフォーム | GitHub Actions |
| トリガー | タグプッシュ（`v*` 形式） |
| ビルドターゲット | Windows x86_64 + macOS Universal |
| 成果物 | インストーラー（.exe / .dmg） |
| リリース | GitHub Releases にドラフト自動作成 |

### 13.4 リリース手順

1. 3ファイルのバージョン番号を同期して更新
2. `Cargo.lock` を更新（`cargo build`）
3. コミット & プッシュ
4. バージョンタグを作成してプッシュ（例: `git tag v1.2.1 && git push origin v1.2.1`）
5. GitHub ActionsがCI/CDビルドを実行し、Releaseドラフトを自動作成
6. ドラフトにリリースノート（英語・日本語）を追加して公開

---

*本ドキュメントは実装コードを元に作成したシステム仕様書です。要件定義書（`mandala-ya-spec.md`）とは目的が異なります。*
