# API仕様書

このドキュメントでは、Chrome Extension APIの使用方法、Service Workerとのメッセージング、ffmpeg.wasmのAPI使用方法を記載します。

---

## 1. Chrome Extension API

### 1.1 manifest.json

#### Manifest V3の基本構造

```json
{
  "manifest_version": 3,
  "name": "Media Extractor",
  "version": "1.0.0",
  "description": "動画・音声ファイルを検出し、ダウンロードまたは音声抽出（MP3変換）できるChrome拡張機能",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "downloads",
    "notifications"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "web_accessible_resources": [
    {
      "resources": ["ffmpeg-core.wasm", "ffmpeg-core.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

### 1.2 chrome.scripting API

#### ページ内のメディアファイルを検出

**ポップアップからの呼び出し**:
```typescript
/**
 * アクティブタブでスクリプトを実行してメディアファイルを検出
 */
async function scanPage(): Promise<MediaItem[]> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    throw new Error("アクティブなタブが見つかりません");
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectMediaFiles,
  });

  return results[0]?.result || [];
}
```

**実行されるスクリプト**:
```typescript
/**
 * ページ内のメディアファイルを収集
 * この関数はページのコンテキストで実行される
 */
function collectMediaFiles(): MediaItem[] {
  const results: MediaItem[] = [];
  const seen = new Set<string>();

  /**
   * 重複チェック付きでアイテムを追加
   */
  const addItem = (url: string, label: string, type: string) => {
    if (!url) return;

    const absoluteUrl = toAbsoluteUrl(url);
    if (!absoluteUrl || seen.has(absoluteUrl)) return;

    if (!isMediaFile(absoluteUrl, type)) return;

    seen.add(absoluteUrl);
    results.push({
      url: absoluteUrl,
      fileName: extractFileName(absoluteUrl),
      label: label || extractFileName(absoluteUrl),
      type: detectMediaType(absoluteUrl, type),
    });
  };

  // <video> タグから検出
  document.querySelectorAll("video").forEach((video) => {
    if (video.currentSrc) {
      addItem(video.currentSrc, video.getAttribute("title") || "", video.getAttribute("type") || "");
    } else if (video.src) {
      addItem(video.src, video.getAttribute("title") || "", video.getAttribute("type") || "");
    }

    video.querySelectorAll("source").forEach((source) => {
      addItem(source.src, source.getAttribute("title") || "", source.type);
    });
  });

  // <audio> タグから検出
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio.currentSrc) {
      addItem(audio.currentSrc, audio.getAttribute("title") || "", audio.getAttribute("type") || "");
    } else if (audio.src) {
      addItem(audio.src, audio.getAttribute("title") || "", audio.getAttribute("type") || "");
    }

    audio.querySelectorAll("source").forEach((source) => {
      addItem(source.src, source.getAttribute("title") || "", source.type);
    });
  });

  // <a> タグから検出
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const text = (link.textContent || "").trim();
    const type = link.getAttribute("type") || "";
    if (href) {
      addItem(href, text, type);
    }
  });

  return results;

  /**
   * 相対URLを絶対URLに変換
   */
  function toAbsoluteUrl(url: string): string | null {
    try {
      return new URL(url, document.baseURI).toString();
    } catch {
      return null;
    }
  }

  /**
   * メディアファイルかどうかを判定
   */
  function isMediaFile(url: string, typeHint: string): boolean {
    if (!url || url.startsWith("blob:")) return false;

    const lowerUrl = url.toLowerCase();
    const videoExts = [".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".m4v"];
    const audioExts = [".mp3", ".wav", ".aac", ".ogg", ".m4a", ".flac", ".wma"];

    const hasVideoExt = videoExts.some((ext) => lowerUrl.includes(ext));
    const hasAudioExt = audioExts.some((ext) => lowerUrl.includes(ext));

    if (hasVideoExt || hasAudioExt) return true;

    if (!typeHint) return false;

    const lowerType = typeHint.toLowerCase();
    return lowerType.includes("video/") || lowerType.includes("audio/");
  }

  /**
   * URLからファイル名を抽出
   */
  function extractFileName(url: string): string {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (!parts.length) return "media_file";
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return "media_file";
    }
  }

  /**
   * メディアタイプを検出
   */
  function detectMediaType(url: string, typeHint: string): "video" | "audio" {
    const lowerUrl = url.toLowerCase();
    const videoExts = [".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".m4v"];

    if (videoExts.some((ext) => lowerUrl.includes(ext))) return "video";

    if (typeHint && typeHint.toLowerCase().includes("video/")) return "video";

    return "audio";
  }
}
```

**戻り値の型**:
```typescript
interface MediaItem {
  /** メディアファイルのURL */
  url: string;

