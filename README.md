# Maṇḍalāya — 曼荼羅盤

A desktop app for creating and managing **Mandala charts** — a 9×9 goal-breakdown tool originally developed by baseball player Shohei Ohtani.

Built with **Tauri v2 + React + TypeScript + Vite**.

---

## Features

- **Hierarchical mandala chart** — drill down/up through nested 3×3 units
- **Focus view & Overview view** — toggle between single-unit edit and full 9×9 overview
- **Drag & drop** — reorder cells within a unit
- **Modal editor** — full-text editing up to 1,024 characters (with `Intl.Segmenter`)
- **9 color palettes** — per-unit color themes
- **Undo / Redo** — up to 64 steps (powered by [zundo](https://github.com/charkour/zundo))
- **Image support** *(partial)* — background images per cell
- **Keyboard shortcuts** — full keyboard navigation (see below)

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt + 数字 / テンキー` | Move focus to cell |
| `Alt + Ctrl + 数字` | Drill down into cell |
| `Alt + U` / `Alt + ←` | Drill up |
| `Alt + →` | Go forward (drill history) |
| `Alt + Shift + 数字` | Swap cells |
| `Alt + V` | Toggle Focus / Overview |
| `Alt + E` | Open modal editor |
| `Alt + G` | AI keyword generation *(planned)* |
| `Ctrl + Z` / `Ctrl + Shift + Z` | Undo / Redo |
| `Ctrl + Shift + S` | Save *(planned)* |
| `Ctrl + E` | Export JSON |
| `Enter` | Confirm edit |
| `Esc` | Cancel edit |

---

## Tech Stack

| Layer | Library |
| --- | --- |
| Desktop runtime | [Tauri v2](https://tauri.app/) |
| UI | React 18 + TypeScript |
| Build | Vite |
| State | [Zustand](https://github.com/pmndrs/zustand) + [zundo](https://github.com/charkour/zundo) |

---

## Development

```bash
# Install dependencies
npm install

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
