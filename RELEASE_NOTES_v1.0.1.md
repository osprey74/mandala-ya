# Maṇḍalāya v1.0.1 Release Notes

**Release Date:** 2026-02-27

---

## English

### Changes

- **CI/CD**: Added GitHub Actions workflows for automated testing and cross-platform builds
  - `ci.yml` — runs unit tests on every push and pull request to `main`
  - `release.yml` — automatically builds Windows (x86_64) and macOS (universal) installers and creates a GitHub Release draft on each `v*.*.*` tag push

### Upgrade Notes

No changes to the application itself. This release validates the automated build pipeline for future releases.

---

## 日本語

### 変更点

- **CI/CD**: GitHub Actions ワークフローを追加
  - `ci.yml` — `main` ブランチへのプッシュ / PR 時にユニットテストを自動実行
  - `release.yml` — `v*.*.*` タグのプッシュ時に Windows (x86_64) と macOS (universal) を自動ビルドし、GitHub Release ドラフトを作成

### アップグレードについて

アプリ本体の変更はありません。将来のリリースに向けた自動ビルドパイプラインの検証リリースです。
