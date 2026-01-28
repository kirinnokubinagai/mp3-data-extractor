# タスク01: Manifest V3拡張 + Service Worker基盤

## メタ情報

| 項目         | 値                     |
| ------------ | ---------------------- |
| 並列グループ | - (順次実行)           |
| 依存タスク   | なし                   |
| 推定時間     | 1h                     |
| 担当subagent | cicd-engineer          |
| テンプレート | setup_task_template.md |
| レビュー     | -                      |

## 概要

既存のmanifest.jsonをManifest V3に拡張し、Service Workerの基盤を構築する

---

## 前提条件

- [ ] 既存のMP3検出機能が動作していること
- [ ] manifest.json が存在すること
- [ ] popup.html, popup.js が存在すること

---

## ゴール

- [ ] Manifest V3に対応した権限設定
- [ ] Service Worker (background.js) 作成
- [ ] Content Script設定
- [ ] ディレクトリ構造整理
- [ ] Chrome拡張機能として読み込み可能

---

## 実装手順

### ステップ1: manifest.json拡張

既存の manifest.json を拡張:

```json
{
  "manifest_version": 3,
  "name": "Media Extractor",
  "version": "2.0.0",
  "description": "動画・音声ファイルを検出してダウンロード、音声抽出が可能なChrome拡張機能",

  "permissions": ["activeTab", "storage", "notifications", "downloads"],

  "host_permissions": ["<all_urls>"],

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },

  "background": {
    "service_worker": "background.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],

  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },

  "web_accessible_resources": [
    {
      "resources": ["icons/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**権限の説明:**

- `activeTab`: 現在のタブのURLとコンテンツアクセス
- `storage`: Chrome Storageでジョブ情報を永続化
- `notifications`: 変換完了通知
- `downloads`: ファイルダウンロード
- `<all_urls>`: 全サイトでメディア検出

### ステップ2: ディレクトリ構造整理

```
mp3-data-extractor/
├── manifest.json
├── background.js          # Service Worker（新規作成）
├── content.js             # Content Script（新規作成）
├── popup.html             # 既存
├── popup.css              # 既存
├── popup.js               # 既存（後で拡張）
├── icons/                 # アイコン格納
│   ├── icon-16.png       # 後で作成
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── lib/                   # 共通ライブラリ（新規作成）
│   ├── types.js          # 型定義（JSDoc）
│   ├── storage.js        # Chrome Storage操作
│   └── messages.js       # メッセージング
└── README.md             # 既存
```

```bash
# ディレクトリ作成
mkdir -p icons lib
```

### ステップ3: Service Worker基盤作成

`background.js` を作成:

```javascript
/**
 * Service Worker (Manifest V3)
 * バックグラウンドでffmpeg.wasmを実行し、音声抽出を行う
 */

// インストール時
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] インストール完了', details.reason);

  // 初期化処理
  if (details.reason === 'install') {
    chrome.storage.local.set({
      jobs: [],
      settings: {
        outputFormat: 'mp3',
        bitrate: '192k',
        notificationsEnabled: true
      }
    });
  }
});

// 起動時
chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] 起動完了');
});

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] メッセージ受信:', message);

  switch (message.type) {
    case 'SCAN_MEDIA':
      handleScanMedia(sender.tab.id);
      break;
    case 'DOWNLOAD_VIDEO':
      handleDownloadVideo(message.payload);
      break;
    case 'EXTRACT_AUDIO':
      handleExtractAudio(message.payload);
      break;
    default:
      console.warn('[Service Worker] 不明なメッセージタイプ:', message.type);
  }

  return true; // 非同期レスポンス
});

/**
 * メディアスキャン処理
 */
function handleScanMedia(tabId) {
  // Content Scriptにメディア検出を依頼
  chrome.tabs.sendMessage(tabId, { type: 'SCAN_REQUEST' });
}

/**
 * 動画ダウンロード処理
 */
function handleDownloadVideo(payload) {
  const { url, filename } = payload;

  chrome.downloads.download(
    {
      url: url,
      filename: filename || 'video.mp4',
      saveAs: true
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[Service Worker] ダウンロードエラー:', chrome.runtime.lastError);
        return;
      }

      console.log('[Service Worker] ダウンロード開始:', downloadId);

      // 通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'ダウンロード開始',
        message: `${filename} のダウンロードを開始しました`
      });
    }
  );
}

/**
 * 音声抽出処理（仮実装）
 */
async function handleExtractAudio(payload) {
  const { url, filename, metadata } = payload;

  console.log('[Service Worker] 音声抽出開始:', filename);

  // TODO: Phase 7でffmpeg.wasm統合
  // 現時点ではプレースホルダー

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: '音声抽出',
    message: `${filename} の音声抽出機能は後のフェーズで実装します`
  });
}

console.log('[Service Worker] 初期化完了');
```

### ステップ4: Content Script基盤作成

`content.js` を作成:

```javascript
/**
 * Content Script
 * ページ内の動画・音声ファイルを検出する
 */

console.log('[Content Script] 読み込み完了:', location.href);

/**
 * メディアファイルを検出
 */
