# タスク03: 開発環境整備

## メタ情報

| 項目 | 値 |
|------|-----|
| 並列グループ | - (順次実行) |
| 依存タスク | 01 |
| 推定時間 | 30min |
| 担当subagent | cicd-engineer |
| テンプレート | setup_task_template.md |
| レビュー | - |

## 概要

ESLint、Prettier、.gitignoreを設定し、開発環境を整備する

---

## 前提条件

- [ ] タスク01（Manifest V3拡張）完了

---

## ゴール

- [ ] .gitignore設定
- [ ] ESLint設定（Vanilla JS用）
- [ ] Prettier設定
- [ ] package.json作成
- [ ] npm scripts設定

---

## 実装手順

### ステップ1: .gitignore作成

`.gitignore` を作成:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Chrome Extension
*.pem
*.crx
*.zip

# Testing
coverage/
.nyc_output/
```

### ステップ2: package.json作成

`package.json` を作成:

```json
{
  "name": "media-extractor",
  "version": "2.0.0",
  "description": "動画・音声ファイルを検出してダウンロード、音声抽出が可能なChrome拡張機能",
  "type": "module",
  "scripts": {
    "lint": "eslint *.js lib/*.js",
    "lint:fix": "eslint *.js lib/*.js --fix",
    "format": "prettier --write \"**/*.{js,json,md,css,html}\"",
    "format:check": "prettier --check \"**/*.{js,json,md,css,html}\"",
    "test": "echo \"テストは後のフェーズで実装\" && exit 0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.2.0"
  },
  "keywords": [
    "chrome-extension",
    "media",
    "video",
    "audio",
    "mp3",
    "ffmpeg"
  ],
  "author": "",
  "license": "MIT"
}
```

### ステップ3: ESLint設定

`eslint.config.js` を作成（ESLint v9 Flat Config形式）:

```javascript
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        chrome: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly'
      }
    },
    rules: {
      // コーディング規約
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Chrome拡張では許可
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'never'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always']
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'icons/**']
  }
];
```

### ステップ4: Prettier設定

`.prettierrc` を作成:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

`.prettierignore` を作成:

```
# Dependencies
node_modules/

# Build
dist/
build/

# Icons
icons/

# Logs
*.log
```

### ステップ5: 依存パッケージインストール

```bash
npm install
```

### ステップ6: 既存ファイルをフォーマット

```bash
npm run format
```

---

## 完了条件

- [ ] .gitignore作成
- [ ] package.json作成
- [ ] ESLint設定完了
- [ ] Prettier設定完了
- [ ] `npm install` 成功
- [ ] `npm run lint` でエラーなし
- [ ] `npm run format` で全ファイルフォーマット済み

---

## 動作確認

```bash
# Lintチェック
npm run lint

# フォーマットチェック
npm run format:check

# エラーがないことを確認
```

---

## 次のタスク

→ タスク04（Button: Primary/Secondary）へ進む
