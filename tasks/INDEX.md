# タスクインデックス

全51タスク（12フェーズ）の一覧

## Phase 1: Setup（順次実行）

| タスク | ファイル                                                                      | 推定時間 |
| ------ | ----------------------------------------------------------------------------- | -------- |
| 01     | [Manifest V3拡張 + Service Worker基盤](01_setup_manifest_service_worker.md)   | 1h       |
| 02     | [Tailwind CSS CDN + デザイントークン設定](02_setup_tailwind_design_tokens.md) | 30min    |
| 03     | [開発環境整備](03_setup_dev_tools.md)                                         | 30min    |

## Phase 2: UI Atoms（並列グループA）

| タスク | ファイル                                                   | 推定時間 | 並列 |
| ------ | ---------------------------------------------------------- | -------- | ---- |
| 04     | [Button Primary/Secondary](04_button_primary_secondary.md) | 30min    | A    |
| 05     | [Button Outline/Ghost](05_button_outline_ghost.md)         | 30min    | A    |
| 06     | [Button Danger/Loading](06_button_danger_loading.md)       | 30min    | A    |
| 07     | [IconButton](07_iconbutton.md)                             | 30min    | A    |
| 08     | [Checkbox](08_checkbox.md)                                 | 30min    | A    |
| 09     | [ProgressBar](09_progressbar.md)                           | 30min    | A    |
| 10     | [Badge](10_badge.md)                                       | 30min    | A    |

## Phase 3: UI Molecules（並列グループB）

| タスク | ファイル                                     | 推定時間 | 並列 |
| ------ | -------------------------------------------- | -------- | ---- |
| 11     | [FormField](11_formfield.md)                 | 30min    | B    |
| 12     | [ProgressIndicator](12_progressindicator.md) | 30min    | B    |
| 13     | [MediaItemActions](13_mediaitemactions.md)   | 30min    | B    |
| 14     | [EmptyState](14_emptystate.md)               | 30min    | B    |
| 15     | [NoticeBox](15_noticebox.md)                 | 30min    | B    |

## Phase 4: UI Organisms（並列グループC）

| タスク | ファイル                                               | 推定時間 | 並列 |
| ------ | ------------------------------------------------------ | -------- | ---- |
| 16     | [Header](16_header.md)                                 | 30min    | C    |
| 17     | [BulkActions](17_bulkactions.md)                       | 30min    | C    |
| 18     | [MediaItem 検出済み状態](18_mediaitem_検出済み状態.md) | 1h       | C    |
| 19     | [MediaItem 変換中状態](19_mediaitem_変換中状態.md)     | 30min    | C    |
| 20     | [MediaItem 完了状態](20_mediaitem_完了状態.md)         | 30min    | C    |
| 21     | [MediaItem エラー状態](21_mediaitem_エラー状態.md)     | 30min    | C    |
| 22     | [MediaList](22_medialist.md)                           | 30min    | C    |
| 23     | [MetadataEditModal](23_metadataeditmodal.md)           | 1h       | C    |

## Phase 5: UI Templates（並列グループD）

| タスク | ファイル                         | 推定時間 | 並列 |
| ------ | -------------------------------- | -------- | ---- |
| 24     | [PopupLayout](24_popuplayout.md) | 30min    | D    |

## Phase 6: Content Script（並列グループE）

| タスク | ファイル                                                             | 推定時間 | 並列 |
| ------ | -------------------------------------------------------------------- | -------- | ---- |
| 25     | [メディア検出スクリプト](25_メディア検出スクリプト.md)               | 1h       | E    |
| 26     | [URL重複除外とファイル情報取得](26_url重複除外とファイル情報取得.md) | 30min    | E    |

## Phase 7: Service Worker（並列グループF）

| タスク | ファイル                                               | 推定時間 | 並列 |
| ------ | ------------------------------------------------------ | -------- | ---- |
| 27     | [ffmpeg.wasm初期化](27_ffmpeg.wasm初期化.md)           | 1h       | F    |
| 28     | [音声抽出ジョブ管理](28_音声抽出ジョブ管理.md)         | 1h       | F    |
| 29     | [進捗通知](29_進捗通知.md)                             | 30min    | F    |
| 30     | [Chrome通知とバッジ更新](30_chrome通知とバッジ更新.md) | 30min    | F    |
| 31     | [Chrome Storage永続化](31_chrome_storage永続化.md)     | 30min    | F    |

