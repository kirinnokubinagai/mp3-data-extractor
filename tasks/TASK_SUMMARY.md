# タスク一覧サマリー

## Phase 1: Setup (完了)

- [x] 01: Manifest V3拡張 + Service Worker基盤
- [x] 02: Tailwind CSS CDN + デザイントークン設定
- [x] 03: 開発環境整備

## Phase 2: UI Atoms (並列グループA)

- [ ] 04: Button Primary/Secondary
- [ ] 05: Button Outline/Ghost
- [ ] 06: Button Danger/Loading
- [ ] 07: IconButton
- [ ] 08: Checkbox
- [ ] 09: ProgressBar
- [ ] 10: Badge

## Phase 3: UI Molecules (並列グループB)

- [ ] 11: FormField (Label + Input + Error)
- [ ] 12: ProgressIndicator (Bar + Status)
- [ ] 13: MediaItemActions (ボタングループ)
- [ ] 14: EmptyState
- [ ] 15: NoticeBox

## Phase 4: UI Organisms (並列グループC)

- [ ] 16: Header
- [ ] 17: BulkActions
- [ ] 18: MediaItem 検出済み状態
- [ ] 19: MediaItem 変換中状態
- [ ] 20: MediaItem 完了状態
- [ ] 21: MediaItem エラー状態
- [ ] 22: MediaList
- [ ] 23: MetadataEditModal

## Phase 5: UI Templates (並列グループD)

- [ ] 24: PopupLayout

## Phase 6: Content Script (並列グループE)

- [ ] 25: メディア検出スクリプト
- [ ] 26: URL重複除外 + ファイル情報取得

## Phase 7: Service Worker (並列グループF)

- [ ] 27: ffmpeg.wasm初期化
- [ ] 28: 音声抽出ジョブ管理
- [ ] 29: 進捗通知
- [ ] 30: Chrome通知 + バッジ更新
- [ ] 31: Chrome Storage永続化

## Phase 8: Data Layer (並列グループG)

- [ ] 32: 型定義
- [ ] 33: メタデータバリデーション
- [ ] 34: ダウンロードユーティリティ

## Phase 9: Integration (並列グループH)

- [ ] 35: Popup ↔ Content Script連携
- [ ] 36: Popup ↔ Service Worker連携
- [ ] 37: 動画ダウンロード統合
- [ ] 38: 音声抽出統合
- [ ] 39: メタデータ編集統合
- [ ] 40: 複数選択・一括操作統合

## Phase 10: TDD Unit (並列グループI)

- [ ] 41: メディア検出ロジックテスト
- [ ] 42: メタデータバリデーションテスト
- [ ] 43: ジョブ管理テスト

## Phase 11: Polish (並列グループJ)

- [ ] 44: キーボード操作対応
- [ ] 45: ARIA属性追加
- [ ] 46: エラーハンドリング強化
- [ ] 47: ローディング状態最適化
- [ ] 48: アプリアイコン作成

## Phase 12: Deploy (順次)

- [ ] 49: セキュリティ監査
- [ ] 50: Chrome Web Store準備
- [ ] 51: 本番ビルド + パッケージング
