# Media Extractor

動画・音声ファイルを検出してダウンロード、音声抽出が可能なChrome拡張機能

## 機能

- ✅ **メディア検出**: ページ内の動画・音声ファイルを自動検出
- ✅ **動画ダウンロード**: 検出した動画をそのままダウンロード
- 🚧 **音声抽出**: 動画から音声のみをMP3で抽出（Phase 7で実装予定）
- 🚧 **メタデータ編集**: 音声ファイルのメタデータを編集（Phase 7で実装予定）
- ✅ **一括操作**: 複数ファイルを選択して一括処理

## 対応フォーマット

### 動画
- MP4, WebM, MKV, AVI, MOV, FLV, WMV, M4V

### 音声
- MP3, WAV, OGG, M4A, FLAC, AAC, WMA

## 開発状況

### 完了済み（Phase 1-4）
- ✅ Manifest V3対応
- ✅ Service Worker実装
- ✅ Content Script実装
- ✅ UIコンポーネントライブラリ（Atoms, Molecules, Organisms）
- ✅ Tailwind CSS + Lucide Icons統合
- ✅ メディア検出機能
- ✅ 基本的なダウンロード機能

### 実装予定（Phase 5-12）
- 🚧 ffmpeg.wasm統合（音声抽出）
- 🚧 メタデータ編集機能
- 🚧 プログレスバー表示
- 🚧 Chrome Notifications統合
- 🚧 Chrome Badge表示
- 🚧 状態管理（Chrome Storage API）
- 🚧 E2Eテスト
- 🚧 パフォーマンス最適化
- 🚧 Chrome Web Store公開

## インストール方法（開発版）

### 1. リポジトリをクローン
```bash
git clone <repository-url>
cd mp3-data-extractor
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. Chrome拡張機能として読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのディレクトリを選択

### 4. 動作確認

1. 任意のWebページを開く（動画や音声ファイルがあるページを推奨）
2. ツールバーのMedia Extractorアイコンをクリック
3. ポップアップが開き、検出されたメディアファイルが表示される

## 使い方

### メディアの検出
1. 拡張機能アイコンをクリック
2. 自動的にページ内のメディアファイルを検出
3. 検出されたファイルがリストに表示される

### 動画のダウンロード
1. リストから対象ファイルを選択
2. 「動画ダウンロード」ボタンをクリック
3. ブラウザのダウンロード機能で保存

### 一括操作
1. 「すべて選択」でリスト全体を選択（または個別にチェック）
2. 「選択した項目を動画ダウンロード」をクリック

### 再スキャン
- ヘッダーの「再スキャン」ボタンでページを再検出

## 開発

### コード品質チェック
```bash
npm run lint       # ESLintでチェック
npm run lint:fix   # 自動修正
npm run format     # Prettierでフォーマット
npm test           # ユニットテスト実行
```

### コンポーネントテスト
ブラウザで `test.html` を開くと、全コンポーネントの動作を確認できます。

### ビルド & パッケージング

Chrome Web Store公開用のZIPパッケージを作成:

```bash
# 自動ビルドスクリプト（推奨）
npm run package

# または手動で
bash scripts/package.sh        # macOS / Linux
pwsh scripts/package.ps1       # Windows PowerShell
```

詳細は [BUILD.md](./BUILD.md) を参照してください。

### ファイル構成
```
mp3-data-extractor/
├── manifest.json          # Chrome拡張機能の設定
├── popup.html             # ポップアップUI
├── popup.js               # ポップアップロジック（ESモジュール）
├── popup.css              # カスタムスタイル
├── background.js          # Service Worker
├── content.js             # Content Script
├── lib/
│   ├── components.js      # UIコンポーネントライブラリ
│   ├── types.js           # 型定義（JSDoc）
│   ├── storage.js         # Chrome Storage APIラッパー
│   └── messages.js        # メッセージパッシング
├── icons/                 # アイコン画像
├── docs/                  # ドキュメント
│   ├── REQUIREMENTS.md    # 要件定義
│   ├── SCREEN_FLOW.md     # 画面遷移図
│   ├── API_SCHEMA.md      # API設計
│   └── UI_DESIGN.md       # UI設計
└── tasks/                 # タスク管理
    ├── INDEX.md           # タスク一覧
    └── *.md               # 個別タスク定義
```

## 技術スタック

- **Manifest Version**: 3
- **UI Framework**: Vanilla JavaScript
- **CSS Framework**: Tailwind CSS (CDN)
- **Icons**: Lucide Icons (CDN)
- **Audio Processing**: ffmpeg.wasm（実装予定）
- **Linting**: ESLint v9
- **Formatting**: Prettier

## デザインシステム

### カラーパレット
- **Primary**: Teal (#14b8a6)
- **Secondary**: Orange (#f97316)
- **Success**: Green (#22c55e)
- **Error**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)
- **Info**: Blue (#3b82f6)

### コンポーネント構成（Atomic Design）
- **Atoms**: Button, Checkbox, ProgressBar, Badge
- **Molecules**: ProgressIndicator, EmptyState, NoticeBox
- **Organisms**: Header, BulkActions, MediaItem, MetadataModal

## ライセンス

MIT

## 注意事項

- 著作権法を遵守し、個人利用の範囲でご使用ください
- 大容量ファイル（1GB超）の処理には時間がかかる場合があります
- 変換中はメモリを多く使用します
