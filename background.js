/**
 * Service Worker (Manifest V3)
 * Offscreen Documentを管理し、音声抽出を委譲する
 * YouTube対応: Render APIサーバー経由
 */

/** APIサーバーURL（デプロイ後に更新） */
const API_SERVER_URL = 'http://localhost:8000'; // TODO: Renderデプロイ後に更新

/** 実行中のジョブ */
const activeJobs = new Map();

/** Offscreen Document作成済みフラグ */
let offscreenDocumentCreated = false;

// インストール時
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Service Worker] インストール完了', details.reason);

  if (details.reason === 'install') {
    // 初期設定
    await chrome.storage.local.set({
      jobs: [],
      settings: {
        outputFormat: 'mp3',
        bitrate: '192k',
        notificationsEnabled: true,
        apiServerUrl: API_SERVER_URL
      }
    });
  }
});

// 起動時
chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] 起動');
});

// メッセージハンドラー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] メッセージ受信:', message.type);

  // 非同期処理を返す
  (async () => {
    try {
      switch (message.type) {
        case 'COLLECT_MEDIA':
          return await handleCollectMedia(message.payload, sender.tab?.id);

        case 'EXTRACT_AUDIO':
          return await handleExtractAudio(message.payload, sender.tab?.id);

        case 'YOUTUBE_DOWNLOAD':
          return await handleYouTubeDownload(message.payload);

        case 'YOUTUBE_EXTRACT':
          return await handleYouTubeExtract(message.payload);

        default:
          console.warn('[Service Worker] 未知のメッセージタイプ:', message.type);
          return { success: false, error: `Unknown message type: ${message.type}` };
      }
    } catch (error) {
      console.error('[Service Worker] エラー:', error);
      return { success: false, error: error.message };
    }
  })().then(sendResponse);

  return true; // 非同期レスポンス
});

/**
 * メディア収集
 */
async function handleCollectMedia(payload, tabId) {
  const { patterns } = payload;

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: collectMediaFromPage,
      args: [patterns]
    });

    const mediaItems = results[0].result;
    console.log('[Service Worker] メディア収集完了:', mediaItems.length, '件');

    return {
      success: true,
      media: mediaItems
    };
  } catch (error) {
    console.error('[Service Worker] メディア収集エラー:', error);
    throw error;
  }
}

/**
 * ページ内メディア収集（Content Script内で実行）
 */
function collectMediaFromPage(patterns) {
  const media = [];
  const processedUrls = new Set();

  // video要素
  document.querySelectorAll('video').forEach(video => {
    const src = video.src || video.currentSrc;
    if (src && !processedUrls.has(src)) {
      processedUrls.add(src);
      media.push({
        type: 'video',
        url: src,
        element: 'video'
      });
    }
  });

  // audio要素
  document.querySelectorAll('audio').forEach(audio => {
    const src = audio.src || audio.currentSrc;
    if (src && !processedUrls.has(src)) {
      processedUrls.add(src);
      media.push({
        type: 'audio',
        url: src,
        element: 'audio'
      });
    }
  });

  // a要素（パターンマッチ）
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.href;
    if (!processedUrls.has(href)) {
      for (const pattern of patterns) {
        if (new RegExp(pattern).test(href)) {
          processedUrls.add(href);
          media.push({
            type: 'link',
            url: href,
            element: 'a',
            text: link.textContent.trim()
          });
          break;
        }
      }
    }
  });

  return media;
}

/**
 * YouTube動画ダウンロード（APIサーバー経由）
 */
async function handleYouTubeDownload(payload) {
  const { url, jobId } = payload;

  console.log('[YouTube Download] 開始:', url);

  try {
    // Popupに進捗通知
    await broadcastToPopup({
      type: 'YOUTUBE_STATUS',
      payload: {
        jobId,
        status: 'fetching_info',
        message: 'サーバーに接続中...'
      }
    });

    // APIサーバーから情報取得
    const settings = await chrome.storage.local.get('settings');
    const apiUrl = settings.settings?.apiServerUrl || API_SERVER_URL;

    const response = await fetch(`${apiUrl}/api/download-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`APIサーバーエラー: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error('動画情報の取得に失敗しました');
    }

    const { title, url: downloadUrl, merged } = result.data;

    // メタデータを送信
    await broadcastToPopup({
      type: 'YOUTUBE_METADATA',
      payload: {
        jobId,
        metadata: {
          title,
          uploader: 'YouTube',
        }
      }
    });

    // ダウンロード開始
    await broadcastToPopup({
      type: 'YOUTUBE_STATUS',
      payload: {
        jobId,
        status: 'downloading',
        message: 'ダウンロード中...'
      }
    });

    const filename = `${sanitizeFilename(title)}.mp4`;

    const downloadId = await chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: false
    });

    console.log('[YouTube Download] ダウンロード開始:', downloadId);

    // 完了通知
    await showNotification({
      title: 'ダウンロード開始',
      message: `${title} のダウンロードを開始しました`,
      icon: 'icons/icon-128.png'
    });

    await broadcastToPopup({
      type: 'YOUTUBE_COMPLETE',
      payload: {
        jobId,
        downloadId,
        filename
      }
    });

    return {
      success: true,
      downloadId,
      filename
    };

  } catch (error) {
    console.error('[YouTube Download] エラー:', error);

    await showNotification({
      title: 'ダウンロードエラー',
      message: error.message,
      icon: 'icons/icon-128.png'
    });

    await broadcastToPopup({
      type: 'YOUTUBE_ERROR',
      payload: {
        jobId,
        error: error.message
      }
    });

    throw error;
  }
}