  /** ファイル名 */
  fileName: string;

  /** 表示用ラベル */
  label: string;

  /** メディアタイプ */
  type: "video" | "audio";
}
```

---

### 1.3 chrome.storage API

#### データの保存・取得

**保存**:
```typescript
/**
 * Chrome Storageにデータを保存
 */
async function saveToStorage<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

// 使用例
await saveToStorage("conversionJobs", jobs);
await saveToStorage("settings", { maxConcurrentJobs: 3 });
```

**取得**:
```typescript
/**
 * Chrome Storageからデータを取得
 */
async function getFromStorage<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

// 使用例
const jobs = await getFromStorage<ConversionJob[]>("conversionJobs");
const settings = await getFromStorage<Settings>("settings");
```

**削除**:
```typescript
/**
 * Chrome Storageからデータを削除
 */
async function removeFromStorage(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}
```

**複数キーの一括取得**:
```typescript
/**
 * 複数のキーを一括取得
 */
async function getMultipleFromStorage(keys: string[]): Promise<Record<string, unknown>> {
  return await chrome.storage.local.get(keys);
}

// 使用例
const data = await getMultipleFromStorage(["conversionJobs", "completedJobs", "settings"]);
```

---

### 1.4 chrome.downloads API

#### ファイルのダウンロード

**基本的なダウンロード**:
```typescript
/**
 * ファイルをダウンロード
 */
async function downloadFile(url: string, fileName?: string): Promise<number> {
  const downloadId = await chrome.downloads.download({
    url,
    filename: fileName,
    saveAs: false, // trueにすると保存先を確認
  });

  return downloadId;
}
```

**Blobからダウンロード**:
```typescript
/**
 * Blobデータをダウンロード
 */
async function downloadBlob(blob: Blob, fileName: string): Promise<number> {
  const blobUrl = URL.createObjectURL(blob);

  const downloadId = await chrome.downloads.download({
    url: blobUrl,
    filename: fileName,
    saveAs: false,
  });

  // ダウンロード完了後にBlob URLを解放
  chrome.downloads.onChanged.addListener((delta) => {
    if (delta.id === downloadId && delta.state?.current === "complete") {
      URL.revokeObjectURL(blobUrl);
    }
  });

  return downloadId;
}
```

**ダウンロード状態の監視**:
```typescript
/**
 * ダウンロード状態を監視
 */
chrome.downloads.onChanged.addListener((delta) => {
  console.log(`Download ${delta.id} state:`, delta.state?.current);
});
```

---

### 1.5 chrome.notifications API

#### 通知の表示

**基本的な通知**:
```typescript
/**
 * 通知を表示
 */
async function showNotification(title: string, message: string): Promise<string> {
  const notificationId = await chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
    priority: 2,
  });

  return notificationId;
}

// 使用例
await showNotification("変換完了", "sample_video.mp4 の音声抽出が完了しました");
```

**クリック可能な通知**:
```typescript
/**
 * クリックで操作できる通知を表示
 */
async function showClickableNotification(
  title: string,
  message: string,
  onClick: () => void
): Promise<string> {
  const notificationId = await chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
    priority: 2,
    requireInteraction: true, // ユーザーが閉じるまで表示
  });

  // クリックイベントのリスナー
  chrome.notifications.onClicked.addListener((clickedId) => {
    if (clickedId === notificationId) {
      onClick();
      chrome.notifications.clear(notificationId);
    }
  });

  return notificationId;
}

// 使用例
await showClickableNotification(
  "変換完了",
  "sample_video.mp4 の音声抽出が完了しました",
  () => {
    // ポップアップを開く等の処理
    chrome.action.openPopup();
  }
);
```

---

### 1.6 chrome.action API（バッジ）

#### アイコンバッジの更新

**バッジテキストの設定**:
```typescript
/**
 * アイコンバッジを更新
 */
