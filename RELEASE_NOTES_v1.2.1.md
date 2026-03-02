# Release Notes — v1.2.1

## ✨ New Features

- **Overview zoom**: Zoom in/out on the overview display
  - `Ctrl+=` / `Ctrl+Scroll-wheel-up` to zoom in (up to 3×)
  - `Ctrl+Scroll-wheel-down` to zoom out (minimum = standard size)
  - `Ctrl+0` to reset to standard size
  - Drag-to-scroll when zoomed in
- **View-specific shortcut hints**: Footer now shows context-appropriate keyboard shortcuts for unit view and overview view

## 🐛 Bug Fixes

- **Overview display size**: Removed the 700 px width cap and applied the correct 6:4 aspect-ratio conversion so the overview grid uses the same viewport proportion as the unit display

## 🔧 Maintenance

- Prevented browser / WebView default zoom shortcuts (`Ctrl++/-/0/wheel`) from interfering with the app

---

# リリースノート — v1.2.1

## ✨ 新機能

- **俯瞰表示ズーム**: 俯瞰表示の拡大・縮小操作を追加
  - `Ctrl+=` / `Ctrl+スクロールホイール↑` で拡大（最大3倍）
  - `Ctrl+スクロールホイール↓` で縮小（最小=標準サイズ）
  - `Ctrl+0` で標準サイズに戻る
  - 拡大時はドラッグでスクロール可能
- **ビュー別ショートカットヒント**: フッターにユニット表示・俯瞰表示それぞれのキーボードショートカットを表示

## 🐛 バグ修正

- **俯瞰表示のサイズ**: 700px幅上限を撤廃し、高さ→幅の6:4比率変換を正しく適用。ユニット表示と同じ比率でビューポートを使用するように修正

## 🔧 メンテナンス

- ブラウザ / WebView デフォルトのズーム操作（`Ctrl++/-/0/wheel`）がアプリに干渉しないよう抑止