/**
 * YouTube音声抽出（APIサーバー + ffmpeg.wasm）
 */
async function handleYouTubeExtract(payload) {
  const { url, jobId, bitrate = '192k' } = payload;

  console.log('[YouTube Extract] 開始:', url);

  try {
    // YouTube情報取得
    await broadcastToPopup({
      type: 'YOUTUBE_STATUS',
      payload: {
        jobId,
        status: 'fetching_info',
        message: 'サーバーに接続中...'
      }
    });

    // APIサーバーから音声URL取得
    const settings = await chrome.storage.local.get('settings');
    const apiUrl = settings.settings?.apiServerUrl || API_SERVER_URL;

    const response = await fetch(`${apiUrl}/api/audio-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`APIサーバーエラー: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error('音声情報の取得に失敗しました');
    }

    const { title, url: audioUrl } = result.data;

    const metadata = {
      title,
      uploader: 'YouTube',
    };

    await broadcastToPopup({
      type: 'YOUTUBE_METADATA',
      payload: {
        jobId,
        metadata
      }
    });

    // 音声をダウンロード（Blob取得）
    await broadcastToPopup({
      type: 'YOUTUBE_STATUS',
      payload: {
        jobId,
        status: 'downloading',
        message: '音声をダウンロード中...'
      }
    });

    const audioResponse = await fetch(audioUrl);
    const blob = await audioResponse.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 通常の音声抽出処理に委譲
    const filename = sanitizeFilename(title);

    return await handleExtractAudio({
      jobId,
      url: blobUrl,
      filename,
      metadata,
      bitrate
    });

  } catch (error) {
    console.error('[YouTube Extract] エラー:', error);

    await showNotification({
      title: '音声抽出エラー',
      message: error.message,
      icon: 'icons/icon-128.png'
    });

    await broadcastToPopup({
      type: 'YOUTUBE_ERROR',
      payload: {
        jobId,
        error: error.message
      }
    });

    throw error;
  }
}

/**
 * 音声抽出（Offscreen Document経由でffmpeg.wasm実行）
 */
async function handleExtractAudio(payload, tabId) {
  const { jobId, url, filename, metadata, bitrate = '192k' } = payload;

  console.log('[Extract Audio] 開始:', filename);

  try {
    // Offscreen Document確認・作成
    await ensureOffscreenDocument();

    // Offscreen Documentに処理を委譲
    const result = await chrome.runtime.sendMessage({
      type: 'EXTRACT_AUDIO',
      payload: {
        jobId,
        url,
        filename,
        metadata,
        bitrate
      }
    });

    if (!result.success) {
      throw new Error(result.error || '音声抽出に失敗しました');
    }

    console.log('[Extract Audio] 完了:', result.filename);

    return result;

  } catch (error) {
    console.error('[Extract Audio] エラー:', error);
    throw error;
  }
}

/**
 * Offscreen Document確認・作成
 */
async function ensureOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length > 0) {
    offscreenDocumentCreated = true;
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'FFmpeg.wasmで音声変換を実行'
  });

  offscreenDocumentCreated = true;
  console.log('[Service Worker] Offscreen Document作成完了');
}

/**
 * Popup全体にブロードキャスト
 */
async function broadcastToPopup(message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    // Popupが閉じている場合はエラーを無視
    if (!error.message.includes('Could not establish connection')) {
      console.error('[Service Worker] Broadcast エラー:', error);
    }
  }
}

/**
 * 通知表示
 */
async function showNotification({ title, message, icon }) {
  const settings = await chrome.storage.local.get('settings');
  if (settings.settings?.notificationsEnabled === false) {
    return;
  }

  await chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title: title,
    message: message
  });
}

/**
 * ファイル名のサニタイズ
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200);
}