function detectMedia() {
  const mediaItems = [];

  // <video> タグ
  document.querySelectorAll('video').forEach((video, index) => {
    const src = video.src || video.currentSrc;
    if (src && !src.startsWith('blob:')) {
      mediaItems.push({
        type: 'video',
        url: src,
        element: 'video',
        index: index
      });
    }
  });

  // <audio> タグ
  document.querySelectorAll('audio').forEach((audio, index) => {
    const src = audio.src || audio.currentSrc;
    if (src && !src.startsWith('blob:')) {
      mediaItems.push({
        type: 'audio',
        url: src,
        element: 'audio',
        index: index
      });
    }
  });

  // <a> タグ（mp3, mp4, webm, etc.）
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.href;
    const ext = href.split('.').pop().split('?')[0].toLowerCase();

    if (['mp3', 'mp4', 'webm', 'ogg', 'wav', 'm4a'].includes(ext)) {
      mediaItems.push({
        type: ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a' ? 'audio' : 'video',
        url: href,
        element: 'link',
        text: link.textContent.trim()
      });
    }
  });

  console.log('[Content Script] メディア検出:', mediaItems.length, '件');
  return mediaItems;
}

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_REQUEST') {
    const mediaItems = detectMedia();
    sendResponse({ success: true, data: mediaItems });
  }

  return true;
});

// 初回検出
setTimeout(() => {
  const mediaItems = detectMedia();
  if (mediaItems.length > 0) {
    // Badgeに件数表示
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      payload: { count: mediaItems.length }
    });
  }
}, 1000);
```

### ステップ5: 共通ライブラリ作成

`lib/types.js` を作成:

```javascript
/**
 * 型定義（JSDoc）
 */

/**
 * メディアアイテム
 * @typedef {Object} MediaItem
 * @property {string} id - ULID
 * @property {'video'|'audio'} type - メディアタイプ
 * @property {string} url - メディアURL
 * @property {string} filename - ファイル名
 * @property {'detected'|'converting'|'completed'|'error'} status - ステータス
 * @property {number} [progress] - 進捗（0-100）
 * @property {Metadata} [metadata] - メタデータ
 */

/**
 * メタデータ
 * @typedef {Object} Metadata
 * @property {string} [title] - タイトル
 * @property {string} [artist] - アーティスト
 * @property {string} [album] - アルバム
 * @property {string} [year] - 年
 * @property {string} [genre] - ジャンル
 * @property {string} [comment] - コメント
 */

/**
 * ジョブ
 * @typedef {Object} Job
 * @property {string} id - ジョブID
 * @property {string} mediaItemId - メディアアイテムID
 * @property {'pending'|'processing'|'completed'|'error'} status - ステータス
 * @property {number} progress - 進捗（0-100）
 * @property {string} [error] - エラーメッセージ
 * @property {number} startedAt - 開始時刻（UNIX時間）
 * @property {number} [completedAt] - 完了時刻（UNIX時間）
 */

export {};
```

`lib/storage.js` を作成:

```javascript
/**
 * Chrome Storage操作
 */

/**
 * すべてのジョブを取得
 * @returns {Promise<Job[]>}
 */
export async function getAllJobs() {
  const result = await chrome.storage.local.get('jobs');
  return result.jobs || [];
}

/**
 * ジョブを保存
 * @param {Job} job
 * @returns {Promise<void>}
 */
export async function saveJob(job) {
  const jobs = await getAllJobs();
  jobs.push(job);
  await chrome.storage.local.set({ jobs });
}

/**
 * ジョブを更新
 * @param {string} jobId
 * @param {Partial<Job>} updates
 * @returns {Promise<void>}
 */
export async function updateJob(jobId, updates) {
  const jobs = await getAllJobs();
  const index = jobs.findIndex((j) => j.id === jobId);

  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    await chrome.storage.local.set({ jobs });
  }
}

/**
 * ストレージをクリア
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  await chrome.storage.local.clear();
}
```

`lib/messages.js` を作成:

```javascript
/**
 * メッセージング
 */

/**
 * Service Workerにメッセージ送信
 * @param {string} type - メッセージタイプ
 * @param {Object} [payload] - ペイロード
 * @returns {Promise<any>}
 */
export async function sendToBackground(type, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Content Scriptにメッセージ送信
 * @param {number} tabId - タブID
 * @param {string} type - メッセージタイプ
 * @param {Object} [payload] - ペイロード
 * @returns {Promise<any>}
 */
export async function sendToContent(tabId, type, payload) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
```

---

## 完了条件

- [ ] manifest.json がManifest V3に対応
- [ ] background.js（Service Worker）作成
- [ ] content.js（Content Script）作成
- [ ] lib/ 配下に共通ライブラリ作成
- [ ] ディレクトリ構造整理
- [ ] Chrome拡張機能として読み込み可能
- [ ] Console でエラーなし

---

## 動作確認

```bash
# Chrome拡張機能として読み込み
# 1. chrome://extensions/ を開く
# 2. 「デベロッパーモード」をON
# 3. 「パッケージ化されていない拡張機能を読み込む」
# 4. このディレクトリを選択
# 5. Console でエラーがないか確認
```

---

## 次のタスク

→ タスク02（Tailwind CSS CDN + デザイントークン設定）へ進む
