# Maṇḍalāya — Mandala Board

A desktop app for creating and managing **Mandala charts** — a 9×9 goal-breakdown tool popularized by baseball player Shohei Ohtani.

Built with **Tauri v2 + React + TypeScript + Vite**.

---

## Installation

Pre-built binaries are available on the [Releases](https://github.com/nicories/mandala-ya/releases) page.

> **Note:** The binaries are **not code-signed**. Your OS will show a security warning on first launch.

### Windows

Windows SmartScreen may block the installer with a **"Windows protected your PC"** dialog.

1. Click **"More info"**
2. Click **"Run anyway"**

### macOS

Gatekeeper will show **""Maṇḍalāya" can't be opened because Apple cannot check it for malicious software."**

1. Open **System Settings → Privacy & Security**
2. Scroll down to the Security section — you will see a message about the blocked app
3. Click **"Open Anyway"**

Alternatively, run the following command before launching the app for the first time:

```bash
xattr -cr /Applications/Maṇḍalāya.app
```

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

## Documentation

- [System Specification](docs/spec/mandala-ya-system-spec.md) — Architecture, data model, component specs, keyboard shortcuts, and more
- [Requirements Definition](docs/spec/mandala-ya-spec.md) — Original requirements (pre-implementation)

---

## License

MIT