async function updateBadge(count: number): Promise<void> {
  if (count === 0) {
    await chrome.action.setBadgeText({ text: "" });
  } else {
    await chrome.action.setBadgeText({ text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
  }
}

// 使用例
await updateBadge(3); // バッジに「3」を表示
await updateBadge(0); // バッジを非表示
```

---

## 2. Service Workerとのメッセージング

### 2.1 メッセージの送受信

#### ポップアップ → Service Worker

**メッセージ送信**:
```typescript
/**
 * Service Workerにメッセージを送信
 */
async function sendMessage<T, R>(action: string, payload: T): Promise<R> {
  const response = await chrome.runtime.sendMessage({ action, payload });
  return response;
}

// 使用例: 音声抽出ジョブを送信
const jobId = await sendMessage<ConversionRequest, string>("startConversion", {
  url: "https://example.com/video.mp4",
  fileName: "sample_video.mp4",
  outputFormat: "mp3",
  metadata: {
    title: "Sample Video",
    artist: "Unknown Artist",
    album: "",
    year: "",
    genre: "",
    comment: "",
  },
});
```

**メッセージ受信（Service Worker側）**:
```typescript
/**
 * ポップアップからのメッセージを受信
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  switch (action) {
    case "startConversion":
      handleStartConversion(payload).then(sendResponse);
      return true; // 非同期レスポンス

    case "cancelConversion":
      handleCancelConversion(payload).then(sendResponse);
      return true;

    case "getConversionStatus":
      handleGetConversionStatus(payload).then(sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown action" });
  }
});
```

---

#### Service Worker → ポップアップ

**メッセージ送信（Service Worker側）**:
```typescript
/**
 * ポップアップに進捗を通知
 */
async function notifyProgress(jobId: string, progress: number): Promise<void> {
  await chrome.runtime.sendMessage({
    action: "progressUpdate",
    payload: { jobId, progress },
  });
}
```

**メッセージ受信（ポップアップ側）**:
```typescript
/**
 * Service Workerからのメッセージを受信
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  switch (action) {
    case "progressUpdate":
      updateProgressUI(payload.jobId, payload.progress);
      break;

    case "conversionComplete":
      handleConversionComplete(payload);
      break;

    case "conversionError":
      handleConversionError(payload);
      break;
  }
});
```

---

### 2.2 メッセージの型定義

```typescript
/**
 * メッセージの共通型
 */
interface Message<T = unknown> {
  action: string;
  payload: T;
}

/**
 * 音声抽出リクエスト
 */
interface ConversionRequest {
  url: string;
  fileName: string;
  outputFormat: string;
  metadata: Metadata;
}

/**
 * 進捗更新メッセージ
 */
interface ProgressUpdate {
  jobId: string;
  progress: number;
  estimatedEndTime: number | null;
  speed: number; // 処理速度（例: 0.8x）
}

/**
 * 完了メッセージ
 */
interface ConversionComplete {
  jobId: string;
  outputFileName: string;
  downloadUrl: string;
}

/**
 * エラーメッセージ
 */
interface ConversionError {
  jobId: string;
  errorMessage: string;
}
```

---

## 3. ffmpeg.wasm API

### 3.1 セットアップ

#### ffmpeg.wasmのインポート

```typescript
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

/**
 * ffmpegインスタンスの作成と初期化
 */
async function createFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();

  // ログハンドラー（進捗表示用）
  ffmpeg.on("log", ({ message }) => {
    console.log("[ffmpeg]", message);
  });

  // 進捗ハンドラー
  ffmpeg.on("progress", ({ progress, time }) => {
    console.log(`進捗: ${Math.round(progress * 100)}%`, `時間: ${time}秒`);
  });

  // 初期化
  await ffmpeg.load({
    coreURL: chrome.runtime.getURL("ffmpeg-core.js"),
    wasmURL: chrome.runtime.getURL("ffmpeg-core.wasm"),
  });

  return ffmpeg;
}
```

---

### 3.2 動画から音声を抽出

#### 基本的な変換処理

```typescript
/**
 * 動画から音声を抽出してMP3に変換
 */
async function convertToMP3(
  ffmpeg: FFmpeg,
  videoUrl: string,
  fileName: string,
  bitrate: number = 128,
  metadata: Metadata,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const inputFileName = "input.mp4";
  const outputFileName = "output.mp3";

  // 進捗ハンドラーを設定
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  // 動画ファイルを取得
  const videoData = await fetchFile(videoUrl);

  // ffmpegの仮想ファイルシステムに書き込み
  await ffmpeg.writeFile(inputFileName, videoData);

  // ffmpegコマンドを実行
  await ffmpeg.exec([
    "-i", inputFileName,                    // 入力ファイル
    "-vn",                                  // 動画なし（音声のみ）
    "-ar", "44100",                         // サンプルレート
    "-ac", "2",                             // ステレオ
    "-b:a", `${bitrate}k`,                  // ビットレート
    "-metadata", `title=${metadata.title}`,
    "-metadata", `artist=${metadata.artist}`,
    "-metadata", `album=${metadata.album}`,
    "-metadata", `date=${metadata.year}`,
    "-metadata", `genre=${metadata.genre}`,
    "-metadata", `comment=${metadata.comment}`,
    outputFileName,                         // 出力ファイル
  ]);

  // 出力ファイルを読み込み
  const data = await ffmpeg.readFile(outputFileName);

  // Blobに変換
  const blob = new Blob([data], { type: "audio/mpeg" });

  // クリーンアップ
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  return blob;
}
```

---

### 3.3 進捗の取得

#### ログから進捗を計算

```typescript
/**
 * ffmpegのログから進捗を計算
 */
function parseProgress(message: string, duration: number): number | null {
  // ログ例: "frame=  100 fps=25 q=28.0 size=     256kB time=00:00:04.00 bitrate= 524.3kbits/s speed=1.0x"
  const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);

  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = parseFloat(timeMatch[3]);

  const currentTime = hours * 3600 + minutes * 60 + seconds;

  if (duration === 0) return 0;

  return Math.min(100, (currentTime / duration) * 100);
}
```

---

### 3.4 メタデータの埋め込み

#### ID3タグの設定

```typescript
/**
 * MP3ファイルにID3タグを埋め込む
 */
