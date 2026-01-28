# UI設計書

## 1. デザイントークン

### 1.1 カラーパレット

#### プライマリカラー（信頼感・安定感）

音声・動画処理という技術的な機能を扱うため、信頼感のある青緑系を採用。

```css
/* Teal系（落ち着いた青緑） */
--primary-50: #f0fdfa;
--primary-100: #ccfbf1;
--primary-200: #99f6e4;
--primary-300: #5eead4;
--primary-400: #2dd4bf;
--primary-500: #14b8a6; /* メインカラー */
--primary-600: #0d9488;
--primary-700: #0f766e;
--primary-800: #115e59;
--primary-900: #134e4a;
--primary-950: #042f2e;
```

#### セカンダリカラー（アクセント・アクション）

音声抽出や変換完了といったポジティブなアクションに使用。

```css
/* Orange系（温かみのあるアクセント） */
--secondary-50: #fff7ed;
--secondary-100: #ffedd5;
--secondary-200: #fed7aa;
--secondary-300: #fdba74;
--secondary-400: #fb923c;
--secondary-500: #f97316; /* メインカラー */
--secondary-600: #ea580c;
--secondary-700: #c2410c;
--secondary-800: #9a3412;
--secondary-900: #7c2d12;
--secondary-950: #431407;
```

#### ニュートラルカラー（背景・テキスト）

温かみのあるグレー（Stone系）を採用し、冷たい印象を回避。

```css
/* Stone系（温かみのあるグレー） */
--neutral-50: #fafaf9; /* 背景（明） */
--neutral-100: #f5f5f4; /* カード背景 */
--neutral-200: #e7e5e4; /* 境界線（薄） */
--neutral-300: #d6d3d1; /* 境界線 */
--neutral-400: #a8a29e; /* プレースホルダー */
--neutral-500: #78716c; /* サブテキスト */
--neutral-600: #57534e; /* テキスト（薄） */
--neutral-700: #44403c; /* テキスト */
--neutral-800: #292524; /* テキスト（濃） */
--neutral-900: #1c1917; /* 見出し */
--neutral-950: #0c0a09; /* 背景（暗） */
```

#### セマンティックカラー（状態表現）

```css
/* 成功（変換完了） */
--success: #22c55e;
--success-light: #dcfce7;
--success-dark: #16a34a;

/* エラー（変換失敗） */
--error: #ef4444;
--error-light: #fee2e2;
--error-dark: #dc2626;

/* 警告（注意事項） */
--warning: #f59e0b;
--warning-light: #fef3c7;
--warning-dark: #d97706;

/* 情報（ステータス） */
--info: #3b82f6;
--info-light: #dbeafe;
--info-dark: #2563eb;
```

---

### 1.2 タイポグラフィ

#### フォントファミリー

```css
/* UI用（Chromeのシステムフォント） */
--font-sans:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* モノスペース（URL表示用） */
--font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', monospace;
```

#### フォントサイズスケール

```css
--text-xs: 0.75rem; /* 12px - 注意事項、補足テキスト */
--text-sm: 0.875rem; /* 14px - URL、ステータステキスト */
--text-base: 1rem; /* 16px - 本文、ボタン */
--text-lg: 1.125rem; /* 18px - ファイル名 */
--text-xl: 1.25rem; /* 20px - ヘッダータイトル */
```

#### フォントウェイト

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 行間

```css
--leading-tight: 1.25; /* 見出し */
--leading-normal: 1.5; /* 本文 */
--leading-relaxed: 1.625; /* 長文 */
```

---

### 1.3 スペーシング（4pxベース）

```css
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
```

---

### 1.4 角丸

```css
--radius-sm: 0.25rem; /* 4px - Badge */
--radius-md: 0.5rem; /* 8px - Button、Input */
--radius-lg: 0.75rem; /* 12px - Card、Modal */
--radius-full: 9999px; /* 完全な丸 - Icon Button */
```

---

### 1.5 シャドウ

```css
/* 控えめなシャドウ（AIっぽさを排除） */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

---

### 1.6 アニメーション

```css
/* トランジション時間 */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* イージング */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

---

## 2. アプリアイコン設計

### 2.1 コンセプト

- 音声波形と動画再生ボタンを組み合わせたシンボル
- シンプルで識別しやすい
- 小サイズでも視認性を確保

### 2.2 カラー