## Phase 8: Data Layer（並列グループG）

| タスク | ファイル                                                       | 推定時間 | 並列 |
| ------ | -------------------------------------------------------------- | -------- | ---- |
| 32     | [型定義](32_型定義.md)                                         | 30min    | G    |
| 33     | [メタデータバリデーション](33_メタデータバリデーション.md)     | 30min    | G    |
| 34     | [ダウンロードユーティリティ](34_ダウンロードユーティリティ.md) | 30min    | G    |

## Phase 9: Integration（並列グループH）

| タスク | ファイル                                                      | 推定時間 | 並列 |
| ------ | ------------------------------------------------------------- | -------- | ---- |
| 35     | [Popup ↔ Content Script連携](35_popup__content_script連携.md) | 1h       | H    |
| 36     | [Popup ↔ Service Worker連携](36_popup__service_worker連携.md) | 1h       | H    |
| 37     | [動画ダウンロード統合](37_動画ダウンロード統合.md)            | 30min    | H    |
| 38     | [音声抽出統合](38_音声抽出統合.md)                            | 1h       | H    |
| 39     | [メタデータ編集統合](39_メタデータ編集統合.md)                | 30min    | H    |
| 40     | [複数選択・一括操作統合](40_複数選択・一括操作統合.md)        | 30min    | H    |

## Phase 10: TDD Unit（並列グループI）

| タスク | ファイル                                                               | 推定時間 | 並列 |
| ------ | ---------------------------------------------------------------------- | -------- | ---- |
| 41     | [メディア検出ロジックテスト](41_メディア検出ロジックテスト.md)         | 1h       | I    |
| 42     | [メタデータバリデーションテスト](42_メタデータバリデーションテスト.md) | 30min    | I    |
| 43     | [ジョブ管理テスト](43_ジョブ管理テスト.md)                             | 1h       | I    |

## Phase 11: Polish（並列グループJ）

| タスク | ファイル                                               | 推定時間 | 並列 |
| ------ | ------------------------------------------------------ | -------- | ---- |
| 44     | [キーボード操作対応](44_キーボード操作対応.md)         | 1h       | J    |
| 45     | [ARIA属性追加](45_aria属性追加.md)                     | 30min    | J    |
| 46     | [エラーハンドリング強化](46_エラーハンドリング強化.md) | 1h       | J    |
| 47     | [ローディング状態最適化](47_ローディング状態最適化.md) | 30min    | J    |
| 48     | [アプリアイコン作成](48_アプリアイコン作成.md)         | 30min    | J    |

## Phase 12: Deploy（順次実行）

| タスク | ファイル                                                       | 推定時間 |
| ------ | -------------------------------------------------------------- | -------- |
| 49     | [セキュリティ監査](49_セキュリティ監査.md)                     | 1h       |
| 50     | [Chrome Web Store準備](50_chrome_web_store準備.md)             | 30min    |
| 51     | [本番ビルドとパッケージング](51_本番ビルドとパッケージング.md) | 30min    |

---

## 合計推定時間

- **Phase 1 (Setup)**: 2時間
- **Phase 2 (Atoms)**: 3.5時間（並列なら30分）
- **Phase 3 (Molecules)**: 2.5時間（並列なら30分）
- **Phase 4 (Organisms)**: 6時間（並列なら1時間）
- **Phase 5 (Templates)**: 30分
- **Phase 6 (Content Script)**: 1.5時間（並列なら1時間）
- **Phase 7 (Service Worker)**: 4時間（並列なら1時間）
- **Phase 8 (Data Layer)**: 1.5時間（並列なら30分）
- **Phase 9 (Integration)**: 4.5時間（並列なら1時間）
- **Phase 10 (TDD)**: 2.5時間（並列なら1時間）
- **Phase 11 (Polish)**: 3.5時間（並列なら1時間）
- **Phase 12 (Deploy)**: 2時間

**順次実行**: 約34時間  
**並列実行**: 約11-12時間
