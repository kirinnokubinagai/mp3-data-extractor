# タスク02: Tailwind CSS CDN + デザイントークン設定

## メタ情報

| 項目 | 値 |
|------|-----|
| 並列グループ | - (順次実行) |
| 依存タスク | 01 |
| 推定時間 | 30min |
| 担当subagent | frontend-style |
| テンプレート | setup_task_template.md |
| レビュー | - |

## 概要

Tailwind CSS CDNを導入し、デザイントークン（カラー、スペーシング等）を設定する

---

## 前提条件

- [ ] タスク01（Manifest V3拡張）完了
- [ ] popup.html が存在すること

---

## ゴール

- [ ] Tailwind CSS CDN導入
- [ ] デザイントークン設定（CSS変数）
- [ ] Lucide Icons CDN導入
- [ ] 既存のpopup.cssにデザインシステム適用

---

## 実装手順

### ステップ1: popup.html にCDN追加

既存の `popup.html` を編集:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Extractor</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tailwind Config -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0fdfa',
              100: '#ccfbf1',
              200: '#99f6e4',
              300: '#5eead4',
              400: '#2dd4bf',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
              800: '#115e59',
              900: '#134e4a',
              950: '#042f2e'
            },
            secondary: {
              50: '#fff7ed',
              100: '#ffedd5',
              200: '#fed7aa',
              300: '#fdba74',
              400: '#fb923c',
              500: '#f97316',
              600: '#ea580c',
              700: '#c2410c',
              800: '#9a3412',
              900: '#7c2d12',
              950: '#431407'
            }
          },
          fontFamily: {
            sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', 'monospace']
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Custom Styles -->
  <link rel="stylesheet" href="popup.css">
</head>
<body class="w-[400px] min-h-[400px] max-h-[600px] overflow-y-auto bg-neutral-50">
  <!-- Popup Content -->
  <div id="app"></div>

  <script type="module" src="popup.js"></script>
  <script>
    // Lucide Icons初期化
    lucide.createIcons();
  </script>
</body>
</html>
```

### ステップ2: popup.css にデザイントークン追加

既存の `popup.css` を拡張:

```css
/**
 * Media Extractor - Design System
 */

/* ============================================
   CSS Variables（デザイントークン）
   ============================================ */

:root {
  /* Colors - Primary (Teal) */
  --color-primary-50: #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-200: #99f6e4;
  --color-primary-300: #5eead4;
  --color-primary-400: #2dd4bf;
  --color-primary-500: #14b8a6;
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;
  --color-primary-800: #115e59;
  --color-primary-900: #134e4a;
  --color-primary-950: #042f2e;

  /* Colors - Secondary (Orange) */
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
  --color-secondary-950: #431407;

  /* Colors - Semantic */
  --color-success: #22c55e;
  --color-success-light: #dcfce7;
  --color-success-dark: #16a34a;

  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-dark: #dc2626;

  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-warning-dark: #d97706;

  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-dark: #2563eb;

  /* Spacing (4px base) */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem;   /* 48px */

  /* Border Radius */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* Transition */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* ============================================
   Base Styles
   ============================================ */

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #292524; /* neutral-800 */
  background-color: #fafaf9; /* neutral-50 */
}

/* ============================================
   Utility Classes（Tailwind風）
   ============================================ */

/* スクロールバーのスタイリング */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f5f4; /* neutral-100 */
}

::-webkit-scrollbar-thumb {
  background: #a8a29e; /* neutral-400 */
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: #78716c; /* neutral-500 */
}

/* フォーカスリング */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* スクリーンリーダー専用 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ============================================
   Animation
   ============================================ */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in var(--duration-normal) var(--ease-default);
}

/* ============================================
   Accessibility: prefers-reduced-motion
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ステップ3: アイコンプレースホルダー作成

アイコンが未作成の場合、後のタスクで作成するため、プレースホルダーとしてSVGを作成:

`icons/placeholder.svg`:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="128" height="128" rx="16" fill="#14b8a6"/>

  <!-- 音声波形（3本の縦線） -->
  <rect x="40" y="40" width="8" height="48" rx="4" fill="#ffffff"/>
  <rect x="60" y="28" width="8" height="72" rx="4" fill="#ffffff"/>
  <rect x="80" y="40" width="8" height="48" rx="4" fill="#ffffff"/>
</svg>
```

このSVGを各サイズにコピー（後でタスク48で正式版作成）:

```bash
cp icons/placeholder.svg icons/icon-16.png
cp icons/placeholder.svg icons/icon-32.png
cp icons/placeholder.svg icons/icon-48.png
cp icons/placeholder.svg icons/icon-128.png
```

---

## 完了条件

- [ ] Tailwind CSS CDN導入完了
- [ ] デザイントークン設定完了
- [ ] Lucide Icons CDN導入完了
- [ ] popup.cssにデザインシステム適用
- [ ] アイコンプレースホルダー作成
- [ ] Chrome拡張機能で読み込み確認
- [ ] スタイルが正しく適用されている

---

## 動作確認

1. Chrome拡張機能を再読み込み
2. ポップアップを開く
3. Tailwindクラスが適用されているか確認
4. Console でエラーなし

---

## 次のタスク

→ タスク03（開発環境整備）へ進む