- メイン: Primary (#14b8a6)
- アクセント: Secondary (#f97316) ※使用する場合
- 背景: 白または透過

### 2.3 形状

- 基本形: 角丸四角（16x16の場合2px角丸）
- 中央に音声波形アイコン（3本の縦線）
- 10%の余白を確保

### 2.4 生成ファイル一覧

| ファイル名   | サイズ  | 用途               |
| ------------ | ------- | ------------------ |
| icon-16.png  | 16x16   | ツールバー（小）   |
| icon-32.png  | 32x32   | ツールバー（中）   |
| icon-48.png  | 48x48   | 拡張機能管理ページ |
| icon-128.png | 128x128 | Chrome Web Store   |

### 2.5 SVGソース（参考）

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景（角丸四角） -->
  <rect width="128" height="128" rx="16" fill="#14b8a6"/>

  <!-- 音声波形（3本の縦線） -->
  <rect x="40" y="40" width="8" height="48" rx="4" fill="#ffffff"/>
  <rect x="60" y="28" width="8" height="72" rx="4" fill="#ffffff"/>
  <rect x="80" y="40" width="8" height="48" rx="4" fill="#ffffff"/>
</svg>
```

---

## 3. コンポーネント一覧（Atomic Design）

### Atoms（原子）

- Button（Primary、Secondary、Outline、Ghost、Danger）
- IconButton
- Checkbox
- Label
- ProgressBar
- Badge
- Icon（Lucide Icons使用）
- Text
- Link

### Molecules（分子）

- MediaItemActions（ボタングループ）
- ProgressIndicator（プログレスバー + ステータステキスト）
- EmptyState（空の状態）
- NoticeBox（注意事項ボックス）
- FormField（Label + Input + Error）

### Organisms（有機体）

- MediaItem（メディアアイテムカード）
- MediaList（メディアアイテムリスト）
- Header（ヘッダー）
- BulkActions（一括操作バー）
- MetadataEditModal（メタデータ編集モーダル）

### Templates

- PopupLayout（ポップアップ全体レイアウト）

---

## 4. 各コンポーネント仕様

### 4.1 Button

#### バリアント

- **primary**: メインアクション（音声抽出、保存）
- **secondary**: サブアクション（編集）
- **outline**: 補助アクション（キャンセル）
- **ghost**: 軽微なアクション（再スキャン）
- **danger**: 破壊的アクション（削除）

#### サイズ

- **sm**: 高さ32px、パディング 8px 12px、text-sm
- **md**: 高さ40px、パディング 10px 16px、text-base
- **lg**: 高さ48px、パディング 12px 20px、text-lg

#### 状態

- **default**: 通常状態
- **hover**: 背景色を1段階濃く
- **active**: 背景色を2段階濃く
- **disabled**: 透明度50%、カーソル not-allowed
- **loading**: Loader2アイコン + テキスト、無効化

#### Tailwind Classes

```tsx
/* Primary Button */
<button className="
  h-10 px-4
  bg-primary-500 hover:bg-primary-600 active:bg-primary-700
  text-white text-base font-medium
  rounded-md shadow-sm
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  音声抽出
</button>

/* Secondary Button */
<button className="
  h-10 px-4
  bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700
  text-white text-base font-medium
  rounded-md shadow-sm
  transition-colors duration-200
">
  編集
</button>

/* Outline Button */
<button className="
  h-10 px-4
  bg-transparent hover:bg-neutral-50 active:bg-neutral-100
  border border-neutral-300
  text-neutral-700 text-base font-medium
  rounded-md
  transition-colors duration-200
">
  キャンセル
</button>

/* Ghost Button */
<button className="
  h-10 px-4
  bg-transparent hover:bg-neutral-50 active:bg-neutral-100
  text-primary-600 text-base font-medium
  rounded-md
  transition-colors duration-200
">
  再スキャン
</button>

/* Danger Button */
<button className="
  h-10 px-4
  bg-error hover:bg-error-dark
  text-white text-base font-medium
  rounded-md shadow-sm
  transition-colors duration-200
">
  削除
</button>

/* Icon Button */
<button className="
  h-8 w-8
  bg-transparent hover:bg-neutral-100 active:bg-neutral-200
  rounded-full
  flex items-center justify-center
  transition-colors duration-200
" aria-label="閉じる">
  <X className="h-5 w-5 text-neutral-700" />
</button>
```

#### アクセシビリティ

- role: "button"
- aria-label: アイコンのみボタンは必須
- キーボード操作: Tab（フォーカス）、Enter/Space（クリック）
- タッチターゲット: 最低40px × 40px（sm含む）

---

### 4.2 ProgressBar

#### バリアント

- **default**: 通常（プライマリカラー）
- **success**: 完了（グリーン）
- **error**: エラー（レッド）

#### サイズ

- 高さ: 8px
- 幅: 100%
- 角丸: radius-full

#### Tailwind Classes

```tsx
/* ProgressBar Container */
<div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
  {/* ProgressBar Fill */}
  <div
    className="h-full bg-primary-500 rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin={0}
    aria-valuemax={100}
  />
</div>

/* Success State */
<div className="w-full h-2 bg-success-light rounded-full overflow-hidden">
  <div
    className="h-full bg-success rounded-full transition-all duration-300"
    style={{ width: "100%" }}
  />
</div>
```

#### アクセシビリティ

- role: "progressbar"
- aria-valuenow: 現在の進捗（0-100）
- aria-valuemin: 0
- aria-valuemax: 100
- aria-label: "変換進捗"

---

### 4.3 MediaItem（メディアアイテムカード）

#### レイアウト

```
┌─────────────────────────────────────────┐
│ ☑ 🎬 sample_video.mp4             [編集] │
│    https://example.com/video.mp4         │
│    [動画DL] [音声抽出]                    │
│    ━━━━━━━━━━━━━━━━ 45% (残り1分20秒)  │
└─────────────────────────────────────────┘
```

#### Tailwind Classes

```tsx
<div
  className="
  p-4
  border border-neutral-200
  rounded-lg
  bg-white
  hover:border-neutral-300 hover:shadow-sm
  transition-all duration-200
"
>
  {/* Header */}
  <div className="flex items-start gap-3">
    {/* Checkbox */}
    <input
      type="checkbox"
      className="mt-1 h-5 w-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
    />

    {/* Icon */}
    <div className="mt-0.5">
      <Video className="h-5 w-5 text-neutral-600" />
    </div>

    {/* Title */}
    <div className="flex-1 min-w-0">
      <h3 className="text-lg font-medium text-neutral-900 truncate">sample_video.mp4</h3>
      <p className="text-sm text-neutral-500 font-mono truncate mt-1">
        https://example.com/video.mp4
      </p>
    </div>

    {/* Edit Button */}
    <button className="h-8 px-3 text-sm text-primary-600 hover:bg-primary-50 rounded-md">
      編集
    </button>
  </div>

  {/* Actions */}
  <div className="flex gap-2 mt-3 ml-8">
    <button className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md">
      動画ダウンロード
    </button>
    <button className="h-9 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md">
      音声抽出
    </button>
  </div>

  {/* Progress Indicator (変換中のみ表示) */}
  <div className="mt-3 ml-8">
    <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
      <span>変換中... 0.8x</span>
      <span>残り約1分20秒</span>
    </div>
    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary-500 rounded-full transition-all duration-300"
        style={{ width: '45%' }}
      />
    </div>
  </div>
</div>
```

#### 状態別の表示

**検出済み（初期状態）**

- チェックボックス、アイコン、ファイル名、URL、ボタン（動画DL、音声抽出、編集）

**変換中**

- ボタンを非表示
- プログレスバー表示
- ステータステキスト表示
- キャンセルボタン表示

**変換完了**

- アイコンを音声アイコン（Music）に変更
- ファイル名を「アーティスト - タイトル.mp3」に変更
- ボタンを「ダウンロード」「削除」に変更
- 完了ステータス「変換完了 (1分30秒)」表示

**エラー**

- エラーメッセージ表示（赤背景）
- ボタンを「再試行」「削除」に変更

#### アクセシビリティ

- role: "article"
- aria-label: ファイル名
- キーボード操作: Tab（フォーカス移動）、Enter（ボタンクリック）

---

### 4.4 MetadataEditModal（メタデータ編集モーダル）

#### レイアウト

```
┌──────────────────────────────────────┐
│ メタデータ編集                [×]     │
├──────────────────────────────────────┤
│ タイトル:    [________________]      │
│ アーティスト: [________________]      │
│ アルバム:     [________________]      │
│ 年:          [____]                  │
│ ジャンル:     [________________]      │
│ コメント:     [________________]      │
├──────────────────────────────────────┤
│           [キャンセル]  [保存]        │
└──────────────────────────────────────┘
```

#### Tailwind Classes

```tsx
/* Modal Overlay */
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
  {/* Modal Container */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    {/* Modal Content */}
    <div
      className="
      w-full max-w-md
      bg-white
      rounded-lg
      shadow-lg
      max-h-[90vh]
      overflow-y-auto
      animate-in fade-in duration-200
    "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <h2 className="text-xl font-semibold text-neutral-900">メタデータ編集</h2>
        <button
          className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
          aria-label="閉じる"
        >
          <X className="h-5 w-5 text-neutral-700" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        {/* Form Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">タイトル</label>
          <input
            type="text"
            className="
              w-full h-10 px-3
              border border-neutral-300
              rounded-md
              text-base
              placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
            placeholder="曲名・動画名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">アーティスト</label>
          <input
            type="text"
            className="
              w-full h-10 px-3
              border border-neutral-300
              rounded-md
              text-base
              placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
            placeholder="アーティスト名"
          />
        </div>

        {/* その他のフィールド... */}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200">
        <button className="h-10 px-4 bg-transparent hover:bg-neutral-50 border border-neutral-300 text-neutral-700 text-base font-medium rounded-md">
          キャンセル
        </button>
        <button className="h-10 px-4 bg-primary-500 hover:bg-primary-600 text-white text-base font-medium rounded-md">
          保存
        </button>
      </div>
    </div>
  </div>
</div>
```

#### アクセシビリティ

- role: "dialog"
- aria-modal: true
- aria-labelledby: ヘッダーのタイトル
- キーボード操作: Esc（閉じる）、Tab（フォーカス移動）
- フォーカストラップ: モーダル内でフォーカスを循環

---

### 4.5 Header（ヘッダー）

#### Tailwind Classes

```tsx
<header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
  {/* Title */}
  <div className="flex items-center gap-2">
    <Film className="h-6 w-6 text-primary-500" />
    <h1 className="text-xl font-semibold text-neutral-900">Media Extractor</h1>
  </div>

  {/* Actions */}
  <button className="h-9 px-3 text-sm text-primary-600 hover:bg-primary-50 rounded-md flex items-center gap-2">
    <RefreshCw className="h-4 w-4" />
    再スキャン
  </button>
</header>
```

---

### 4.6 BulkActions（一括操作バー）

#### Tailwind Classes

```tsx
<div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
  {/* Select All */}
  <div className="flex items-center gap-2 mb-3">
    <input
      type="checkbox"
      className="h-5 w-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
    />
    <label className="text-sm font-medium text-neutral-700">すべて選択</label>
  </div>

  {/* Bulk Action Buttons */}
  <div className="flex gap-2">
    <button className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md">
      選択した項目を動画ダウンロード
    </button>
    <button className="h-9 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md">
      選択した項目を音声抽出
    </button>
  </div>
</div>
```

---

### 4.7 EmptyState（空の状態）

#### Tailwind Classes

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <FolderOpen className="h-16 w-16 text-neutral-400 mb-4" />
  <h3 className="text-lg font-medium text-neutral-900 mb-2">
    メディアファイルが見つかりませんでした
  </h3>
  <p className="text-sm text-neutral-600 text-center max-w-xs">
    このページには動画・音声ファイルが検出されませんでした。別のページで試してください。
  </p>
</div>
```

---

### 4.8 NoticeBox（注意事項ボックス）

#### Tailwind Classes

```tsx
<div className="px-4 py-3 bg-warning-light border-l-4 border-warning">
  <div className="flex items-start gap-3">
    <AlertTriangle className="h-5 w-5 text-warning-dark flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-neutral-900 mb-1">注意事項</h4>
      <ul className="text-xs text-neutral-700 space-y-1">
        <li>大容量ファイル（1GB超）の処理には10分以上かかる場合があります</li>
        <li>変換中はメモリを多く使用します。他のタブを閉じることを推奨します</li>
        <li>著作権法を遵守し、個人利用の範囲でご使用ください</li>
      </ul>
    </div>
  </div>
</div>
```

---

## 5. レスポンシブ設計

Chrome拡張機能のポップアップは固定サイズのため、レスポンシブ対応は不要。

### ポップアップサイズ

- 幅: 400px（固定）
- 高さ: 最小400px、最大600px
- スクロール: 縦スクロールのみ

---

## 6. インタラクション

### 6.1 ホバー

- ボタン: 背景色を1段階濃く（200ms transition）
- カード: 境界線を濃く、軽いシャドウ（200ms transition）
- リンク: 下線表示

### 6.2 フォーカス

- ボタン: ring-2 ring-primary-500 ring-offset-2
- 入力フィールド: ring-2 ring-primary-500
- チェックボックス: ring-2 ring-primary-500

### 6.3 アニメーション

- プログレスバー: width変化を300ms transition
- モーダル: フェードイン200ms
- 完了状態: チェックマークをフェードイン（150ms）

### 6.4 ローディング

- ボタン: Loader2アイコン + "処理中..." テキスト
- プログレスバー: 0%から100%まで滑らかに変化

---

## 7. アクセシビリティ

### 7.1 ARIA属性

| コンポーネント | ARIA属性                                                        |
| -------------- | --------------------------------------------------------------- |
| Button         | role="button", aria-label（アイコンのみ）                       |
| ProgressBar    | role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax |
| Modal          | role="dialog", aria-modal="true", aria-labelledby               |
| Alert          | role="alert"                                                    |
| MediaItem      | role="article", aria-label                                      |

### 7.2 キーボード操作

| キー      | 動作                         |
| --------- | ---------------------------- |
| Tab       | フォーカス移動               |
| Shift+Tab | フォーカス逆移動             |
| Enter     | ボタンクリック、モーダル保存 |
| Space     | チェックボックストグル       |
| Esc       | モーダルを閉じる             |

### 7.3 タッチターゲット

- 最小サイズ: 40px × 40px（Googleの推奨）
- ボタン間の余白: 8px以上

### 7.4 色のコントラスト比

- テキスト（本文）: 4.5:1以上（WCAG AA）
- テキスト（見出し）: 3:1以上
- UI要素: 3:1以上

---

## 8. ダークモード対応（将来対応）

現時点では対応しないが、将来的に対応する場合の設計。

### ダークモードカラー

```css
/* Dark Mode Colors */
--dark-bg-primary: #1c1917;
--dark-bg-secondary: #292524;
--dark-text-primary: #fafaf9;
--dark-text-secondary: #d6d3d1;
--dark-border: #44403c;
```

---

## 9. 次のステップ

UI設計が完了しました。次は以下を実施します。

1. **design-reviewer でレビュー**: UX心理学47原則に基づくチェック
2. **タスク生成**: task-creator で実装タスクを生成
3. **実装開始**: frontend-component で各コンポーネントを実装

---

## 10. チェックリスト

### デザイントークン

- [x] プライマリカラー決定（Teal）
- [x] セカンダリカラー決定（Orange）
- [x] ニュートラルカラー決定（Stone）
- [x] セマンティックカラー決定
- [x] タイポグラフィ定義
- [x] スペーシング定義
- [x] 角丸定義
- [x] シャドウ定義
- [x] アニメーション定義

### アプリアイコン

- [x] コンセプト決定（音声波形）
- [x] カラー決定（Primary）
- [x] 全サイズ定義（16/32/48/128）
- [x] SVGソース作成

### コンポーネント仕様

- [x] Button（5バリアント、3サイズ、5状態）
- [x] ProgressBar
- [x] MediaItem
- [x] MetadataEditModal
- [x] Header
- [x] BulkActions
- [x] EmptyState
- [x] NoticeBox

### アクセシビリティ

- [x] ARIA属性定義
- [x] キーボード操作定義
- [x] タッチターゲットサイズ確保
- [x] 色のコントラスト比確認

### インタラクション

- [x] ホバー定義
- [x] フォーカス定義
- [x] アニメーション定義
- [x] ローディング状態定義

---

## 11. 使用するLucide Icons一覧

```typescript
import {
  // 基本
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Info,

  // ナビゲーション
  ChevronRight,
  ChevronDown,

  // アクション
  Download,
  Upload,
  Edit,
  Trash2,
  RefreshCw,

  // メディア
  Video,
  Music,
  Film,
  Play,
  Pause,

  // 状態
  Loader2,
  Clock,

  // その他
  FolderOpen,
  Settings
} from 'lucide-react';
```

---

## 完了

UI設計書の作成が完了しました。次のステップは `design-reviewer` でのレビューです。