async function embedMetadata(
  ffmpeg: FFmpeg,
  inputBlob: Blob,
  metadata: Metadata
): Promise<Blob> {
  const inputFileName = "input.mp3";
  const outputFileName = "output.mp3";

  // Blobをffmpegの仮想ファイルシステムに書き込み
  const inputData = new Uint8Array(await inputBlob.arrayBuffer());
  await ffmpeg.writeFile(inputFileName, inputData);

  // メタデータを設定
  await ffmpeg.exec([
    "-i", inputFileName,
    "-c", "copy", // コーデックをコピー（再エンコードしない）
    "-metadata", `title=${metadata.title}`,
    "-metadata", `artist=${metadata.artist}`,
    "-metadata", `album=${metadata.album}`,
    "-metadata", `date=${metadata.year}`,
    "-metadata", `genre=${metadata.genre}`,
    "-metadata", `comment=${metadata.comment}`,
    outputFileName,
  ]);

  // 出力ファイルを読み込み
  const data = await ffmpeg.readFile(outputFileName);
  const blob = new Blob([data], { type: "audio/mpeg" });

  // クリーンアップ
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  return blob;
}
```

---

### 3.5 エラーハンドリング

```typescript
/**
 * ffmpegのエラーをハンドリング
 */
async function safeConvert(
  ffmpeg: FFmpeg,
  videoUrl: string,
  fileName: string,
  metadata: Metadata
): Promise<Blob> {
  try {
    return await convertToMP3(ffmpeg, videoUrl, fileName, 128, metadata);
  } catch (error) {
    if (error instanceof Error) {
      // エラーメッセージから原因を特定
      if (error.message.includes("Invalid data")) {
        throw new Error("ファイルが破損しているか、サポートされていない形式です");
      }
      if (error.message.includes("No such file")) {
        throw new Error("ファイルを取得できませんでした");
      }
      throw new Error(`変換に失敗しました: ${error.message}`);
    }
    throw new Error("不明なエラーが発生しました");
  }
}
```

---

## 4. 全体的な処理フロー（実装例）

### 4.1 Service Worker（background.js）

```typescript
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { ulid } from "ulid";

