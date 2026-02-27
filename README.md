# Maṇḍalāya — Mandala Board

A desktop app for creating and managing **Mandala charts** — a 9×9 goal-breakdown tool popularized by baseball player Shohei Ohtani.

Built with **Tauri v2 + React + TypeScript + Vite**.

---

## Features

- **Hierarchical mandala chart** — drill down/up through nested 3×3 units
- **Focus view & Overview view** — toggle between single-unit editing and full 9×9 overview
- **Drag & drop** — reorder cells within a unit
- **Modal editor** — rich text editing up to 1,024 characters (with `Intl.Segmenter`)
- **9 color palettes** — per-unit color themes
- **Undo / Redo** — up to 64 steps (powered by [zundo](https://github.com/charkour/zundo))
- **Image support** — background images per cell, with automatic garbage collection on save
- **AI keyword generation** — generate branch keywords from the center theme via Claude API (`Alt+G`)
- **Full keyboard navigation** — all actions reachable without a mouse (see below)
- **Auto-save** — debounced save on every edit; manual save via `Ctrl+Shift+S`
- **Export** — JSON, Markdown, and OPML formats

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt + 0–9 / Numpad` | Move focus to cell |
| `Tab` / `Shift+Tab` | Next / previous cell (skips center) |
| `Alt + Ctrl + 0–9` | Drill down into cell |
| `Alt + U` / `Alt + ←` | Drill up |
| `Alt + →` | Go forward (drill history) |
| `Alt + Shift + 0–9` | Swap cells |
| `Alt + V` | Toggle Focus / Overview |
| `Alt + E` | Open modal editor |
| `Alt + I` | Add image to focused cell |
| `Alt + Shift + I` | Remove image from focused cell |
| `Alt + G` | AI keyword generation (Claude API) |
| `Ctrl + Z` / `Ctrl + Shift + Z` | Undo / Redo |
| `Ctrl + Shift + S` | Save (file dialog) |
| `Ctrl + E` | Export (JSON / Markdown / OPML) |
| `Enter` | Confirm edit |
| `Esc` | Cancel edit |

---

## Tech Stack

| Layer | Library / Tool |
| --- | --- |
| Desktop runtime | [Tauri v2](https://tauri.app/) |
| UI | React 19 + TypeScript |
| Build | Vite |
| State | [Zustand](https://github.com/pmndrs/zustand) + [zundo](https://github.com/charkour/zundo) |
| Icons | [Material Symbols Rounded](https://fonts.google.com/icons) (npm, offline) |
| Tests | [Vitest](https://vitest.dev/) |

---

## Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start dev server (Tauri window)
npm run tauri dev

# Build for production
npm run tauri build
```

---

## Project Status

See [docs/tasks.md](docs/tasks.md) for the full task list.

---

## License

MIT
