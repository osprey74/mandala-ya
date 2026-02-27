# mandala-ya

> Mandala-ya is a desktop application built with Tauri v2, React, and TypeScript.

## Task Management

- **task_file**: `docs/tasks.md`
- **done_marker**: `✅`
- **progress_summary**: true (フェーズ表＋進捗サマリーの数値も更新)

## Documentation

- **docs_to_update**:
  - `README.md` (EN)
  - `README.ja.md` (JA)
- **doc_pairs**:
  - `README.md` ↔ `README.ja.md`

## Versioning

- **version_files**:
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
- **extra_version_files**: none
- **cargo_lockfile**: true

## CI/CD

- **cicd**: true
- **cicd_trigger**: tag push
- **cicd_platform**: GitHub Actions (Windows x86_64 + macOS universal)
- **cicd_note**: タグプッシュで自動ビルド＆ Release ドラフト作成

## SNS

- **sns_accounts**: none