/**
 * アクティブなジョブを管理
 */
const activeJobs = new Map<string, { ffmpeg: FFmpeg; abortController: AbortController }>();

/**
 * 待機中のジョブキュー
 */
const jobQueue: Array<() => Promise<void>> = [];

/**
 * 最大同時実行数
 */
const MAX_CONCURRENT_JOBS = 3;

/**
 * メッセージハンドラー
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  switch (action) {
    case "startConversion":
      handleStartConversion(payload).then(sendResponse);
      return true;

    case "cancelConversion":
      handleCancelConversion(payload).then(sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown action" });
  }
});

/**
 * 音声抽出を開始
 */
async function handleStartConversion(request: ConversionRequest): Promise<string> {
  const jobId = ulid();

  // Chrome Storageにジョブを保存
  const jobs = (await getFromStorage<ConversionJob[]>("conversionJobs")) || [];
  jobs.push({
    id: jobId,
    url: request.url,
    fileName: request.fileName,
    status: "pending",
    progress: 0,
    startTime: Date.now(),
    estimatedEndTime: null,
    outputFormat: request.outputFormat,
    metadata: request.metadata,
  });
  await saveToStorage("conversionJobs", jobs);

  // キューに追加
  jobQueue.push(async () => {
    await processConversion(jobId, request);
  });

  // ジョブ実行
  processQueue();

  return jobId;
}

/**
 * キューからジョブを取り出して実行
 */
async function processQueue(): Promise<void> {
  if (activeJobs.size >= MAX_CONCURRENT_JOBS) return;
  if (jobQueue.length === 0) return;

  const job = jobQueue.shift();
  if (job) {
    await job();
    processQueue(); // 次のジョブを実行
  }
}

/**
 * 変換処理を実行
 */
async function processConversion(jobId: string, request: ConversionRequest): Promise<void> {
  const ffmpeg = new FFmpeg();
  const abortController = new AbortController();

  activeJobs.set(jobId, { ffmpeg, abortController });

  try {
    // ffmpeg初期化
    await ffmpeg.load();

    // ステータス更新: downloading
    await updateJobStatus(jobId, "downloading");

    // 動画ファイル取得
    const videoData = await fetchFile(request.url);

    // ステータス更新: converting
    await updateJobStatus(jobId, "converting");

    // 進捗ハンドラー
    ffmpeg.on("progress", async ({ progress }) => {
      await updateJobProgress(jobId, Math.round(progress * 100));
    });

    // 変換実行
    await ffmpeg.writeFile("input.mp4", videoData);
    await ffmpeg.exec([
      "-i", "input.mp4",
      "-vn",
      "-ar", "44100",
      "-ac", "2",
      "-b:a", "128k",
      "-metadata", `title=${request.metadata.title}`,
      "-metadata", `artist=${request.metadata.artist}`,
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");
    const blob = new Blob([data], { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);

    // ステータス更新: finalizing
    await updateJobStatus(jobId, "finalizing");

    // 完了ジョブに追加
    const outputFileName = `${request.metadata.artist} - ${request.metadata.title}.mp3`;
    await addCompletedJob({
      id: jobId,
      url: request.url,
      fileName: request.fileName,
      outputFileName,
      outputFormat: "mp3",
      completedTime: Date.now(),
      metadata: request.metadata,
      downloadUrl: blobUrl,
    });

    // 変換中ジョブから削除
    await removeConversionJob(jobId);

    // 通知表示
    await showNotification("変換完了", `${request.fileName} の音声抽出が完了しました`);

    // バッジ更新
    const completedJobs = (await getFromStorage<CompletedJob[]>("completedJobs")) || [];
    await updateBadge(completedJobs.length);

    // ポップアップに通知
    await chrome.runtime.sendMessage({
      action: "conversionComplete",
      payload: { jobId, outputFileName, downloadUrl: blobUrl },
    });
  } catch (error) {
    // エラー処理
    await updateJobStatus(jobId, "error");
    await updateJobError(jobId, error instanceof Error ? error.message : "不明なエラー");

    await chrome.runtime.sendMessage({
      action: "conversionError",
      payload: { jobId, errorMessage: error instanceof Error ? error.message : "不明なエラー" },
    });
  } finally {
    activeJobs.delete(jobId);
  }
}

/**
 * ジョブのステータスを更新
 */
async function updateJobStatus(jobId: string, status: ConversionJobStatus): Promise<void> {
  const jobs = (await getFromStorage<ConversionJob[]>("conversionJobs")) || [];
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    job.status = status;
    await saveToStorage("conversionJobs", jobs);
  }
}

/**
 * ジョブの進捗を更新
 */
async function updateJobProgress(jobId: string, progress: number): Promise<void> {
  const jobs = (await getFromStorage<ConversionJob[]>("conversionJobs")) || [];
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    job.progress = progress;

    // 推定完了時刻を計算
    const elapsed = Date.now() - job.startTime;
    const total = (elapsed / progress) * 100;
    job.estimatedEndTime = job.startTime + total;

    await saveToStorage("conversionJobs", jobs);

    // ポップアップに通知
    await chrome.runtime.sendMessage({
      action: "progressUpdate",
      payload: { jobId, progress, estimatedEndTime: job.estimatedEndTime },
    });
  }
}

/**
 * キャンセル処理
 */
async function handleCancelConversion(jobId: string): Promise<void> {
  const activeJob = activeJobs.get(jobId);
  if (activeJob) {
    activeJob.abortController.abort();
    activeJobs.delete(jobId);
  }

  await removeConversionJob(jobId);
}
```

---

## 5. API呼び出しのまとめ

### 5.1 ポップアップでの主要な操作

| 操作 | API | 説明 |
|------|-----|------|
| ページスキャン | `chrome.scripting.executeScript()` | メディアファイルを検出 |
| 音声抽出開始 | `chrome.runtime.sendMessage()` | Service Workerにジョブ送信 |
| 動画ダウンロード | `chrome.downloads.download()` | 動画をダウンロード |
| メタデータ保存 | `chrome.storage.local.set()` | メタデータを保存 |
| 進捗取得 | `chrome.runtime.onMessage` | Service Workerから進捗を受信 |

---

### 5.2 Service Workerでの主要な操作

| 操作 | API | 説明 |
|------|-----|------|
| ffmpeg初期化 | `ffmpeg.load()` | ffmpegを初期化 |
| 動画取得 | `fetchFile()` | URLから動画を取得 |
| 変換実行 | `ffmpeg.exec()` | MP3に変換 |
| 通知表示 | `chrome.notifications.create()` | 完了通知 |
| バッジ更新 | `chrome.action.setBadgeText()` | アイコンバッジを更新 |
| ジョブ保存 | `chrome.storage.local.set()` | ジョブをStorageに保存 |

---

## 6. エラーコード一覧

| コード | 説明 | 対処方法 |
|--------|------|---------|
| `FETCH_FAILED` | 動画の取得に失敗 | URLを確認、CORS制限を確認 |
| `CONVERSION_FAILED` | ffmpegの変換に失敗 | ファイル形式を確認 |
| `OUT_OF_MEMORY` | メモリ不足 | ファイルサイズを確認、他のタブを閉じる |
| `UNSUPPORTED_FORMAT` | 非対応の形式 | 対応形式を確認 |
| `DOWNLOAD_FAILED` | ダウンロードに失敗 | ディスク容量を確認 |

---

## 7. パフォーマンス最適化

### 7.1 ffmpegの最適化

```typescript
/**
 * 高速変換設定（品質は少し落ちる）
 */
await ffmpeg.exec([
  "-i", "input.mp4",
  "-vn",
  "-ar", "44100",
  "-ac", "2",
  "-b:a", "128k",
  "-preset", "ultrafast",  // 高速プリセット
  "output.mp3",
]);
```

### 7.2 メモリ管理

```typescript
/**
 * 変換後にffmpegインスタンスを破棄
 */
async function processConversion(jobId: string, request: ConversionRequest): Promise<void> {
  const ffmpeg = new FFmpeg();

  try {
    // 変換処理
    await convertToMP3(ffmpeg, request.url, request.fileName, 128, request.metadata);
  } finally {
    // メモリ解放
    ffmpeg.terminate();
  }
}
```
